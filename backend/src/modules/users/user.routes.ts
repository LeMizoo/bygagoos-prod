import { Router } from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware';
import { UserRole } from '../../core/types/userRoles';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
} from './user.controller';

const router = Router();

// Toutes les routes utilisateurs nécessitent une authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/me', (req, res) => {
  // Rediriger vers le contrôleur auth
  res.redirect('/api/auth/me');
});

router.post('/change-password', changePassword);

// Routes réservées aux admins
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;