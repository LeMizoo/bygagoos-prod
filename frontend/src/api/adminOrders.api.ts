// frontend/src/api/adminOrders.api.ts
import api from "./client";
import { dev } from "../utils/devLogger";

export interface Order {
  _id: string;
  orderNumber?: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  client?: {
    firstName?: string;
    lastName?: string;
    company?: string;
    email?: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  designs?: Array<Record<string, unknown>>;
  items?: Array<Record<string, unknown>>;
  totalPrice?: number;
  price?: {
    total?: number;
  };
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderResponse {
  success?: boolean;
  data?: Order | Order[] | { orders?: Order[]; order?: Order };
  message?: string;
}

const extractResponseData = <T,>(responseData: unknown): T => {
  if (responseData && typeof responseData === "object" && "data" in responseData) {
    return ((responseData as { data?: T }).data ?? responseData) as T;
  }

  return responseData as T;
};

const normalizeOrder = (data: Record<string, unknown>): Order => {
  const createdBy = data.createdBy as Order["createdBy"] | undefined;
  const user = (data.user as Order["user"] | undefined) ?? createdBy;
  const client = data.client as Order["client"] | undefined;
  const price = (data.price as Order["price"] | undefined) ?? {};
  const totalPrice =
    typeof data.totalPrice === "number"
      ? data.totalPrice
      : typeof data.total === "number"
        ? data.total
        : typeof price.total === "number"
          ? price.total
          : 0;

  return {
    _id: typeof data._id === "string" ? data._id : typeof data.id === "string" ? data.id : "",
    orderNumber: typeof data.orderNumber === "string" ? data.orderNumber : undefined,
    clientId: typeof data.clientId === "string" ? data.clientId : undefined,
    clientName: typeof data.clientName === "string" ? data.clientName : undefined,
    clientEmail: typeof data.clientEmail === "string" ? data.clientEmail : undefined,
    client,
    user,
    createdBy,
    designs: Array.isArray(data.designs) ? data.designs : undefined,
    items: Array.isArray(data.items) ? data.items : undefined,
    totalPrice,
    price,
    status: typeof data.status === "string" ? data.status : "PENDING",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : undefined,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
};

const normalizeOrdersList = (responseData: unknown): Order[] => {
  const payload = extractResponseData<OrderResponse | Record<string, unknown>>(responseData);

  if (Array.isArray(payload)) {
    return payload.map((order) => normalizeOrder(order as Record<string, unknown>));
  }

  const maybeOrders = (payload as { orders?: unknown }).orders;
  if (Array.isArray(maybeOrders)) {
    return maybeOrders.map((order) => normalizeOrder(order as Record<string, unknown>));
  }

  const maybeOrder = (payload as { order?: unknown }).order;
  if (maybeOrder && typeof maybeOrder === "object") {
    return [normalizeOrder(maybeOrder as Record<string, unknown>)];
  }

  if (payload && typeof payload === "object" && "_id" in payload) {
    return [normalizeOrder(payload as Record<string, unknown>)];
  }

  return [];
};

const normalizeSingleOrder = (responseData: unknown): Order => {
  const payload = extractResponseData<OrderResponse | Record<string, unknown>>(responseData);

  if (payload && typeof payload === "object" && "_id" in payload) {
    return normalizeOrder(payload as Record<string, unknown>);
  }

  const maybeOrder = (payload as { order?: unknown }).order;
  if (maybeOrder && typeof maybeOrder === "object") {
    return normalizeOrder(maybeOrder as Record<string, unknown>);
  }

  return normalizeOrder({ _id: "", status: "PENDING" });
};

export const adminOrdersApi = {
  getAll: async (): Promise<Order[]> => {
    dev.log("🌐 Orders API: GET /api/orders");
    const response = await api.get("/orders", {
      params: { page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" },
    });
    return normalizeOrdersList(response.data);
  },

  getById: async (id: string): Promise<Order> => {
    dev.log(`🌐 Orders API: GET /api/orders/${id}`);
    const response = await api.get(`/orders/${id}`);
    return normalizeSingleOrder(response.data);
  },

  create: async (data: Partial<Order>): Promise<Order> => {
    dev.log("🌐 Orders API: POST /api/orders");
    const response = await api.post("/orders", data);
    return normalizeSingleOrder(response.data);
  },

  update: async (id: string, data: Partial<Order>): Promise<Order> => {
    dev.log(`🌐 Orders API: PATCH /api/orders/${id}`);
    const response = await api.patch(`/orders/${id}`, data);
    return normalizeSingleOrder(response.data);
  },

  delete: async (id: string): Promise<void> => {
    dev.log(`🌐 Orders API: DELETE /api/orders/${id}`);
    await api.delete(`/orders/${id}`);
  },
};

export default adminOrdersApi;
