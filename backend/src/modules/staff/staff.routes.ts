// backend/src/modules/staff/staff.routes.ts

import { Router, Request, Response } from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware';
import { UserRole } from '../../core/types/userRoles';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import Staff from './staff.model';
import logger from '../../core/utils/logger';
import { upload, handleMulterError } from '../../config/multer';
import path from 'path';

const router = Router();

// Toutes les routes staff nécessitent une authentification
router.use(protect);

// ✅ GET /staff - Accessible à tous les utilisateurs authentifiés
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info(`📥 GET /staff - User: ${req.user?.email} (${req.user?.role})`);

    const staff = await Staff.find({ isActive: true })
      .populate('user', 'email firstName lastName avatar role')
      .sort('-createdAt');

    logger.debug(`📊 Staff récupéré: ${staff.length} membres`);

    return apiResponse.success(res, staff, 'Staff récupéré avec succès');
  } catch (error) {
    logger.error('❌ Erreur get staff:', error);
    return apiResponse.error(res, 'Erreur lors de la récupération du staff', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// ✅ GET /staff/:id - Accessible à tous les utilisateurs authentifiés
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`📥 GET /staff/${id} - User: ${req.user?.email}`);

    const member = await Staff.findById(id)
      .populate('user', 'email firstName lastName avatar role');

    if (!member) {
      logger.warn(`⚠️ Staff non trouvé: ${id}`);
      return apiResponse.error(res, 'Membre non trouvé', HTTP_STATUS.NOT_FOUND);
    }

    return apiResponse.success(res, member, 'Membre récupéré avec succès');
  } catch (error) {
    logger.error(`❌ Erreur get staff by id ${req.params.id}:`, error);
    return apiResponse.error(res, 'Erreur lors de la récupération du membre', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// 🔐 POST /staff - Réservé aux admins
router.post('/', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    logger.info(`📥 POST /staff - User: ${req.user?.email} (${req.user?.role})`);

    const staffData = {
      ...req.body,
      createdBy: req.user?._id,
      createdByEmail: req.user?.email
    };

    // Vérifier si l'email existe déjà
    const existingStaff = await Staff.findOne({ email: staffData.email });
    if (existingStaff) {
      logger.warn(`⚠️ Email déjà utilisé: ${staffData.email}`);
      return apiResponse.error(res, 'Cet email est déjà utilisé', HTTP_STATUS.CONFLICT);
    }

    const staff = await Staff.create(staffData);
    
    logger.info(`✅ Staff créé: ${staff.firstName} ${staff.lastName} (${staff.email})`);
    
    return apiResponse.success(res, staff, 'Membre créé avec succès', HTTP_STATUS.CREATED);
  } catch (error: unknown) {
    const err = error as any;
    logger.error('❌ Erreur create staff:', err);
    
    if (err.code === 11000) {
      return apiResponse.error(res, 'Cet email est déjà utilisé', HTTP_STATUS.CONFLICT);
    } else if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      return apiResponse.error(res, messages.join(', '), HTTP_STATUS.BAD_REQUEST);
    } else {
      return apiResponse.error(res, 'Erreur lors de la création', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
});

// 🔐 PUT /staff/:id - Réservé aux admins
router.put('/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`📥 PUT /staff/${id} - User: ${req.user?.email}`);

    // Vérifier si l'email est modifié et déjà utilisé
    if (req.body.email) {
      const existingStaff = await Staff.findOne({ 
        email: req.body.email,
        _id: { $ne: id }
      });
      
      if (existingStaff) {
        logger.warn(`⚠️ Email déjà utilisé par un autre membre: ${req.body.email}`);
        return apiResponse.error(res, 'Cet email est déjà utilisé par un autre membre', HTTP_STATUS.CONFLICT);
      }
    }

    const staff = await Staff.findByIdAndUpdate(
      id,
      { 
        $set: {
          ...req.body,
          updatedBy: req.user?._id,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!staff) {
      logger.warn(`⚠️ Staff non trouvé pour mise à jour: ${id}`);
      return apiResponse.error(res, 'Membre non trouvé', HTTP_STATUS.NOT_FOUND);
    }

    logger.info(`✅ Staff mis à jour: ${staff.firstName} ${staff.lastName}`);
    
    return apiResponse.success(res, staff, 'Membre mis à jour avec succès');
  } catch (error: unknown) {
    const err = error as any;
    logger.error(`❌ Erreur update staff ${req.params.id}:`, err);
    
    if (err.code === 11000) {
      return apiResponse.error(res, 'Cet email est déjà utilisé', HTTP_STATUS.CONFLICT);
    } else if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      return apiResponse.error(res, messages.join(', '), HTTP_STATUS.BAD_REQUEST);
    } else {
      return apiResponse.error(res, 'Erreur lors de la mise à jour', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
});

// 🔐 DELETE /staff/:id - Réservé aux admins (désactivation soft delete)
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`📥 DELETE /staff/${id} - User: ${req.user?.email}`);

    const staff = await Staff.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        active: false,
        deactivatedBy: req.user?._id,
        deactivatedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!staff) {
      logger.warn(`⚠️ Staff non trouvé pour suppression: ${id}`);
      return apiResponse.error(res, 'Membre non trouvé', HTTP_STATUS.NOT_FOUND);
    }

    logger.info(`✅ Staff désactivé: ${staff.firstName} ${staff.lastName}`);
    
    return apiResponse.success(res, staff, 'Membre désactivé avec succès');
  } catch (error) {
    logger.error(`❌ Erreur delete staff ${req.params.id}:`, error);
    return apiResponse.error(res, 'Erreur lors de la suppression', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// 🔐 PATCH /staff/:id/restore - Restaurer un membre désactivé
router.patch('/:id/restore', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`📥 PATCH /staff/${id}/restore - User: ${req.user?.email}`);

    const staff = await Staff.findByIdAndUpdate(
      id,
      { 
        isActive: true,
        active: true,
        restoredBy: req.user?._id,
        restoredAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!staff) {
      logger.warn(`⚠️ Staff non trouvé pour restauration: ${id}`);
      return apiResponse.error(res, 'Membre non trouvé', HTTP_STATUS.NOT_FOUND);
    }

    logger.info(`✅ Staff restauré: ${staff.firstName} ${staff.lastName}`);
    
    return apiResponse.success(res, staff, 'Membre restauré avec succès');
  } catch (error) {
    logger.error(`❌ Erreur restore staff ${req.params.id}:`, error);
    return apiResponse.error(res, 'Erreur lors de la restauration', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});
router.post('/:id/avatar', 
  protect, 
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.single('avatar'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      logger.info(`📥 POST /staff/${id}/avatar - User: ${req.user?.email}`);

      if (!req.file) {
        logger.warn(`⚠️ Aucun fichier fourni pour l'avatar: ${id}`);
        return apiResponse.error(res, 'Aucun fichier fourni', HTTP_STATUS.BAD_REQUEST);
      }

      const member = await Staff.findById(id);
      if (!member) {
        logger.warn(`⚠️ Membre non trouvé pour upload avatar: ${id}`);
        return apiResponse.error(res, 'Membre non trouvé', HTTP_STATUS.NOT_FOUND);
      }

      // Construire l'URL de l'avatar
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

      // Mettre à jour l'avatar du membre
      member.avatar = avatarUrl;
      member.updatedAt = new Date();
      await member.save();

      logger.info(`✅ Avatar mis à jour pour ${member.firstName} ${member.lastName}`);
      
      return apiResponse.success(res, {
        avatarUrl,
        filename: req.file.filename,
        member: {
          _id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          avatar: member.avatar
        }
      }, 'Avatar mis à jour avec succès');
    } catch (error) {
      logger.error(`❌ Erreur upload avatar ${req.params.id}:`, error);
      return apiResponse.error(res, 'Erreur lors de l\'upload de l\'avatar', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
);

// Gestionnaire d'erreurs Multer pour les routes d'avatar
// router.use(handleMulterError);

export default router;