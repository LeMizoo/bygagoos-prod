import { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  AlertCircle,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { dashboardApi, SuperAdminStats } from "../../api/dashboard.api";
import {
  StatCard,
  DashboardSection,
  ListItem,
} from "../../components/dashboard/DashboardComponents";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getSuperAdminStats();
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
          Tableau de Bord Super Admin
        </h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble complète de l'activité et des performances
        </p>
      </div>

      {/* Top Stats */}
      <DashboardSection title="Vue d'ensemble" description="Les chiffres clés">
        <StatCard
          title="Commandes Totales"
          value={stats.orders.total}
          icon={ShoppingCart}
          description={`${stats.orders.recentOrders7days} ces 7 derniers jours`}
          color="blue"
        />
        <StatCard
          title="Revenu Total"
          value={`${(stats.revenue.total / 1000).toFixed(1)}k €`}
          icon={DollarSign}
          description={`Moyenne: ${stats.revenue.average.toFixed(0)} € par commande`}
          color="green"
        />
        <StatCard
          title="Designs Actifs"
          value={stats.designs.active}
          icon={Package}
          description={`${stats.designs.draft} en brouillon`}
          color="purple"
        />
        <StatCard
          title="Utilisateurs"
          value={stats.users.total}
          icon={Users}
          description={`${stats.users.admins} admin(s)`}
          color="orange"
        />
      </DashboardSection>

      {/* Orders Status */}
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
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="En Production"
          value={stats.orders.byStatus.inProgress}
          icon={TrendingUp}
          color="orange"
        />
        <StatCard
          title="Complétées"
          value={stats.orders.byStatus.completed}
          icon={ShoppingCart}
          color="green"
        />
      </DashboardSection>

      {/* Staff & Clients */}
      <div className="grid lg:grid-cols-3 gap-6">
        <DashboardSection title="Personnel">
          <StatCard
            title="Total"
            value={stats.staff.total}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Actifs"
            value={stats.staff.active}
            icon={Users}
            color="green"
          />
        </DashboardSection>

        <DashboardSection title="Clients">
          <StatCard
            title="Total"
            value={stats.clients.total}
            icon={Users}
            color="purple"
          />
        </DashboardSection>

        <DashboardSection title="Designs">
          <StatCard
            title="Total"
            value={stats.designs.total}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Archivés"
            value={
              stats.designs.total - stats.designs.active - stats.designs.draft
            }
            icon={Package}
            color="gray"
          />
        </DashboardSection>
      </div>

      {/* Top Clients & Designs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Top 5 Clients</h3>
          <div className="space-y-1">
            {stats.topClients.length > 0 ? (
              stats.topClients.map((client, idx) => (
                <ListItem
                  key={idx}
                  title={
                    client.clientInfo?.[0]
                      ? `${client.clientInfo[0].firstName} ${client.clientInfo[0].lastName}`
                      : "Client supprimé"
                  }
                  subtitle={`${client.orderCount} commande(s)`}
                  value={`${client.totalSpent.toFixed(0)} €`}
                  badge={`#${idx + 1}`}
                />
              ))
            ) : (
              <p className="text-gray-600 text-sm py-4">Aucun client</p>
            )}
          </div>
        </div>

        {/* Top Designs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Top 5 Designs</h3>
          <div className="space-y-1">
            {stats.topDesigns.length > 0 ? (
              stats.topDesigns.map((design, idx) => (
                <ListItem
                  key={idx}
                  title={design.title}
                  subtitle={`Popularité: ${design.popularity}%`}
                  value={`${design.orderCount} commande(s)`}
                  badge={`#${idx + 1}`}
                />
              ))
            ) : (
              <p className="text-gray-600 text-sm py-4">Aucun design</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
