import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';

export class apiResponse {
  /**
   * Envoie une réponse de succès
   */
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Succès',
    statusCode: number = HTTP_STATUS.OK
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Envoie une réponse d'erreur
   */
  static error(
    res: Response,
    message: string = 'Erreur',
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: any[]
  ): void {
    const response: any = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Envoie une réponse paginée
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Succès'
  ): void {
    const totalPages = Math.ceil(total / limit);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    });
  }
}