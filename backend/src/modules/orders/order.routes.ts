// backend/src/modules/orders/order.routes.ts

import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { apiLimiter } from '../../middlewares/rateLimit.middleware';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  assignOrder,
  addMessage,
  markMessagesAsRead,
  getOrderStats,
  getOrdersByClient,
  downloadInvoice,
  restoreOrder
} from './order.controller';

import {
  createOrderSchema,
  updateOrderSchema,
  updateStatusSchema,
  assignOrderSchema,
  addMessageSchema,
  orderFiltersSchema
} from './order.validator';

// Import du type UserRole
import { UserRole } from '../../core/types/userRoles';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(protect);

// Routes principales
router.route('/')
  .get(
    apiLimiter,
    validate(orderFiltersSchema, 'query'),
    authorize([ // ✅ Tableau de rôles
      UserRole.ADMIN, 
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER, 
      UserRole.DESIGNER, 
      UserRole.STAFF
    ]),
    getOrders
  )
  .post(
    apiLimiter,
    validate(createOrderSchema),
    authorize([ // ✅ Tableau de rôles
      UserRole.ADMIN, 
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER, 
      UserRole.CLIENT
    ]),
    createOrder
  );

// Statistiques
router.get('/stats',
  apiLimiter,
  authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]), // ✅ Tableau
  getOrderStats
);

// Routes par client
router.get('/client/:clientId',
  apiLimiter,
  authorize([ // ✅ Tableau
    UserRole.ADMIN, 
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER, 
    UserRole.DESIGNER, 
    UserRole.CLIENT
  ]),
  getOrdersByClient
);

// Restaurer commande archivée
router.post('/:id/restore',
  apiLimiter,
  authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN]), // ✅ Tableau avec un seul élément
  restoreOrder
);

// Routes pour une commande spécifique
router.route('/:id')
  .get(
    apiLimiter,
    authorize([ // ✅ Tableau
      UserRole.ADMIN, 
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER, 
      UserRole.DESIGNER, 
      UserRole.CLIENT
    ]),
    getOrderById
  )
  .patch(
    apiLimiter,
    validate(updateOrderSchema),
    authorize([ // ✅ Tableau
      UserRole.ADMIN, 
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER, 
      UserRole.DESIGNER
    ]),
    updateOrder
  )
  .delete(
    apiLimiter,
    authorize([UserRole.ADMIN]), // ✅ Tableau
    deleteOrder
  );

// Changement de statut
router.patch('/:id/status',
  apiLimiter,
  validate(updateStatusSchema),
  authorize([ // ✅ Tableau
    UserRole.ADMIN, 
    UserRole.MANAGER, 
    UserRole.DESIGNER
  ]),
  updateOrderStatus
);

// Assignation
router.patch('/:id/assign',
  apiLimiter,
  validate(assignOrderSchema),
    authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]), // ✅ Tableau
  assignOrder
);

// Messages
router.post('/:id/messages',
  apiLimiter,
  validate(addMessageSchema),
    authorize([ // ✅ Tableau
      UserRole.ADMIN, 
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER, 
      UserRole.DESIGNER, 
      UserRole.CLIENT
  ]),
  addMessage
);

router.patch('/:id/messages/read',
  apiLimiter,
    authorize([ // ✅ Tableau
      UserRole.ADMIN, 
      UserRole.SUPER_ADMIN,
      UserRole.MANAGER, 
      UserRole.DESIGNER, 
      UserRole.CLIENT
  ]),
  markMessagesAsRead
);

// Facture PDF
router.get('/:id/invoice',
  apiLimiter,
  authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.CLIENT]), // ✅ Tableau
  downloadInvoice
);

export default router;
