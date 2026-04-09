// frontend/src/pages/orders/OrdersPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  Download,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { OrdersTable } from '../../components/orders/OrdersTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { exportToCSV } from '../../utils/export';
import dev from '../../utils/devLogger';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const { stats, fetchStats, isLoading } = useOrderStore();

  React.useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = () => {
    // Logique d'export
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink-black">Commandes</h1>
          <p className="text-dim-grey mt-1">
            Gérez toutes les commandes de l'atelier
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} className="mr-2" />
            Filtres
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download size={18} className="mr-2" />
            Exporter
          </Button>
          
          <Button onClick={() => navigate('/orders/create')}>
            <Plus size={18} className="mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Commandes créées"
          value={stats?.overview?.totalOrders || 0}
          icon={<BarChart3 size={20} />}
          trend={{ value: 5, direction: 'up' }}
          color="primary"
        />
        
        <KpiCard
          title="Commandes en cours"
          value={stats?.overview?.inProgressOrders || 0}
          icon={<BarChart3 size={20} />}
          trend={{ value: 5, direction: 'up' }}
          color="primary"
        />
        
        <KpiCard
          title="En attente"
          value={stats?.overview?.pendingOrders || 0}
          icon={<BarChart3 size={20} />}
          trend={{ value: 2, direction: 'down' }}
          color="warning"
        />
        
        <KpiCard
          title="Chiffre d'affaires"
          value={`${stats?.overview?.totalRevenue?.toLocaleString()} €`}
          icon={<BarChart3 size={20} />}
          trend={{ value: 12, direction: 'up' }}
          color="success"
        />
        
        <KpiCard
          title="Paniers moyens"
          value={`${stats?.overview?.averageOrderValue?.toLocaleString()} €`}
          icon={<BarChart3 size={20} />}
          trend={{ value: 3, direction: 'up' }}
          color="info"
        />
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <DateRangePicker
              onChange={(range) => dev.log(range)}
            />
            
            {/* Autres filtres */}
          </div>
        </Card>
      )}

      {/* Tableau des commandes */}
      <Card className="p-6">
        <OrdersTable 
          onView={(order) => navigate(`/orders/${order._id}`)}
          onEdit={(order) => navigate(`/orders/${order._id}/edit`)}
        />
      </Card>
    </div>
  );
};