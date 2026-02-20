import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ClientService } from './client.service';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { validateData } from '../../core/middlewares/validate';
import { createClientSchema, updateClientSchema, queryClientSchema } from './dto';

const clientService = new ClientService();

/**
 * Récupère tous les clients
 */
export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const query = validateData(queryClientSchema, req.query) as any;
    const result = await clientService.findAll(userId, query);

    apiResponse.success(res, result, 'Clients récupérés avec succès');
  } catch (error: any) {
    console.error('Erreur getClients:', error);
    apiResponse.error(res, error.message || 'Erreur lors de la récupération des clients', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Récupère un client par son ID
 */
export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID client requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const client = await clientService.findById(id, userId);

    apiResponse.success(res, { client }, 'Client récupéré avec succès');
  } catch (error: any) {
    console.error('Erreur getClientById:', error);
    
    if (error.message === 'Client non trouvé') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'ID de client invalide') {
      apiResponse.error(res, error.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la récupération du client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Crée un nouveau client
 */
export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const createdBy = req.user?._id;
    
    if (!userId || !createdBy) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const data = validateData(createClientSchema, req.body) as any;
    const client = await clientService.create(userId, data, createdBy);

    apiResponse.success(res, { client }, 'Client créé avec succès', HTTP_STATUS.CREATED);
  } catch (error: any) {
    console.error('Erreur createClient:', error);
    
    if (error.message === 'Un client avec cet email existe déjà') {
      apiResponse.error(res, error.message, HTTP_STATUS.CONFLICT);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la création du client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Met à jour un client
 */
export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID client requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const data = validateData(updateClientSchema, req.body) as any;

    if (Object.keys(data).length === 0) {
      apiResponse.error(res, 'Aucune donnée fournie pour la mise à jour', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const client = await clientService.update(id, userId, data);
    apiResponse.success(res, { client }, 'Client mis à jour avec succès');
  } catch (error: any) {
    console.error('Erreur updateClient:', error);
    
    if (error.message === 'Client non trouvé') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'Un client avec cet email existe déjà') {
      apiResponse.error(res, error.message, HTTP_STATUS.CONFLICT);
    } else if (error.message === 'ID de client invalide') {
      apiResponse.error(res, error.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la mise à jour du client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Supprime un client (soft delete)
 */
export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID client requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    await clientService.delete(id, userId);

    apiResponse.success(res, null, 'Client supprimé avec succès');
  } catch (error: any) {
    console.error('Erreur deleteClient:', error);
    
    if (error.message === 'Client non trouvé') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'ID de client invalide') {
      apiResponse.error(res, error.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la suppression du client', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Récupère les statistiques des clients
 */
export const getClientStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const stats = await clientService.getStats(userId);
    apiResponse.success(res, stats, 'Statistiques récupérées');
  } catch (error: any) {
    console.error('Erreur getClientStats:', error);
    apiResponse.error(res, error.message || 'Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Recherche des clients
 */
export const searchClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { q, limit } = req.query;
    if (!q || typeof q !== 'string') {
      apiResponse.error(res, 'Terme de recherche requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const clients = await clientService.search(userId, q, limit ? parseInt(limit as string) : 10);
    apiResponse.success(res, { clients, count: clients.length }, 'Recherche effectuée');
  } catch (error: any) {
    console.error('Erreur searchClients:', error);
    apiResponse.error(res, error.message || 'Erreur lors de la recherche', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};