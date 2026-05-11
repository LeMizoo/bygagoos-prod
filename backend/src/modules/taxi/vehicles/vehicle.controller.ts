import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { apiResponse } from '../../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../../core/constants/httpStatus';
import { validateData } from '../../../core/middlewares/validate';
import { createTaxiVehicleSchema, queryTaxiVehicleSchema, updateTaxiVehicleSchema } from './dto';
import { taxiVehicleService } from './vehicle.service';

export const getVehicles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const query = validateData(queryTaxiVehicleSchema, req.query) as any;
    const result = await taxiVehicleService.findAll(userId, query, req.user?.role);
    apiResponse.success(res, result, 'Véhicules récupérés avec succès');
  } catch (error) {
    const err = error as Error;
    apiResponse.error(res, err.message || 'Erreur lors de la récupération des véhicules', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const getVehicleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID véhicule requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const vehicle = await taxiVehicleService.findById(id, userId, req.user?.role);
    apiResponse.success(res, vehicle, 'Véhicule récupéré avec succès');
  } catch (error) {
    const err = error as Error;
    if (err.message === 'Véhicule non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de véhicule invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de la récupération du véhicule', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

export const createVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const createdBy = req.user?._id;
    if (!userId || !createdBy) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const data = validateData(createTaxiVehicleSchema, req.body) as any;
    const vehicle = await taxiVehicleService.create(userId, data, createdBy);
    apiResponse.success(res, vehicle, 'Véhicule créé avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    const err = error as Error;
    apiResponse.error(res, err.message || 'Erreur lors de la création du véhicule', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID véhicule requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const data = validateData(updateTaxiVehicleSchema, req.body) as any;
    const vehicle = await taxiVehicleService.update(id, userId, data, req.user?.role);
    apiResponse.success(res, vehicle, 'Véhicule mis à jour avec succès');
  } catch (error) {
    const err = error as Error;
    if (err.message === 'Véhicule non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de véhicule invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de la mise à jour du véhicule', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    if (!id) {
      apiResponse.error(res, 'ID véhicule requis', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    await taxiVehicleService.delete(id, userId, req.user?.role);
    apiResponse.success(res, null, 'Véhicule supprimé avec succès');
  } catch (error) {
    const err = error as Error;
    if (err.message === 'Véhicule non trouvé') {
      apiResponse.error(res, err.message, HTTP_STATUS.NOT_FOUND);
    } else if (err.message === 'ID de véhicule invalide') {
      apiResponse.error(res, err.message, HTTP_STATUS.BAD_REQUEST);
    } else {
      apiResponse.error(res, err.message || 'Erreur lors de la suppression du véhicule', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
};

export const getVehicleStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const stats = await taxiVehicleService.getStats(userId, req.user?.role);
    apiResponse.success(res, stats, 'Statistiques des véhicules récupérées');
  } catch (error) {
    const err = error as Error;
    apiResponse.error(res, err.message || 'Erreur lors de la récupération des statistiques', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
