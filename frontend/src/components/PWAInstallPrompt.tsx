import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Battery, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installée');
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Ne pas afficher si déjà installée ou si l'utilisateur a refusé
  if (isInstalled || showPrompt === false || localStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl shadow-xl border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Installer l'application</h3>
              <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600" title="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Installez ByGagoos sur votre appareil pour un accès plus rapide et le mode hors ligne.
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                <span>Moins de batterie</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Plus rapide</span>
              </div>
            </div>
            <button
              onClick={handleInstall}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-2 rounded-xl hover:bg-amber-700 transition-all"
            >
              <Download className="h-4 w-4" />
              Installer l'application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}