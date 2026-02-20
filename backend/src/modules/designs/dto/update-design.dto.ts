import { z } from 'zod';
import { createDesignSchema } from './create-design.dto';
import { DesignStatus } from '../design.model';

export const updateDesignSchema = createDesignSchema.partial().extend({
  status: z.enum(Object.values(DesignStatus) as [string, ...string[]]).optional(),
  addTags: z.array(z.string()).optional(),
  removeTags: z.array(z.string()).optional()
});

export type UpdateDesignDto = z.infer<typeof updateDesignSchema>;