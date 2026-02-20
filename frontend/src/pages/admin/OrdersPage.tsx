import { Link } from "react-router-dom";
import {
  PlusCircle,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
} from "lucide-react";

export default function OrdersPage() {
  const orderStats = [
    {
      label: "En attente",
      value: "12",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: "En production",
      value: "8",
      color: "text-blue-600",
      bg: "bg-blue-100",
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: "Prêtes à livrer",
      value: "5",
      color: "text-purple-600",
      bg: "bg-purple-100",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      label: "Livrées",
      value: "42",
      color: "text-green-600",
      bg: "bg-green-100",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      label: "Annulées",
      value: "3",
      color: "text-red-600",
      bg: "bg-red-100",
      icon: <AlertCircle className="h-5 w-5" />,
    },
  ];

  const recentOrders = [
    {
      id: "#BG-0012",
      client: "Jean Dupont",
      amount: "85,000 Ar",
      status: "En attente",
      date: "15/02/2024",
    },
    {
      id: "#BG-0011",
      client: "Marie Martin",
      amount: "120,000 Ar",
      status: "En production",
      date: "14/02/2024",
    },
    {
      id: "#BG-0010",
      client: "Entreprise ABC",
      amount: "250,000 Ar",
      status: "Prête à livrer",
      date: "13/02/2024",
    },
    {
      id: "#BG-0009",
      client: "Sarah Johnson",
      amount: "45,000 Ar",
      status: "Livrée",
      date: "12/02/2024",
    },
    {
      id: "#BG-0008",
      client: "Robert Wilson",
      amount: "95,000 Ar",
      status: "Livrée",
      date: "11/02/2024",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Commandes
          </h1>
          <p className="text-gray-600 mt-1">
            Suivez et gérez les commandes en cours
          </p>
        </div>
        <Link
          to="/admin/orders/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvelle commande
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {orderStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vue d'ensemble */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Aperçu des commandes
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: 70 commandes • Chiffre d'affaires: 4,850,000 Ar
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Ce mois</option>
              <option>Le mois dernier</option>
              <option>Cette année</option>
            </select>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Exporter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === "Livrée"
                          ? "bg-green-100 text-green-800"
                          : order.status === "En production"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "Prête à livrer"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section principale */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Package className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Module de gestion des commandes complet
        </h3>
        <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
          Cette section est actuellement en cours de développement. Elle
          permettra de gérer toutes les commandes clients de A à Z avec des
          fonctionnalités avancées.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-600 font-bold mb-2">Création rapide</div>
            <p className="text-sm text-gray-600">Commandes en quelques clics</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-600 font-bold mb-2">
              Suivi en temps réel
            </div>
            <p className="text-sm text-gray-600">
              Statuts mis à jour automatiquement
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-purple-600 font-bold mb-2">
              Facturation intégrée
            </div>
            <p className="text-sm text-gray-600">
              Générez des factures professionnelles
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-yellow-600 font-bold mb-2">
              Rapports détaillés
            </div>
            <p className="text-sm text-gray-600">
              Analyses et statistiques avancées
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link
            to="/admin/orders/create"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Créer une commande
          </Link>
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <span>Voir la documentation</span>
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-4 bg-yellow-50 p-4 rounded-lg">
        <p className="font-medium mb-1">🚀 Fonctionnalités à venir :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Création de commandes avec sélection de designs</li>
          <li>Suivi en temps réel des statuts de production</li>
          <li>Système de facturation automatique</li>
          <li>Notifications par email aux clients</li>
          <li>Rapports de ventes et analyses</li>
          <li>Interface client pour le suivi des commandes</li>
        </ul>
      </div>
    </div>
  );
}
