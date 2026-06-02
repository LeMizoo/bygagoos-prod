import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, DollarSign, Calendar, ArrowRight, Crown,
  ShoppingBag, Users, ShieldCheck, Sparkles, Briefcase
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import DashboardAccessPanel from '../../components/dashboard/DashboardAccessPanel';
import {
  centralAdministrationLinks,
  homeNavigationLinks,
  transversalDashboardLinks,
} from '../../data/dashboardNavigation';
import { directionGenerale, executivePillars, prodBrand } from '../../data/prod';
import dashboardApi from '../../api/dashboard.api';
import dev from '../../utils/devLogger';

// Enregistrer Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

const governanceStats = [
  { label: "Membres direction", value: "4", icon: Crown },
  { label: "Activités", value: "3", icon: Sparkles },
  { label: "Socle technique", value: "1", icon: ShieldCheck },
  { label: "Vision", value: "ByGagoos Prod", icon: Briefcase },
];

interface DashboardStats {
  totalRevenue?: number;
  monthlyRevenue?: number[];
  monthlyOrders?: number[];
  months?: string[];
  pendingOrders?: number;
  completedOrders?: number;
  totalOrders?: number;
  inkStats?: { designs: number; clients: number; orders: number };
  transStats?: { vehicles: number; drivers: number; tripsToday: number };
  cdaStats?: { tables: number; reservationsToday: number; occupancyRate: number };
  lowStockAlerts?: Array<{ id: string; itemName: string; currentStock: number; threshold: number }>;
  maintenanceAlerts?: Array<{ id: string; vehicleId: string; type: string; date: string }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getAdminStats();
        setStats(data as DashboardStats);
      } catch (error) {
        dev.error('Erreur chargement stats:', error);
        // Données de démonstration
        setStats({
          totalRevenue: 28450000,
          monthlyRevenue: [1250000, 1890000, 2100000, 2780000, 3150000, 3420000, 3680000, 3950000, 4120000, 4380000, 4520000, 28450000],
          monthlyOrders: [45, 52, 61, 68, 72, 78, 82, 85, 89, 92, 95, 156],
          months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
          pendingOrders: 23,
          completedOrders: 245,
          totalOrders: 268,
          inkStats: { designs: 89, clients: 512, orders: 156 },
          transStats: { vehicles: 15, drivers: 12, tripsToday: 18 },
          cdaStats: { tables: 12, reservationsToday: 8, occupancyRate: 67 },
          lowStockAlerts: [
            { id: '1', itemName: 'Huile de friture', currentStock: 4, threshold: 10 },
            { id: '2', itemName: 'Farine', currentStock: 3, threshold: 5 },
          ],
          maintenanceAlerts: [
            { id: '1', vehicleId: 'VHC-001', type: 'Vidange', date: '2026-05-25' },
            { id: '2', vehicleId: 'VHC-003', type: 'Révision freins', date: '2026-05-28' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const chartData = {
    labels: stats.months || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Chiffre d\'affaires (Ar)',
        data: stats.monthlyRevenue || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Nombre de commandes',
        data: stats.monthlyOrders || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw;
            return `${label}: ${value.toLocaleString()} ${label === 'Chiffre d\'affaires (Ar)' ? 'Ar' : ''}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          callback: function(value: any) {
            return `${(value / 1000000).toFixed(1)}M Ar`;
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Hero - Direction Générale */}
      <section className="rounded-[2rem] bg-gradient-to-r from-amber-950 via-stone-900 to-slate-950 p-8 text-white shadow-2xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Crown className="h-4 w-4" />
              Direction Générale
            </div>
            <h1 className="mt-5 text-4xl font-black sm:text-5xl">{prodBrand.name}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/85">
              {prodBrand.summary} La Direction Générale reste familiale et coordonne les
              trois activités avec une même vision, une même rigueur et un même socle.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/home" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-transform hover:scale-[1.02]">
                Retour à l’accueil <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/admin/family" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                Gouvernance familiale <ShieldCheck className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-3">
              {governanceStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl bg-black/20 p-4">
                    <Icon className="h-5 w-5 text-amber-300" />
                    <div className="mt-2 text-2xl font-black">{item.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/60">{item.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-3xl bg-white p-5 text-gray-900">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">Priorité de la semaine</p>
              <p className="mt-3 text-lg font-bold">Aligner les trois dashboards sur le même socle</p>
              <p className="mt-2 text-sm text-gray-600">Chaque activité garde son propre écran, mais l’accès et la lecture se font désormais depuis un centre de commande unique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">CA total</p><p className="text-2xl font-bold text-gray-900">{((stats.totalRevenue || 0) / 1000000).toFixed(1)}M Ar</p></div>
            <div className="p-3 bg-green-100 rounded-xl"><DollarSign className="h-5 w-5 text-green-600" /></div>
          </div>
          <div className="flex items-center gap-1 mt-2"><TrendingUp className="h-3 w-3 text-green-500" /><span className="text-xs text-green-600">+12%</span><span className="text-xs text-gray-400">vs mois dernier</span></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Commandes</p><p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p></div>
            <div className="p-3 bg-blue-100 rounded-xl"><ShoppingBag className="h-5 w-5 text-blue-600" /></div>
          </div>
          <div className="flex items-center gap-2 mt-2"><span className="text-xs text-amber-600">{stats.pendingOrders || 0} en attente</span><span className="text-xs text-green-600">{stats.completedOrders || 0} terminées</span></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Clients actifs</p><p className="text-2xl font-bold text-gray-900">{stats.inkStats?.clients || 0}</p></div>
            <div className="p-3 bg-purple-100 rounded-xl"><Users className="h-5 w-5 text-purple-600" /></div>
          </div>
          <div className="mt-2 text-xs text-green-600">+23 nouveaux ce mois</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Taux activité</p><p className="text-2xl font-bold text-gray-900">78%</p></div>
            <div className="p-3 bg-amber-100 rounded-xl"><TrendingUp className="h-5 w-5 text-amber-600" /></div>
          </div>
          <div className="mt-2 text-xs text-green-600">+5% vs mois dernier</div>
        </div>
      </div>

      {/* Graphique d'évolution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Évolution du CA</h2><Calendar className="h-4 w-4 text-gray-400" /></div>
        <div className="h-80"><Line data={chartData} options={chartOptions} /></div>
      </div>

      {/* Alertes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">⚠️ Alertes stock</h2></div>
          <div className="divide-y divide-gray-100">
            {(stats.lowStockAlerts || []).map(alert => (
              <div key={alert.id} className="p-4 flex items-center justify-between">
                <div><p className="font-medium text-gray-900">{alert.itemName}</p><p className="text-sm text-gray-500">Stock bas: {alert.currentStock} / {alert.threshold}</p></div>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Critique</span>
              </div>
            ))}
            {(!stats.lowStockAlerts?.length) && <div className="p-8 text-center text-gray-500">Aucune alerte stock ⚡</div>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">🔧 Maintenance à venir</h2></div>
          <div className="divide-y divide-gray-100">
            {(stats.maintenanceAlerts || []).map(alert => (
              <div key={alert.id} className="p-4 flex items-center justify-between">
                <div><p className="font-medium text-gray-900">{alert.type}</p><p className="text-sm text-gray-500">Véhicule {alert.vehicleId} - {new Date(alert.date).toLocaleDateString()}</p></div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">À venir</span>
              </div>
            ))}
            {(!stats.maintenanceAlerts?.length) && <div className="p-8 text-center text-gray-500">Aucune maintenance planifiée 🔧</div>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Focus opérationnel</h2>
              <p className="text-sm text-gray-500">Vue consolidée des priorités de la Direction Générale.</p>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-gray-700">Alertes stocks</p>
              {(stats.lowStockAlerts || []).slice(0, 2).map(alert => (
                <div key={alert.id} className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.itemName}</p>
                    <p className="text-sm text-gray-500">Stock {alert.currentStock} / {alert.threshold}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Critique</span>
                </div>
              ))}
              {!(stats.lowStockAlerts?.length) && <p className="mt-3 text-sm text-gray-500">Aucune alerte stock critique.</p>}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-gray-700">Maintenance à venir</p>
              {(stats.maintenanceAlerts || []).slice(0, 2).map(alert => (
                <div key={alert.id} className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.type}</p>
                    <p className="text-sm text-gray-500">Véhicule {alert.vehicleId} • {new Date(alert.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">À venir</span>
                </div>
              ))}
              {!(stats.maintenanceAlerts?.length) && <p className="mt-3 text-sm text-gray-500">Aucune maintenance planifiée.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <DashboardAccessPanel title="Centre de commande" subtitle="Tous les dashboards métiers à portée de main" links={transversalDashboardLinks} columns={4} />
          <DashboardAccessPanel title="Administration centrale" subtitle="Équipe, clients, commandes et réglages" links={centralAdministrationLinks} columns={4} />
        </div>
      </div>

      <DashboardAccessPanel title="Vitrine rapide" subtitle="Retour vers l’accueil et le hub activités" links={homeNavigationLinks} columns={2} compact />

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Infos directionnelles</h2>
            <p className="mt-1 text-sm text-gray-500">Gardez la page légère et consultez le reste uniquement si nécessaire.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            onClick={() => setShowDetails(prev => !prev)}
          >
            {showDetails ? 'Masquer les détails' : 'Voir les détails de la gouvernance'}
          </button>
        </div>
      </div>

      {showDetails && (
        <section className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Membres de la famille</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {directionGenerale.map((member) => (
                <div key={member.name} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                  <div className={`inline-flex rounded-2xl ${member.accent} px-3 py-2 text-lg font-black text-white`}>{member.initials}</div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-amber-700">{member.role}</p>
                  <p className="mt-2 text-sm text-gray-600">{member.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Piliers exécutifs</h2>
            <div className="mt-5 space-y-4">
              {executivePillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                    <div className="inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700"><Icon className="h-5 w-5" /></div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{pillar.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{pillar.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      )}

      {/* Footer section */}
      <section className="rounded-[2rem] bg-gradient-to-r from-gray-900 to-stone-800 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">Direction Générale</p>
            <h2 className="mt-3 text-3xl font-bold">Le socle commun de ByGagoos Prod</h2>
            <p className="mt-3 max-w-3xl text-white/80">Cette page sert désormais de porte d’entrée unique pour naviguer entre les activités, l’administration centrale et la gouvernance familiale.</p>
          </div>
          <Link to="/home#activities" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg">Explorer les activités <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}