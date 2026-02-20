import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { AuthRequest } from '../../middlewares/auth.middleware';

const usersService = new UsersService();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await usersService.findAll(req.query);
    apiResponse.success(res, { users, count: users.length }, 'Utilisateurs récupérés');
  } catch (error: any) {
    console.error('Erreur getUsers:', error);
    apiResponse.error(res, error.message || 'Erreur lors de la récupération des utilisateurs', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID utilisateur requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const user = await usersService.findById(id);
    apiResponse.success(res, { user }, 'Utilisateur récupéré');
  } catch (error: any) {
    console.error('Erreur getUserById:', error);
    
    if (error.message === 'Utilisateur non trouvé') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la récupération de l\'utilisateur', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID utilisateur requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const user = await usersService.update(id, req.body);
    apiResponse.success(res, { user }, 'Utilisateur mis à jour');
  } catch (error: any) {
    console.error('Erreur updateUser:', error);
    
    if (error.message === 'Utilisateur non trouvé') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'Cet email est déjà utilisé') {
      apiResponse.error(res, error.message, HTTP_STATUS.CONFLICT);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la mise à jour', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID utilisateur requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    await usersService.delete(id);
    apiResponse.success(res, null, 'Utilisateur supprimé');
  } catch (error: any) {
    console.error('Erreur deleteUser:', error);
    
    if (error.message === 'Utilisateur non trouvé') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la suppression', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      apiResponse.error(res, 'Ancien et nouveau mot de passe requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    if (newPassword.length < 6) {
      apiResponse.error(res, 'Le nouveau mot de passe doit contenir au moins 6 caractères', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    await usersService.changePassword(userId, oldPassword, newPassword);
    apiResponse.success(res, null, 'Mot de passe changé avec succès');
  } catch (error: any) {
    console.error('Erreur changePassword:', error);
    
    if (error.message === 'Ancien mot de passe incorrect') {
      apiResponse.error(res, error.message, HTTP_STATUS.UNAUTHORIZED);
    } else if (error.message === 'Utilisateur non trouvé') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors du changement de mot de passe', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};