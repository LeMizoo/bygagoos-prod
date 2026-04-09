// frontend/src/components/ui/ErrorMessage.tsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface ErrorMessageProps {
  title?: string;
  message: string;
  statusCode?: number;
  redirectTo?: string;
  redirectDelay?: number;
  onRetry?: () => void;
  showBackButton?: boolean;
  showListButton?: boolean;
  listButtonPath?: string;
  listButtonText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Erreur',
  message,
  statusCode,
  redirectTo,
  redirectDelay = 3,
  onRetry,
  showBackButton = true,
  showListButton = true,
  listButtonPath = '/admin/staff',
  listButtonText = 'Voir la liste'
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = React.useState(redirectDelay);

  React.useEffect(() => {
    if (redirectTo && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (redirectTo && countdown === 0) {
      navigate(redirectTo, { replace: true });
    }
  }, [countdown, redirectTo, navigate]);

  // Déterminer l'icône et la couleur selon le code d'erreur
  const getErrorStyle = () => {
    if (statusCode === 404) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-800',
        icon: (
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      };
    }
    if (statusCode === 400) {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-800',
        icon: (
          <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      };
    }
    if (statusCode === 401 || statusCode === 403) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-800',
        icon: (
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        )
      };
    }
    // Erreur serveur par défaut (500)
    return {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: (
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    };
  };

  const style = getErrorStyle();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className={`max-w-md w-full ${style.bg} border-l-4 ${style.border} p-6 rounded-lg shadow-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {style.icon}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-lg font-medium ${style.text}`}>
              {statusCode ? `Erreur ${statusCode} - ${title}` : title}
            </h3>
            <div className="mt-2">
              <p className={`text-sm ${style.text}`}>{message}</p>
            </div>
            
            {redirectTo && (
              <div className="mt-4">
                <p className={`text-sm ${style.text}`}>
                  Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Réessayer
                </button>
              )}
              
              {showBackButton && (
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Retour
                </button>
              )}

              {showListButton && (
                <Link
                  to={listButtonPath}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {listButtonText}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};