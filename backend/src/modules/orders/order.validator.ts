// backend/src/modules/orders/order.validator.ts

import { z } from 'zod';

// Schéma pour les items de commande
const orderItemSchema = z.object({
  designId: z.string().min(1, "L'ID du design est requis"),
  quantity: z.number().min(1, "La quantité doit être au moins 1"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  totalPrice: z.number().min(0, "Le prix total doit être positif").optional(),
  notes: z.string().optional()
});

// Schéma pour les paiements
const paymentSchema = z.object({
  amount: z.number().min(0, "Le montant doit être positif"),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'PAYPAL', 'STRIPE']),
  date: z.date().optional(),
  transactionId: z.string().optional()
});

// Schéma pour les messages
const messageSchema = z.object({
  sender: z.string().min(1, "L'expéditeur est requis"),
  content: z.string().min(1, "Le contenu du message est requis"),
  isRead: z.boolean().optional().default(false),
  attachments: z.array(z.string()).optional()
});

// Schéma pour la création de commande
export const createOrderSchema = z.object({
  orderNumber: z.string().optional(),
  clientId: z.string().min(1, "L'ID du client est requis"),
  items: z.array(orderItemSchema).min(1, "Au moins un article est requis"),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED']).default('PENDING'),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED', 'FAILED']).default('PENDING'),
  subtotal: z.number().min(0, "Le sous-total doit être positif"),
  tax: z.number().min(0, "La TVA doit être positive").default(0),
  discount: z.number().min(0, "La réduction doit être positive").default(0),
  total: z.number().min(0, "Le total doit être positif"),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  assignedTo: z.array(z.string()).optional(),
  messages: z.array(messageSchema).optional(),
  payment: paymentSchema.optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  completedAt: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

// Schéma pour la mise à jour de commande
export const updateOrderSchema = z.object({
  items: z.array(orderItemSchema).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED', 'FAILED']).optional(),
  subtotal: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  assignedTo: z.array(z.string()).optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  completedAt: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

// Schéma pour la mise à jour du statut
export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED'])
});

// Schéma pour l'assignation
export const assignOrderSchema = z.object({
  assignedTo: z.array(z.string()).min(1, "Au moins un assigné est requis")
});

// Schéma pour l'ajout de message
export const addMessageSchema = z.object({
  content: z.string().min(1, "Le contenu du message est requis"),
  attachments: z.array(z.string()).optional()
});

// Schéma pour les filtres de commandes
export const orderFiltersSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED', 'FAILED']).optional(),
  clientId: z.string().optional(),
  assignedTo: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});