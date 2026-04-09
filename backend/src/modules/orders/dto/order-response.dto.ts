import { IOrder, IOrderItem, IPayment, OrderStatus, PaymentStatus } from '../order.model';

export class OrderResponseDTO {
  id: string;
  orderNumber: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    design?: {
      id: string;
      title: string;
    };
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    notes?: string;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payments: IPayment[];
  paymentStatus: PaymentStatus;
  paymentDue?: Date;
  notes?: string;
  terms?: string;
  createdBy: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(order: any) {
    this.id = order._id?.toString() || order.id;
    this.orderNumber = order.orderNumber;
    
    if (order.client) {
      this.client = {
        id: order.client._id?.toString() || order.client.id,
        name: order.client.firstName && order.client.lastName 
          ? `${order.client.firstName} ${order.client.lastName}`
          : order.client.name || order.client.email,
        email: order.client.email
      };
    }
    
    this.items = (order.items || []).map((item: any) => ({
      design: item.design ? {
        id: item.design._id?.toString() || item.design.id,
        title: item.design.title
      } : undefined,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      notes: item.notes
    }));
    
    this.subtotal = order.subtotal || order.price?.subtotal || 0;
    this.tax = order.tax || order.price?.tax || 0;
    this.discount = order.discount || order.price?.discount?.value || 0;
    this.total = order.total || order.price?.total || 0;
    this.status = order.status;
    this.payments = order.payment?.transactions || [];
    this.paymentStatus = order.payment?.status || PaymentStatus.PENDING;
    this.paymentDue = order.payment?.dueDate;
    this.notes = order.notes;
    this.terms = order.terms;
    
    if (order.createdBy) {
      this.createdBy = {
        id: order.createdBy._id?.toString() || order.createdBy.id,
        name: order.createdBy.firstName && order.createdBy.lastName
          ? `${order.createdBy.firstName} ${order.createdBy.lastName}`
          : order.createdBy.name || order.createdBy.email
      };
    }
    
    if (order.assignedTo) {
      this.assignedTo = {
        id: order.assignedTo._id?.toString() || order.assignedTo.id,
        name: order.assignedTo.firstName && order.assignedTo.lastName
          ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}`
          : order.assignedTo.name || order.assignedTo.email
      };
    }
    
    this.completedAt = order.completedAt;
    this.cancelledAt = order.cancelledAt;
    this.cancelledReason = order.cancelledReason;
    this.metadata = order.metadata;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }
}