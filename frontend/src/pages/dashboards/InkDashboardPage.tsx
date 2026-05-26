import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Users, ArrowRight, Plus, Eye,
  Bike, UtensilsCrossed, Crown, Palette, RefreshCw,
  Factory, AlertCircle, Clock3
} from 'lucide-react';
import { orderApi } from '../../api/orderApi';

type ProductionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'MODIFICATION'
  | 'VALIDATED'
  | 'PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'ARCHIVED'
  | string;

interface ProductionOrder {
  id: string;
  orderNumber: string;
  title: string;
  clientName: string;
  total: number;
  status: ProductionStatus;
  priority?: string;
  deadline?: string;
  updatedAt?: string;
  createdAt?: string;
  producerName?: string;
}

const productionSteps = [
  { status: 'PENDING', label: 'Reçue', progress: 10 },
  { status: 'IN_PROGRESS', label: 'Design', progress: 30 },
  { status: 'REVIEW', label: 'Relecture', progress: 45 },
  { status: 'MODIFICATION', label: 'Retouches', progress: 55 },
  { status: 'VALIDATED', label: 'Validée', progress: 65 },
  { status: 'PRODUCTION', label: 'Production', progress: 80 },
  { status: 'SHIPPED', label: 'Expédiée', progress: 92 },
  { status: 'DELIVERED', label: 'Livrée', progress: 100 },
] as const;

const statusMeta: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-blue-100 text-blue-700' },
  REVIEW: { label: 'Relecture', className: 'bg-indigo-100 text-indigo-700' },
  MODIFICATION: { label: 'Retouches', className: 'bg-orange-100 text-orange-700' },
  VALIDATED: { label: 'Validée', className: 'bg-emerald-100 text-emerald-700' },
  PRODUCTION: { label: 'Production', className: 'bg-purple-100 text-purple-700' },
  SHIPPED: { label: 'Expédiée', className: 'bg-cyan-100 text-cyan-700' },
  DELIVERED: { label: 'Livrée', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
  ARCHIVED: { label: 'Archivée', className: 'bg-gray-100 text-gray-600' },
};

const activeProductionStatuses = new Set([
  'PENDING',
  'IN_PROGRESS',
  'REVIEW',
  'MODIFICATION',
  'VALIDATED',
  'PRODUCTION',
]);

const getProgress = (status: ProductionStatus) => {
  const step = productionSteps.find((item) => item.status === status);
  if (status === 'CANCELLED' || status === 'ARCHIVED') return 0;
  return step?.progress ?? 20;
};

const getStatusLabel = (status: ProductionStatus) => statusMeta[status]?.label ?? status;

const getStatusClassName = (status: ProductionStatus) =>
  statusMeta[status]?.className ?? 'bg-gray-100 text-gray-700';

const getClientName = (order: any) => {
  if (order.clientName) return order.clientName;
  if (order.client?.company) return order.client.company;
  if (order.client?.firstName || order.client?.lastName) {
    return [order.client.firstName, order.client.lastName].filter(Boolean).join(' ');
  }
  return 'Client non renseigné';
};

const getAssigneeName = (assignee: any) => {
  if (!assignee) return undefined;
  if (typeof assignee === 'string') return assignee;
  return [assignee.firstName, assignee.lastName].filter(Boolean).join(' ') || undefined;
};

const normalizeOrder = (order: any): ProductionOrder => ({
  id: order.id || order._id,
  orderNumber: order.orderNumber || `CMD-${String(order.id || order._id || '').slice(-6).toUpperCase()}`,
  title: order.title || order.description || 'Commande Ink',
  clientName: getClientName(order),
  total: order.price?.total ?? order.total ?? order.totalPrice ?? 0,
  status: order.status,
  priority: order.priority,
  deadline: order.deadline || order.estimatedDelivery || order.requestedDate,
  updatedAt: order.updatedAt,
  createdAt: order.createdAt,
  producerName: getAssigneeName(order.assignedTo?.producer),
});

export default function InkDashboardPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await orderApi.getOrders({
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      const payload = response?.data ?? response;
      const rawOrders = Array.isArray(payload?.orders) ? payload.orders : Array.isArray(payload) ? payload : [];

      setOrders(rawOrders.map(normalizeOrder));
      setLastUpdatedAt(new Date());
      setError(null);
    } catch (fetchError) {
      console.error('Erreur chargement commandes Ink:', fetchError);
      setError('Impossible de charger le suivi production pour le moment.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = window.setInterval(() => fetchOrders(true), 15000);
    return () => window.clearInterval(interval);
  }, [fetchOrders]);

  const productionOrders = useMemo(
    () => orders.filter((order) => activeProductionStatuses.has(order.status)).slice(0, 6),
    [orders]
  );

  const stats = useMemo(() => {
    const completed = orders.filter((order) => order.status === 'DELIVERED').length;
    const pending = orders.filter((order) => order.status === 'PENDING').length;
    const inProduction = orders.filter((order) => activeProductionStatuses.has(order.status)).length;
    const averageProgress = productionOrders.length
      ? Math.round(productionOrders.reduce((sum, order) => sum + getProgress(order.status), 0) / productionOrders.length)
      : 0;

    return {
      orders: { total: orders.length, pending, completed, inProduction },
      designs: { total: 45, active: 32 },
      clients: { total: 128, new: 12 },
      averageProgress,
    };
  }, [orders, productionOrders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const activityLinks = [
    { name: "ByGagoos Ink", icon: Palette, href: "/ink/dashboard", current: true, color: "text-purple-600 bg-purple-100" },
    { name: "ByGagoos Trans", icon: Bike, href: "/trans/dashboard", current: false, color: "text-cyan-600 bg-cyan-100" },
    { name: "ByGagoos CDA", icon: UtensilsCrossed, href: "/cda/dashboard", current: false, color: "text-amber-600 bg-amber-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-gray-500">Basculer vers :</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {activityLinks.map((activity) => {
              const Icon = activity.icon;
              return (
                <Link
                  key={activity.name}
                  to={activity.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activity.current
                      ? "bg-gray-100 text-gray-900 cursor-default"
                      : `${activity.color} hover:opacity-80 hover:scale-105`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{activity.name}</span>
                </Link>
              );
            })}
          </div>
          <Link
            to="/prod/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all"
          >
            <Crown className="h-4 w-4" />
            <span className="text-sm font-medium">Direction Générale</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ByGagoos Ink</h1>
          <p className="text-gray-500 mt-1">Sérigraphie textile & design personnalisé</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <Link
            to="/admin/orders/create"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle commande
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Commandes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.orders.total}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex gap-3 mt-3 text-xs">
            <span className="text-amber-600">{stats.orders.pending} en attente</span>
            <span className="text-green-600">{stats.orders.completed} livrées</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Production active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.orders.inProduction}</p>
            </div>
            <div className="bg-violet-100 p-3 rounded-xl">
              <Factory className="h-5 w-5 text-violet-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">{stats.averageProgress}% d'avancement moyen</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Designs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.designs.total}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">{stats.designs.active} actifs</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.clients.total}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-green-600">+{stats.clients.new} nouveaux ce mois</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-2 p-5 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Suivi production en temps réel</h2>
            <p className="text-sm text-gray-500">
              Mise à jour automatique toutes les 15 secondes
              {lastUpdatedAt ? ` · ${lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
          </div>
          <Link to="/admin/orders" className="text-sm text-purple-600 hover:text-purple-700">Piloter les commandes</Link>
        </div>

        {error && (
          <div className="m-5 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-0 border-b border-gray-100 md:grid-cols-4 lg:grid-cols-8">
          {productionSteps.map((step) => {
            const count = orders.filter((order) => order.status === step.status).length;
            return (
              <div key={step.status} className="border-r border-gray-100 px-4 py-3 last:border-r-0">
                <p className="text-xs text-gray-500">{step.label}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{count}</p>
              </div>
            );
          })}
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="p-5 text-sm text-gray-500">Chargement du suivi production...</div>
          )}

          {!isLoading && productionOrders.length === 0 && (
            <div className="p-5 text-sm text-gray-500">Aucune commande Ink active en production.</div>
          )}

          {!isLoading && productionOrders.map((order) => {
            const progress = getProgress(order.status);
            return (
              <div key={order.id} className="p-5 hover:bg-gray-50">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusClassName(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      {order.priority && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {order.priority}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-600">{order.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>{order.clientName}</span>
                      {order.producerName && <span>Prod: {order.producerName}</span>}
                      {order.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-80">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{progress}%</span>
                      <span className="text-gray-500">{order.total.toLocaleString()} Ar</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-purple-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
          <Link to="/admin/orders" className="text-sm text-purple-600 hover:text-purple-700">Voir tout</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{order.orderNumber}</p>
                <p className="truncate text-sm text-gray-500">{order.clientName}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-medium text-gray-900">{order.total.toLocaleString()} Ar</p>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusClassName(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  {order.createdAt && (
                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!isLoading && recentOrders.length === 0 && (
            <div className="p-4 text-sm text-gray-500">Aucune commande récente.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/designs" className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
          <span className="font-medium text-purple-700">Galerie de designs</span>
          <Eye className="h-4 w-4 text-purple-600" />
        </Link>
        <Link to="/admin/clients" className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
          <span className="font-medium text-purple-700">Gestion des clients</span>
          <Users className="h-4 w-4 text-purple-600" />
        </Link>
        <Link to="/gallery" className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
          <span className="font-medium text-purple-700">Voir la galerie publique</span>
          <ArrowRight className="h-4 w-4 text-purple-600" />
        </Link>
      </div>
    </div>
  );
}
