import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { adminClientsApi, CreateClientData } from "../../api/adminClients.api";
import toast from "react-hot-toast";
import dev from '../../utils/devLogger';

const CreateClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CreateClientData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validation basique
    if (!formData.firstName?.trim()) {
      setError("Le prénom est requis");
      setSaving(false);
      return;
    }

    if (!formData.lastName?.trim()) {
      setError("Le nom est requis");
      setSaving(false);
      return;
    }

    if (!formData.email?.trim()) {
      setError("L'email est requis");
      setSaving(false);
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("L'email n'est pas valide");
      setSaving(false);
      return;
    }

    try {
      // Préparer les données - UNIQUEMENT les champs acceptés par le backend
      const dataToSend: CreateClientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      // Ajouter les champs optionnels seulement s'ils ont des valeurs
      if (formData.phone?.trim()) {
        dataToSend.phone = formData.phone.trim();
      }
      
      // isActive est optionnel, le backend a une valeur par défaut (true)
      if (formData.isActive !== undefined) {
        dataToSend.isActive = formData.isActive;
      }

      dev.log("📤 Envoi des données:", dataToSend);

      const client = await adminClientsApi.create(dataToSend);
      dev.log("✅ Client créé:", client);
      
      toast.success("Client créé avec succès");
      navigate("/admin/clients", { state: { refresh: true } });
    } catch (err: any) {
      dev.error("❌ Erreur détaillée:", err);
      
      let errorMessage = err.message || "Erreur lors de la création";
      
      // Essayer d'extraire le message d'erreur si c'est du JSON
      try {
        const parsedError = JSON.parse(err.message);
        if (parsedError.message) errorMessage = parsedError.message;
      } catch {
        // Ignorer
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/clients")}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Nouveau client</h1>
      </div>

      <div className="bg-white shadow-sm rounded-xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
              <p className="font-medium">Erreur de validation</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Informations personnelles
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jean"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="client@exemple.com"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="01 23 45 67 89"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700"
              >
                Client actif
              </label>
            </div>
          </div>

          {/* Note d'information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              ⚠️ Les champs entreprise, adresse, ville, code postal, pays et notes ne sont pas disponibles pour le moment. Ils seront ajoutés dans une future version.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end pt-6 space-x-3 border-t">
            <button
              type="button"
              onClick={() => navigate("/admin/clients")}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Créer le client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientPage;