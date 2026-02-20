import { Router } from 'express';
import { protect, authorize } from '../../middlewares/auth.middleware';
import { UserRole } from '../../core/types/userRoles';
import { validate } from '../../core/middlewares/validate';
import { queryOrderSchema, createOrderSchema, updateOrderSchema, addPaymentSchema } from './dto';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  addPayment,
  getOrderStats
} from './order.controller';

const router = Router();

// Toutes les routes commandes nécessitent une authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/stats', getOrderStats);
router.get('/', validate(queryOrderSchema, 'query'), getOrders);
router.get('/:id', getOrderById);
router.post('/', validate(createOrderSchema, 'body'), createOrder);
router.put('/:id', validate(updateOrderSchema, 'body'), updateOrder);
router.post('/:id/payments', validate(addPaymentSchema, 'body'), addPayment);
router.delete('/:id', deleteOrder);

export default router;