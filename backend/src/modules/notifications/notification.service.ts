import webpush from 'web-push';
import { Types } from 'mongoose';
import env from '../../config/env';
import logger from '../../core/utils/logger';
import { UserRole } from '../../core/types/userRoles';
import PushSubscription from './pushSubscription.model';

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

interface SubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const isConfigured = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);

if (isConfigured) {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

export class NotificationService {
  getPublicKey() {
    return env.VAPID_PUBLIC_KEY;
  }

  async saveSubscription(userId: string, role: UserRole | undefined, subscription: SubscriptionInput, userAgent?: string) {
    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      throw new Error('Abonnement push invalide');
    }

    return PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        user: new Types.ObjectId(userId),
        role,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async removeSubscription(endpoint: string) {
    if (!endpoint) return;
    await PushSubscription.findOneAndUpdate({ endpoint }, { isActive: false });
  }

  async notifyUser(userId: string | Types.ObjectId, payload: PushPayload) {
    const subscriptions = await PushSubscription.find({
      user: new Types.ObjectId(userId),
      isActive: true,
    });

    await this.sendToSubscriptions(subscriptions, payload);
  }

  async notifyRoles(roles: UserRole[], payload: PushPayload) {
    const subscriptions = await PushSubscription.find({
      role: { $in: roles },
      isActive: true,
    });

    await this.sendToSubscriptions(subscriptions, payload);
  }

  private async sendToSubscriptions(subscriptions: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>, payload: PushPayload) {
    if (!isConfigured || subscriptions.length === 0) {
      return;
    }

    await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, JSON.stringify(payload));
        } catch (error: any) {
          if (error?.statusCode === 404 || error?.statusCode === 410) {
            await PushSubscription.findOneAndUpdate({ endpoint: subscription.endpoint }, { isActive: false });
            return;
          }

          logger.warn('Erreur envoi notification push:', error);
        }
      })
    );
  }
}

export const notificationService = new NotificationService();
