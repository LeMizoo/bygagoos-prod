import { z } from 'zod';
import { PaymentMethod } from '../order.model';

const orderItemSchema = z.object({
  designId: z.string().optional().nullable(),
  description: z.string().min(3, 'La description doit contenir au moins 3 caractères'),
  quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
  unitPrice: z.number().min(0, 'Le prix unitaire ne peut pas être négatif'),
  notes: z.string().optional().nullable()
});

export const createOrderSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  items: z.array(orderItemSchema).min(1, 'Au moins un article est requis'),
  tax: z.number().min(0, 'La taxe ne peut pas être négative').default(0),
  discount: z.number().min(0, 'La remise ne peut pas être négative').default(0),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  paymentDue: z.string().optional().nullable().transform(val => val ? new Date(val) : undefined),
  paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]).optional()
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;