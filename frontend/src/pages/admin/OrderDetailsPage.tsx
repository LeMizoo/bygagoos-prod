// frontend/src/pages/admin/OrderDetailsPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../../stores/orderStore";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  MessageCircle, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  Send,
  Paperclip
} from "lucide-react";
import { API_URL } from "../../api";

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, fetchOrderById, updateOrderStatus, addMessage, isLoading } = useOrderStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"details" | "messages" | "history">("details");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;
    await addMessage(id, { content: newMessage });
    setNewMessage("");
    if (id) {
      fetchOrderById(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Commande non trouvée</h3>
        <p className="mt-1 text-sm text-gray-500">La commande que vous recherchez n'existe pas.</p>
        <div className="mt-6">
          <Button onClick={() => navigate("/admin/orders")}>Retour aux commandes</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
      IN_PROGRESS: { color: "bg-blue-100 text-blue-800", icon: <Package className="h-4 w-4" /> },
      REVIEW: { color: "bg-purple-100 text-purple-800", icon: <AlertCircle className="h-4 w-4" /> },
      MODIFICATION: { color: "bg-orange-100 text-orange-800", icon: <Edit className="h-4 w-4" /> },
      VALIDATED: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4" /> },
      PRODUCTION: { color: "bg-indigo-100 text-indigo-800", icon: <Package className="h-4 w-4" /> },
      SHIPPED: { color: "bg-cyan-100 text-cyan-800", icon: <Package className="h-4 w-4" /> },
      DELIVERED: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4" /> },
      CANCELLED: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4" /> },
      ARCHIVED: { color: "bg-gray-100 text-gray-800", icon: <Package className="h-4 w-4" /> }
    };
    return statusConfig[currentOrder.status] || statusConfig.PENDING;
  };

  const getPaymentStatusBadge = (status: string = "PENDING") => {
    const statusConfig: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PARTIAL: "bg-blue-100 text-blue-800",
      PAID: "bg-green-100 text-green-800",
      REFUNDED: "bg-purple-100 text-purple-800",
      CANCELLED: "bg-red-100 text-red-800"
    };
    return statusConfig[status] || statusConfig.PENDING;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (id) {
      await updateOrderStatus(id, newStatus);
      fetchOrderById(id);
    }
  };

  const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "DESIGNER";
  const canChangeStatus = user?.role === "ADMIN" || user?.role === "MANAGER";

  const statusBadge = getStatusBadge(currentOrder.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/admin/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Commande {currentOrder.orderNumber}
          </h1>
          <Badge className={statusBadge.color}>
            {statusBadge.icon}
            <span className="ml-1">{currentOrder.status}</span>
          </Badge>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <Button onClick={() => navigate(`/admin/orders/edit/${id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
          <Button variant="outline" onClick={() => window.open(`${API_URL}/orders/${id}/invoice`)}>
            <Download className="h-4 w-4 mr-2" />
            Facture
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`${
              activeTab === "details"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`${
              activeTab === "messages"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Messages
            {currentOrder.messages && currentOrder.messages.length > 0 && (
              <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {currentOrder.messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`${
              activeTab === "history"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Historique
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Articles commandés">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Design
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrder.designs?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.design?.title || `Design #${item.design}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.price?.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {(item.price * item.quantity).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                      Sous-total
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {currentOrder.price?.subtotal?.toFixed(2)} €
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                      TVA ({currentOrder.price?.taxRate}%)
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {currentOrder.price?.tax?.toFixed(2)} €
                    </td>
                  </tr>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="px-6 py-3 text-right text-base font-bold text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-3 text-base font-bold text-indigo-600">
                      {currentOrder.price?.total?.toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Card>

            {currentOrder.description && (
              <Card title="Description">
                <p className="text-gray-700">{currentOrder.description}</p>
              </Card>
            )}

            {canChangeStatus && (
              <Card title="Changer le statut">
                <div className="flex flex-wrap gap-2">
                  {[
                    "PENDING", "IN_PROGRESS", "REVIEW", "MODIFICATION", 
                    "VALIDATED", "PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"
                  ].map((status) => (
                    <Button
                      key={status}
                      variant={currentOrder.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate(status)}
                      disabled={currentOrder.status === status}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card title="Informations client">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">Client:</span>
                  <span className="ml-2 text-gray-900">
                    {currentOrder.client?.firstName} {currentOrder.client?.lastName}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(currentOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">Paiement:</span>
                  <Badge className={`ml-2 ${getPaymentStatusBadge(currentOrder.payment?.status)}`}>
                    {currentOrder.payment?.status || "PENDING"}
                  </Badge>
                </div>
                <div className="flex items-center text-sm">
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">Priorité:</span>
                  <span className="ml-2 text-gray-900">{currentOrder.priority}</span>
                </div>
              </div>
            </Card>

            {currentOrder.assignedTo && (
              <Card title="Assigné à">
                <div className="space-y-2">
                  {currentOrder.assignedTo.designer && (
                    <div className="text-sm">
                      <span className="font-medium">Designer:</span>
                      <span className="ml-2 text-gray-700">{currentOrder.assignedTo.designer}</span>
                    </div>
                  )}
                  {currentOrder.assignedTo.validator && (
                    <div className="text-sm">
                      <span className="font-medium">Validateur:</span>
                      <span className="ml-2 text-gray-700">{currentOrder.assignedTo.validator}</span>
                    </div>
                  )}
                  {currentOrder.assignedTo.producer && (
                    <div className="text-sm">
                      <span className="font-medium">Producteur:</span>
                      <span className="ml-2 text-gray-700">{currentOrder.assignedTo.producer}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {currentOrder.deadline && (
              <Card title="Date d'échéance">
                <div className="flex items-center text-sm">
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {new Date(currentOrder.deadline).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <Card title="Messages">
          <div className="space-y-4">
            {/* Liste des messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto p-4">
              {currentOrder.messages && currentOrder.messages.length > 0 ? (
                currentOrder.messages.map((message: any, index: number) => (
                  <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-900">{message.user?.firstName} {message.user?.lastName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <p className="mt-1 text-gray-700">{message.content}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex items-center text-xs text-indigo-600">
                        <Paperclip className="h-3 w-3 mr-1" />
                        {message.attachments.length} pièce(s) jointe(s)
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Aucun message pour cette commande</p>
              )}
            </div>

            {/* Formulaire de nouveau message */}
            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "history" && (
        <Card title="Historique des changements">
          <div className="flow-root">
            {currentOrder.history && currentOrder.history.length > 0 ? (
              <ul className="-mb-8">
                {currentOrder.history?.map((entry: any, index: number) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== (currentOrder.history?.length ?? 0) - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                            <Clock className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              Changement de statut :{' '}
                              <span className="font-medium text-gray-900">{entry.status}</span>
                            </p>
                            {entry.comment && (
                              <p className="mt-1 text-sm text-gray-700">{entry.comment}</p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={entry.createdAt}>
                              {new Date(entry.createdAt).toLocaleString()}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-8">Aucun historique disponible</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
