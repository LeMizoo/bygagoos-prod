import { z } from 'zod';
import { createClientSchema } from './create-client.dto';

export const updateClientSchema = createClientSchema.partial();

export type UpdateClientDto = z.infer<typeof updateClientSchema>;