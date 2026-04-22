import { EventEmitter } from 'events';
import logger from './logger';

/**
 * Événements globaux de l'application
 * Permet la communication entre modules sans dépendances directes
 */

export enum AppEvent {
  // Clients
  CLIENT_CREATED = 'client:created',
  CLIENT_UPDATED = 'client:updated',
  CLIENT_DELETED = 'client:deleted',

  // Designs
  DESIGN_CREATED = 'design:created',
  DESIGN_UPDATED = 'design:updated',
  DESIGN_DELETED = 'design:deleted',

  // Orders
  ORDER_CREATED = 'order:created',
  ORDER_UPDATED = 'order:updated',
  ORDER_DELETED = 'order:deleted',
  ORDER_STATUS_CHANGED = 'order:status-changed',

  // Staff
  STAFF_CREATED = 'staff:created',
  STAFF_UPDATED = 'staff:updated',
  STAFF_DELETED = 'staff:deleted',

  // Users
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_DELETED = 'user:deleted',
}

export interface EventPayload {
  [AppEvent.CLIENT_CREATED]: { clientId: string; clientName: string; userId: string };
  [AppEvent.CLIENT_UPDATED]: { clientId: string; changes: Record<string, unknown> };
  [AppEvent.CLIENT_DELETED]: { clientId: string };
  [AppEvent.DESIGN_CREATED]: { designId: string; designTitle: string; userId: string };
  [AppEvent.DESIGN_UPDATED]: { designId: string; changes: Record<string, unknown> };
  [AppEvent.DESIGN_DELETED]: { designId: string };
  [AppEvent.ORDER_CREATED]: { orderId: string; clientId: string; userId: string };
  [AppEvent.ORDER_UPDATED]: { orderId: string; changes: Record<string, unknown> };
  [AppEvent.ORDER_DELETED]: { orderId: string };
  [AppEvent.ORDER_STATUS_CHANGED]: { orderId: string; oldStatus: string; newStatus: string };
  [AppEvent.STAFF_CREATED]: { staffId: string; staffName: string };
  [AppEvent.STAFF_UPDATED]: { staffId: string; changes: Record<string, unknown> };
  [AppEvent.STAFF_DELETED]: { staffId: string };
  [AppEvent.USER_CREATED]: { userId: string; email: string };
  [AppEvent.USER_UPDATED]: { userId: string; changes: Record<string, unknown> };
  [AppEvent.USER_DELETED]: { userId: string };
}

class AppEventEmitter {
  private static instance: AppEventEmitter;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(20); // Augmenter la limite
  }

  public static getInstance(): AppEventEmitter {
    if (!AppEventEmitter.instance) {
      AppEventEmitter.instance = new AppEventEmitter();
    }
    return AppEventEmitter.instance;
  }

  /**
   * Émettre un événement avec type-safety
   */
  public emit<T extends AppEvent>(event: T, payload: EventPayload[T]): boolean {
    logger.debug(`📢 Event emitted: ${event}`, payload);
    return this.emitter.emit(event, payload);
  }

  /**
   * Écouter un événement avec type-safety
   */
  public on<T extends AppEvent>(
    event: T,
    listener: (payload: EventPayload[T]) => void
  ): EventEmitter {
    logger.debug(`👂 Listener registered for: ${event}`);
    return this.emitter.on(event, listener);
  }

  /**
   * Écouter une seule fois
   */
  public once<T extends AppEvent>(
    event: T,
    listener: (payload: EventPayload[T]) => void
  ): EventEmitter {
    return this.emitter.once(event, listener);
  }

  /**
   * Retirer un listener
   */
  public off<T extends AppEvent>(
    event: T,
    listener: (payload: EventPayload[T]) => void
  ): EventEmitter {
    return this.emitter.off(event, listener);
  }

  /**
   * Obtenir le nombre de listeners
   */
  public listenerCount(event: AppEvent): number {
    return this.emitter.listenerCount(event);
  }
}

export default AppEventEmitter.getInstance();
