import { z } from 'zod';

export const queryClientSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'company', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  isActive: z.union([z.string(), z.boolean()]).optional().transform(val => val === true || val === 'true'),
  tags: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
    if (Array.isArray(val)) return val;
    return val ? val.split(',') : [];
  })
});

export type QueryClientDto = z.infer<typeof queryClientSchema>;