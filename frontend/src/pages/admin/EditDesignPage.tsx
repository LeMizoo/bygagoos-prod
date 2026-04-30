import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload, Image, Tag, DollarSign, Loader2, Trash2 } from "lucide-react";
import { adminDesignsApi } from "../../api/adminDesigns.api";
import dev from "../../utils/devLogger";
import type { DesignStatus } from "../../types/design";

export default function EditDesignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    tags: [] as string[],
    status: "active" as DesignStatus,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);

  const loadDesign = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await adminDesignsApi.getDesignById(id);
      const design = response.data;
      if (!design) throw new Error("Design non trouvé");

      const metadata = design.metadata || {};
      const category = metadata.category || design.type || design.category || "";
      const price = metadata.basePrice || design.basePrice || 0;

      let status: DesignStatus = "draft";
      const rawStatus = String(design.status || "").toUpperCase();
      if (rawStatus === "ARCHIVED") status = "archived";
      else if (rawStatus === "REJECTED") status = "inactive";
      else if (rawStatus === "APPROVED") status = "active";
      else if (rawStatus === "IN_PROGRESS" || rawStatus === "DRAFT" || rawStatus === "PENDING") status = "draft";
      else if (design.isActive === false) status = "inactive";
      else if (design.isActive === true) status = "active";

      setFormData({
        title: design.title || "",
        description: design.description || "",
        category,
        price: String(price),
        tags: design.tags || [],
        status,
      });

      // Gérer l'image et l'ID du fichier
      const thumbnail = design.thumbnail || design.files?.[0]?.url || design.images?.[0] || null;
      setPreview(thumbnail);
      setCurrentFileId(design.files?.[0]?._id?.toString() || null);
      setNewImage(null);
    } catch (error) {
      dev.error("Erreur chargement:", error);
      alert("Erreur lors du chargement du design");
      navigate("/admin/designs");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadDesign();
  }, [loadDesign]);

  const handleDeleteImage = async () => {
    if (!id || !currentFileId) return;
    if (!window.confirm("Supprimer définitivement cette image ?")) return;
    try {
      setDeletingImage(true);
      await adminDesignsApi.removeDesignImage(id, currentFileId);
      setPreview(null);
      setCurrentFileId(null);
      setNewImage(null);
      alert("Image supprimée");
    } catch (error: any) {
      console.error("Erreur suppression image:", error);
      alert("Erreur lors de la suppression de l'image");
    } finally {
      setDeletingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      setImageError(null);

      const updatePayload: Record<string, unknown> = {};

      if (formData.title.trim()) updatePayload.title = formData.title.trim();
      if (formData.description.trim()) updatePayload.description = formData.description.trim();
      if (formData.category) updatePayload.type = formData.category;
      if (formData.price && !isNaN(Number(formData.price)) && Number(formData.price) > 0) {
        updatePayload.basePrice = Number(formData.price);
      }
      if (formData.tags.length > 0) updatePayload.tags = formData.tags;

      let backendStatus = "DRAFT";
      if (formData.status === "active") backendStatus = "APPROVED";
      else if (formData.status === "inactive") backendStatus = "REJECTED";
      else if (formData.status === "archived") backendStatus = "ARCHIVED";
      updatePayload.status = backendStatus;

      if (Object.keys(updatePayload).length > 0) {
        dev.log("📦 Mise à jour design:", updatePayload);
        await adminDesignsApi.updateDesign(id, updatePayload);
      }

      // Gestion de l'image : si nouvelle image, on supprime l'ancienne (s'il y en a une) puis on upload
      if (newImage) {
        // 1. Supprimer l'ancienne image si elle existe
        if (currentFileId) {
          try {
            await adminDesignsApi.removeDesignImage(id, currentFileId);
          } catch (err) {
            console.warn("Erreur suppression ancienne image (ignorée)", err);
          }
        }
        // 2. Uploader la nouvelle
        await adminDesignsApi.uploadDesignImages(id, [newImage]);
        // 3. Recharger le design pour obtenir le nouvel ID du fichier
        await loadDesign();
      }

      alert("Design mis à jour avec succès !");
      navigate("/admin/designs", { state: { refresh: true } });
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      const message = error?.response?.data?.message || error?.message || "Erreur lors de la mise à jour";
      if (message.includes("fichiers")) setImageError(message);
      else alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setImageError(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4">
            <Link
              to="/admin/designs"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Modifier le design
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Informations du design
          </h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du design *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                </div>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="T-SHIRT">T-Shirt</option>
                  <option value="SWEATSHIRT">Sweatshirt</option>
                  <option value="ACCESSOIRE">Accessoire</option>
                  <option value="ART_MURAL">Art Mural</option>
                  <option value="EDITION_LIMITEE">Édition Limitée</option>
                  <option value="SERIGRAPHIE">Sérigraphie</option>
                  <option value="LOGO">Logo</option>
                  <option value="BRANDING">Branding</option>
                  <option value="PACKAGING">Packaging</option>
                  <option value="PRINT">Print</option>
                  <option value="DIGITAL">Digital</option>
                  <option value="ILLUSTRATION">Illustration</option>
                </select>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Prix (Ar)
                  </label>
                </div>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (séparés par des virgules)
              </label>
              <input
                id="tags"
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t);
                  setFormData((prev) => ({ ...prev, tags }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Madagascar, Art, Tradition"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Image className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Image du design</h2>
            </div>
            {preview && currentFileId && (
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={deletingImage}
                className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {deletingImage ? "Suppression..." : "Supprimer l'image"}
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {preview ? "Image actuelle" : "Ajouter une image"}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto h-48 object-cover rounded-lg"
                      />
                      <div className="text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Changer l'image</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Télécharger une image</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
              {imageError && (
                <p className="mt-2 text-sm text-red-600">{imageError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
          <Link
            to="/admin/designs"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}