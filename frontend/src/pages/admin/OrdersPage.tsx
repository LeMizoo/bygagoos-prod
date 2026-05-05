import { useNavigate } from "react-router-dom";
import { PlusCircle, RefreshCw, ShoppingCart } from "lucide-react";
import { OrdersTable } from "../../components/orders/OrdersTable";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useOrderStore } from "../../stores/orderStore";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { fetchOrders, fetchStats, isLoading } = useOrderStore();

  const handleRefresh = async () => {
    await Promise.all([fetchOrders(), fetchStats()]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-gray-600 mt-1">Suivez, ouvrez et modifiez toutes les commandes de l’atelier</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw size={18} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => navigate("/admin/orders/create")}>
            <PlusCircle size={18} className="mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <OrdersTable
          onView={(order) => navigate(`/admin/orders/${order._id}`)}
          onEdit={(order) => navigate(`/admin/orders/edit/${order._id}`)}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Gestion directe</p>
              <p className="font-medium text-gray-900">Voir, modifier et suivre</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Astuce</p>
          <p className="font-medium text-gray-900">Le bouton Modifier ouvre la fiche édition admin.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Raccourci</p>
          <p className="font-medium text-gray-900">Les actions sont maintenant alignées avec /admin/orders.</p>
        </div>
      </div>
    </div>
  );
}
