// frontend/src/types/order.ts
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "READY_FOR_PICKUP"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "ON_HOLD";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "REFUNDED"
  | "FAILED"
  | "CANCELLED";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "MOBILE_MONEY"
  | "BANK_TRANSFER"
  | "PAYPAL"
  | "OTHER";

export type ShippingMethod =
  | "PICKUP"
  | "STANDARD"
  | "EXPRESS"
  | "INTERNATIONAL";

export interface OrderItem {
  designId: string;
  designTitle: string;
  designImage?: string;
  quantity: number;
  unitPrice: number;
  color: string;
  size?: string;
  printType?: "screen_print" | "digital_print" | "embroidery" | "vinyl";
  printArea?: string;
  notes?: string;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  shipping: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shippingMethod?: ShippingMethod;
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress?: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  internalNotes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  paidAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateOrderDto {
  clientId: string;
  items: Array<{
    designId: string;
    quantity: number;
    color: string;
    size?: string;
    printType?: "screen_print" | "digital_print" | "embroidery" | "vinyl";
    notes?: string;
  }>;
  shippingMethod?: ShippingMethod;
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress?: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: PaymentMethod;
  notes?: string;
  internalNotes?: string;
  taxRate?: number;
  discount?: number;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shippingMethod?: ShippingMethod;
  assignedTo?: string;
  notes?: string;
  internalNotes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  paidAt?: string;
  trackingNumber?: string;
  taxRate?: number;
  discount?: number;
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
}

// Interface pour la réponse de l'API
export interface ApiOrder {
  _id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  items: any[];
  subtotal: number;
  tax: number;
  taxRate: number;
  shipping: number;
  discount?: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingAddress?: any;
  billingAddress?: any;
  notes?: string;
  internalNotes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  paidAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Fonction utilitaire pour convertir ApiOrder en Order
export const apiToOrder = (apiData: ApiOrder): Order => ({
  _id: apiData._id,
  orderNumber:
    apiData.orderNumber || `CMD-${apiData._id.slice(-6).toUpperCase()}`,
  clientId: apiData.clientId,
  clientName: apiData.clientName || "Client inconnu",
  clientEmail: apiData.clientEmail || "",
  clientPhone: apiData.clientPhone,
  items:
    apiData.items?.map((item: any) => ({
      designId: item.designId,
      designTitle: item.designTitle || "Design sans nom",
      designImage: item.designImage,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      color: item.color || "Noir",
      size: item.size,
      printType: item.printType,
      printArea: item.printArea,
      notes: item.notes,
      total: (item.quantity || 1) * (item.unitPrice || 0),
    })) || [],
  subtotal: apiData.subtotal || 0,
  tax: apiData.tax || 0,
  taxRate: apiData.taxRate || 0,
  shipping: apiData.shipping || 0,
  discount: apiData.discount,
  total: apiData.total || 0,
  status: apiData.status as OrderStatus,
  paymentStatus: apiData.paymentStatus as PaymentStatus,
  paymentMethod: apiData.paymentMethod as PaymentMethod,
  shippingMethod: apiData.shippingMethod as ShippingMethod,
  shippingAddress: apiData.shippingAddress,
  billingAddress: apiData.billingAddress,
  notes: apiData.notes,
  internalNotes: apiData.internalNotes,
  estimatedDelivery: apiData.estimatedDelivery,
  deliveredAt: apiData.deliveredAt,
  paidAt: apiData.paidAt,
  assignedTo: apiData.assignedTo,
  assignedToName: apiData.assignedToName,
  trackingNumber: apiData.trackingNumber,
  createdAt: apiData.createdAt,
  updatedAt: apiData.updatedAt,
  createdBy: apiData.createdBy,
});

// Interface pour les statistiques commandes
export interface OrderStats {
  total: number;
  totalRevenue: number;
  averageOrderValue: number;
  byStatus: Record<OrderStatus, number>;
  byMonth: Array<{ month: string; count: number; revenue: number }>;
  topClients: Array<{
    clientId: string;
    clientName: string;
    orderCount: number;
    totalSpent: number;
  }>;
  topDesigns: Array<{
    designId: string;
    designTitle: string;
    quantitySold: number;
    revenue: number;
  }>;
}

// Interface pour les filtres commandes
export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  assignedTo?: string;
  shippingMethod?: ShippingMethod;
}

// Interface pour le suivi de commande
export interface OrderTracking {
  status: OrderStatus;
  date: string;
  location?: string;
  notes?: string;
  updatedBy?: string;
}
