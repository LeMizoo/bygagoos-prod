import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { 
  getSuperAdminStats, 
  getAdminStats, 
  getUserStats 
} from './dashboard.controller';

const router = Router();

// Toutes les routes dashboard nécessitent une authentification
router.use(protect);

// Super Admin uniquement
router.get(
  '/super-admin-stats',
  roleMiddleware(['SUPER_ADMIN']),
  getSuperAdminStats
);

// Admin et Super Admin
router.get(
  '/admin-stats',
  roleMiddleware(['ADMIN', 'SUPER_ADMIN']),
  getAdminStats
);

// Tous les utilisateurs authentifiés
router.get(
  '/user-stats',
  getUserStats
);

export default router;