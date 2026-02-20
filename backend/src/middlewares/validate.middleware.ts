import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import { AppError } from '../core/utils/errors/AppError';

/**
 * Middleware de validation avec Zod
 * @param schema - Schéma Zod à valider
 * @param source - Source des données à valider (body, query, params)
 */
export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        next(new AppError(
          'Erreur de validation',
          HTTP_STATUS.BAD_REQUEST,
          'VALIDATION_ERROR',
          errors
        ));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Valide les données avec un schéma Zod et retourne les données typées
 * @param schema - Schéma Zod
 * @param data - Données à valider
 */
export const validateData = <T>(schema: AnyZodObject, data: unknown): T => {
  try {
    return schema.parse(data) as T;
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      throw new AppError(
        'Erreur de validation',
        HTTP_STATUS.BAD_REQUEST,
        'VALIDATION_ERROR',
        errors
      );
    }
    throw error;
  }
};

/**
 * Middleware de validation multiple (body, query, params)
 * @param schemas - Objet contenant les schémas à valider
 */
export const validateAll = (schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        next(new AppError(
          'Erreur de validation',
          HTTP_STATUS.BAD_REQUEST,
          'VALIDATION_ERROR',
          errors
        ));
      } else {
        next(error);
      }
    }
  };
};