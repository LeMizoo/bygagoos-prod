import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload, Image, Tag, DollarSign } from "lucide-react";
import { adminDesignsApi } from "../../api/adminDesigns.api";
import dev from "../../utils/devLogger";

export default function CreateDesignPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // ✅ correction : = manquant
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    tags: [] as string[],
    image: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Veuillez sélectionner une image.");
      return;
    }

    try {
      setLoading(true);

      // Préparer les données selon CreateDesignDto (sans type ni metadata)
      const titleValue = formData.title.trim();
      const descriptionValue = formData.description.trim() || undefined;
      const categoryValue = formData.category || "OTHER";
      const priceValue = Number(formData.price) || 0;

      dev.log("📝 Création du design...");
      const created = await adminDesignsApi.createDesign({
        title: titleValue,
        description: descriptionValue,
        category: categoryValue,
        basePrice: priceValue,
        status: "draft",
        tags: formData.tags,
      });

      const createdId = created?.data?._id;
      if (!createdId) {
        throw new Error("ID du design non reçu après création.");
      }
      dev.log("✅ Design créé, ID:", createdId);

      dev.log("📤 Envoi de l'image...");
      await adminDesignsApi.uploadDesignImages(createdId, [formData.image]);
      dev.log("✅ Image uploadée avec succès.");

      alert("Design créé avec succès !");
      navigate("/admin/designs", { state: { refresh: true } });
    } catch (error: unknown) {
      console.error("❌ Erreur détaillée:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err?.message || "Erreur lors de la création du design";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
              Ajouter un nouveau design
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
                placeholder="ex: T-shirt ByGagoos Édition Limitée"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez le design, les techniques utilisées, l'inspiration..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <label className="text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  aria-label="Catégorie du design"
                  title="Catégorie du design"
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
                    Prix (Ar)
                  </label>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: 25000"
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
                placeholder="ex: Madagascar, Art, Tradition, Moderne"
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
                Image du design *
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
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setFormData((prev) => ({ ...prev, image: null }));
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Changer d'image
                      </button>
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
                            required
                          />
                        </label>
                        <p className="pl-1">ou glissez-déposez</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Conseil :</strong> Utilisez une image haute qualité
                (minimum 1000x1000px) avec un fond clair ou transparent pour un
                meilleur rendu.
              </p>
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
            disabled={loading || !formData.image}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Création en cours..." : "Créer le design"}
          </button>
        </div>
      </form>
    </div>
  );
}