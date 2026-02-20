import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { dashboardApi, AdminStats } from "../../api/dashboard.api";
import {
  StatCard,
  DashboardSection,
  ListItem,
} from "../../components/dashboard/DashboardComponents";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getAdminStats();
        setStats(data); // déjà retourné par l'API
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
          Tableau de Bord Admin
        </h1>
        <p className="text-gray-600 mt-2">
          Suivi de l'activité et des performances cette semaine
        </p>
      </div>

      {/* Main Stats */}
      <DashboardSection title="Vue d'ensemble">
        <StatCard
          title="Commandes Actives"
          value={stats.orders.active}
          icon={Clock}
          description="En attente ou en production"
          color="orange"
        />
        <StatCard
          title="Commandes Complétées"
          value={stats.orders.completed}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Revenue Cette Semaine"
          value={`${(stats.revenue.thisWeek / 1000).toFixed(1)}k €`}
          icon={DollarSign}
          description={`${stats.revenue.ordersThisWeek} commande(s)`}
          color="green"
        />
        <StatCard
          title="Designs Actifs"
          value={stats.designs.active}
          icon={Package}
          description={`${stats.designs.draft} en brouillon`}
          color="purple"
        />
      </DashboardSection>

      {/* Orders by Status */}
      <DashboardSection title="État des Commandes">
        <StatCard
          title="Brouillons"
          value={stats.orders.byStatus.draft}
          icon={ShoppingCart}
          color="gray"
        />
        <StatCard
          title="Confirmées"
          value={stats.orders.byStatus.confirmed}
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          title="En Production"
          value={stats.orders.byStatus.inProgress}
          icon={Clock}
          color="orange"
        />
      </DashboardSection>

      {/* Recent Clients & Popular Designs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Clients Récents</h3>
          <div className="space-y-1">
            {stats.recentClients.length > 0 ? (
              stats.recentClients.map((client, idx) => (
                <ListItem
                  key={idx}
                  title={`${client.firstName} ${client.lastName}`}
                  subtitle={client.company || client.email}
                  value={client.phone || "-"}
                />
              ))
            ) : (
              <p className="text-gray-600 text-sm py-4">Aucun client</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Designs Populaires</h3>
          <div className="space-y-1">
            {stats.designs.popular.length > 0 ? (
              stats.designs.popular.map((design, idx) => (
                <ListItem
                  key={idx}
                  title={design.title}
                  subtitle={`Statut: ${design.status}`}
                  value={`${design.viewCount} vues`}
                  badge={`${design.orderCount} cmd`}
                />
              ))
            ) : (
              <p className="text-gray-600 text-sm py-4">Aucun design</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Commandes Récentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600">Client</th>
                <th className="px-4 py-2 text-left text-gray-600">
                  Responsable
                </th>
                <th className="px-4 py-2 text-center text-gray-600">Designs</th>
                <th className="px-4 py-2 text-right text-gray-600">Montant</th>
                <th className="px-4 py-2 text-center text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {order.client?.firstName} {order.client?.lastName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {order.user?.firstName} {order.user?.lastName}
                    </td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      {order.designs?.length || 0}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      {order.totalPrice.toFixed(2)} €
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          order.status === "done"
                            ? "bg-green-100 text-green-800"
                            : order.status === "in_progress"
                              ? "bg-orange-100 text-orange-800"
                              : order.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status === "done"
                          ? "Complétée"
                          : order.status === "in_progress"
                            ? "En cours"
                            : order.status === "confirmed"
                              ? "Confirmée"
                              : "Brouillon"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-600"
                  >
                    Aucune commande récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
