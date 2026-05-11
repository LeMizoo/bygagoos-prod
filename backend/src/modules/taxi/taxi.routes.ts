import { Router } from 'express';
import vehicleRoutes from './vehicles/vehicle.routes';

const router = Router();

router.use('/vehicles', vehicleRoutes);

export default router;
