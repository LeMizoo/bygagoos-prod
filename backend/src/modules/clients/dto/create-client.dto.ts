import { z } from 'zod';

export const createClientSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.object({
    street: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    country: z.string().optional().nullable().default('France')
  }).optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([])
});

export type CreateClientDto = z.infer<typeof createClientSchema>;