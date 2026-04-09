// frontend/src/pages/admin/EditOrderPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { CreateOrder } from '../../components/orders/CreateOrder';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const EditOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, fetchOrderById, isLoading, updateOrder } = useOrderStore();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  useEffect(() => {
    if (currentOrder) {
      setFormData({
        title: currentOrder.title || "",
        description: currentOrder.description || "",
        priority: currentOrder.priority || "MEDIUM",
        deadline: currentOrder.deadline ? new Date(currentOrder.deadline).toISOString().split('T')[0] : "",
      });
    }
  }, [currentOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id && formData) {
      await updateOrder(id, formData);
      navigate(`/admin/orders/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-dim-grey">Chargement...</div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-ink-black mb-4">
          Commande non trouvée
        </h2>
        <Button onClick={() => navigate('/admin/orders')}>
          Retour aux commandes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/admin/orders/${id}`)}
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour aux détails
        </Button>
        <h1 className="text-2xl font-bold text-ink-black">
          Modifier commande #{currentOrder.orderNumber}
        </h1>
      </div>

      <Card className="p-6">
        <CreateOrder isEditing={true} initialData={currentOrder} />
      </Card>
    </div>
  );
};