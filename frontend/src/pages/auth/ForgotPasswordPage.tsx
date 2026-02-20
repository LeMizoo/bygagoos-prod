import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email requis");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email invalide");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simuler l'envoi
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch {
      setError("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img
              src="/logo.svg"
              alt="ByGagoos-Ink"
              className="h-16 w-16"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSubmitted ? "Email envoyé !" : "Mot de passe oublié"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSubmitted
              ? "Consultez votre boîte mail pour réinitialiser votre mot de passe"
              : "Entrez votre email pour recevoir un lien de réinitialisation"}
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`appearance-none relative block w-full px-10 py-3 border ${
                    error ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="votre@email.com"
                />
              </div>
              {error && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading
                  ? "Envoi en cours..."
                  : "Envoyer le lien de réinitialisation"}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-600 text-4xl mb-4">✓</div>
              <p className="text-green-800 font-medium">
                Un email de réinitialisation a été envoyé à <br />
                <span className="font-bold">{email}</span>
              </p>
              <p className="text-green-700 text-sm mt-2">
                Vérifiez votre boîte de réception (et les spams)
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à la connexion
              </Link>

              <div className="text-sm text-gray-500">
                Vous n'avez pas reçu l'email ?{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Renvoyer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
