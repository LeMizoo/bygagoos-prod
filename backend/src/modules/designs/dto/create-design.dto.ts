import { z } from 'zod';
import { DesignType, DesignStatus } from '../design.model';

export const createDesignSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional().nullable(),
  type: z.enum(Object.values(DesignType) as [string, ...string[]]),
  category: z.string().optional().nullable(),
  basePrice: z.coerce.number().optional().nullable(),
  status: z.enum(Object.values(DesignStatus) as [string, ...string[]]).optional().default(DesignStatus.DRAFT),
  clientId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : undefined),
  metadata: z.record(z.unknown()).optional().default({})
});

export type CreateDesignDto = z.infer<typeof createDesignSchema>;
