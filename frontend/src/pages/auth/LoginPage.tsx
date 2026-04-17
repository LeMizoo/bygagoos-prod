import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import dev from '../../utils/devLogger';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email invalide";
    }

    if (!password) {
      newErrors.password = "Mot de passe requis";
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitError(null);
    try {
      dev.log('📝 Tentative de connexion...');
      await login(email, password);
      
      const { user } = useAuthStore.getState();
      dev.log('👤 Utilisateur connecté:', user);
      
      if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/profile");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setSubmitError(errorMessage);
      dev.error('Erreur:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="/logo.svg"
            alt="ByGagoos-Ink"
            className="h-16 w-16 mx-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{" "}
            <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              créez un compte gratuitement
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className={`w-full px-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? "border-red-300" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                aria-label="Afficher / masquer le mot de passe"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <Link to="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>

          {submitError && (
            <p className="text-sm text-red-600 flex items-center" role="alert">
              <AlertCircle className="h-4 w-4 mr-1" />
              {submitError}
            </p>
          )}
        </form>

        {/* Boutons sociaux avec logos uniquement - alignés horizontalement */}
        <div className="pt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            {/* Microsoft */}
            <button
              title="Se connecter avec Microsoft"
              aria-label="Se connecter avec Microsoft"
              className="p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M11.5 2v9.5H2V2h9.5zm0 20H2v-9.5h9.5V22zM22 2v9.5h-9.5V2H22zm0 20h-9.5v-9.5H22V22z" fill="#00a4ef"/>
              </svg>
            </button>

            {/* Google */}
            <button
              title="Se connecter avec Google"
              aria-label="Se connecter avec Google"
              className="p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>

            {/* Apple */}
            <button
              title="Se connecter avec Apple"
              aria-label="Se connecter avec Apple"
              className="p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              title="Se connecter avec Facebook"
              aria-label="Se connecter avec Facebook"
              className="p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" fill="#1877f2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}