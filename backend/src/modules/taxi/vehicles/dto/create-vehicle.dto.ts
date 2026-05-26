import { z } from 'zod';
import { TaxiVehicleStatus } from '../vehicle.model';

const currentLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional().nullable(),
  heading: z.number().min(0).max(360).optional().nullable(),
  speed: z.number().min(0).optional().nullable(),
  updatedAt: z.coerce.date().optional().nullable(),
});

export const createTaxiVehicleSchema = z.object({
  plateNumber: z.string().min(1, 'La plaque est requise'),
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  color: z.string().optional().nullable(),
  year: z.number().int().min(1950).max(2100).optional().nullable(),
  status: z.enum(Object.values(TaxiVehicleStatus) as [string, ...string[]]).optional(),
  currentLocation: currentLocationSchema.optional().nullable(),
  currentMileage: z.number().int().min(0).optional().nullable(),
  lastMaintenanceAt: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateTaxiVehicleDto = z.infer<typeof createTaxiVehicleSchema>;
