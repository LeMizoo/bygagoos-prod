// frontend/src/pages/user/UserOrderTrackingPage.tsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  MessageCircle,
  Download,
  Package,
  Truck,
  XCircle
} from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatPrice } from '../../utils/formatters';

// Configuration des statuts
const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  PENDING: { color: 'warning', label: 'En attente', icon: Clock },
  IN_PROGRESS: { color: 'info', label: 'En cours', icon: Package },
  REVIEW: { color: 'primary', label: 'À valider', icon: FileText },
  MODIFICATION: { color: 'warning', label: 'Modification', icon: AlertCircle },
  VALIDATED: { color: 'success', label: 'Validé', icon: CheckCircle },
  PRODUCTION: { color: 'info', label: 'Production', icon: Package },
  SHIPPED: { color: 'primary', label: 'Expédié', icon: Truck },
  DELIVERED: { color: 'success', label: 'Livré', icon: CheckCircle },
  CANCELLED: { color: 'danger', label: 'Annulé', icon: XCircle }
};

// Composant Timeline simple
const TimelineItem: React.FC<{
  item: any;
  isLast: boolean;
}> = ({ item, isLast }) => {
  const Icon = item.icon || Clock;
  
  return (
    <li>
      <div className="relative pb-8">
        {!isLast && (
          <span
            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
        )}
        <div className="relative flex space-x-3">
          <div>
            <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
              <Icon className="h-5 w-5 text-indigo-600" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
            <div>
              <p className="text-sm text-gray-900 font-medium">{item.title}</p>
              {item.description && (
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              )}
            </div>
            <div className="whitespace-nowrap text-right text-sm text-gray-500">
              {item.date && (
                <time dateTime={item.date.toISOString()}>
                  {format(item.date, 'dd MMM yyyy HH:mm', { locale: fr })}
                </time>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export const UserOrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, fetchOrderById, isLoading } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  if (isLoading) {
    return <LoadingSpinner text="Chargement de la commande..." />;
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
          Commande non trouvée
        </h2>
        <p className="text-gray-500 mb-6">
          La commande que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <Button onClick={() => navigate('/user/orders')}>
          Mes commandes
        </Button>
      </div>
    );
  }

  const StatusIcon = statusConfig[currentOrder.status]?.icon || Clock;
  const history = currentOrder.history || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/user/orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Mes commandes
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open(`/api/orders/${id}/invoice`)}
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger facture
        </Button>
      </div>

      {/* Statut principal */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Commande #{currentOrder.orderNumber}
            </h1>
            <p className="text-gray-500 mt-1">{currentOrder.title}</p>
          </div>
          
          <div className="text-left md:text-right">
            <Badge 
              variant={statusConfig[currentOrder.status]?.color as any}
              className="inline-flex items-center space-x-2 px-4 py-2"
            >
              <StatusIcon className="h-5 w-5" />
              <span>{statusConfig[currentOrder.status]?.label || currentOrder.status}</span>
            </Badge>
            <p className="text-sm text-gray-500 mt-2">
              Créée le {format(new Date(currentOrder.createdAt), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline de progression */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-6">Suivi de commande</h2>
        {history.length > 0 ? (
          <ul className="space-y-4">
            {history.map((item: any, index: number) => (
              <TimelineItem
                key={index}
                item={{
                  date: new Date(item.createdAt),
                  title: statusConfig[item.status]?.label || item.status,
                  description: item.comment,
                  icon: statusConfig[item.status]?.icon || Clock
                }}
                isLast={index === history.length - 1}
              />
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-4">Aucun historique disponible</p>
        )}
      </Card>

      {/* Designs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Vos designs</h2>
        
        <div className="space-y-4">
          {currentOrder.designs && currentOrder.designs.length > 0 ? (
            currentOrder.designs.map((item: any, index: number) => (
              <div key={index} className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4 p-4 bg-gray-50 rounded-lg">
                {item.design?.thumbnail && (
                  <img 
                    src={item.design.thumbnail} 
                    alt={item.design.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.design?.title || 'Design'}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Quantité: {item.quantity} - Prix: {formatPrice(item.price || 0)}
                  </p>
                  
                  {item.modifications && (
                    <div className="bg-white p-3 rounded text-sm">
                      <p className="text-gray-500 mb-1">Vos modifications:</p>
                      <p>{item.modifications}</p>
                    </div>
                  )}
                  
                  {item.previewUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.open(item.previewUrl)}
                    >
                      Voir la preview
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Aucun design associé à cette commande</p>
          )}
        </div>
      </Card>

      {/* Récapitulatif prix */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Sous-total</span>
            <span>{formatPrice(currentOrder.price?.subtotal || 0)}</span>
          </div>
          
          {currentOrder.price?.discount && (
            <div className="flex justify-between text-green-600">
              <span>Réduction</span>
              <span>-{formatPrice((currentOrder.price.subtotal || 0) - 
                ((currentOrder.price.total || 0) - (currentOrder.price.tax || 0)))}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-500">TVA ({(currentOrder.price?.taxRate || 20)}%)</span>
            <span>{formatPrice(currentOrder.price?.tax || 0)}</span>
          </div>
          
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total TTC</span>
            <span className="text-indigo-600">{formatPrice(currentOrder.price?.total || 0)}</span>
          </div>
        </div>
      </Card>

      {/* Boutons d'action si besoin */}
      {currentOrder.status === 'REVIEW' && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-4">Action requise</h2>
          <p className="mb-4">
            Votre commande est prête à être validée. Vous pouvez :
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button variant="default" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider la commande
            </Button>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Demander une modification
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};