// frontend/src/pages/user/ProfilePage.tsx

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Extraire le prénom et nom du champ name complet
  const getFirstName = () => {
    if (!user?.name) return "";
    const parts = user.name.split(" ");
    return parts[0] || "";
  };

  const getLastName = () => {
    if (!user?.name) return "";
    const parts = user.name.split(" ");
    return parts.slice(1).join(" ") || "";
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: getFirstName(),
        lastName: getLastName(),
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "Non renseigné",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Construire le nom complet à partir du prénom et nom
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const updateData: any = {};
      
      if (fullName !== user?.name) updateData.name = fullName;
      if (formData.phone !== user?.phone) updateData.phone = formData.phone;
      
      if (Object.keys(updateData).length > 0) {
        // use dev logger
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { dev } = require('../../utils/devLogger');
        dev.log('📝 Mise à jour du profil avec:', updateData);
        await updateProfile(updateData);
        setMessage({ type: "success", text: "Profil mis à jour avec succès!" });
      } else {
        setMessage({ type: "success", text: "Aucune modification détectée" });
      }

      setIsEditing(false);
    } catch (error: any) {
      // use dev logger
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { dev } = require('../../utils/devLogger');
      dev.error('❌ Erreur mise à jour profil:', error);
      setMessage({
        type: "error",
        text: error.message || "Erreur lors de la mise à jour du profil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validations
      if (!passwordData.currentPassword) {
        setMessage({
          type: "error",
          text: "Veuillez entrer votre mot de passe actuel",
        });
        return;
      }
      if (!passwordData.newPassword) {
        setMessage({
          type: "error",
          text: "Veuillez entrer un nouveau mot de passe",
        });
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setMessage({
          type: "error",
          text: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        });
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({
          type: "error",
          text: "Les nouveaux mots de passe ne correspondent pas",
        });
        return;
      }

      setLoading(true);
      
      // Utiliser la méthode du store
      const { changePassword } = useAuthStore.getState();
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword,
      );

      setMessage({ type: "success", text: "Mot de passe changé avec succès!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error: any) {
      // use dev logger
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { dev } = require('../../utils/devLogger');
      dev.error('❌ Erreur changement mot de passe:', error);
      setMessage({
        type: "error",
        text: error.message || "Erreur lors du changement de mot de passe",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-2">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      {/* Message d'alerte */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span
            className={
              message.type === "success" ? "text-green-800" : "text-red-800"
            }
          >
            {message.text}
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Photo de profil et infos basiques */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-blue-600" />
                  )}
                </div>
                <button 
                  className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  aria-label="Changer la photo de profil"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                {user.name}
              </h2>
              <p className="text-gray-600">{user.email}</p>

              <div className="mt-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {user.role?.replace("_", " ")}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Membre depuis</p>
                <p className="font-medium text-gray-900">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formulaire d'édition du profil */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Informations personnelles
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Modifier le profil
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Votre prénom"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <span>{getFirstName() || "Non renseigné"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Votre nom"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <span>{getLastName() || "Non renseigné"}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{user.email}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre numéro de téléphone"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{user.phone || "Non renseigné"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre adresse"
                  />
                ) : (
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{user.address || "Non renseigné"}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    setFormData({
                      firstName: getFirstName(),
                      lastName: getLastName(),
                      email: user.email || "",
                      phone: user.phone || "",
                      address: user.address || "Non renseigné",
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>
              </div>
            )}
          </div>

          {/* Section Changement de mot de passe */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Sécurité</h3>
              </div>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Changer le mot de passe
                </button>
              )}
            </div>

            {isChangingPassword && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Entrez votre mot de passe actuel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Entrez un nouveau mot de passe (min. 6 caractères)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setMessage(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {loading ? "Changement..." : "Changer le mot de passe"}
                  </button>
                </div>
              </div>
            )}

            {!isChangingPassword && (
              <p className="text-gray-600 text-sm">
                Changez votre mot de passe régulièrement pour maintenir votre
                compte sécurisé.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}