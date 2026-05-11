import { z } from 'zod';
import { TaxiVehicleStatus } from '../vehicle.model';

export const createTaxiVehicleSchema = z.object({
  plateNumber: z.string().min(1, 'La plaque est requise'),
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  color: z.string().optional().nullable(),
  year: z.number().int().min(1950).max(2100).optional().nullable(),
  status: z.enum(Object.values(TaxiVehicleStatus) as [string, ...string[]]).optional(),
  currentMileage: z.number().int().min(0).optional().nullable(),
  lastMaintenanceAt: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateTaxiVehicleDto = z.infer<typeof createTaxiVehicleSchema>;
