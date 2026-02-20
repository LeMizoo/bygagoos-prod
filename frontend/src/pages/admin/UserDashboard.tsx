import { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Clock,
  AlertCircle,
  Loader,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { dashboardApi, UserStats } from "../../api/dashboard.api";
import {
  StatCard,
  DashboardSection,
  ListItem,
} from "../../components/dashboard/DashboardComponents";

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getUserStats(); // directement la data
        setStats(data);
      } catch (error: any) {
        toast.error(
          error.message || "Erreur lors du chargement des statistiques",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des données</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Mon Tableau de Bord
        </h1>
        <p className="text-gray-600 mt-2">
          Suivi de vos commandes et activités
        </p>
      </div>

      {/* Main Stats */}
      <DashboardSection title="Vue d'ensemble">
        <StatCard
          title="Commandes Totales"
          value={stats.orders.total}
          icon={ShoppingCart}
          description={`${stats.orders.completed} complétées`}
          color="blue"
        />
        <StatCard
          title="Commandes Actives"
          value={stats.orders.active}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Montant Dépensé"
          value={`${(stats.spending.total / 1000).toFixed(1)}k €`}
          icon={DollarSign}
          description={`Moyenne: ${stats.spending.average.toFixed(0)} €`}
          color="green"
        />
        <StatCard
          title="Mes Clients"
          value={stats.clients}
          icon={Users}
          color="purple"
        />
      </DashboardSection>

      {/* Secondary Stats */}
      <DashboardSection title="Ressources">
        <StatCard
          title="Mes Designs"
          value={stats.designs}
          icon={Package}
          color="blue"
        />
      </DashboardSection>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Mes Commandes Récentes</h3>
        <div className="overflow-x-auto">
          {stats.recentOrders?.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">Client</th>
                  <th className="px-4 py-2 text-center text-gray-600">
                    Designs
                  </th>
                  <th className="px-4 py-2 text-right text-gray-600">
                    Montant
                  </th>
                  <th className="px-4 py-2 text-center text-gray-600">
                    Statut
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {order.client?.firstName} {order.client?.lastName}
                    </td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      {order.designs?.length || 0}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      {order.totalPrice.toFixed(2)} €
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded inline-flex items-center gap-1 ${
                          order.status === "done"
                            ? "bg-green-100 text-green-800"
                            : order.status === "in_progress"
                              ? "bg-orange-100 text-orange-800"
                              : order.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status === "done" && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {order.status === "done"
                          ? "Complétée"
                          : order.status === "in_progress"
                            ? "En cours"
                            : order.status === "confirmed"
                              ? "Confirmée"
                              : order.status === "cancelled"
                                ? "Annulée"
                                : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Aucune commande trouvée</p>
              <p className="text-sm text-gray-500 mt-1">
                Créez votre première commande pour la voir ici
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <Package className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Créer une Commande</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ajoutez une nouvelle commande pour un client
          </p>
          <button className="btn-primary text-sm">Nouvelle Commande</button>
        </div>

        <div className="bg-green-50 rounded-xl border border-green-200 p-6">
          <Users className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Gérer les Clients</h3>
          <p className="text-sm text-gray-600 mb-4">
            Consultez et gérez votre liste de clients
          </p>
          <button className="btn-primary text-sm">Voir les Clients</button>
        </div>
      </div>
    </div>
  );
}
