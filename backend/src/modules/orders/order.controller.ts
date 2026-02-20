import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { OrderService } from './order.service';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { validateData } from '../../core/middlewares/validate';
import { createOrderSchema, updateOrderSchema, addPaymentSchema, queryOrderSchema } from './dto';

const orderService = new OrderService();

/**
 * Récupère toutes les commandes
 */
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const query = validateData(queryOrderSchema, req.query) as any;
    const result = await orderService.findAll(userId, query);

    apiResponse.success(res, result, 'Commandes récupérées avec succès');
  } catch (error: any) {
    console.error('Erreur getOrders:', error);
    apiResponse.error(res, error.message || 'Erreur lors de la récupération des commandes', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Récupère une commande par son ID
 */
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID commande requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const order = await orderService.findById(id, userId);

    apiResponse.success(res, { order }, 'Commande récupérée avec succès');
  } catch (error: any) {
    console.error('Erreur getOrderById:', error);
    
    if (error.message === 'Commande non trouvée') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'ID de commande invalide') {
      apiResponse.error(res, error.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la récupération de la commande', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Crée une nouvelle commande
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const createdBy = req.user?._id;
    
    if (!userId || !createdBy) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const data = validateData(createOrderSchema, req.body) as any;
    const order = await orderService.create(userId, data, createdBy);

    apiResponse.success(res, { order }, 'Commande créée avec succès', HTTP_STATUS.CREATED);
  } catch (error: any) {
    console.error('Erreur createOrder:', error);
    
    if (error.message === 'Client non trouvé' || error.message.includes('Design avec ID')) {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la création de la commande', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Met à jour une commande
 */
export const updateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID commande requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const data = validateData(updateOrderSchema, req.body) as any;

    if (Object.keys(data).length === 0) {
      apiResponse.error(res, 'Aucune donnée fournie pour la mise à jour', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const order = await orderService.update(id, userId, data);
    apiResponse.success(res, { order }, 'Commande mise à jour avec succès');
  } catch (error: any) {
    console.error('Erreur updateOrder:', error);
    
    if (error.message === 'Commande non trouvée') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'Client non trouvé' || error.message.includes('Design avec ID')) {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'ID de commande invalide') {
      apiResponse.error(res, error.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la mise à jour de la commande', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Ajoute un paiement à une commande
 */
export const addPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;    if (!id) {
      apiResponse.error(res, 'ID commande requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }    const data = validateData(addPaymentSchema, req.body) as any;
    const order = await orderService.addPayment(id, userId, data);

    apiResponse.success(res, { order }, 'Paiement ajouté avec succès');
  } catch (error: any) {
    console.error('Erreur addPayment:', error);
    
    if (error.message === 'Commande non trouvée') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'ID de commande invalide') {
      apiResponse.error(res, error.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de l\'ajout du paiement', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Supprime une commande
 */
export const deleteOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID commande requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    await orderService.delete(id, userId);

    apiResponse.success(res, null, 'Commande supprimée avec succès');
  } catch (error: any) {
    console.error('Erreur deleteOrder:', error);
    
    if (error.message === 'Commande non trouvée') {
      apiResponse.error(res, error.message, HTTP_STATUS.NOT_FOUND);
    } else if (error.message === 'ID de commande invalide') {
      apiResponse.error(res, error.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, error.message || 'Erreur lors de la suppression de la commande', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

/**
 * Récupère les statistiques des commandes
 */
export const getOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const stats = await orderService.getStats(userId);
    apiResponse.success(res, stats, 'Statistiques récupérées');
  } catch (error: any) {
    console.error('Erreur getOrderStats:', error);
    apiResponse.error(res, error.message || 'Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};