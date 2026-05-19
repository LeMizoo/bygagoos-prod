// frontend/src/hooks/useInactivityLogout.ts

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { dev } from '../utils/devLogger';

/**
 * Hook pour gérer la déconnexion automatique en cas d'inactivité
 * 
 * Comportement:
 * - Après INACTIVITY_TIME ms d'inactivité: affiche un avertissement
 * - Après WARNING_TIME ms de plus: déconnecte automatiquement
 * - Les actions utilisateur (click, keypress) réinitialisent le timer
 */
const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutes avant avertissement
const WARNING_TIME = 2 * 60 * 1000;    // 2 minutes pour confirmer (avant déconnexion)

export const useInactivityLogout = () => {
  const { logout, isAuthenticated } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isWarningShownRef = useRef<boolean>(false);

  // Réinitialiser les timers et masquer l'avertissement
  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;

    // Effacer les timers précédents
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    isWarningShownRef.current = false;
    lastActivityRef.current = Date.now();

    dev.log('🔄 Inactivity timer reset');

    // Avertissement après INACTIVITY_TIME
    timeoutRef.current = setTimeout(() => {
      if (!isWarningShownRef.current) {
        isWarningShownRef.current = true;
        dev.log('⏰ Inactivity warning shown');

        // Afficher un toast avec option d'action
        toast.custom(
          (t) => (
            <div className="bg-yellow-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
              <div className="font-bold mb-2">⏰ Session inactive</div>
              <p className="text-sm mb-3">
                Vous serez déconnecté dans 2 minutes si vous ne continuez pas.
              </p>
              <button
                onClick={() => {
                  resetInactivityTimer();
                  toast.dismiss(t.id);
                }}
                className="bg-white text-yellow-600 px-3 py-1 rounded font-bold hover:bg-gray-100 transition"
              >
                Rester connecté
              </button>
            </div>
          ),
          {
            duration: WARNING_TIME,
          }
        );

        // Déconnexion après WARNING_TIME
        warningTimeoutRef.current = setTimeout(() => {
          dev.log('🚪 Auto-logout due to inactivity');
          toast.error('Session expirée - vous avez été déconnecté');
          logout();
        }, WARNING_TIME);
      }
    }, INACTIVITY_TIME);
  }, [isAuthenticated, logout]);

  // Événements d'activité utilisateur
  useEffect(() => {
    if (!isAuthenticated) {
      // Nettoyer les timers si pas connecté
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    // Initialiser les timers au montage
    resetInactivityTimer();

    // Événements qui réinitialisent l'inactivité
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      // Éviter les réinitialisations trop fréquentes
      if (Date.now() - lastActivityRef.current > 1000) {
        dev.log('👤 User activity detected');
        resetInactivityTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      // Nettoyer les event listeners
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      // Nettoyer les timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [isAuthenticated, resetInactivityTimer]);

  return {
    resetInactivityTimer,
  };
};

export default useInactivityLogout;
