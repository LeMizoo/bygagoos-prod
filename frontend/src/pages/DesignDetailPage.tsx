import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Image as ImageIcon,
  FileText,
  Tag,
  Palette,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import dev from "../utils/devLogger";
import { designApi } from "../api/designApi";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

interface Design {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  collection?: string;
  thumbnail?: string;
  image?: string;
  tags?: string[];
  basePrice?: number;
  price?: number;
  isActive?: boolean;
  createdAt?: string;
  likes?: number;
  artist?: string;
  featured?: boolean;
  ethnicGroup?: string;
  colors?: string[];
  files?: Array<{
    _id?: string;
    url: string;
    name: string;
    type?: string;
  }>;
}

export default function DesignDetailPage() {
  const { designId } = useParams<{ designId: string }>();
  const navigate = useNavigate();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchDesignDetail = async () => {
      if (!designId) {
        setError("ID du design manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        dev.log(`📦 Chargement détail du design: ${designId}`);
        
        // Essayer l'API publique d'abord (pour les designs actifs)
        const response = await designApi.getPublicGallery({ limit: 100 });
        
        let designData: Design | null = null;
        
        // Chercher le design dans la réponse
        // Structure: { success, data: { designs: [...], ... } }
        if (response?.data?.designs) {
          designData = response.data.designs.find((d: any) => d._id === designId) || null;
        }

        if (!designData) {
          setError("Design non trouvé");
        } else {
          setDesign(designData);
          dev.log("✅ Design chargé:", designData);
        }
      } catch (err) {
        dev.error("❌ Erreur chargement design:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchDesignDetail();
  }, [designId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate("/gallery")}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour à la galerie
          </button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Design non trouvé
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "Le design que vous recherchez n'existe pas."}
            </p>
            <Link
              to="/gallery"
              className="inline-block px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Retourner à la galerie
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = design.thumbnail || design.image || "/placeholder-design.png";
  const price = design.basePrice || design.price || "Tarif sur demande";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate("/gallery")}
          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour à la galerie
        </button>

        {/* Grille d'affichage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg w-full">
              <img
                src={imageUrl}
                alt={design.title}
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          </div>

          {/* Détails */}
          <div className="flex flex-col justify-start">
            {/* Titre et prix */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {design.title}
              </h1>
              {design.category && (
                <p className="text-amber-600 font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {design.category}
                </p>
              )}
            </div>

            {/* Prix et actions */}
            <div className="bg-amber-50 rounded-xl p-6 mb-6 border border-amber-200">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-gray-600">Prix</span>
                <span className="text-3xl font-bold text-amber-600">
                  {typeof price === "number" ? `${price} €` : price}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setLiked(!liked)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-amber-600 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      liked ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {design.likes || 0}
                  </span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-600 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Partager</span>
                </button>
                <Link
                  to="/home#commander"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Commander
                </Link>
              </div>
            </div>

            {/* Description */}
            {design.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {design.description}
                </p>
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="space-y-4">
              {design.ethnicGroup && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Inspiration</p>
                    <p className="font-medium text-gray-900">
                      {design.ethnicGroup}
                    </p>
                  </div>
                </div>
              )}

              {design.createdAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Créé le</p>
                    <p className="font-medium text-gray-900">
                      {new Date(design.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              )}

              {design.colors && design.colors.length > 0 && (
                <div className="flex items-start gap-3">
                  <Palette className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Couleurs</p>
                    <div className="flex gap-2 flex-wrap">
                      {design.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {design.tags && design.tags.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {design.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fichiers/Visuels */}
        {design.files && design.files.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-amber-600" />
              Visuels ({design.files.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {design.files.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-colors flex items-center justify-center">
                    <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
