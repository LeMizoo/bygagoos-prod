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
    
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    
    // Assurer le prototype pour instanceof en TS
    Object.setPrototypeOf(this, AppError.prototype);
  }

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

  // Méthodes statiques
  static badRequest(message = 'Requête invalide', details?: any) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Non autorisé', details?: any) {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  }

  static forbidden(message = 'Accès interdit', details?: any) {
    return new AppError(message, 403, 'FORBIDDEN', details);
  }

  static notFound(message = 'Ressource non trouvée', details?: any) {
    return new AppError(message, 404, 'NOT_FOUND', details);
  }

  static internal(message = 'Erreur interne', details?: any) {
    return new AppError(message, 500, 'INTERNAL_ERROR', details);
  }
}