// frontend/src/components/admin/DesignsTable.tsx
import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Tag,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Design } from "../../api/adminDesigns.api";

interface DesignsTableProps {
  designs: Design[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string, isActive: boolean) => void;
}

const DesignsTable: React.FC<DesignsTableProps> = ({
  designs,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Validation des données
  if (!designs || !Array.isArray(designs)) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Données invalides
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Les données des designs sont corrompues ou indisponibles.
        </p>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun design</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aucun design n'a été trouvé. Créez votre premier design.
        </p>
      </div>
    );
  }

  // Filtrer les designs
  const filteredDesigns = designs.filter((design) => {
    const matchesSearch =
      searchTerm === "" ||
      design.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || design.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Récupérer toutes les catégories uniques
  const categories = Array.from(
    new Set(designs.map((d) => d.category).filter(Boolean)),
  ).filter((cat) => cat !== undefined) as string[];

  const formatPrice = (price?: number) => {
    if (!price) return "Non défini";
    return `${price.toLocaleString("fr-FR")} Ar`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return "Date invalide";
    }
  };

  const truncateText = (text: string = "", maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Filtres */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un design..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Toutes catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-600">
              {filteredDesigns.length} design
              {filteredDesigns.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Design
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Catégorie
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Prix
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDesigns.map((design) => (
              <tr
                key={design._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 mr-4">
                      {design.images?.[0] ? (
                        <img
                          src={design.images[0]}
                          alt={design.title}
                          className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const parent = (e.target as HTMLImageElement)
                              .parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {design.title || "Sans nom"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {truncateText(design.description, 60)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {design.category || "Non catégorisé"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(design.priceRange?.min || 0)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {onToggleStatus ? (
                    <button
                      onClick={() =>
                        onToggleStatus(
                          design._id,
                          !(design.isActive as boolean),
                        )
                      }
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        (design.isActive as boolean)
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      title={
                        (design.isActive as boolean)
                          ? "Actif - Cliquer pour désactiver"
                          : "Inactif - Cliquer pour activer"
                      }
                    >
                      {(design.isActive as boolean) ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactif
                        </>
                      )}
                    </button>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (design.isActive as boolean)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {(design.isActive as boolean) ? "Actif" : "Inactif"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(design.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(design._id)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(design._id)}
                      className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(design._id)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer avec stats */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {filteredDesigns.length} design
            {filteredDesigns.length !== 1 ? "s" : ""} affiché
            {filteredDesigns.length !== 1 ? "s" : ""}
          </span>
          <div className="text-sm text-gray-600">
            Actifs:{" "}
            {designs.filter((d) => (d.isActive as boolean) !== false).length} |
            Inactifs:{" "}
            {designs.filter((d) => (d.isActive as boolean) === false).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignsTable;
