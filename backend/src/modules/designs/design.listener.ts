import appEventEmitter, { AppEvent } from '../../core/utils/eventEmitter';
import logger from '../../core/utils/logger';

// Types pour les payloads d'événements
interface DesignCreatedPayload {
  designId: string;
  designTitle: string;
  userId: string;
}

interface DesignUpdatedPayload {
  designId: string;
  changes: Record<string, unknown>;
}

interface DesignDeletedPayload {
  designId: string;
}

interface OrderStatusChangedPayload {
  orderId: string;
  oldStatus: string;
  newStatus: string;
}

/**
 * Initialise les listeners pour les événements liés aux designs
 */
export const initializeDesignListeners = (): void => {
  
  // Écouter la création de designs
  appEventEmitter.on(AppEvent.DESIGN_CREATED, (payload: DesignCreatedPayload) => {
    logger.info(`🎨 Design créé: ${payload.designTitle} (ID: ${payload.designId}) par utilisateur ${payload.userId}`);
    
    // Ici vous pouvez ajouter:
    // - Envoyer une notification aux administrateurs
    // - Mettre à jour un cache
    // - Ajouter à une file d'attente pour traitement
    // - Envoyer un email de confirmation
    // - Synchroniser avec un service externe
  });

  // Écouter la mise à jour de designs
  appEventEmitter.on(AppEvent.DESIGN_UPDATED, (payload: DesignUpdatedPayload) => {
    logger.info(`✏️ Design mis à jour: ${payload.designId}`, { changes: payload.changes });
    
    // Ici vous pouvez ajouter:
    // - Envoyer des notifications pour les changements importants
    // - Mettre à jour l'historique des modifications
    // - Recalculer des statistiques
  });

  // Écouter la suppression de designs
  appEventEmitter.on(AppEvent.DESIGN_DELETED, (payload: DesignDeletedPayload) => {
    logger.warn(`🗑️ Design supprimé: ${payload.designId}`);
    
    // Ici vous pouvez ajouter:
    // - Nettoyer les fichiers associés
    // - Archiver les données
    // - Notifier l'équipe
  });

  // Écouter les changements de statut (réutilise l'événement ORDER_STATUS_CHANGED)
  appEventEmitter.on(AppEvent.ORDER_STATUS_CHANGED, (payload: OrderStatusChangedPayload) => {
    // Vérifier si c'est un design (via l'ID ou contexte)
    logger.info(`🔄 Statut changé pour ${payload.orderId}: ${payload.oldStatus} → ${payload.newStatus}`);
    
    // Actions spécifiques selon le nouveau statut
    switch (payload.newStatus) {
      case 'COMPLETED':
        logger.info(`✅ Design ${payload.orderId} complété avec succès`);
        // Envoyer une notification de complétion
        // Mettre à jour les métriques
        break;
      case 'APPROVED':
        logger.info(`👍 Design ${payload.orderId} approuvé`);
        // Passer à l'étape suivante du workflow
        break;
      case 'REJECTED':
        logger.warn(`❌ Design ${payload.orderId} rejeté`);
        // Notifier pour révision
        break;
      case 'IN_PROGRESS':
        logger.info(`🚀 Design ${payload.orderId} en cours`);
        // Démarrer le suivi du temps
        break;
      default:
        break;
    }
  });
};

/**
 * Fonction utilitaire pour suivre les statistiques des designs
 */
export const setupDesignMetrics = (): void => {
  let designCount = 0;
  let lastCreatedDesign: string | null = null;

  appEventEmitter.on(AppEvent.DESIGN_CREATED, (payload: DesignCreatedPayload) => {
    designCount++;
    lastCreatedDesign = payload.designId;
    logger.debug(`📊 Statistiques: ${designCount} designs créés depuis le démarrage`);
  });

  // Réinitialiser périodiquement (optionnel)
  setInterval(() => {
    if (designCount > 0) {
      logger.info(`📈 Période: ${designCount} designs créés, Dernier: ${lastCreatedDesign}`);
      designCount = 0;
    }
  }, 3600000); // Toutes les heures
};

/**
 * Fonction pour notifier les équipes via webhook (exemple)
 */
export const setupWebhookNotifications = (webhookUrl: string): void => {
  const sendWebhook = async (event: string, payload: DesignCreatedPayload | DesignUpdatedPayload | DesignDeletedPayload) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          payload,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        logger.error(`Webhook failed for event ${event}: ${response.statusText}`);
      }
    } catch (error) {
      logger.error(`Error sending webhook for event ${event}:`, error);
    }
  };

  appEventEmitter.on(AppEvent.DESIGN_CREATED, (payload: DesignCreatedPayload) => {
    sendWebhook('design.created', payload);
  });

  appEventEmitter.on(AppEvent.DESIGN_UPDATED, (payload: DesignUpdatedPayload) => {
    sendWebhook('design.updated', payload);
  });

  appEventEmitter.on(AppEvent.DESIGN_DELETED, (payload: DesignDeletedPayload) => {
    sendWebhook('design.deleted', payload);
  });
};

// Exporter tout
export default {
  initializeDesignListeners,
  setupDesignMetrics,
  setupWebhookNotifications
};