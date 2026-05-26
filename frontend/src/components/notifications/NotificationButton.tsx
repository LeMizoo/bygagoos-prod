import { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { getNotificationPermission, isPushSupported, subscribeToPushNotifications } from '../../utils/pushNotifications';

export default function NotificationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState(() => getNotificationPermission());
  const isSupported = isPushSupported();
  const isEnabled = permission === 'granted';

  const handleEnable = async () => {
    if (!isSupported || isEnabled || isLoading) return;

    setIsLoading(true);
    try {
      await subscribeToPushNotifications();
      setPermission(getNotificationPermission());
    } catch (error) {
      console.error('Erreur activation notifications:', error);
      setPermission(getNotificationPermission());
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleEnable}
      disabled={isEnabled || isLoading}
      title={isEnabled ? 'Alertes activées' : 'Activer les alertes commandes et réservations'}
      className={`hidden rounded-lg p-2 transition-colors md:inline-flex ${
        isEnabled
          ? 'bg-green-50 text-green-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-amber-700'
      } disabled:cursor-default`}
    >
      {isEnabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
    </button>
  );
}
