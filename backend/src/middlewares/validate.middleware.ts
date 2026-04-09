import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { apiResponse } from '../core/utils/apiResponse';
import { HTTP_STATUS } from '../core/constants/httpStatus';
import logger from '../core/utils/logger';

interface JoiValidationErrorItem {
  path: (string | number)[];
  message: string;
}

interface JoiValidationError {
  details: JoiValidationErrorItem[];
}

interface JoiSchema {
  validate: (
    data: unknown,
    options?: { abortEarly?: boolean }
  ) => { error?: JoiValidationError; value?: unknown };
}

/**
 * Middleware de validation compatible Zod et Joi
 */
export const validate = (
  schema: AnyZodObject | JoiSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ('parseAsync' in schema) {
        await schema.parseAsync(req[source]);
      } else {
        const { error } = schema.validate(req[source], { abortEarly: false });

        if (error) {
          throw error;
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('❌ Erreur de validation Zod:', errors);

        return apiResponse.error(
          res,
          'Erreur de validation',
          HTTP_STATUS.BAD_REQUEST,
          errors
        );
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'details' in error
      ) {
        const joiError = error as JoiValidationError;

        const errors = joiError.details.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('❌ Erreur de validation Joi:', errors);

        return apiResponse.error(
          res,
          'Erreur de validation',
          HTTP_STATUS.BAD_REQUEST,
          errors
        );
      }

      next(error);
    }
  };
};

/**
 * Validate and return parsed data (works with Zod and Joi)
 */
export const validateData = <T = any>(schema: AnyZodObject | JoiSchema, data: unknown): T => {
  if ('parse' in schema || 'parseAsync' in schema) {
    return (schema as AnyZodObject).parse(data) as T;
  }

  const { error, value } = (schema as JoiSchema).validate(data, { abortEarly: false });

  if (error) {
    throw error;
  }

  return value as T;
};

/**
 * Validate an array of items against a schema and return parsed items
 */
export const validateAll = <T = any>(schema: AnyZodObject | JoiSchema, data: unknown): T[] => {
  if (!Array.isArray(data)) {
    throw new Error('Expected an array for validateAll');
  }

  return (data as unknown[]).map((item) => validateData<T>(schema, item));
};