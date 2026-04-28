// frontend/src/pages/admin/EditDesignPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload, Image } from "lucide-react";
import { adminDesignsApi } from "../../api/adminDesigns.api";
import dev from "../../utils/devLogger";

type BackendDesignStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";

interface DesignResponse {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  metadata?: {
    category?: string;
    basePrice?: number;
  };
  price?: number;
  tags?: string[];
  status?: string;
  thumbnail?: string;
}

export default function EditDesignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    tags: [] as string[],
    status: "" as BackendDesignStatus | "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesign = async () => {
      if (!id) return;
      try {
        dev.log(`📝 Chargement du design ${id}...`);
        const response = await adminDesignsApi.getDesignById(id);
        const design = response.data as DesignResponse;
        if (!design) throw new Error("Design non trouvé");
        setFormData({
          title: design.title || "",
          description: design.description || "",
          category: design.metadata?.category || design.category || "",
          price: (design.metadata?.basePrice ?? design.price ?? 0).toString(),
          tags: design.tags || [],
          status: (design.status as BackendDesignStatus) || "DRAFT",
        });
        if (design.thumbnail) setExistingImage(design.thumbnail);
        dev.log("✅ Design chargé", design);
      } catch (error) {
        console.error(error);
        alert("Impossible de charger le design");
        navigate("/admin/designs");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDesign();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setLoading(true);
      // Construction du payload conforme au DTO backend (sans metadata)
      const updatePayload: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,        // "APPROVED", "DRAFT", etc.
        tags: formData.tags,
      };
      // Ajouter category et basePrice si le DTO les accepte en propriétés directes
      if (formData.category) updatePayload.category = formData.category;
      if (formData.price) updatePayload.basePrice = Number(formData.price);
      
      await adminDesignsApi.updateDesign(id, updatePayload);
      
      if (imageFile) {
        await adminDesignsApi.uploadDesignImages(id, [imageFile]);
      }
      alert("Design mis à jour avec succès !");
      navigate("/admin/designs", { state: { refresh: true } });
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(err?.response?.data?.message || err?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-8">
        <Link
          to="/admin/designs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Modifier le design</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Informations</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner</option>
                  <option value="T-SHIRT">T-Shirt</option>
                  <option value="SWEATSHIRT">Sweatshirt</option>
                  <option value="ACCESSOIRE">Accessoire</option>
                  <option value="ART_MURAL">Art mural</option>
                  <option value="EDITION_LIMITEE">Édition limitée</option>
                </select>
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (Ar)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvé</option>
                <option value="REJECTED">Rejeté</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) => {
                  const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                  setFormData((prev) => ({ ...prev, tags }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ex: Madagascar, Art, Moderne"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Image</h2>
          </div>
          {existingImage && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Image actuelle</p>
              <img
                src={existingImage}
                alt="Design actuel"
                className="h-40 object-contain rounded border"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouvelle image (optionnel)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              {preview ? (
                <div className="text-center">
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="mx-auto h-40 object-contain rounded mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setImageFile(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
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
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 10 Mo)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to="/admin/designs"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}