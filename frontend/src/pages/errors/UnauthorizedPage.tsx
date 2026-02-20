import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Shield className="h-24 w-24 text-red-500 mx-auto" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          403 - Accès refusé
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/home"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Accueil
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}