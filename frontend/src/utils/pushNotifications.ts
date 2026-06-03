import notificationsApi from '../api/notifications.api';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const getNotificationPermission = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker non supporté');
  }

  return navigator.serviceWorker.register('/service-worker.js');
};

export const subscribeToPushNotifications = async () => {
  if (!isPushSupported()) {
    throw new Error('Notifications non supportées sur ce navigateur');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission notifications refusée');
  }

  const publicKey = await notificationsApi.getVapidPublicKey();
  if (!publicKey) {
    throw new Error('Clé VAPID absente côté serveur');
  }

  const registration = await registerServiceWorker();
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription = existingSubscription || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await notificationsApi.subscribe(subscription.toJSON());
  return subscription;
};
