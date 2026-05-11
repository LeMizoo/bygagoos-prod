import { Router } from 'express';
import { restaurantController } from './restaurant.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

router.use(protect);
router.use(authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']));

router.get('/tables', (req, res) => restaurantController.getTables(req, res));
router.patch('/tables/:id/status', (req, res) => restaurantController.updateTableStatus(req, res));

router.get('/reservations', (req, res) => restaurantController.getReservations(req, res));
router.get('/reservations/today', (req, res) => restaurantController.getTodayReservations(req, res));
router.post('/reservations', (req, res) => restaurantController.createReservation(req, res));

router.get('/menu', (req, res) => restaurantController.getMenu(req, res));
router.get('/menu/featured', (req, res) => restaurantController.getFeaturedMenu(req, res));

router.get('/stock/alerts', (req, res) => restaurantController.getStockAlerts(req, res));

router.get('/stats', (req, res) => restaurantController.getRestaurantStats(req, res));

export default router;