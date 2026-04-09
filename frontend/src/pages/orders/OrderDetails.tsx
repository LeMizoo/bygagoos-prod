// frontend/src/pages/orders/OrderDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  Edit,
  Download,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Paperclip,
  User,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { Timeline } from '../../components/ui/Timeline';
import { formatPrice } from '../../utils/formatters';

const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
  PENDING: { color: 'warning', label: 'En attente', icon: Clock },
  IN_PROGRESS: { color: 'info', label: 'En cours', icon: AlertCircle },
  REVIEW: { color: 'primary', label: 'En révision', icon: FileText },
  MODIFICATION: { color: 'warning', label: 'Modification', icon: Edit },
  VALIDATED: { color: 'success', label: 'Validé', icon: CheckCircle },
  PRODUCTION: { color: 'info', label: 'Production', icon: AlertCircle },
  SHIPPED: { color: 'primary', label: 'Expédié', icon: Clock },
  DELIVERED: { color: 'success', label: 'Livré', icon: CheckCircle },
  CANCELLED: { color: 'danger', label: 'Annulé', icon: XCircle }
};

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [message, setMessage] = useState('');
  
  const { currentOrder, fetchOrderById, updateOrderStatus, addMessage, isLoading } = useOrderStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id]);

  if (!currentOrder) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-dim-grey">Chargement...</div>
      </div>
    );
  }

  const StatusIcon = statusConfig[currentOrder.status]?.icon || Clock;

  const handleStatusChange = async (newStatus: string) => {
    if (id) {
      await updateOrderStatus(id, newStatus);
    }
  };

  const handleSendMessage = async () => {
    if (id && message.trim()) {
      await addMessage(id, { content: message });
      setMessage('');
    }
  };

  const tabs = [
    {
      id: 'details',
      label: 'Détails',
      content: (
        <div className="space-y-6">
          {/* Informations générales */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informations commande</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-dim-grey mb-1">N° Commande</p>
                <p className="font-semibold text-dark-teal">#{currentOrder.orderNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-dim-grey mb-1">Statut</p>
                <Badge variant={statusConfig[currentOrder.status].color as 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'} className="flex items-center space-x-1 w-fit">
                  <StatusIcon size={16} />
                  <span>{statusConfig[currentOrder.status].label}</span>
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-dim-grey mb-1">Priorité</p>
                <Badge variant={
                  currentOrder.priority === 'URGENT' ? 'danger' :
                  currentOrder.priority === 'HIGH' ? 'danger' :
                  currentOrder.priority === 'MEDIUM' ? 'warning' : 'success'
                }>
                  {currentOrder.priority}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-dim-grey mb-1">Date création</p>
                <p>{format(new Date(currentOrder.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
              </div>
              
              <div>
                <p className="text-sm text-dim-grey mb-1">Date souhaitée</p>
                <p>{format(new Date(currentOrder.requestedDate || new Date()), 'dd MMMM yyyy', { locale: fr })}</p>
              </div>
              
              <div>
                <p className="text-sm text-dim-grey mb-1">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {currentOrder.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {!currentOrder.tags?.length && <span className="text-dim-grey">-</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Client */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Client</h3>
            
            <div className="flex items-start space-x-4">
              <Avatar 
                name={`${currentOrder.client.firstName} ${currentOrder.client.lastName}`}
                size="lg"
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {currentOrder.client.firstName} {currentOrder.client.lastName}
                </p>
                {currentOrder.client.company && (
                  <p className="text-dim-grey">{currentOrder.client.company}</p>
                )}
                <p className="text-dim-grey">{currentOrder.client.email}</p>
                {currentOrder.client.phone && (
                  <p className="text-dim-grey">{currentOrder.client.phone}</p>
                )}
              </div>
              <Button variant="outline" size="sm">
                Voir le profil
              </Button>
            </div>
          </Card>

          {/* Équipe assignée */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Équipe assignée</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-dim-grey mb-2">Designer</p>
                {currentOrder.assignedTo?.designer ? (
                  <div className="flex items-center space-x-2">
                    {typeof currentOrder.assignedTo.designer === 'string' ? (
                      <span>{currentOrder.assignedTo.designer}</span>
                    ) : (currentOrder.assignedTo.designer && typeof currentOrder.assignedTo.designer === 'object' ? (
                      <>
                        <Avatar 
                          name={`${(currentOrder.assignedTo.designer as any).firstName} ${(currentOrder.assignedTo.designer as any).lastName}`}
                          size="sm"
                        />
                        <span>
                          {(currentOrder.assignedTo.designer as any).firstName} {(currentOrder.assignedTo.designer as any).lastName}
                        </span>
                      </>
                    ) : null)}
                  </div>
                ) : (
                  <span className="text-dim-grey">Non assigné</span>
                )}
              </div>
              
              <div>
                <p className="text-sm text-dim-grey mb-2">Validateur</p>
                {currentOrder.assignedTo?.validator ? (
                  <div className="flex items-center space-x-2">
                    {typeof currentOrder.assignedTo.validator === 'string' ? (
                      <span>{currentOrder.assignedTo.validator}</span>
                    ) : (currentOrder.assignedTo.validator && typeof currentOrder.assignedTo.validator === 'object' ? (
                      <>
                        <Avatar 
                          name={`${(currentOrder.assignedTo.validator as any).firstName} ${(currentOrder.assignedTo.validator as any).lastName}`}
                          size="sm"
                        />
                        <span>
                          {(currentOrder.assignedTo.validator as any).firstName} {(currentOrder.assignedTo.validator as any).lastName}
                        </span>
                      </>
                    ) : null)}
                  </div>
                ) : (
                  <span className="text-dim-grey">Non assigné</span>
                )}
              </div>
              
              <div>
                <p className="text-sm text-dim-grey mb-2">Producteur</p>
                {currentOrder.assignedTo?.producer ? (
                  <div className="flex items-center space-x-2">
                    {typeof currentOrder.assignedTo.producer === 'string' ? (
                      <span>{currentOrder.assignedTo.producer}</span>
                    ) : (currentOrder.assignedTo.producer && typeof currentOrder.assignedTo.producer === 'object' ? (
                      <>
                        <Avatar 
                          name={`${(currentOrder.assignedTo.producer as any).firstName} ${(currentOrder.assignedTo.producer as any).lastName}`}
                          size="sm"
                        />
                        <span>
                          {(currentOrder.assignedTo.producer as any).firstName} {(currentOrder.assignedTo.producer as any).lastName}
                        </span>
                      </>
                    ) : null)}
                  </div>
                ) : (
                  <span className="text-dim-grey">Non assigné</span>
                )}
              </div>
            </div>
          </Card>

          {/* Designs */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Designs commandés</h3>
            
            <div className="space-y-4">
              {currentOrder.designs.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-antique-white rounded-lg">
                  {item.design.thumbnail && (
                    <img 
                      src={item.design.thumbnail} 
                      alt={item.design.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold">{item.design.title}</h4>
                        <p className="text-sm text-dim-grey">
                          Type: {item.design.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price)}</p>
                        <p className="text-sm text-dim-grey">x{item.quantity}</p>
                      </div>
                    </div>
                    
                    {item.modifications && (
                      <div className="mt-2 p-2 bg-white rounded text-sm">
                        <p className="text-dim-grey mb-1">Modifications:</p>
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
              ))}
            </div>
          </Card>

          {/* Finances */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informations financières</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dim-grey">Sous-total</span>
                <span>{formatPrice(currentOrder.price.subtotal)}</span>
              </div>
              
              {currentOrder.price.discount && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Réduction ({currentOrder.price.discount.type === 'percentage' 
                      ? `${currentOrder.price.discount.value}%` 
                      : formatPrice(currentOrder.price.discount.value)})
                  </span>
                  <span>
                    -{formatPrice(currentOrder.price.subtotal - 
                      (currentOrder.price.total - currentOrder.price.tax))}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-dim-grey">TVA ({currentOrder.price.taxRate}%)</span>
                <span>{formatPrice(currentOrder.price.tax)}</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total TTC</span>
                <span className="text-dark-teal">{formatPrice(currentOrder.price.total)}</span>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-dim-grey mb-2">Statut paiement</p>
                <Badge variant={
                  currentOrder.payment?.status === 'PAID' ? 'success' :
                  currentOrder.payment?.status === 'PARTIAL' ? 'warning' : 'danger'
                }>
                  {currentOrder.payment?.status || 'N/A'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 'timeline',
      label: 'Historique',
      content: (
        <Card className="p-6">
          <Timeline
            items={(currentOrder.history || []).map((item: any, index: number) => ({
              id: `${index}`,
              label: `Statut changé : ${statusConfig[item.status]?.label || item.status}`,
              description: item.comment,
              user: item.changedBy,
              icon: statusConfig[item.status]?.icon
            }))}
          />
        </Card>
      )
    },
    {
      id: 'messages',
      label: 'Messages',
      content: (
        <Card className="p-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {currentOrder.messages?.map((msg: any) => (
              <div 
                key={msg._id}
                className={`flex ${msg.user._id === user?._id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${msg.user._id === user?._id ? 'order-1' : ''}`}>
                  <div className="flex items-center mb-1 space-x-2">
                    {msg.user._id !== user?._id && (
                      <Avatar 
                        name={`${msg.user.firstName} ${msg.user.lastName}`}
                        size="sm"
                      />
                    )}
                    <span className="text-sm font-medium">
                      {msg.user.firstName} {msg.user.lastName}
                    </span>
                    <span className="text-xs text-dim-grey">
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <div className={`rounded-lg p-3 ${
                    msg.user._id === user?._id 
                      ? 'bg-dark-teal text-white' 
                      : 'bg-antique-white'
                  }`}>
                    <p>{msg.content}</p>
                    {msg.attachments?.map((att: any, idx: number) => (
                      <a 
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 mt-2 text-sm underline"
                      >
                        <Paperclip size={14} />
                        <span>{att.filename}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send size={18} />
            </Button>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/orders')}
          className="mb-4"
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour aux commandes
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-ink-black">
              Commande #{currentOrder.orderNumber}
            </h1>
            <p className="text-dim-grey mt-1">{currentOrder.title}</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(`/orders/${id}/edit`)}>
              <Edit size={18} className="mr-2" />
              Modifier
            </Button>
            
            <Button variant="outline" onClick={() => window.open(`/api/orders/${id}/invoice`)}>
              <Download size={18} className="mr-2" />
              Facture
            </Button>
            
            {/* Actions rapides de statut */}
            <Select
              value={currentOrder.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(e.target.value)}
              className="w-48"
            >
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};