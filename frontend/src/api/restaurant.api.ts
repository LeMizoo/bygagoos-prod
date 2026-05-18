import axiosInstance from './axiosInstance';
import type {
  RestaurantStats,
  Table,
  Reservation,
  MenuItem,
  StockAlert,
} from '../types/restaurant';

const API_BASE = '/restaurant';

type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as RawRecord;
  }

  return {};
};

const asArray = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

const pickId = (value: RawRecord, fallback: string): string => {
  return String(value._id ?? value.id ?? fallback);
};

const parseTableNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) {
      const parsed = Number.parseInt(match[0], 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
};

const normalizeTable = (table: unknown, index: number): Table => {
  const record = asRecord(table);
  const tableNumber = record.number ?? record.tableNumber;

  return {
    id: pickId(record, `table-${index}`),
    number: parseTableNumber(tableNumber, index + 1),
    capacity: Number(record.capacity ?? 0),
    location: String(record.location ?? ''),
    status: String(record.status ?? 'AVAILABLE'),
  };
};

const normalizeReservation = (reservation: unknown, index: number): Reservation => {
  const record = asRecord(reservation);
  const tableValue = record.table;
  const tableRecord = asRecord(tableValue);
  const tableNumberSource = tableRecord.tableNumber ?? tableRecord.number ?? tableValue;

  return {
    id: pickId(record, `reservation-${index}`),
    name: String(record.guestName ?? record.name ?? 'Réservation'),
    time: String(record.reservationTime ?? record.time ?? ''),
    table: parseTableNumber(tableNumberSource, index + 1),
    status: String(record.status ?? 'PENDING'),
  };
};

const normalizeMenuItem = (menuItem: unknown, index: number): MenuItem => {
  const record = asRecord(menuItem);

  return {
    _id: pickId(record, `menu-${index}`),
    name: String(record.name ?? ''),
    description: String(record.description ?? ''),
    price: Number(record.price ?? record.basePrice ?? 0),
    category: String(record.category ?? ''),
    isFeatured: Boolean(record.isFeatured),
    available: Boolean(record.isAvailable ?? record.available ?? true),
  };
};

const describeStockAlert = (item: RawRecord, level: 'critical' | 'low' | 'expiringSoon'): string => {
  const name = String(item.name ?? 'Article');
  const quantity = item.quantity !== undefined ? String(item.quantity) : '';
  const unit = item.unit ? String(item.unit) : '';
  const quantityLabel = quantity
    ? `${quantity}${unit ? ` ${unit}` : ''}`
    : '';

  if (level === 'expiringSoon') {
    const expiryDate = item.expiryDate ? new Date(String(item.expiryDate)) : null;
    const formattedDate = expiryDate && !Number.isNaN(expiryDate.getTime())
      ? expiryDate.toLocaleDateString('fr-FR')
      : 'bientôt';

    return `${name} expire le ${formattedDate}`;
  }

  const severityLabel = level === 'critical' ? 'stock critique' : 'stock faible';
  return quantityLabel
    ? `${name} en ${severityLabel} (${quantityLabel} restants)`
    : `${name} en ${severityLabel}`;
};

const normalizeStockAlerts = (data: unknown): StockAlert[] => {
  if (Array.isArray(data)) {
    return data.map((item, index) => {
      const record = asRecord(item);
      return {
        id: pickId(record, `alert-${index}`),
        message: String(record.message ?? describeStockAlert(record, 'critical')),
      };
    });
  }

  const payload = asRecord(data);
  const sections: Array<{
    items: unknown;
    level: 'critical' | 'low' | 'expiringSoon';
  }> = [
    { items: payload.critical, level: 'critical' },
    { items: payload.low, level: 'low' },
    { items: payload.expiringSoon, level: 'expiringSoon' },
  ];

  const alerts: StockAlert[] = [];

  sections.forEach(({ items, level }) => {
    asArray(items).forEach((item, index) => {
      const record = asRecord(item);
      alerts.push({
        id: pickId(record, `${level}-${index}`),
        message: describeStockAlert(record, level),
      });
    });
  });

  return alerts;
};

export const restaurantApi = {
  getTables: async (): Promise<{ tables: Table[] }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/tables`);
    const payload = asRecord(data);
    const rawTables = Array.isArray(payload.tables) ? payload.tables : asArray(data);

    return {
      tables: rawTables.map(normalizeTable),
    };
  },

  updateTableStatus: async (tableId: string, status: string, occupiedBy?: string | null): Promise<Table> => {
    const { data } = await axiosInstance.patch(`${API_BASE}/tables/${tableId}/status`, {
      status,
      occupiedBy,
    });
    return normalizeTable(data, 0);
  },

  getReservations: async (page = 1, limit = 10): Promise<{ reservations: Reservation[]; total: number; page: number; pages: number }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/reservations`, {
      params: { page, limit },
    });
    const payload = asRecord(data);
    const rawReservations = Array.isArray(payload.reservations) ? payload.reservations : asArray(data);

    return {
      reservations: rawReservations.map(normalizeReservation),
      total: Number(payload.total ?? rawReservations.length),
      page: Number(payload.page ?? page),
      pages: Number(payload.pages ?? payload.totalPages ?? 1),
    };
  },

  getTodayReservations: async (): Promise<{ reservations: Reservation[] }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/reservations/today`);
    const payload = asRecord(data);
    const rawReservations = Array.isArray(payload.reservations) ? payload.reservations : asArray(data);

    return {
      reservations: rawReservations.map(normalizeReservation),
    };
  },

  createReservation: async (reservationData: any): Promise<Reservation> => {
    const { data } = await axiosInstance.post(`${API_BASE}/reservations`, reservationData);
    return normalizeReservation(data, 0);
  },

  getMenu: async (category?: string): Promise<{ menuItems: MenuItem[] }> => {
    const { data } = await axiosInstance.get(`${API_BASE}/menu`, {
      params: { category },
    });
    const payload = asRecord(data);
    const rawMenuItems = Array.isArray(payload.menuItems) ? payload.menuItems : asArray(data);

    return {
      menuItems: rawMenuItems.map(normalizeMenuItem),
    };
  },

  getFeaturedMenu: async (): Promise<MenuItem[]> => {
    const { data } = await axiosInstance.get(`${API_BASE}/menu/featured`);
    const payload = asRecord(data);
    const rawMenuItems = Array.isArray(payload.menuItems) ? payload.menuItems : asArray(data);

    return rawMenuItems.map(normalizeMenuItem);
  },

  getStockAlerts: async (): Promise<StockAlert[]> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stock/alerts`);
    return normalizeStockAlerts(data);
  },

  getRestaurantStats: async (): Promise<RestaurantStats> => {
    const { data } = await axiosInstance.get(`${API_BASE}/stats`);
    return data;
  },
};

export default restaurantApi;
