// frontend/src/components/admin/OrdersTable.tsx
import React from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Order } from "../../api/adminOrders.api";

interface OrdersTableProps {
  orders: Order[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus?: (id: string, status: Order["status"]) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  // Validation des données
  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Données invalides
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Les données des commandes sont corrompues ou indisponibles.
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Aucune commande
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Aucune commande n'a été trouvée. Créez votre première commande.
        </p>
      </div>
    );
  }

  const getStatusConfig = (status: Order["status"]) => {
    const configs = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      PROCESSING: { color: "bg-blue-100 text-blue-800", icon: Package },
      COMPLETED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircle },
    };
    return configs[status] || configs.PENDING;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "0 Ar";
    return `${price.toLocaleString("fr-FR")} Ar`;
  };

  const getTotalItems = (order: Order) => {
    return (
      order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Commande
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Articles
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Montant
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
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Commande #{order._id?.substring(-6) || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Client: {order.clientId?.substring(-6) || "Non spécifié"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {getTotalItems(order)} article
                      {getTotalItems(order) !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.items?.length || 0} type
                      {order.items?.length !== 1 ? "s" : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon className="h-4 w-4 mr-2" />
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(order._id)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(order._id)}
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(order._id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status Quick Actions */}
      {onUpdateStatus && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {orders.length} commande{orders.length !== 1 ? "s" : ""} au total
            </span>
            <div className="flex space-x-2">
              <span className="text-sm text-gray-600">Actions rapides:</span>
              <select
                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const status = e.target.value as Order["status"];
                  if (status && orders.length > 0) {
                    // Appliquer à toutes les commandes sélectionnées (ici on prend la première)
                    onUpdateStatus(orders[0]._id, status);
                  }
                }}
              >
                <option value="">Changer statut</option>
                <option value="PENDING">En attente</option>
                <option value="PROCESSING">En traitement</option>
                <option value="COMPLETED">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
