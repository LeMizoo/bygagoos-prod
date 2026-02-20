// frontend/src/types/settings.ts
export interface CompanyAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BusinessHours {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  open: string; // Format HH:mm
  close: string; // Format HH:mm
  closed: boolean;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface PaymentSettings {
  methods: Array<"CASH" | "CARD" | "MOBILE_MONEY" | "BANK_TRANSFER" | "PAYPAL">;
  defaultMethod: "CASH" | "CARD" | "MOBILE_MONEY" | "BANK_TRANSFER" | "PAYPAL";
  currency: string; // 'EUR', 'USD', 'MGA'
  taxEnabled: boolean;
  taxRate: number;
  vatNumber?: string;
}

export interface ShippingSettings {
  methods: Array<"PICKUP" | "STANDARD" | "EXPRESS" | "INTERNATIONAL">;
  pickupAddress: CompanyAddress;
  standardCost: number;
  expressCost: number;
  internationalCost: number;
  freeShippingThreshold?: number;
  estimatedDeliveryDays: {
    standard: number;
    express: number;
    international: number;
  };
}

export interface NotificationSettings {
  emailNotifications: boolean;
  adminEmail: string;
  newOrderEmail: boolean;
  orderStatusEmail: boolean;
  lowStockEmail: boolean;
  smsNotifications: boolean;
  adminPhone?: string;
}

export interface DesignSettings {
  defaultPrintType: "screen_print" | "digital_print" | "embroidery" | "vinyl";
  defaultPrintArea: string;
  availableColors: string[]; // Codes hexadécimaux
  availableSizes: string[]; // ['S', 'M', 'L', 'XL', 'XXL']
  minOrderQuantity: number;
  productionLeadTime: number; // En jours
}

export interface AppSettings {
  _id: string;

  // Informations de l'entreprise
  companyName: string;
  companyLogo?: string;
  companyDescription?: string;
  contactEmail: string;
  contactPhone: string;
  address: CompanyAddress;

  // Horaires d'ouverture
  businessHours: BusinessHours[];

  // Réseaux sociaux
  socialMedia: SocialMediaLinks;

  // Configuration des paiements
  payment: PaymentSettings;

  // Configuration de la livraison
  shipping: ShippingSettings;

  // Notifications
  notifications: NotificationSettings;

  // Configuration des designs
  design: DesignSettings;

  // Paramètres généraux
  defaultOrderStatus: "PENDING" | "CONFIRMED" | "IN_PROGRESS";
  autoGenerateOrderNumber: boolean;
  orderNumberPrefix: string;
  orderNumberSequence: number;
  lowStockThreshold: number;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface UpdateSettingsDto {
  // Informations de l'entreprise
  companyName?: string;
  companyLogo?: string;
  companyDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Partial<CompanyAddress>;

  // Horaires d'ouverture
  businessHours?: Partial<BusinessHours>[];

  // Réseaux sociaux
  socialMedia?: Partial<SocialMediaLinks>;

  // Configuration des paiements
  payment?: Partial<PaymentSettings>;

  // Configuration de la livraison
  shipping?: Partial<ShippingSettings>;

  // Notifications
  notifications?: Partial<NotificationSettings>;

  // Configuration des designs
  design?: Partial<DesignSettings>;

  // Paramètres généraux
  defaultOrderStatus?: "PENDING" | "CONFIRMED" | "IN_PROGRESS";
  autoGenerateOrderNumber?: boolean;
  orderNumberPrefix?: string;
  lowStockThreshold?: number;
}

// Interface pour la réponse de l'API
export interface ApiSettings {
  _id: string;
  companyName: string;
  companyLogo?: string;
  companyDescription?: string;
  contactEmail: string;
  contactPhone: string;
  address: any;
  businessHours: any[];
  socialMedia: any;
  payment: any;
  shipping: any;
  notifications: any;
  design: any;
  defaultOrderStatus: string;
  autoGenerateOrderNumber: boolean;
  orderNumberPrefix: string;
  orderNumberSequence: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

// Fonction utilitaire pour convertir ApiSettings en AppSettings
export const apiToSettings = (apiData: ApiSettings): AppSettings => ({
  _id: apiData._id,
  companyName: apiData.companyName || "By Gagoos Ink",
  companyLogo: apiData.companyLogo,
  companyDescription: apiData.companyDescription,
  contactEmail: apiData.contactEmail || "contact@bygagoosink.com",
  contactPhone: apiData.contactPhone || "",
  address: apiData.address || {
    street: "",
    city: "",
    postalCode: "",
    country: "Madagascar",
  },
  businessHours: apiData.businessHours || [
    { day: "monday", open: "08:00", close: "18:00", closed: false },
    { day: "tuesday", open: "08:00", close: "18:00", closed: false },
    { day: "wednesday", open: "08:00", close: "18:00", closed: false },
    { day: "thursday", open: "08:00", close: "18:00", closed: false },
    { day: "friday", open: "08:00", close: "18:00", closed: false },
    { day: "saturday", open: "09:00", close: "13:00", closed: false },
    { day: "sunday", open: "00:00", close: "00:00", closed: true },
  ],
  socialMedia: apiData.socialMedia || {},
  payment: apiData.payment || {
    methods: ["CASH", "MOBILE_MONEY"],
    defaultMethod: "CASH",
    currency: "EUR",
    taxEnabled: true,
    taxRate: 20,
  },
  shipping: apiData.shipping || {
    methods: ["PICKUP", "STANDARD"],
    pickupAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: "Madagascar",
    },
    standardCost: 5,
    expressCost: 10,
    internationalCost: 25,
    estimatedDeliveryDays: {
      standard: 7,
      express: 3,
      international: 14,
    },
  },
  notifications: apiData.notifications || {
    emailNotifications: true,
    adminEmail: "admin@bygagoosink.com",
    newOrderEmail: true,
    orderStatusEmail: true,
    lowStockEmail: true,
    smsNotifications: false,
  },
  design: apiData.design || {
    defaultPrintType: "screen_print",
    defaultPrintArea: "Poitrine",
    availableColors: ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF"],
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    minOrderQuantity: 1,
    productionLeadTime: 7,
  },
  defaultOrderStatus:
    (apiData.defaultOrderStatus as "PENDING" | "CONFIRMED" | "IN_PROGRESS") ||
    "PENDING",
  autoGenerateOrderNumber: apiData.autoGenerateOrderNumber !== false,
  orderNumberPrefix: apiData.orderNumberPrefix || "CMD",
  orderNumberSequence: apiData.orderNumberSequence || 1000,
  lowStockThreshold: apiData.lowStockThreshold || 10,
  createdAt: apiData.createdAt,
  updatedAt: apiData.updatedAt,
  updatedBy: apiData.updatedBy,
});

// Interface pour les paramètres système
export interface SystemInfo {
  version: string;
  environment: "development" | "production" | "staging";
  database: {
    type: string;
    connected: boolean;
    version?: string;
  };
  server: {
    uptime: number;
    memoryUsage: {
      total: number;
      used: number;
      free: number;
    };
  };
  lastBackup?: string;
  nextBackup?: string;
}
