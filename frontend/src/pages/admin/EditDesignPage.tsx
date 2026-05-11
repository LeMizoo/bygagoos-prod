import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, Image, Tag, DollarSign } from "lucide-react";
import { adminDesignsApi } from "../../api/adminDesigns.api";
import dev from "../../utils/devLogger";
import { normalizeImageUrl } from "../../utils/imageUrl";

type EditDesignDetail = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string | null;
  category?: string;
  tags?: string[];
  thumbnail?: string;
  images?: string[];
  metadata?: Record<string, unknown>;
};

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
    image: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadDesign = async () => {
      if (!id) return;

      try {
        setInitialLoading(true);
        const response = await adminDesignsApi.getDesignById(id);
        const design = response.data as EditDesignDetail | undefined;

        if (!design) {
          throw new Error("Design introuvable");
        }

        const metadata = design.metadata || {};
        const categoryValue = String(design.category || metadata.category || "");
        const basePriceValue = metadata.basePrice ?? metadata.price ?? "";
        const existingImage = normalizeImageUrl(design.thumbnail || design.images?.[0] || "");

        setFormData({
          title: design.title || "",
          description: design.description || "",
          category: categoryValue,
          price: String(basePriceValue || ""),
          tags: Array.isArray(design.tags) ? design.tags : [],
          image: null,
        });

        setPreview(existingImage || null);
        setOriginalPreview(existingImage || null);
      } catch (error) {
        dev.error("Erreur chargement design:", error);
        alert("Impossible de charger ce design");
        navigate("/admin/designs", { replace: true });
      } finally {
        setInitialLoading(false);
      }
    };

    loadDesign();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      setLoading(true);

      const updatePayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || undefined,
        basePrice: Number(formData.price || 0),
        tags: formData.tags,
        metadata: {
          category: formData.category || undefined,
          basePrice: Number(formData.price || 0),
        },
      };

      const updated = await adminDesignsApi.updateDesign(id, updatePayload as never);

      const updatedId = updated?.data?._id || id;
      if (updatedId && formData.image) {
        await adminDesignsApi.uploadDesignImages(updatedId, [formData.image], { setAsThumbnail: true });
      }

      alert("Design modifié avec succès !");
      navigate("/admin/designs", { state: { refresh: true } });
    } catch (error) {
      alert("Erreur lors de la modification du design");
      dev.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-3 text-gray-600">Chargement du design...</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du design *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <label className="text-sm font-medium text-gray-700">
                    Catégorie *
                  </label>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="T-SHIRT">T-Shirt</option>
                  <option value="SWEATSHIRT">Sweatshirt</option>
                  <option value="ACCESSOIRE">Accessoire</option>
                  <option value="ART_MURAL">Art Mural</option>
                  <option value="EDITION_LIMITEE">Édition Limitée</option>
                  <option value="SERIGRAPHIE">Sérigraphie</option>
                </select>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <label className="text-sm font-medium text-gray-700">
                    Prix (Ar) *
                  </label>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags.join(", ")}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t);
                  setFormData((prev) => ({ ...prev, tags }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
          <div className="flex items-center mb-6">
            <Image className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Image du design</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image du design
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
                      <div className="text-sm text-gray-500">
                        {originalPreview && preview === originalPreview
                          ? "Image actuelle"
                          : "Nouvelle image sélectionnée"}
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <label className="inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                          Changer l'image
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(originalPreview);
                            setFormData((prev) => ({ ...prev, image: null }));
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Réinitialiser
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Choisir une image</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
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
            disabled={loading}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Modification en cours..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
