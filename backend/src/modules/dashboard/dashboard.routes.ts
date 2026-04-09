// backend/src/modules/dashboard/dashboard.routes.ts

import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { authorize, isSuperAdmin, isAdmin } from '../../middlewares/role.middleware'; // ✅ Import multiple
import { 
  getSuperAdminStats, 
  getAdminStats, 
  getUserStats 
} from './dashboard.controller';

const router = Router();

// Toutes les routes dashboard nécessitent une authentification
router.use(protect);

// Super Admin uniquement - Option 1: avec isSuperAdmin
router.get(
  '/super-admin-stats',
  isSuperAdmin, // ✅ Utilisation du middleware dédié
  getSuperAdminStats
);

// Super Admin uniquement - Option 2: avec authorize (équivalent)
router.get(
  '/super-admin-stats-alt',
  authorize(['SUPER_ADMIN']), // ✅ Alternative avec authorize
  getSuperAdminStats
);

// Admin et Super Admin - Option 1: avec isAdmin
router.get(
  '/admin-stats',
  isAdmin, // ✅ Utilisation du middleware dédié
  getAdminStats
);

// Admin et Super Admin - Option 2: avec authorize
router.get(
  '/admin-stats-alt',
  authorize(['ADMIN', 'SUPER_ADMIN']), // ✅ Alternative avec authorize
  getAdminStats
);

// Tous les utilisateurs authentifiés
router.get(
  '/user-stats',
  getUserStats // ✅ Pas de restriction de rôle
);

export default router;