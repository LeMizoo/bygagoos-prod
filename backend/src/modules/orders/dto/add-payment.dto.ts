import { z } from 'zod';
import { PaymentMethod } from '../order.model';

export const addPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  method: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
  transactionId: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

export type AddPaymentDto = z.infer<typeof addPaymentSchema>;