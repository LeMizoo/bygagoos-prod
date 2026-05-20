import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Package, Users, Clock, 
  ArrowRight, Plus, Eye, CheckCircle
} from 'lucide-react';

export default function InkDashboardPage() {
  const [stats, setStats] = useState({
    orders: { total: 24, pending: 8, completed: 16 },
    designs: { total: 45, active: 32 },
    clients: { total: 128, new: 12 }
  });

  const recentOrders = [
    { id: 'CMD-001', client: 'Marie Rakoto', total: 125000, status: 'completed', date: '2024-05-19' },
    { id: 'CMD-002', client: 'Jean Andria', total: 89000, status: 'pending', date: '2024-05-18' },
    { id: 'CMD-003', client: 'Sophie Ranaivo', total: 210000, status: 'processing', date: '2024-05-18' },
  ];

  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700'
  };

  const statusLabels = {
    completed: 'Terminée',
    pending: 'En attente',
    processing: 'En cours'
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ByGagoos Ink</h1>
          <p className="text-gray-500 mt-1">Sérigraphie textile & design personnalisé</p>
        </div>
        <Link
          to="/admin/orders/create"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle commande
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
            <span className="text-green-600">{stats.orders.completed} terminées</span>
          </div>
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

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
          <Link to="/admin/orders" className="text-sm text-purple-600 hover:text-purple-700">Voir tout</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{order.id}</p>
                <p className="text-sm text-gray-500">{order.client}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{order.total.toLocaleString()} Ar</p>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
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