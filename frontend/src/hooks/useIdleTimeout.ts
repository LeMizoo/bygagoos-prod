// hooks/useIdleTimeout.ts
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useIdleTimeout(timeoutMinutes: number = 30) {
  const logout = useAuthStore((state) => state.logout);
  // Correction : utiliser ReturnType<typeof setTimeout> au lieu de NodeJS.Timeout
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
      alert('Déconnecté pour inactivité');
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    resetTimer();
    events.forEach(event => window.addEventListener(event, resetTimer));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);
}