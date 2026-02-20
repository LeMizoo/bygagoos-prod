import { z } from 'zod';
import { createOrderSchema } from './create-order.dto';
import { OrderStatus, PaymentStatus } from '../order.model';

export const updateOrderSchema = createOrderSchema.partial().extend({
  status: z.enum(Object.values(OrderStatus) as [string, ...string[]]).optional(),
  paymentStatus: z.enum(Object.values(PaymentStatus) as [string, ...string[]]).optional(),
  cancelledReason: z.string().optional().nullable()
});

export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;