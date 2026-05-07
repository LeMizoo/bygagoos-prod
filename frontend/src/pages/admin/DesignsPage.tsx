import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Image,
  Filter,
  Search,
  Download,
  RefreshCw,
  Trash2,
  Edit,
} from "lucide-react";
import { adminDesignsApi } from "../../api/adminDesigns.api";
import dev from "../../utils/devLogger";

type BackendDesignStatus = "DRAFT" | "PENDING" | "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "ARCHIVED" | "INACTIVE";
type UiDesignStatus = "draft" | "active" | "inactive" | "archived";

interface BackendDesign {
  id?: string;
  _id?: string;
  title: string;
  type?: string;
  category?: string;
  status?: BackendDesignStatus | string;
  files?: Array<{ url?: string }>;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
  basePrice?: number;
}

interface DesignRow {
  id: string;
  title: string;
  category: string;
  price: number;
  thumbnail?: string;
  tags: string[];
  status: UiDesignStatus;
  isActive: boolean;
  type?: string;
}

const backendTypeLabels: Record<string, string> = {
  LOGO: "Logo",
  BRANDING: "Branding",
  PACKAGING: "Packaging",
  PRINT: "Print",
  DIGITAL: "Digital",
  ILLUSTRATION: "Illustration",
  OTHER: "Autre",
  "T-SHIRT": "T-Shirt",
  SWEATSHIRT: "Sweatshirt",
  ACCESSOIRE: "Accessoire",
  ART_MURAL: "Art Mural",
  EDITION_LIMITEE: "Édition Limitée",
  SERIGRAPHIE: "Sérigraphie",
};

const uiStatusLabels: Record<UiDesignStatus, string> = {
  draft: "Brouillon",
  active: "Actif",
  inactive: "Inactif",
  archived: "Archivé",
};

const normalizeStatus = (status?: string, isActive?: boolean): UiDesignStatus => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "ARCHIVED") return "archived";
  if (normalized === "REJECTED" || normalized === "INACTIVE") return "inactive";
  if (normalized === "DRAFT" || normalized === "PENDING") return "draft";
  if (normalized === "ACTIVE" || normalized === "APPROVED" || normalized === "IN_PROGRESS" || normalized === "COMPLETED") return "active";
  return isActive === false ? "inactive" : "active";
};

// 🔧 Correction : forcer HTTPS pour les images Cloudinary
const fixImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  return url.replace(/^http:/, 'https:');
};

const normalizeDesign = (design: BackendDesign): DesignRow | null => {
  const id = design.id || design._id;
  if (!id) return null;

  const metadata = design.metadata || {};
  const categoryValue = metadata.category || design.category || design.type || "OTHER";
  const priceValue = metadata.basePrice ?? design.basePrice ?? 0;
  const resolvedStatus = normalizeStatus(design.status, design.isActive);

  // Récupérer l'URL de l'image et la convertir en HTTPS
  const imageUrl = design.thumbnail || design.images?.[0] || design.files?.[0]?.url;
  const thumbnail = fixImageUrl(imageUrl);

  return {
    id,
    title: design.title,
    category: backendTypeLabels[String(categoryValue).toUpperCase()] || String(categoryValue).replace(/_/g, " "),
    price: Number(priceValue) || 0,
    thumbnail,
    tags: design.tags || [],
    status: resolvedStatus,
    isActive: design.isActive ?? resolvedStatus === "active",
    type: design.type,
  };
};

const categories = ["", "T-SHIRT", "SWEATSHIRT", "ACCESSOIRE", "ART_MURAL", "EDITION_LIMITEE", "SERIGRAPHIE", "LOGO", "BRANDING", "PACKAGING", "PRINT", "DIGITAL", "ILLUSTRATION", "OTHER"];

export default function DesignsPage() {
  const location = useLocation();
  const [designs, setDesigns] = useState<DesignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const response = await adminDesignsApi.getAllDesigns({ page: 1, limit: 100 });
      
      let designsData: BackendDesign[] = [];
      const data: any = response;
      
      // ✅ Structure correcte de l'API : response.data.designs
      if (data?.data?.designs && Array.isArray(data.data.designs)) {
        designsData = data.data.designs;
        dev.log(`📦 Designs chargés (data.data.designs): ${designsData.length}`);
      } 
      // Fallback pour d'autres structures possibles
      else if (Array.isArray(data)) {
        designsData = data;
        dev.log(`📦 Designs chargés (Array): ${designsData.length}`);
      } 
      else if (data?.data && Array.isArray(data.data)) {
        designsData = data.data;
        dev.log(`📦 Designs chargés (data.data): ${designsData.length}`);
      } 
      else if (data?.designs && Array.isArray(data.designs)) {
        designsData = data.designs;
        dev.log(`📦 Designs chargés (data.designs): ${designsData.length}`);
      }
      
      setDesigns(
        designsData
          .map((design) => normalizeDesign(design))
          .filter((design): design is DesignRow => design !== null)
      );
    } catch (error) {
      dev.error("Erreur lors du chargement des designs:", error);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  useEffect(() => {
    if ((location.state as { refresh?: boolean } | null)?.refresh) {
      loadDesigns();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredDesigns = useMemo(() => {
    const term = search.trim().toLowerCase();

    return designs.filter((design) => {
      const matchesSearch =
        !term ||
        design.title.toLowerCase().includes(term) ||
        design.category.toLowerCase().includes(term) ||
        design.tags.some((tag) => tag.toLowerCase().includes(term));

      const matchesCategory = !category || design.category.toUpperCase() === category;

      return matchesSearch && matchesCategory;
    });
  }, [designs, search, category]);

  const stats = useMemo(() => {
    const byCategory = filteredDesigns.reduce<Record<string, number>>((acc, design) => {
      acc[design.category] = (acc[design.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: designs.length,
      active: designs.filter((design) => design.isActive).length,
      byCategory,
      popular: [...designs]
        .sort((a, b) => b.price - a.price)
        .slice(0, 4),
    };
  }, [designs, filteredDesigns]);

  const handleDeleteDesign = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce design ?")) {
      return;
    }

    try {
      await adminDesignsApi.deleteDesign(id);
      await loadDesigns();
    } catch (error) {
      dev.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du design");
    }
  };

  const handleUpdateStatus = async (id: string, status: "active" | "inactive" | "archived") => {
    try {
      await adminDesignsApi.updateDesignStatus(id, status);
      await loadDesigns();
    } catch (error) {
      dev.error("Erreur lors de la mise à jour du statut:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue des Designs</h1>
          <p className="text-gray-600 mt-1">Gérez votre bibliothèque de créations</p>
        </div>
        <Link
          to="/admin/designs/create"
          className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau design
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <p className="text-sm text-gray-600">Designs totaux</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <p className="text-sm text-gray-600">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <p className="text-sm text-gray-600">Populaires</p>
          <p className="text-2xl font-bold text-purple-600">{stats.popular.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <p className="text-sm text-gray-600">Catégories</p>
          <p className="text-2xl font-bold text-yellow-600">{Object.keys(stats.byCategory).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filtrer par catégorie"
              title="Filtrer par catégorie"
            >
              {categories.map((cat) => (
                <option key={cat || "all"} value={cat}>
                  {cat ? backendTypeLabels[cat] || cat : "Toutes les catégories"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un design..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={loadDesigns}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800">Tous les designs</h2>
            <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {filteredDesigns.length} designs
            </span>
          </div>
          <button className="inline-flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Chargement des designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Image className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun design trouvé</h3>
            <p className="text-gray-600 mb-6">
              {search || category
                ? "Aucun résultat ne correspond à vos critères."
                : "Commencez par créer votre premier design."}
            </p>
            <Link
              to="/admin/designs/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Créer votre premier design
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Design</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDesigns.map((design) => (
                  <tr key={design.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {design.thumbnail ? (
                            <img className="h-10 w-10 rounded-lg object-cover" src={design.thumbnail} alt={design.title} />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Image className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{design.title}</div>
                          <div className="text-sm text-gray-500">{design.tags.slice(0, 2).join(", ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {design.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {design.price.toLocaleString()} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          design.status === "active"
                            ? "bg-green-100 text-green-800"
                            : design.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : design.status === "archived"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }`}>
                          {uiStatusLabels[design.status]}
                        </span>
                        <select
                          value={design.status}
                          onChange={(e) => handleUpdateStatus(design.id, e.target.value as "active" | "inactive" | "archived")}
                          className="text-xs border border-gray-300 rounded p-1"
                          aria-label="Changer le statut"
                          title="Changer le statut"
                        >
                          <option value="draft">Brouillon</option>
                          <option value="active">Actif</option>
                          <option value="inactive">Inactif</option>
                          <option value="archived">Archivé</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/designs/edit/${design.id}`}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteDesign(design.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Comment utiliser cette section</h3>
        <ul className="text-blue-700 space-y-1">
          <li>• <strong>Créer un design</strong> : Ajoutez des images, définissez les prix et caractéristiques</li>
          <li>• <strong>Organiser</strong> : Utilisez les catégories et tags pour structurer votre catalogue</li>
          <li>• <strong>Gérer la visibilité</strong> : Activez/désactivez les designs selon leur disponibilité</li>
          <li>• <strong>Suivre la popularité</strong> : Les designs les plus vus/commandés sont mis en avant</li>
        </ul>
      </div>
    </div>
  );
}