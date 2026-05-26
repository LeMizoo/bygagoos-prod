import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        const worker = registration.waiting;
        if (worker) {
          setWaitingWorker(worker);
          setShowUpdate(true);
        }
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdate(false);
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-blue-50 rounded-2xl shadow-xl border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-blue-900">Nouvelle version disponible</h3>
              <button onClick={() => setShowUpdate(false)} className="text-blue-400 hover:text-blue-600" title="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Une mise à jour est disponible. Rafraîchissez pour profiter des dernières fonctionnalités.
            </p>
            <button
              onClick={handleUpdate}
              className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Mettre à jour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}