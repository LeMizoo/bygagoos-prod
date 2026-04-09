// frontend/src/components/auth/ProtectedRoute.tsx

import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { dev } from '../../utils/devLogger';

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  allowSuperAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredRoles = [],
  allowSuperAdmin = true,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    dev.log('🛡️ ProtectedRoute - Vérification:', {
      path: location.pathname,
      isAuthenticated,
      userRole: user?.role,
      requiredRoles: requiredRole ? [requiredRole] : requiredRoles
    });
  }, [location.pathname, isAuthenticated, user, requiredRole, requiredRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    dev.log('❌ Non authentifié, redirection vers login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const userRole = user.role?.toUpperCase() || '';

  // SUPER_ADMIN a toujours accès si allowSuperAdmin est true
  if (allowSuperAdmin && userRole === 'SUPER_ADMIN') {
    dev.log('✅ SUPER_ADMIN - Accès autorisé');
    return <>{children}</>;
  }

  const rolesToCheck: string[] = requiredRole 
    ? [requiredRole.toUpperCase()] 
    : requiredRoles.map(r => r.toUpperCase());

  // Si aucune restriction de rôle, tout utilisateur authentifié a accès
  if (rolesToCheck.length === 0) {
    dev.log('✅ Aucune restriction de rôle, accès autorisé');
    return <>{children}</>;
  }

  dev.log('🔍 Vérification rôle:', {
    userRole,
    allowedRoles: rolesToCheck,
    match: rolesToCheck.includes(userRole)
  });

  if (!rolesToCheck.includes(userRole)) {
    dev.log('❌ Rôle non autorisé, redirection vers unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  dev.log('✅ Accès autorisé');
  return <>{children}</>;
};

export default ProtectedRoute;