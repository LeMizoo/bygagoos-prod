import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { stopKeepAlive } from "../../api/axiosInstance";
import dev from '../../utils/devLogger';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        dev.error("Auth check failed:", error);
      } finally {
        setIsChecking(false);
      }
    };

    initializeAuth();
  }, [checkAuth]);

  // Nettoyer le keep-alive au démontage
  useEffect(() => {
    return () => {
      stopKeepAlive();
    };
  }, []);

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}