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
  name: string;          // nom du client
  time: string;          // heure
  table: number;         // numéro de table
  status: string;        // statut
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