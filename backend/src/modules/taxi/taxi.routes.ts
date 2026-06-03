import { Router } from 'express';
import { taxiController } from './taxi.controller';
import { driverController } from './driver.controller';
import { protect } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import vehicleRoutes from './vehicles/vehicle.routes';

const router = Router();
router.use(protect);
router.use(authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER']));

// ==================== ROUTES SPÉCIFIQUES ====================
// (doivent être placées AVANT les routes avec paramètres)
router.get('/maintenance', (req, res) => taxiController.getMaintenanceDueSoon(req, res));

// ==================== ROUTES VÉHICULES ====================
// Le module `vehicles` expose le contrat réellement utilisé par le frontend
// (plateNumber, brand, model, status) et remplace l'ancien mapping legacy.
router.use('/vehicles', vehicleRoutes);

// ==================== ROUTES CONDUCTEURS (DRIVERS) ====================
router.get('/drivers', (req, res) => driverController.getDrivers(req, res));
router.get('/drivers/stats', (req, res) => driverController.getDriverStats(req, res));
router.get('/drivers/:id', (req, res) => driverController.getDriverById(req, res));
router.post('/drivers', (req, res) => driverController.createDriver(req, res));
router.put('/drivers/:id', (req, res) => driverController.updateDriver(req, res));
router.delete('/drivers/:id', (req, res) => driverController.deleteDriver(req, res));
router.post('/drivers/assign-vehicle', (req, res) => driverController.assignVehicle(req, res));
router.post('/drivers/:id/unassign-vehicle', (req, res) => driverController.unassignVehicle(req, res));
router.patch('/drivers/:id/status', (req, res) => driverController.updateDriverStatus(req, res));

// ==================== ROUTES TRAJETS ====================
router.get('/trips/today', (req, res) => taxiController.getTodayTrips(req, res));
router.post('/trips', (req, res) => taxiController.createTrip(req, res));
router.patch('/trips/:id/status', (req, res) => taxiController.updateTripStatus(req, res));

// ==================== ROUTES MAINTENANCE ====================
router.get('/maintenance/due-soon', (req, res) => taxiController.getMaintenanceDueSoon(req, res));
router.get('/stats', (req, res) => taxiController.getFleetStats(req, res));

export default router;