// frontend/src/pages/admin/SuperAdminDashboard.tsx
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
import { dashboardApi, AdminStats } from "../../api/dashboard.api";
import dev from '../../utils/devLogger';
import {
  StatCard,
  DashboardSection,
  ListItem,
} from "../../components/dashboard/DashboardComponents";

// Interface pour les statistiques étendues du Super Admin
// On n'étend plus AdminStats, on crée une interface indépendante
interface SuperAdminStats {
  orders: {
    total: number;
    active: number;
    completed: number;
    thisPeriod: number;
    previousPeriod: number;
    byStatus: {
      draft: number;
      confirmed: number;
      inProgress: number;
      completed: number;
    };
    recentOrders7days: number;
  };
  revenue: {
    total: number;
    thisPeriod: number;
    previousPeriod: number;
    average: number;
    ordersThisPeriod: number;
    history: Array<{
      date: string;
      amount: number;
    }>;
  };
  designs: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    popular: Array<{
      id: string;
      title: string;
      status: string;
      viewCount: number;
      orderCount: number;
    }>;
  };
  users: {
    total: number;
    admins: number;
    staff: number;
    clients: number;
  };
  staff: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  topClients: Array<{
    clientInfo: Array<{
      firstName: string;
      lastName: string;
      email: string;
    }>;
    orderCount: number;
    totalSpent: number;
  }>;
  topDesigns: Array<{
    title: string;
    popularity: number;
    orderCount: number;
  }>;
  recentOrders: any[];
  recentClients: any[];
  alerts?: string[];
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Appel à l'API pour les stats super admin
        // Note: Il faut que cette route existe dans le backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/super-admin-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }
        
        const data = await response.json();
        setStats(data.data || data);
      } catch (error: any) {
        toast.error(
          error.message || "Erreur lors du chargement des statistiques",
        );
        dev.error("Error fetching super admin stats:", error);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Commandes Totales"
          value={stats.orders.total || 0}
          icon={ShoppingCart}
          description={`${stats.orders.recentOrders7days || 0} ces 7 derniers jours`}
          color="blue"
        />
        <StatCard
          title="Revenu Total"
          value={`${((stats.revenue.total || 0) / 1000).toFixed(1)}k €`}
          icon={DollarSign}
          description={`Moyenne: ${(stats.revenue.average || 0).toFixed(0)} € par commande`}
          color="green"
        />
        <StatCard
          title="Designs Actifs"
          value={stats.designs.active || 0}
          icon={Package}
          description={`${stats.designs.draft || 0} en brouillon`}
          color="purple"
        />
        <StatCard
          title="Utilisateurs"
          value={stats.users?.total || 0}
          icon={Users}
          description={`${stats.users?.admins || 0} admin(s)`}
          color="orange"
        />
      </div>

      {/* Orders Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">État des Commandes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Brouillons"
            value={stats.orders.byStatus?.draft || 0}
            icon={ShoppingCart}
            color="gray"
          />
          <StatCard
            title="Confirmées"
            value={stats.orders.byStatus?.confirmed || 0}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="En Production"
            value={stats.orders.byStatus?.inProgress || 0}
            icon={TrendingUp}
            color="orange"
          />
          <StatCard
            title="Complétées"
            value={stats.orders.byStatus?.completed || 0}
            icon={ShoppingCart}
            color="green"
          />
        </div>
      </div>

      {/* Staff & Clients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Personnel</h3>
          <div className="space-y-4">
            <StatCard
              title="Total"
              value={stats.staff?.total || 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Actifs"
              value={stats.staff?.active || 0}
              icon={Users}
              color="green"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Clients</h3>
          <div className="space-y-4">
            <StatCard
              title="Total"
              value={stats.clients?.total || 0}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Nouveaux ce mois"
              value={stats.clients?.newThisMonth || 0}
              icon={Users}
              color="blue"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Designs</h3>
          <div className="space-y-4">
            <StatCard
              title="Total"
              value={stats.designs.total || 0}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Archivés"
              value={stats.designs.archived || 0}
              icon={Package}
              color="gray"
            />
          </div>
        </div>
      </div>

      {/* Top Clients & Designs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Top 5 Clients</h3>
          <div className="space-y-2">
            {stats.topClients && stats.topClients.length > 0 ? (
              stats.topClients.map((client, idx) => (
                <ListItem
                  key={idx}
                  title={
                    client.clientInfo?.[0]
                      ? `${client.clientInfo[0].firstName || ''} ${client.clientInfo[0].lastName || ''}`.trim() || "Client"
                      : "Client supprimé"
                  }
                  subtitle={`${client.orderCount || 0} commande(s)`}
                  value={`${(client.totalSpent || 0).toFixed(0)} €`}
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
          <div className="space-y-2">
            {stats.topDesigns && stats.topDesigns.length > 0 ? (
              stats.topDesigns.map((design, idx) => (
                <ListItem
                  key={idx}
                  title={design.title || "Sans titre"}
                  subtitle={`Popularité: ${design.popularity || 0}%`}
                  value={`${design.orderCount || 0} commande(s)`}
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