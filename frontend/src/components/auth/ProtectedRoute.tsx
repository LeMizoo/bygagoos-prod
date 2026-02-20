import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
}

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredRoles = [],
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute - Vérification:', {
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
    console.log('❌ Non authentifié, redirection vers login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const rolesToCheck: string[] = requiredRole ? [requiredRole] : requiredRoles;

  if (rolesToCheck.length > 0) {
    const userRole = user.role?.toUpperCase() || '';
    const allowedRoles = rolesToCheck.map(r => r.toUpperCase());
    
    console.log('🔍 Vérification rôle:', {
      userRole,
      allowedRoles,
      match: allowedRoles.includes(userRole)
    });
    
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Rôle non autorisé, redirection vers unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('✅ Accès autorisé');
  return <>{children}</>;
};

export default ProtectedRoute;