/**
 * Classe d'erreur personnalisée pour l'application
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;
    
    // Capturer la stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Définir le nom de l'erreur
    this.name = this.constructor.name;
  }

  /**
   * Convertit l'erreur en objet JSON pour la réponse API
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
      }
    };
  }

  /**
   * Crée une erreur "Bad Request" (400)
   */
  static badRequest(message: string = 'Requête invalide', details?: any): AppError {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  /**
   * Crée une erreur "Unauthorized" (401)
   */
  static unauthorized(message: string = 'Non autorisé', details?: any): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  }

  /**
   * Crée une erreur "Forbidden" (403)
   */
  static forbidden(message: string = 'Accès interdit', details?: any): AppError {
    return new AppError(message, 403, 'FORBIDDEN', details);
  }

  /**
   * Crée une erreur "Not Found" (404)
   */
  static notFound(message: string = 'Ressource non trouvée', details?: any): AppError {
    return new AppError(message, 404, 'NOT_FOUND', details);
  }

  /**
   * Crée une erreur "Conflict" (409)
   */
  static conflict(message: string = 'Conflit de données', details?: any): AppError {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  /**
   * Crée une erreur "Validation Error" (422)
   */
  static validation(message: string = 'Erreur de validation', details?: any): AppError {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  /**
   * Crée une erreur "Too Many Requests" (429)
   */
  static tooManyRequests(message: string = 'Trop de requêtes', details?: any): AppError {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS', details);
  }

  /**
   * Crée une erreur "Internal Server Error" (500)
   */
  static internal(message: string = 'Erreur interne du serveur', details?: any): AppError {
    return new AppError(message, 500, 'INTERNAL_ERROR', details);
  }

  /**
   * Vérifie si l'erreur est une erreur opérationnelle
   */
  static isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }
}

export default AppError;