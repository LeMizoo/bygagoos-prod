import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* -------------------------- */
  /* Form handlers              */
  /* -------------------------- */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = "Prénom requis";
    if (!formData.lastName) newErrors.lastName = "Nom requis";

    if (!formData.email) newErrors.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email invalide";

    if (!formData.password) newErrors.password = "Mot de passe requis";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 caractères";

    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await register(formData);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------- */
  /* UI                         */
  /* -------------------------- */

  const inputClass =
    "w-full px-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 space-y-6">
        {/* HEADER */}
        <div className="text-center">
          <img
            src="/bygagoos-large.png"
            alt="ByGagoos-Ink"
            className="h-14 mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
          <p className="text-sm text-gray-500">
            Rejoignez l'espace ByGagoos-Ink
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FIRST + LAST NAME */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  name="firstName"
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 ${
                    errors.firstName ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  name="lastName"
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 ${
                    errors.lastName ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
              className={`${inputClass} pl-10 ${
                errors.email ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-red-600 text-xs flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.email}
            </p>
          )}

          {/* PHONE */}
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              name="phone"
              placeholder="Téléphone (optionnel)"
              value={formData.phone}
              onChange={handleChange}
              className={`${inputClass} pl-10 border-gray-300`}
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              className={`${inputClass} pl-10 pr-12 ${
                errors.password ? "border-red-300" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-3.5 text-gray-400"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-xs flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.password}
            </p>
          )}

          {/* CONFIRM */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${inputClass} pl-10 pr-12 ${
                errors.confirmPassword ? "border-red-300" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-3.5 text-gray-400"
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-xs flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.confirmPassword}
            </p>
          )}

          {/* BUTTON */}
          <button
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? "Création..." : "Créer mon compte"}
          </button>

          {/* LINK */}
          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link to="/auth/login" className="text-blue-600 font-medium">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
