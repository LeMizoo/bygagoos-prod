import { z } from 'zod';
import { OrderPriority, OrderStatus, PaymentStatus } from './order.model';

const orderDesignSchema = z.object({
  design: z.string().min(1, "L'ID du design est requis"),
  quantity: z.coerce.number().int().min(1, 'La quantite doit etre au moins 1'),
  modifications: z.string().trim().max(2000, 'Les modifications sont trop longues').optional().nullable(),
  previewUrl: z.string().trim().optional().nullable(),
});

const discountSchema = z.object({
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, 'La reduction doit etre positive'),
  reason: z.string().trim().max(500, 'La raison est trop longue').optional().nullable(),
});

const createOrderBaseSchema = z.object({
  client: z.string().min(1, "L'ID du client est requis").optional(),
  clientId: z.string().min(1, "L'ID du client est requis").optional(),
  title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caracteres'),
  description: z.string().trim().max(2000, 'La description est trop longue').optional().nullable(),
  priority: z.nativeEnum(OrderPriority).default(OrderPriority.MEDIUM),
  requestedDate: z.coerce.date(),
  designs: z.array(orderDesignSchema).min(1, 'Au moins un design est requis'),
  taxRate: z.coerce.number().min(0, 'La TVA doit etre positive').max(100, 'La TVA ne peut pas depasser 100').default(20),
  discount: discountSchema.optional().nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const createOrderSchema = createOrderBaseSchema.superRefine((data, ctx) => {
  if (!data.client && !data.clientId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "L'ID du client est requis",
      path: ['client'],
    });
  }
});

export const updateOrderSchema = z.object({
  client: z.string().min(1, "L'ID du client est requis").optional(),
  clientId: z.string().min(1, "L'ID du client est requis").optional(),
  title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caracteres').optional(),
  description: z.string().trim().max(2000, 'La description est trop longue').optional().nullable(),
  priority: z.nativeEnum(OrderPriority).optional(),
  requestedDate: z.coerce.date().optional(),
  designs: z.array(orderDesignSchema).min(1, 'Au moins un design est requis').optional(),
  taxRate: z.coerce.number().min(0, 'La TVA doit etre positive').max(100, 'La TVA ne peut pas depasser 100').optional(),
  discount: discountSchema.optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  comment: z.string().trim().max(2000, 'Le commentaire est trop long').optional().nullable(),
});

const assignedTeamSchema = z.object({
  designer: z.string().min(1).optional(),
  validator: z.string().min(1).optional(),
  producer: z.string().min(1).optional(),
}).refine((value) => Boolean(value.designer || value.validator || value.producer), {
  message: 'Au moins un assigne est requis',
});

export const assignOrderSchema = z.object({
  assignedTo: z.union([
    z.array(z.string().min(1)).min(1),
    assignedTeamSchema,
  ]).transform((value) => {
    if (Array.isArray(value)) {
      return {
        designer: value[0],
        validator: value[1],
        producer: value[2],
      };
    }

    return value;
  }),
});

export const addMessageSchema = z.object({
  content: z.string().trim().min(1, 'Le contenu du message est requis').max(5000, 'Le message est trop long'),
  attachments: z.array(z.string().min(1)).optional(),
});

export const orderFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
  clientId: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(['orderNumber', 'client', 'title', 'priority', 'status', 'requestedDate', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
