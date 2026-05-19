// frontend/src/hooks/useInactivityLogout.ts
import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export const useInactivityLogout = () => {
  const { logout } = useAuthStore();
  const timeoutRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  }, [logout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      resetTimer();
    };

    resetTimer();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [logout, resetTimer]);

  return null;
};

// ✅ Export par défaut
export default useInactivityLogout;