import { z } from 'zod';
import { TaxiVehicleStatus } from '../vehicle.model';

export const queryTaxiVehicleSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(Object.values(TaxiVehicleStatus) as [string, ...string[]]).optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type QueryTaxiVehicleDto = z.infer<typeof queryTaxiVehicleSchema>;
