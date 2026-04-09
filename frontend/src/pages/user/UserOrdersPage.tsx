// frontend/src/pages/user/UserOrdersPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const UserOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders, fetchOrdersByClient, isLoading, error } = useOrderStore();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Récupérer l'ID du client depuis l'utilisateur
    // Adapter selon la structure réelle de votre objet user
    const clientId = (user as any)?.client?._id || (user as any)?.clientId;
    if (clientId) {
      fetchOrdersByClient(clientId);
    }
  }, [user, fetchOrdersByClient]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      PENDING: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="h-4 w-4" />,
        label: 'En attente'
      },
      IN_PROGRESS: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <Package className="h-4 w-4" />,
        label: 'En cours'
      },
      REVIEW: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'En révision'
      },
      MODIFICATION: { 
        color: 'bg-orange-100 text-orange-800', 
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Modification demandée'
      },
      VALIDATED: { 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Validé'
      },
      PRODUCTION: { 
        color: 'bg-indigo-100 text-indigo-800', 
        icon: <Package className="h-4 w-4" />,
        label: 'En production'
      },
      SHIPPED: { 
        color: 'bg-cyan-100 text-cyan-800', 
        icon: <Package className="h-4 w-4" />,
        label: 'Expédié'
      },
      DELIVERED: { 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Livré'
      },
      CANCELLED: { 
        color: 'bg-red-100 text-red-800', 
        icon: <XCircle className="h-4 w-4" />,
        label: 'Annulé'
      },
      ARCHIVED: { 
        color: 'bg-gray-100 text-gray-800', 
        icon: <Package className="h-4 w-4" />,
        label: 'Archivé'
      }
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['PENDING', 'IN_PROGRESS', 'REVIEW', 'MODIFICATION', 'VALIDATED', 'PRODUCTION', 'SHIPPED'].includes(order.status);
    if (filter === 'completed') return order.status === 'DELIVERED';
    if (filter === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
        <Button onClick={() => navigate('/orders/new')}>
          Nouvelle commande
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtrer par:</span>
          <div className="flex space-x-2 flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Toutes
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Actives
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Terminées
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('cancelled')}
            >
              Annulées
            </Button>
          </div>
        </div>
      </Card>

      {/* Liste des commandes */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n'avez pas encore de commandes.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/orders/new')}>
              Passer une commande
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = getStatusBadge(order.status);
            return (
              <Card key={order._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Commande #{order.orderNumber}
                      </h3>
                      <Badge className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {order.title || `Commande du ${new Date(order.createdAt).toLocaleDateString()}`}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {order.designs?.length || 0} article(s)
                      </span>
                      <span>
                        Total: {order.price?.total?.toFixed(2)} {order.price?.currency || 'EUR'}
                      </span>
                      <span>
                        Créée le: {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {order.deadline && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Date d'échéance:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(order.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate(`/user/orders/${order._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};