import bcrypt from 'bcrypt';
import User, { IUser } from './user.model';
import { AppError } from '../../core/utils/errors/AppError';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { UserRole } from '../../core/types/userRoles'; // Importer l'enum
import { env } from '../../config/env';
import logger from '../../core/utils/logger';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: UserRole; // CHANGÉ: Utiliser UserRole au lieu de string
  phone?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: UserRole; // CHANGÉ: Utiliser UserRole au lieu de string
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

export class UsersService {
  private static readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(data: CreateUserDto): Promise<IUser> {
    try {
      const existingUser = await User.findOne({ email: data.email.toLowerCase() });
      if (existingUser) {
        throw new AppError('Un utilisateur avec cet email existe déjà', HTTP_STATUS.CONFLICT);
      }

      const hashedPassword = await bcrypt.hash(data.password, UsersService.BCRYPT_ROUNDS);

      // CORRECTION: Utiliser UserRole pour le typage
      let role: UserRole = data.role || UserRole.CLIENT;
      if (role === 'USER' as UserRole) role = UserRole.CLIENT;

      const userData: any = {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: role,
        isActive: true,
        phone: data.phone || '',
        avatar: data.avatar
      };

      if (data.firstName && data.lastName) {
        userData.firstName = data.firstName;
        userData.lastName = data.lastName;
        userData.name = `${data.firstName} ${data.lastName}`;
      } else if (data.name) {
        userData.name = data.name;
        const nameParts = data.name.split(' ');
        userData.firstName = nameParts[0] || '';
        userData.lastName = nameParts.slice(1).join(' ') || '';
      } else {
        userData.name = data.email.split('@')[0];
        userData.firstName = userData.name;
        userData.lastName = '';
      }

      const user = await User.create(userData);
      
      logger.info(`✅ Utilisateur créé: ${user.email} (${user.role})`);
      
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('❌ Erreur createUser:', error);
      throw new AppError('Erreur lors de la création de l\'utilisateur', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Trouver un utilisateur par email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Trouver un utilisateur par ID
   */
  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new AppError('Utilisateur non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      if (data.email) user.email = data.email.toLowerCase();
      if (data.firstName) user.firstName = data.firstName;
      if (data.lastName) user.lastName = data.lastName;
      if (data.name) user.name = data.name;
      if (data.role) user.role = data.role; // CORRECTION: Maintenant UserRole
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.avatar !== undefined) user.avatar = data.avatar;
      if (data.isActive !== undefined) user.isActive = data.isActive;

      if (data.firstName || data.lastName) {
        user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      }

      await user.save();
      
      logger.info(`✅ Utilisateur mis à jour: ${user.email}`);
      
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('❌ Erreur updateUser:', error);
      throw new AppError('Erreur lors de la mise à jour de l\'utilisateur', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(id).select('+password');
      if (!user) {
        throw new AppError('Utilisateur non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        throw new AppError('Ancien mot de passe incorrect', HTTP_STATUS.UNAUTHORIZED);
      }

      const hashedPassword = await bcrypt.hash(newPassword, UsersService.BCRYPT_ROUNDS);

      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      logger.info(`✅ Mot de passe changé pour l'utilisateur ${id}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('❌ Erreur changePassword:', error);
      throw new AppError('Erreur lors du changement de mot de passe', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new AppError('Utilisateur non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      user.isActive = false;
      await user.save();
      
      logger.info(`✅ Utilisateur désactivé: ${user.email}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('❌ Erreur deleteUser:', error);
      throw new AppError('Erreur lors de la suppression de l\'utilisateur', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Lister tous les utilisateurs
   */
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: IUser[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments()
      ]);

      return { users, total };
    } catch (error) {
      logger.error('❌ Erreur getAllUsers:', error);
      throw new AppError('Erreur lors de la récupération des utilisateurs', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Vérifier si un email est déjà utilisé
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { email: email.toLowerCase() };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    
    const user = await User.findOne(query);
    return !!user;
  }

  /**
   * Alias pour findAll (accepte query parameters)
   */
  async findAll(query?: any): Promise<IUser[]> {
    try {
      const page = parseInt(query?.page) || 1;
      const limit = parseInt(query?.limit) || 20;
      
      const result = await this.getAllUsers(page, limit);
      return result.users;
    } catch (error) {
      logger.error('Erreur findAll:', error);
      throw error;
    }
  }

  /**
   * Alias pour update (accepte les mêmes paramètres)
   */
  async update(id: string, data: UpdateUserDto): Promise<IUser | null> {
    return this.updateUser(id, data);
  }

  /**
   * Alias pour delete (accepte les mêmes paramètres)
   */
  async delete(id: string): Promise<void> {
    return this.deleteUser(id);
  }
}

export default new UsersService();