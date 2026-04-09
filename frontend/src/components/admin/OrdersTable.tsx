// frontend/src/components/orders/OrdersTable.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Download,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useOrderStore, Order } from '../../stores/orderStore';
import { DataTable } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatPrice } from '../../utils/formatters';
import dev from '../../utils/devLogger';

interface OrdersTableProps {
  onSelect?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  onView?: (order: Order) => void;
}

const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
  PENDING: { 
    color: 'warning', 
    label: 'En attente',
    icon: Clock
  },
  IN_PROGRESS: { 
    color: 'info', 
    label: 'En cours',
    icon: AlertCircle
  },
  REVIEW: { 
    color: 'info', 
    label: 'En révision',
    icon: Eye
  },
  MODIFICATION: { 
    color: 'warning', 
    label: 'Modification',
    icon: Edit
  },
  VALIDATED: { 
    color: 'success', 
    label: 'Validé',
    icon: CheckCircle
  },
  PRODUCTION: { 
    color: 'info', 
    label: 'Production',
    icon: AlertCircle
  },
  SHIPPED: { 
    color: 'info', 
    label: 'Expédié',
    icon: Clock
  },
  DELIVERED: { 
    color: 'success', 
    label: 'Livré',
    icon: CheckCircle
  },
  CANCELLED: { 
    color: 'danger', 
    label: 'Annulé',
    icon: XCircle
  }
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  LOW: { color: 'success', label: 'Basse' },
  MEDIUM: { color: 'warning', label: 'Moyenne' },
  HIGH: { color: 'danger', label: 'Haute' },
  URGENT: { color: 'danger', label: 'Urgent' }
};

export const OrdersTable: React.FC<OrdersTableProps> = ({
  onSelect,
  onEdit,
  onDelete,
  onView
}) => {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { 
    orders, 
    pagination, 
    filters, 
    setFilters, 
    fetchOrders,
    deleteOrder,
    isLoading 
  } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // À implémenter
    dev.log('Change status', orderId, newStatus);
  };

  const handleDelete = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete._id);
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'N° Commande',
      render: (order: Order) => (
        <div className="flex items-center space-x-3">
          <span className="font-medium text-dark-teal">
            #{order.orderNumber}
          </span>
          {order.priority === 'URGENT' && (
            <Badge variant="danger" size="sm">Urgent</Badge>
          )}
        </div>
      )
    },
    {
      key: 'client',
      label: 'Client',
      render: (order: Order) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            name={`${order.client.firstName} ${order.client.lastName}`}
            size="sm"
          />
          <div>
            <div className="font-medium">
              {order.client.firstName} {order.client.lastName}
            </div>
            {order.client.company && (
              <div className="text-sm text-dim-grey">
                {order.client.company}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Titre',
      render: (order: Order) => (
        <div>
          <div className="font-medium">{order.title}</div>
          <div className="text-sm text-dim-grey">
            {order.designs.length} design{order.designs.length > 1 ? 's' : ''}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (order: any) => {
        const config = statusConfig[order.status];
        const Icon = config?.icon || Clock;
        const variant = (config?.color as 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary') || 'default';
        return (
          <Badge variant={variant} className="flex items-center space-x-1">
            <Icon size={14} />
            <span>{config?.label}</span>
          </Badge>
        );
      }
    },
    {
      key: 'priority',
      label: 'Priorité',
      render: (order: any) => {
        const config = priorityConfig[order.priority];
        const variant = (config?.color as 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary') || 'default';
        return (
          <Badge variant={variant} size="sm">
            {config?.label}
          </Badge>
        );
      }
    },
    {
      key: 'assignedTo',
      label: 'Assigné à',
      render: (order: Order) => {
        const designer = order.assignedTo?.designer;
        if (!designer) return <span className="text-dim-grey">Non assigné</span>;

        if (typeof designer === 'string') {
          return <span className="text-sm">{designer}</span>;
        }

        const designerObj = designer as any;
        return (
          <div className="flex items-center space-x-2">
            <Avatar 
              name={`${designerObj.firstName} ${designerObj.lastName}`}
              size="sm"
            />
            <span className="text-sm">
              {designerObj.firstName} {designerObj.lastName}
            </span>
          </div>
        );
      }
    },
    {
      key: 'price',
      label: 'Montant',
      render: (order: Order) => (
        <div className="font-medium">
          {formatPrice(order.price.total, order.price.currency)}
        </div>
      )
    },
    {
      key: 'requestedDate',
      label: 'Date souhaitée',
      render: (order: Order) => (
        <div>
          {order.requestedDate && (
            <>
              <div>{format(new Date(order.requestedDate), 'dd/MM/yyyy')}</div>
              <div className="text-xs text-dim-grey">
                {format(new Date(order.requestedDate), 'HH:mm')}
              </div>
            </>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order: Order) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView ? onView(order) : navigate(`/orders/${order._id}`)}
            title="Voir détails"
          >
            <Eye size={18} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit ? onEdit(order) : navigate(`/orders/${order._id}/edit`)}
            title="Modifier"
          >
            <Edit size={18} />
          </Button>
          
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm">
                <MoreVertical size={18} />
              </Button>
            }
            items={[
              {
                label: 'Changer statut',
                icon: <Clock size={16} />,
                onClick: () => handleStatusChange(order._id, 'IN_PROGRESS')
              },
              {
                label: 'Messages',
                icon: <MessageCircle size={16} />,
                onClick: () => navigate(`/orders/${order._id}/messages`)
              },
              {
                label: 'Facture',
                icon: <Download size={16} />,
                onClick: () => window.open(`/api/orders/${order._id}/invoice`)
              },
              {
                label: 'Supprimer',
                icon: <Trash2 size={16} />,
                onClick: () => {
                  setOrderToDelete(order);
                  setShowDeleteConfirm(true);
                },
                className: 'text-red-600 hover:text-red-700'
              }
            ]}
          />
        </div>
      )
    }
  ];

  return (
    <>
      <DataTable
        data={orders}
        columns={columns}
        keyExtractor={(order) => order._id}
        isLoading={isLoading}
        pagination={{
          page: pagination?.page || 1,
          limit: pagination?.limit || 20,
          total: pagination?.total || 0
        }}
        onPageChange={(page: number) => setFilters({ page })}
        onSort={(key, order) => setFilters({ sortBy: key, sortOrder: order })}
      />
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la commande"
        message={`Êtes-vous sûr de vouloir supprimer la commande #${orderToDelete?.orderNumber} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </>
  );
};