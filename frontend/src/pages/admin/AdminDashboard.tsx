// frontend/src/pages/admin/AdminDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  ChevronRight,
  Star,
  Zap,
  Award,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import toast from "react-hot-toast";
import dev from '../../utils/devLogger';
import { dashboardApi, AdminStats, DashboardFilters } from "../../api/dashboard.api";
import { useAuthStore } from "../../stores/authStore";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { UserRole, hasPermission } from "../../types/roles";
import { getAllStaff, type StaffMember } from "../../api/adminStaff.api";
import adminClientsApi from "../../api/adminClients.api";
import { adminDesignsApi } from "../../api/adminDesigns.api";
import { adminOrdersApi } from "../../api/adminOrders.api";
import { Client } from "../../types/client";
import { Design } from "../../types";
import { Order } from "../../api/adminOrders.api";
import { PreviewTable } from "../../components/dashboard/PreviewTable";

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Types pour les périodes
type PeriodType = 'day' | 'week' | 'month' | 'year';

// Types pour les graphiques
interface RevenueHistoryItem {
  date: string;
  amount: number;
}

interface OrdersHistoryItem {
  date: string;
  count: number;
}

interface ChartDataConfig {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'orders'>('revenue');
  const [exporting, setExporting] = useState(false);

  // États pour les données d'aperçu
  const [staffData, setStaffData] = useState<StaffMember[]>([]);
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [designsData, setDesignsData] = useState<Design[]>([]);
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  
  const [staffLoading, setStaffLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [designsLoading, setDesignsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Vérification des permissions
  const canViewRevenue = user && hasPermission(user.role as UserRole, 'read:revenue');

  useEffect(() => {
    fetchStats();
    loadPreviewData();
    
    // Rafraîchissement automatique toutes les 5 minutes
    const interval = setInterval(() => {
      if (!showFilters) {
        refreshStats();
      }
    }, 300000);
    
    return () => clearInterval(interval);
  }, [period]);

  const loadPreviewData = async () => {
    // Charger Staff
    try {
      setStaffLoading(true);
      const staff = await getAllStaff();
      setStaffData(staff);
    } catch (error: any) {
      dev.error("Erreur chargement staff:", error);
    } finally {
      setStaffLoading(false);
    }

    // Charger Clients
    try {
      setClientsLoading(true);
      const clients = await adminClientsApi.getAll();
      setClientsData(clients);
    } catch (error: any) {
      dev.error("Erreur chargement clients:", error);
    } finally {
      setClientsLoading(false);
    }

    // Charger Designs
    try {
      setDesignsLoading(true);
      const result = await adminDesignsApi.getAllDesigns({ limit: 10 });
      setDesignsData(result.data || []);
    } catch (error: any) {
      dev.error("Erreur chargement designs:", error);
    } finally {
      setDesignsLoading(false);
    }

    // Charger Orders
    try {
      setOrdersLoading(true);
      const orders = await adminOrdersApi.getAll();
      setOrdersData(orders);
    } catch (error: any) {
      dev.error("Erreur chargement orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getAdminStats(period, filters);
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des statistiques");
      dev.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      setRefreshing(true);
      const data = await dashboardApi.getAdminStats(period, filters);
      setStats(data);
      toast.success("Données actualisées", { duration: 2000 });
    } catch (error: any) {
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setRefreshing(false);
    }
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    fetchStats();
  };

  const handleResetFilters = () => {
    setFilters({});
    fetchStats();
  };

  const handleExport = async () => {
    if (!stats) return;
    
    try {
      setExporting(true);
      
      const data = [
        ['Rapport d\'activité', formatDate(new Date())],
        [],
        ['Métriques principales'],
        ['Commandes actives', stats.orders.active],
        ['Commandes complétées', stats.orders.completed],
        ['Revenue cette période', `${stats.revenue.thisPeriod} €`],
        ['Designs actifs', stats.designs.active],
        [],
        ['Statut des commandes'],
        ['Brouillons', stats.orders.byStatus.draft],
        ['Confirmées', stats.orders.byStatus.confirmed],
        ['En production', stats.orders.byStatus.inProgress],
        ['Terminées', stats.orders.byStatus.completed],
        [],
        ['Clients récents'],
        ...(stats.recentClients?.map(c => [`${c.firstName} ${c.lastName}`, c.email, c.phone || '']) || []),
      ];

      const csvContent = data.map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `dashboard_${formatDate(new Date()).replace(/\//g, '-')}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Rapport exporté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  // Données pour le graphique d'évolution
  const revenueChartData = useMemo((): ChartDataConfig | null => {
    if (!stats?.revenue?.history) return null;

    const labels = stats.revenue.history.map((item: RevenueHistoryItem) => item.date);
    const data = stats.revenue.history.map((item: RevenueHistoryItem) => item.amount);

    return {
      labels,
      datasets: [
        {
          label: 'Chiffre d\'affaires (€)',
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [stats]);

  const ordersChartData = useMemo((): ChartDataConfig | null => {
    if (!stats?.orders?.history) return null;

    return {
      labels: stats.orders.history.map((item: OrdersHistoryItem) => item.date),
      datasets: [
        {
          label: 'Commandes',
          data: stats.orders.history.map((item: OrdersHistoryItem) => item.count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  }, [stats]);

  const statusChartData = useMemo((): ChartDataConfig | null => {
    if (!stats?.orders?.byStatus) return null;

    return {
      labels: ['Brouillons', 'Confirmées', 'En production', 'Terminées'],
      datasets: [
        {
          label: 'Commandes par statut',
          data: [
            stats.orders.byStatus.draft,
            stats.orders.byStatus.confirmed,
            stats.orders.byStatus.inProgress,
            stats.orders.byStatus.completed,
          ],
          backgroundColor: [
            'rgba(156, 163, 175, 0.8)', // gray
            'rgba(59, 130, 246, 0.8)',  // blue
            'rgba(245, 158, 11, 0.8)',  // orange
            'rgba(34, 197, 94, 0.8)',   // green
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement des données</p>
        <button
          onClick={refreshStats}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  // Calcul des tendances
  const revenueTrend = stats.revenue.thisPeriod - stats.revenue.previousPeriod;
  const revenueTrendPercent = stats.revenue.previousPeriod > 0 
    ? (revenueTrend / stats.revenue.previousPeriod) * 100 
    : 0;

  const ordersTrend = stats.orders.thisPeriod - stats.orders.previousPeriod;
  const ordersTrendPercent = stats.orders.previousPeriod > 0 
    ? (ordersTrend / stats.orders.previousPeriod) * 100 
    : 0;

  return (
    <div className="space-y-8">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Tableau de Bord
          </h1>
          <p className="text-gray-600 mt-2">
            {formatDate(new Date())} • Dernière mise à jour
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Sélecteur de période */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodType)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
            aria-label="Sélectionner la période"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>

          {/* Bouton export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Export...' : 'Exporter'}
          </button>

          {/* Bouton actualiser */}
          <button
            onClick={refreshStats}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Filtres avancés</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                aria-label="Date de début"
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                aria-label="Date de fin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut des commandes
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                aria-label="Statut des commandes"
                onChange={(e) => setFilters(prev => ({ ...prev, orderStatus: e.target.value }))}
              >
                <option value="">Tous</option>
                <option value="draft">Brouillons</option>
                <option value="confirmed">Confirmées</option>
                <option value="in_progress">En production</option>
                <option value="completed">Terminées</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Commandes actives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {ordersTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={ordersTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                {ordersTrendPercent > 0 ? '+' : ''}{ordersTrendPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Commandes actives</p>
          <p className="text-2xl font-bold text-gray-900">{stats.orders.active}</p>
          <p className="text-xs text-gray-500 mt-2">
            vs {stats.orders.previousPeriod} période précédente
          </p>
        </div>

        {/* Commandes complétées */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-sm text-gray-500">
              {stats.orders.completed > 0 
                ? ((stats.orders.completed / (stats.orders.completed + stats.orders.active)) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Commandes complétées</p>
          <p className="text-2xl font-bold text-gray-900">{stats.orders.completed}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.orders.byStatus.completed} ce mois
          </p>
        </div>

        {/* Chiffre d'affaires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {revenueTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                {revenueTrendPercent > 0 ? '+' : ''}{revenueTrendPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Chiffre d'affaires</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.revenue.thisPeriod)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.revenue.ordersThisPeriod} commande(s)
          </p>
        </div>

        {/* Designs actifs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-sm text-gray-500">
              {stats.designs.popular?.length || 0} populaires
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Designs actifs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.designs.active}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.designs.draft} en brouillon
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique d'évolution */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Évolution</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChart('revenue')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedChart === 'revenue'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                CA
              </button>
              <button
                onClick={() => setSelectedChart('orders')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedChart === 'orders'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Commandes
              </button>
            </div>
          </div>
          
          <div className="h-80">
            {selectedChart === 'revenue' && revenueChartData && (
              <Line
                data={revenueChartData as ChartData<'line'>}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.parsed.y} €`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `${value} €`,
                      },
                    },
                  },
                } as ChartOptions<'line'>}
              />
            )}
            
            {selectedChart === 'orders' && ordersChartData && (
              <Bar
                data={ordersChartData as ChartData<'bar'>}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                } as ChartOptions<'bar'>}
              />
            )}
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6">Répartition des commandes</h3>
          <div className="h-64">
            {statusChartData && (
              <Doughnut
                data={statusChartData as ChartData<'doughnut'>}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  cutout: '60%',
                } as ChartOptions<'doughnut'>}
              />
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">Brouillon: {stats.orders.byStatus.draft}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Confirmée: {stats.orders.byStatus.confirmed}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Production: {stats.orders.byStatus.inProgress}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Terminée: {stats.orders.byStatus.completed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients récents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Clients récents
            </h3>
            <Link
              to="/admin/clients"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.recentClients && stats.recentClients.length > 0 ? (
              stats.recentClients.map((client, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {client.firstName?.[0]}{client.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {client.company || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {client.createdAt ? formatDate(client.createdAt) : 'Nouveau'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun client récent</p>
            )}
          </div>
        </div>

        {/* Designs populaires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Designs populaires
            </h3>
            <Link
              to="/admin/designs"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.designs.popular && stats.designs.popular.length > 0 ? (
              stats.designs.popular.map((design, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{design.title}</p>
                      <p className="text-sm text-gray-500">
                        {design.status === 'active' ? 'Actif' : 'Brouillon'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {design.viewCount} vues
                    </p>
                    <p className="text-xs text-gray-500">
                      {design.orderCount} commandes
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun design populaire</p>
            )}
          </div>
        </div>
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Commandes récentes
          </h3>
          <Link
            to="/admin/orders"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">Client</th>
                <th className="px-4 py-3 text-left text-gray-600">Responsable</th>
                <th className="px-4 py-3 text-center text-gray-600">Designs</th>
                <th className="px-4 py-3 text-right text-gray-600">Montant</th>
                <th className="px-4 py-3 text-center text-gray-600">Statut</th>
                <th className="px-4 py-3 text-center text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.client?.firstName} {order.client?.lastName}
                        </p>
                        {order.client?.company && (
                          <p className="text-xs text-gray-500">{order.client.company}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.user?.firstName} {order.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {order.designs?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(order.totalPrice || 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'IN_PROGRESS'
                              ? 'bg-orange-100 text-orange-800'
                              : order.status === 'CONFIRMED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status === 'DELIVERED'
                          ? 'Terminée'
                          : order.status === 'IN_PROGRESS'
                            ? 'En production'
                            : order.status === 'CONFIRMED'
                              ? 'Confirmée'
                              : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {order.createdAt ? formatDate(order.createdAt) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
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

      {/* Conseils et astuces */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Conseils pour booster votre activité</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                {stats.designs.popular && stats.designs.popular.length > 0 
                  ? `Mettez en avant vos designs populaires (${stats.designs.popular[0]?.title})`
                  : 'Créez de nouveaux designs pour attirer plus de clients'}
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                {stats.recentClients && stats.recentClients.length > 0
                  ? `Contactez vos nouveaux clients pour fidélisation`
                  : 'Développez votre clientèle'}
              </li>
              <li className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                {stats.orders.byStatus.draft > 0
                  ? `Relancez les ${stats.orders.byStatus.draft} commandes en brouillon`
                  : 'Proposez des promotions pour générer des commandes'}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tableaux d'aperçu */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Aperçus des données</h2>
        <div className="space-y-6">
          {/* Tableau Staff */}
          <PreviewTable
            title="Personnel"
            columns={[
              {
                key: 'firstName',
                label: 'Nom',
                render: (value, row) => `${row.firstName} ${row.lastName}`,
              },
              {
                key: 'email',
                label: 'Email',
              },
              {
                key: 'role',
                label: 'Rôle',
              },
              {
                key: 'department',
                label: 'Département',
              },
              {
                key: 'isActive',
                label: 'Statut',
                render: (value) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {value ? 'Actif' : 'Inactif'}
                  </span>
                ),
              },
            ]}
            data={staffData}
            loading={staffLoading}
            emptyMessage="Aucun personnel"
            viewAllLink="/admin/staff"
          />

          {/* Tableau Clients */}
          <PreviewTable
            title="Clients"
            columns={[
              {
                key: 'firstName',
                label: 'Nom',
                render: (value, row) => `${row.firstName} ${row.lastName}`,
              },
              {
                key: 'email',
                label: 'Email',
              },
              {
                key: 'phone',
                label: 'Téléphone',
              },
              {
                key: 'city',
                label: 'Ville',
              },
              {
                key: 'isActive',
                label: 'Statut',
                render: (value) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {value ? 'Actif' : 'Inactif'}
                  </span>
                ),
              },
            ]}
            data={clientsData}
            loading={clientsLoading}
            emptyMessage="Aucun client"
            viewAllLink="/admin/clients"
          />

          {/* Tableau Designs */}
          <PreviewTable
            title="Designs"
            columns={[
              {
                key: 'title',
                label: 'Titre',
              },
              {
                key: 'category',
                label: 'Catégorie',
              },
              {
                key: 'style',
                label: 'Style',
              },
              {
                key: 'status',
                label: 'Statut',
                render: (value) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {value === 'active' ? 'Actif' : 'Brouillon'}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                label: 'Créé',
                render: (value) => value ? formatDate(value) : '-',
              },
            ]}
            data={designsData}
            loading={designsLoading}
            emptyMessage="Aucun design"
            viewAllLink="/admin/designs"
          />

          {/* Tableau Commandes */}
          <PreviewTable
            title="Commandes"
            columns={[
              {
                key: 'clientId',
                label: 'Client ID',
              },
              {
                key: 'items',
                label: 'Articles',
                render: (value) => Array.isArray(value) ? value.length : 0,
              },
              {
                key: 'totalPrice',
                label: 'Montant',
                render: (value) => value ? formatCurrency(value) : '-',
              },
              {
                key: 'status',
                label: 'Statut',
                render: (value) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    value === 'PROCESSING' ? 'bg-orange-100 text-orange-800' :
                    value === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {value === 'COMPLETED' ? 'Terminée' :
                     value === 'PROCESSING' ? 'En traitement' :
                     value === 'PENDING' ? 'En attente' : 'Annulée'}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                label: 'Date',
                render: (value) => value ? formatDate(value) : '-',
              },
            ]}
            data={ordersData}
            loading={ordersLoading}
            emptyMessage="Aucune commande"
            viewAllLink="/admin/orders"
          />
        </div>
      </div>
    </div>
  );
}