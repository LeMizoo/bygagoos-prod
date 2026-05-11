// backend/src/modules/auth/auth.service.ts

import User from '../users/user.model';
import { generateAccessToken } from './utils/jwt';
import { RefreshTokenService } from './refreshToken.service';
import bcrypt from 'bcrypt';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';
import { OAuth2Client } from 'google-auth-library';
import { RegisterDto, LoginDto, GoogleLoginDto, UpdateProfileDto } from './dto';
import { env } from '../../config/env';
import { Document } from 'mongoose';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const googleClientId = env.GOOGLE_CLIENT_ID || env.GMAIL_CLIENT_ID || '';
const googleClientSecret = env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
const normalizeBaseUrl = (value: string) => value.replace(/\/$/, '');

const createGoogleOAuthClient = (redirectUri?: string) => {
  if (!googleClientId) return null;

  return new OAuth2Client(
    googleClientId,
    googleClientSecret || undefined,
    redirectUri || env.GOOGLE_REDIRECT_URI || env.GMAIL_REDIRECT_URI || undefined
  );
};

export class AuthService {
  /**
   * Helper pour formater la réponse utilisateur sans utiliser 'any'
   */
  private formatUserResponse(user: Document) {
    const userObj = user.toObject() as Record<string, unknown>;
    const avatarPath = userObj.avatar as string | undefined;
    let fullAvatarUrl = avatarPath || null;

    if (avatarPath && !avatarPath.startsWith('http')) {
      const baseUrl = env.API_URL;
      fullAvatarUrl = `${baseUrl}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
    }

    return {
      id: userObj._id,
      email: userObj.email,
      firstName: userObj.firstName,
      lastName: userObj.lastName,
      name: userObj.name,
      role: userObj.role,
      phone: userObj.phone,
      avatar: fullAvatarUrl,
      address: userObj.address || null,
      isActive: userObj.isActive,
      lastLogin: userObj.lastLogin,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
    };
  }

  /**
   * Recherche un utilisateur par email, avec repli tolérant pour les anciens comptes.
   */
  private async findUserByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);

    const exactMatch = await User.findOne({ email: normalizedEmail }).select('+password');
    if (exactMatch) {
      return exactMatch;
    }

    return User.findOne({
      email: { $regex: `^${escapeRegExp(normalizedEmail)}$`, $options: 'i' }
    }).select('+password');
  }

  async register(userData: RegisterDto) {
    const { email, password, firstName, lastName, phone } = userData;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await this.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('Email déjà utilisé', HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      role: 'CLIENT',
      phone,
      isActive: true,
    });

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = RefreshTokenService.generateToken();
    await RefreshTokenService.storeToken(user.id, refreshToken);

    logger.info(`✅ Inscription: ${user.email}`);

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async login(credentials: LoginDto) {
    console.log('=== AUTH SERVICE LOGIN ===');
    console.log('Credentials reçus:', { 
      email: credentials.email, 
      password: credentials.password ? '***' : 'manquant' 
    });
    
    const { email, password } = credentials;
    
    // Validation supplémentaire
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      throw new AppError('Email et mot de passe requis', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Normaliser l'email (trim + lowercase)
    const normalizedEmail = normalizeEmail(email);
    console.log('Email normalisé:', normalizedEmail);
    
    // Chercher l'utilisateur avec le mot de passe
    const user = await this.findUserByEmail(normalizedEmail);
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour:', normalizedEmail);
      throw new AppError('Email ou mot de passe incorrect', HTTP_STATUS.UNAUTHORIZED);
    }
    
    console.log('✅ Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    });
    
    // Vérifier si le compte est actif
    if (!user.isActive) {
      console.log('❌ Compte désactivé');
      throw new AppError('Compte désactivé. Contactez l\'administrateur.', HTTP_STATUS.FORBIDDEN);
    }
    
    // Vérifier le mot de passe avec logs détaillés
    console.log('🔐 Vérification du mot de passe...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Résultat de la comparaison bcrypt:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe invalide pour:', normalizedEmail);
      throw new AppError('Email ou mot de passe incorrect', HTTP_STATUS.UNAUTHORIZED);
    }
    
    console.log('✅ Mot de passe valide!');
    
    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();
    console.log('📅 lastLogin mis à jour');
    
    // Générer les tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = RefreshTokenService.generateToken();
    await RefreshTokenService.storeToken(user.id, refreshToken);
    
    console.log('🎫 Tokens générés avec succès');
    console.log('✅ Login réussi pour:', user.email);
    
    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(payload: GoogleLoginDto) {
    const googleOAuthClient = createGoogleOAuthClient();
    if (!googleOAuthClient || !googleClientId) {
      throw new AppError('Connexion Google non configurée côté serveur', HTTP_STATUS.SERVICE_UNAVAILABLE);
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: payload.credential,
      audience: googleClientId,
    });

    const googleUser = ticket.getPayload();
    const email = googleUser?.email?.trim().toLowerCase();
    if (!email) {
      throw new AppError('Compte Google invalide', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!googleUser?.email_verified) {
      throw new AppError('Email Google non vérifié', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await this.findUserByEmail(email);
    if (!user) {
      if (email === env.GOOGLE_SUPER_ADMIN_EMAIL.toLowerCase()) {
        throw new AppError(
          'Compte super admin introuvable. Veuillez vérifier le compte existant ou utiliser le login classique.',
          HTTP_STATUS.NOT_FOUND
        );
      }

      throw new AppError('Aucun compte ByGagoos associé à cet email Google', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Compte désactivé. Contactez l\'administrateur.', HTTP_STATUS.FORBIDDEN);
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = RefreshTokenService.generateToken();
    await RefreshTokenService.storeToken(user.id, refreshToken);

    logger.info(`✅ Connexion Google: ${user.email}`);

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async googleCallback(code: string, redirectUri: string) {
    const googleOAuthClient = createGoogleOAuthClient(redirectUri);
    if (!googleOAuthClient || !googleClientId) {
      throw new AppError('Connexion Google non configurée côté serveur', HTTP_STATUS.SERVICE_UNAVAILABLE);
    }

    const { tokens } = await googleOAuthClient.getToken(code);
    if (!tokens.id_token) {
      throw new AppError('Jeton Google invalide', HTTP_STATUS.UNAUTHORIZED);
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    const googleUser = ticket.getPayload();
    const email = googleUser?.email?.trim().toLowerCase();
    if (!email) {
      throw new AppError('Compte Google invalide', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!googleUser?.email_verified) {
      throw new AppError('Email Google non vérifié', HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new AppError('Aucun compte ByGagoos associé à cet email Google', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('Compte désactivé. Contactez l\'administrateur.', HTTP_STATUS.FORBIDDEN);
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = RefreshTokenService.generateToken();
    await RefreshTokenService.storeToken(user.id, refreshToken);

    logger.info(`✅ Connexion Google OAuth: ${user.email}`);

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(oldRefreshToken: string) {
    const userId = await RefreshTokenService.verifyToken(oldRefreshToken);
    if (!userId) throw new AppError('Session expirée', HTTP_STATUS.UNAUTHORIZED);

    const user = await User.findById(userId);
    if (!user || !user.isActive) throw new AppError('Accès interdit', HTTP_STATUS.FORBIDDEN);

    const newRefreshToken = await RefreshTokenService.rotateToken(oldRefreshToken, userId);
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, refreshToken: string) {
    await RefreshTokenService.revokeToken(refreshToken);
    logger.info(`👋 Déconnexion: ${userId}`);
    return true;
  }

  async getMe(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new AppError('Utilisateur non trouvé', HTTP_STATUS.NOT_FOUND);
    return this.formatUserResponse(user);
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Utilisateur non trouvé', HTTP_STATUS.NOT_FOUND);

    if (updateData.name) user.name = updateData.name;
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.avatar) user.avatar = updateData.avatar;
    
    if (updateData.address) {
      const userObj = user as unknown as Record<string, unknown>;
      userObj.address = updateData.address;
    }

    if (updateData.firstName || updateData.lastName) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    await user.save();
    return this.formatUserResponse(user);
  }

  async changePassword(userId: string, current: string, next: string, confirm: string) {
    if (next !== confirm) throw new AppError('Mots de passe différents', HTTP_STATUS.BAD_REQUEST);
    const user = await User.findById(userId).select('+password');
    const userWithPass = user as unknown as Record<string, string>;

    if (!user || !(await bcrypt.compare(current, userWithPass.password || ''))) {
      throw new AppError('Ancien mot de passe incorrect', HTTP_STATUS.BAD_REQUEST);
    }
    user.password = await bcrypt.hash(next, 12);
    await user.save();
    await RefreshTokenService.revokeAllUserTokens(userId);
  }
}

export default new AuthService();
