import { Router } from 'express';
import { protect, AuthRequest } from '../../middlewares/auth.middleware';
import { apiResponse } from '../../core/utils/apiResponse';
import { HTTP_STATUS } from '../../core/constants/httpStatus';
import { notificationService } from './notification.service';

const router = Router();

router.get('/vapid-public-key', (_req, res) => {
  apiResponse.success(res, { publicKey: notificationService.getPublicKey() }, 'Clé publique push récupérée');
});

router.use(protect);

router.post('/subscribe', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    if (!userId) {
      apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    await notificationService.saveSubscription(userId, req.user?.role, req.body.subscription, req.headers['user-agent']);
    apiResponse.success(res, null, 'Notifications activées');
  } catch (error) {
    const err = error as Error;
    apiResponse.error(res, err.message || 'Erreur activation notifications', HTTP_STATUS.BAD_REQUEST);
  }
});

router.post('/unsubscribe', async (req, res) => {
  await notificationService.removeSubscription(req.body.endpoint);
  apiResponse.success(res, null, 'Notifications désactivées');
});

router.post('/test', async (req: AuthRequest, res) => {
  const userId = req.user?.id || req.user?._id?.toString();
  if (!userId) {
    apiResponse.error(res, 'Non authentifié', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  await notificationService.notifyUser(userId, {
    title: 'ByGagoos Prod',
    body: 'Les notifications push sont bien activées.',
    url: '/prod/dashboard',
    tag: 'push-test',
  });
  apiResponse.success(res, null, 'Notification de test envoyée');
});

export default router;
