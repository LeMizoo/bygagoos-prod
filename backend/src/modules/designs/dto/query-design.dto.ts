import { z } from 'zod';
import { DesignStatus, DesignType } from '../design.model';

export const queryDesignSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
  status: z.enum(Object.values(DesignStatus) as [string, ...string[]]).optional(),
  type: z.enum(Object.values(DesignType) as [string, ...string[]]).optional(),
  clientId: z.string().optional(),
  assignedTo: z.string().optional(),
  sortBy: z.enum(['title', 'status', 'type', 'createdAt', 'dueDate']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  isActive: z.union([z.string(), z.boolean()]).optional().transform(val => val === true || val === 'true'),
  tags: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
    if (Array.isArray(val)) return val;
    return val ? val.split(',') : [];
  })
});

export type QueryDesignDto = z.infer<typeof queryDesignSchema>;