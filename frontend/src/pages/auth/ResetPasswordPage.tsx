import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <h2 className="text-center text-3xl font-bold">Nouveau mot de passe</h2>

        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-10 pr-12 py-3 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-3.5 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Confirmer</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-10 pr-12 py-3 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-3.5 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button className="w-full py-3 bg-blue-600 text-white rounded-lg">
            Réinitialiser
          </button>

          <Link
            to="/auth/login"
            className="flex items-center justify-center text-sm text-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la connexion
          </Link>
        </form>
      </div>
    </div>
  );
}
