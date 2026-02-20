import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '../order.model';

export const queryOrderSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  search: z.string().optional(),
  clientId: z.string().optional(),
  status: z.enum(Object.values(OrderStatus) as [string, ...string[]]).optional(),
  paymentStatus: z.enum(Object.values(PaymentStatus) as [string, ...string[]]).optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dateTo: z.string().optional().transform(val => val ? new Date(val) : undefined),
  sortBy: z.enum(['orderNumber', 'client', 'total', 'status', 'createdAt', 'paymentDue']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export type QueryOrderDto = z.infer<typeof queryOrderSchema>;