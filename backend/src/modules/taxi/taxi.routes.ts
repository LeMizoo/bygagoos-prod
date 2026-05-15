import { Router } from 'express';
import { taxiController } from './taxi.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();
router.use(protect);
router.use(authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']));

// ✅ Routes spécifiques (doivent être placées AVANT les routes avec paramètres)
router.get('/vehicles/stats', (req, res) => taxiController.getFleetStats(req, res));
router.get('/maintenance', (req, res) => taxiController.getMaintenanceDueSoon(req, res));

// Routes CRUD pour les véhicules
router.get('/vehicles', (req, res) => taxiController.getVehicles(req, res));
router.get('/vehicles/:id', (req, res) => taxiController.getVehicleById(req, res));
router.post('/vehicles', (req, res) => taxiController.createVehicle(req, res));
router.put('/vehicles/:id', (req, res) => taxiController.updateVehicle(req, res));
router.delete('/vehicles/:id', (req, res) => taxiController.deleteVehicle(req, res));

// Routes pour les trajets
router.get('/trips/today', (req, res) => taxiController.getTodayTrips(req, res));
router.post('/trips', (req, res) => taxiController.createTrip(req, res));
router.patch('/trips/:id/status', (req, res) => taxiController.updateTripStatus(req, res));

// Routes pour la maintenance
router.get('/maintenance/due-soon', (req, res) => taxiController.getMaintenanceDueSoon(req, res));
router.get('/stats', (req, res) => taxiController.getFleetStats(req, res));

export default router;