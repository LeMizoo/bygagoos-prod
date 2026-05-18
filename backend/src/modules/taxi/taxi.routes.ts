import { Router } from 'express';
import { taxiController } from './taxi.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import vehicleRoutes from './vehicles/vehicle.routes';

const router = Router();
router.use(protect);
router.use(authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']));

// ✅ Routes spécifiques (doivent être placées AVANT les routes avec paramètres)
router.get('/maintenance', (req, res) => taxiController.getMaintenanceDueSoon(req, res));

// Routes CRUD pour les véhicules
// Le module `vehicles` expose le contrat réellement utilisé par le frontend
// (plateNumber, brand, model, status) et remplace l'ancien mapping legacy.
router.use('/vehicles', vehicleRoutes);

// Routes pour les trajets
router.get('/trips/today', (req, res) => taxiController.getTodayTrips(req, res));
router.post('/trips', (req, res) => taxiController.createTrip(req, res));
router.patch('/trips/:id/status', (req, res) => taxiController.updateTripStatus(req, res));

// Routes pour la maintenance
router.get('/maintenance/due-soon', (req, res) => taxiController.getMaintenanceDueSoon(req, res));
router.get('/stats', (req, res) => taxiController.getFleetStats(req, res));

export default router;
