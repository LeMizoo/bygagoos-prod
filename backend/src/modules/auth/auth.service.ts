import User from '../users/user.model';
import { generateAccessToken } from './utils/jwt';
import { RefreshTokenService } from './refreshToken.service';
import bcrypt from 'bcrypt';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';

export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData: any) {
    const { email, password, firstName, lastName } = userData;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(
        'Un utilisateur avec cet email existe déjà',
        HTTP_STATUS.CONFLICT
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ CORRECTION: Utiliser 'CLIENT' au lieu de 'client'
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'CLIENT', // ← Changé de 'client' à 'CLIENT'
      isActive: true,
    });

    // Générer les tokens
    const accessToken = generateAccessToken(
      user.id,
      user.email,
      user.role
    );

    // Générer et stocker le refresh token dans Redis
    const refreshToken = RefreshTokenService.generateToken();
    await RefreshTokenService.storeToken(user.id, refreshToken);

    logger.info(`✅ Nouvel utilisateur inscrit: ${user.email} (rôle: ${user.role})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Connexion utilisateur
   */
  async login(credentials: { email: string; password: string }) {
    const { email, password } = credentials;

    // Vérifier l'utilisateur
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(
        'Email ou mot de passe incorrect',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError(
        'Email ou mot de passe incorrect',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new AppError(
        "Compte désactivé. Contactez l'administrateur.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer les tokens
    const accessToken = generateAccessToken(
      user.id,
      user.email,
      user.role
    );

    // Générer et stocker le refresh token dans Redis
    const refreshToken = RefreshTokenService.generateToken();
    await RefreshTokenService.storeToken(user.id, refreshToken);

    logger.info(`✅ Utilisateur connecté: ${user.email} (rôle: ${user.role})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(oldRefreshToken: string) {
    // Vérifier le refresh token dans Redis
    const userId = await RefreshTokenService.verifyToken(oldRefreshToken);

    if (!userId) {
      throw new AppError(
        'Refresh token invalide ou expiré',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(
        'Utilisateur non trouvé',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (!user.isActive) {
      throw new AppError(
        'Compte désactivé',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Rotation : nouveau refresh + révocation ancien
    const newRefreshToken = await RefreshTokenService.rotateToken(
      oldRefreshToken,
      userId
    );

    // Nouveau access token
    const newAccessToken = generateAccessToken(
      user.id,
      user.email,
      user.role
    );

    logger.info(
      `🔄 Token rafraîchi pour l'utilisateur: ${user.email}`
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(userId: string, refreshToken: string) {
    try {
      await RefreshTokenService.revokeToken(refreshToken);

      logger.info(
        `👋 Déconnexion de l'utilisateur ${userId}`
      );

      return true;
    } catch (error) {
      logger.error(
        '❌ Erreur lors de la déconnexion:',
        error
      );

      throw new AppError(
        'Erreur lors de la déconnexion',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtenir les informations de l'utilisateur
   */
  async getMe(userId: string) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new AppError(
        'Utilisateur non trouvé',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }
}