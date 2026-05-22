// ==================== TYPES EXISTANTS ====================
export interface RestaurantStats {
  totalTables: number;
  occupiedTables: number;
  todayReservations: number;
  occupancyRate: number;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  location: string;
  status: string;
}

export interface Reservation {
  id: string;
  name: string;
  time: string;
  table: number;
  status: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isFeatured: boolean;
  available: boolean;
}

export interface StockAlert {
  id: string;
  message: string;
}

// ==================== TYPES STOCK ====================
export interface StockItem {
  id: string;
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  alertLevel: 'CRITICAL' | 'LOW' | 'NORMAL';
  supplier?: string;
  lastRestockDate?: string;
  expiryDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: 'PURCHASE' | 'SALE' | 'WASTE' | 'ADJUSTMENT' | 'RETURN';
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateStockItemDto {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  supplier?: string;
  expiryDate?: string;
  notes?: string;
}

export interface StockStats {
  totalItems: number;
  criticalStock: number;
  lowStock: number;
  totalValue: number;
  mostConsumed: Array<{ name: string; consumed: number }>;
}