import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validate';
import { queryClientSchema, createClientSchema, updateClientSchema } from './dto';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
  searchClients
} from './client.controller';

const router = Router();

// Toutes les routes clients nécessitent une authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/search', searchClients);
router.get('/stats', getClientStats);
router.get('/', validate(queryClientSchema, 'query'), getClients);
router.get('/:id', getClientById);
router.post('/', validate(createClientSchema, 'body'), createClient);
router.put('/:id', validate(updateClientSchema, 'body'), updateClient);
router.delete('/:id', deleteClient);

export default router;