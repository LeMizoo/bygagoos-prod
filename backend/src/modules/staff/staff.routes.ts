import { Router, Request } from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware';
import { UserRole } from '../../core/types/userRoles';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import Staff from './staff.model';

const router = Router();

// Toutes les routes staff nécessitent une authentification
router.use(protect);

// GET /staff - Récupérer tous les membres du staff
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER), async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true })
      .populate('user', 'email firstName lastName avatar')
      .sort('-createdAt');

    apiResponse.success(res, { staff, count: staff.length }, 'Staff récupéré');
  } catch (error) {
    console.error('Erreur get staff:', error);
    apiResponse.error(res, 'Erreur lors de la récupération du staff', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// GET /staff/:id - Récupérer un membre du staff par ID
router.get('/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER), async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Staff.findById(id).populate('user', 'email firstName lastName avatar');

    if (!member) {
      apiResponse.error(res, 'Membre non trouvé', HTTP_STATUS.NOT_FOUND);
      return;
    }

    apiResponse.success(res, { staff: member }, 'Membre récupéré');
  } catch (error) {
    console.error('Erreur get staff by id:', error);
    apiResponse.error(res, 'Erreur lors de la récupération du membre', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// POST /staff - Créer un nouveau membre du staff
router.post('/', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), async (req, res) => {
  try {
    const staffData = {
      ...req.body,
      createdBy: req.user?._id
    };

    const staff = await Staff.create(staffData);
    apiResponse.success(res, { staff }, 'Membre créé avec succès', HTTP_STATUS.CREATED);
  } catch (error: any) {
    console.error('Erreur create staff:', error);
    
    if (error.code === 11000) {
      apiResponse.error(res, 'Cet email est déjà utilisé', HTTP_STATUS.CONFLICT);
    } else if (error.name === 'ValidationError') {
      apiResponse.error(res, 'Données invalides', HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, 'Erreur lors de la création', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
});

// PUT /staff/:id - Mettre à jour un membre
router.put('/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!staff) {
      apiResponse.error(res, 'Membre non trouvé', HTTP_STATUS.NOT_FOUND);
      return;
    }

    apiResponse.success(res, { staff }, 'Membre mis à jour');
  } catch (error: any) {
    console.error('Erreur update staff:', error);
    
    if (error.code === 11000) {
      apiResponse.error(res, 'Cet email est déjà utilisé', HTTP_STATUS.CONFLICT);
    } else if (error.name === 'ValidationError') {
      apiResponse.error(res, 'Données invalides', HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, 'Erreur lors de la mise à jour', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
});

// DELETE /staff/:id - Supprimer (désactiver) un membre
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!staff) {
      apiResponse.error(res, 'Membre non trouvé', HTTP_STATUS.NOT_FOUND);
      return;
    }

    apiResponse.success(res, null, 'Membre désactivé');
  } catch (error) {
    console.error('Erreur delete staff:', error);
    apiResponse.error(res, 'Erreur lors de la suppression', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

export default router;