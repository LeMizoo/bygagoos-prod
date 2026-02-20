import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/logo.png"
            alt="ByGagoos Ink"
            className="h-16 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
          404
        </h1>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page non trouvée
        </h2>

        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez
          l'URL ou retournez à l'accueil.
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary w-full py-3 text-lg flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="text-sm text-gray-500">
            Besoin d'aide ?{" "}
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contactez-nous
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Vous êtes perdu ? Voici quelques liens utiles :
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <a
              href="/about"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Notre histoire
            </a>
            <a
              href="/gallery"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Galerie
            </a>
            <a
              href="/contact"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Contact
            </a>
            <a
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}