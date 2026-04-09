// backend/src/modules/auth/auth.service.ts

import User from '../users/user.model';
import { generateAccessToken } from './utils/jwt';
import { RefreshTokenService } from './refreshToken.service';
import bcrypt from 'bcrypt';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import logger from '../../core/utils/logger';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto';
import { env } from '../../config/env';
import { Document } from 'mongoose';

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

  async register(userData: RegisterDto) {
    const { email, password, firstName, lastName, phone } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email déjà utilisé', HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
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
    const { email, password } = credentials;

    const user = await User.findOne({ email }).select('+password');
    // Utilisation d'une assertion vers un objet littéral pour accéder au password hashé
    const userWithPass = user as unknown as Record<string, string>;
    
    if (!user || !(await bcrypt.compare(password, userWithPass.password || ''))) {
      throw new AppError('Email ou mot de passe incorrect', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError("Compte désactivé", HTTP_STATUS.FORBIDDEN);
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = RefreshTokenService.generateToken();
    await RefreshTokenService.storeToken(user.id, refreshToken);

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