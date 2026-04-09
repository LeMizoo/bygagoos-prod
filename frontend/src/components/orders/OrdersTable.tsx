import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, MoreVertical, Clock } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { formatPrice } from '../../utils/formatters';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrdersTableProps {
  onSelect?: (order: any) => void;
  onEdit?: (order: any) => void;
  onDelete?: (order: any) => void;
  onView?: (order: any) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  onSelect,
  onEdit,
  onDelete,
  onView
}) => {
  const { orders, isLoading } = useOrderStore();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium">N° Commande</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Client</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Montant</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center">Chargement...</td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-gray-500">Aucune commande</td>
            </tr>
          ) : (
            orders.map((order: any) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                <td className="px-4 py-3">{order.clientName}</td>
                <td className="px-4 py-3">
                  <Badge variant="default">{order.status}</Badge>
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {onView && (
                      <Button variant="ghost" size="sm" onClick={() => onView(order)}>
                        <Eye size={18} />
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(order)}>
                        <Edit size={18} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
