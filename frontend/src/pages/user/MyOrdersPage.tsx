import { Package, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function MyOrdersPage() {
  const orders = [
    {
      id: "#BG001",
      date: "15/02/2024",
      items: 3,
      amount: "450,000 MGA",
      status: "En production",
      statusColor: "blue",
      estimatedDelivery: "25/02/2024",
    },
    {
      id: "#BG002",
      date: "10/02/2024",
      items: 1,
      amount: "120,000 MGA",
      status: "Livré",
      statusColor: "green",
      estimatedDelivery: "20/02/2024",
    },
    {
      id: "#BG003",
      date: "05/02/2024",
      items: 5,
      amount: "890,000 MGA",
      status: "En attente",
      statusColor: "yellow",
      estimatedDelivery: "15/03/2024",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Livré":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "En production":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "En attente":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
        <p className="text-gray-600 mt-2">
          Suivez l'état de vos commandes et consultez votre historique
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livraison estimée
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-blue-600">{order.id}</div>
                    <button className="text-sm text-blue-500 hover:text-blue-700 mt-1">
                      Voir les détails
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{order.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      {order.items} article(s)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {order.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                          order.statusColor === "green"
                            ? "bg-green-100 text-green-800"
                            : order.statusColor === "blue"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">
                      {order.estimatedDelivery}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune commande pour le moment
            </h3>
            <p className="text-gray-600 mb-4">
              Lorsque vous passerez une commande, elle apparaîtra ici.
            </p>
            <a href="/gallery" className="btn-primary">
              Découvrir nos créations
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-blue-800 mb-2">Suivi de commande</h4>
          <p className="text-blue-700 text-sm">
            Vous recevrez des mises à jour par email à chaque étape de
            production.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="font-bold text-green-800 mb-2">Personnalisation</h4>
          <p className="text-green-700 text-sm">
            Toutes nos créations peuvent être personnalisées selon vos besoins.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h4 className="font-bold text-purple-800 mb-2">Support dédié</h4>
          <p className="text-purple-700 text-sm">
            Une question ? Contactez-nous directement via votre espace client.
          </p>
        </div>
      </div>
    </div>
  );
}
