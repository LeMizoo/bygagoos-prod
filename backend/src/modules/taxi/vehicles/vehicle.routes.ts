import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { validate } from '../../../core/middlewares/validate';
import { createTaxiVehicleSchema, queryTaxiVehicleSchema, updateTaxiVehicleSchema } from './dto';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
} from './vehicle.controller';

const router = Router();

router.use(protect);

router.get('/stats', getVehicleStats);
router.get('/', validate(queryTaxiVehicleSchema, 'query'), getVehicles);
router.get('/:id', getVehicleById);
router.post('/', validate(createTaxiVehicleSchema, 'body'), createVehicle);
router.put('/:id', validate(updateTaxiVehicleSchema, 'body'), updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
