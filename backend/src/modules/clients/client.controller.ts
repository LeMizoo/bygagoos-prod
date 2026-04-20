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

    const query = validateData(queryClientSchema, req.query) as Record<string, unknown>;
    const result = await clientService.findAll(userId, query, req.user?.role);

    // Debug temporaire - retourner les données brutes
    console.log('DEBUG getClients - user:', req.user?.email, 'role:', req.user?.role, 'result count:', result.total);
    
    // Temporairement retourner les données brutes pour debug
    apiResponse.success(res, {
      ...result,
      debug: {
        userId,
        role: req.user?.role,
        filter: 'empty for admin'
      }
    }, 'Clients récupérés avec succès');
  } catch (error) {
    const err = error as Error;

    console.error('Erreur getClients:', err);

    apiResponse.error(
      res,
      err.message || 'Erreur lors de la récupération des clients',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
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

    const client = await clientService.findById(id, userId, req.user?.role);

    apiResponse.success(res, client, 'Client récupéré avec succès');
  } catch (error) {
    const err = error as Error;

    console.error('Erreur getClientById:', err);

    if (err.message === 'Client non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de client invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(
        res,
        err.message || 'Erreur lors de la récupération du client',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
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

    const data = validateData(createClientSchema, req.body) as Record<string, unknown>;

    const client = await clientService.create(userId, data, createdBy.toString());

    apiResponse.success(res, client, 'Client créé avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    const err = error as Error;

    console.error('Erreur createClient:', err);

    if (err.message === 'Un client avec cet email existe déjà') {
      apiResponse.error(res, err.message, HTTP_STATUS.CONFLICT);
    } else {
      apiResponse.error(
        res,
        err.message || 'Erreur lors de la création du client',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
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

    const data = validateData(updateClientSchema, req.body) as Record<string, unknown>;

    if (Object.keys(data).length === 0) {
      apiResponse.error(res, 'Aucune donnée fournie pour la mise à jour', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const client = await clientService.update(id, userId, data, req.user?.role);

    apiResponse.success(res, client, 'Client mis à jour avec succès');
  } catch (error) {
    const err = error as Error;

    console.error('Erreur updateClient:', err);

    if (err.message === 'Client non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'Un client avec cet email existe déjà') {
      apiResponse.error(res, err.message, HTTP_STATUS.CONFLICT);
    } else if (err.message === 'ID de client invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(
        res,
        err.message || 'Erreur lors de la mise à jour du client',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
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

    await clientService.delete(id, userId, req.user?.role);

    apiResponse.success(res, null, 'Client supprimé avec succès');
  } catch (error) {
    const err = error as Error;

    console.error('Erreur deleteClient:', err);

    if (err.message === 'Client non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de client invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(
        res,
        err.message || 'Erreur lors de la suppression du client',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
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

    const stats = await clientService.getStats(userId, req.user?.role);

    apiResponse.success(res, stats, 'Statistiques récupérées');
  } catch (error) {
    const err = error as Error;

    console.error('Erreur getClientStats:', err);

    apiResponse.error(
      res,
      err.message || 'Erreur lors de la récupération des statistiques',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
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

    const clients = await clientService.search(
      userId,
      q,
      limit ? parseInt(limit as string, 10) : 10,
      req.user?.role
    );

    apiResponse.success(res, { clients, count: clients.length }, 'Recherche effectuée');
  } catch (error) {
    const err = error as Error;

    console.error('Erreur searchClients:', err);

    apiResponse.error(
      res,
      err.message || 'Erreur lors de la recherche',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};