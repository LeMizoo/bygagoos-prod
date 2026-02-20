import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Image,
  Tag,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { adminDesignsApi } from "../../api/adminDesigns.api";
// Importer directement depuis design.ts pour éviter les conflits
import type { Design as DesignType, DesignCategory } from "../../types/design";

export default function DesignsPage() {
  const [designs, setDesigns] = useState<DesignType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DesignCategory | "">("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byCategory: {} as Record<string, number>,
    popular: [] as DesignType[],
  });

  const categories: DesignCategory[] = [
    "T-SHIRT",
    "HOODIE",
    "SWEATSHIRT",
    "POLO",
    "TANK_TOP",
    "POSTER",
    "STICKER",
    "MUG",
    "BAG",
    "CAP",
    "OTHER",
  ];

  useEffect(() => {
    loadDesigns();
    loadStats();
  }, [search, category]);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const response = await adminDesignsApi.getAllDesigns({
        search,
        category: category || undefined,
        page: 1,
        limit: 50,
      });
      const designsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.designs || [];
      setDesigns(designsData.filter((d: any) => d && d._id)); // Filtrer les designs valides avec _id
    } catch (error) {
      console.error("Erreur lors du chargement des designs:", error);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminDesignsApi.getDesignStats();
      const statsData = response.data as any;
      setStats({
        total: statsData?.total || 0,
        active: statsData?.byStatus?.["active"] || 0,
        byCategory: statsData?.byCategory || {},
        popular: (statsData?.popular || []) as any[],
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce design ?")) {
      try {
        await adminDesignsApi.deleteDesign(id);
        loadDesigns();
        loadStats();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression du design");
      }
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: "active" | "inactive" | "archived",
  ) => {
    try {
      await adminDesignsApi.updateDesignStatus(id, status);
      loadDesigns();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Catalogue des Designs
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez votre bibliothèque de créations
          </p>
        </div>
        <Link
          to="/admin/designs/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau design
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Designs totaux</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <span className="font-bold">📊</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <span className="font-bold">✅</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Populaires</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.popular?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <span className="font-bold">🔥</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Catégories</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Object.keys(stats.byCategory || {}).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="font-bold">🏷️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
            </div>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as DesignCategory | "")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un design..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <button
              onClick={loadDesigns}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des Designs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-800">
                Tous les designs
              </h2>
              <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {designs.length} designs
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des designs...</p>
          </div>
        ) : designs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Image className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun design trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {search || category
                ? "Aucun résultat correspond à vos critères de recherche."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Design
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {designs && designs.length > 0 ? (
                  designs.map((design, index) => {
                    // Type assertion pour accéder aux propriétés
                    const designTyped = design as DesignType;
                    const key = designTyped._id || `design-${index}`;
                    return (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {designTyped.thumbnail ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={designTyped.thumbnail}
                                  alt={designTyped.title}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Image className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {designTyped.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {designTyped.tags?.slice(0, 2).join(", ")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {designTyped.category?.replace("_", " ") ||
                              "Non catégorisé"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {designTyped.basePrice?.toLocaleString() || "0"} Ar
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                designTyped.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : designTyped.status === "draft"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : designTyped.status === "archived"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {designTyped.status === "active"
                                ? "Actif"
                                : designTyped.status === "draft"
                                  ? "Brouillon"
                                  : designTyped.status === "archived"
                                    ? "Archivé"
                                    : "Inactif"}
                            </span>
                            <select
                              value={designTyped.status || "draft"}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  designTyped._id,
                                  e.target.value as
                                    | "active"
                                    | "inactive"
                                    | "archived",
                                )
                              }
                              className="text-xs border border-gray-300 rounded p-1"
                            >
                              <option value="draft">Brouillon</option>
                              <option value="active">Actif</option>
                              <option value="inactive">Inactif</option>
                              <option value="archived">Archivé</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link
                              to={`/admin/designs/${designTyped._id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/admin/designs/edit/${designTyped._id}`}
                              className="text-green-600 hover:text-green-900"
                              title="Éditer"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteDesign(designTyped._id)
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {loading ? "Chargement..." : "Aucun design disponible"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          💡 Comment utiliser cette section
        </h3>
        <ul className="text-blue-700 space-y-1">
          <li>
            • <strong>Créer un design</strong> : Ajoutez des images, définissez
            les prix et caractéristiques
          </li>
          <li>
            • <strong>Organiser</strong> : Utilisez les catégories et tags pour
            structurer votre catalogue
          </li>
          <li>
            • <strong>Gérer la visibilité</strong> : Activez/désactivez les
            designs selon leur disponibilité
          </li>
          <li>
            • <strong>Suivre la popularité</strong> : Les designs les plus
            vus/commandés sont mis en avant
          </li>
        </ul>
      </div>
    </div>
  );
}
