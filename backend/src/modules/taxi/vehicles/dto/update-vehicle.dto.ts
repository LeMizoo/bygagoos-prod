import { z } from 'zod';
import { createTaxiVehicleSchema } from './create-vehicle.dto';
import { TaxiVehicleStatus } from '../vehicle.model';

export const updateTaxiVehicleSchema = createTaxiVehicleSchema.partial().extend({
  status: z.enum(Object.values(TaxiVehicleStatus) as [string, ...string[]]).optional(),
});

export type UpdateTaxiVehicleDto = z.infer<typeof updateTaxiVehicleSchema>;
