// frontend/src/types/design.ts

export type DesignCategory =
  | "T-SHIRT"
  | "HOODIE"
  | "SWEATSHIRT"
  | "POLO"
  | "TANK_TOP"
  | "POSTER"
  | "STICKER"
  | "MUG"
  | "BAG"
  | "CAP"
  | "OTHER";

export type DesignStyle =
  | "VINTAGE"
  | "MODERN"
  | "URBAN"
  | "MINIMALIST"
  | "ARTISTIC"
  | "TRIBAL"
  | "GEOMETRIC"
  | "TYPOGRAHPHY"
  | "ILLUSTRATION"
  | "ABSTRACT";

export type DesignStatus = "draft" | "active" | "inactive" | "archived";

// Interface principale Design (version étendue pour le frontend)
export interface Design {
  _id: string;
  id?: string; // Compatibilité
  name?: string; // Compatibilité avec GalleryPage
  title: string;
  description?: string;
  category: DesignCategory | string; // Accepte string pour compatibilité API
  style?: DesignStyle;
  colors: string[]; // Codes hexadécimaux
  sizes?: string[];
  basePrice?: number;
  price?: number; // Mapped from basePrice for compatibility
  image: string; // URL principale (compatibilité)
  images?: string[]; // URLs des images (complet)
  thumbnail?: string; // URL de la miniature
  /** @deprecated Utiliser `status` à la place */
  isActive: boolean; // Conservé pour compatibilité
  status: DesignStatus; // Statut complet du design
  tags: string[];
  popularity?: number;
  printType?: "screen_print" | "digital_print" | "embroidery" | "vinyl";
  printArea?: string;
  minQuantity?: number;
  productionTime?: number; // En jours
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  
  // Champs spécifiques à l'application ByGagoos
  collection?: string;
  ethnicGroup?: string;
  featured?: boolean;
  new?: boolean;
  likes: number;
  artist: string;
  
  // Métadonnées supplémentaires
  metadata?: {
    category?: string;
    basePrice?: number;
    [key: string]: any;
  };
  
  // Fichiers uploadés
  files?: Array<{
    url: string;
    type?: string;
    isThumbnail?: boolean;
  }>;
  
  // Compatibilité avec anciennes versions
  type?: string;
}

export interface CreateDesignDto {
  title: string;
  description?: string;
  category: DesignCategory | string;
  style?: DesignStyle;
  colors?: string[];
  sizes?: string[];
  basePrice?: number;
  images?: File[] | string[]; // Accepte File ou URL string
  image?: File | string; // Compatibilité
  thumbnail?: File | string; // Compatibilité
  tags?: string[];
  printType?: "screen_print" | "digital_print" | "embroidery" | "vinyl";
  printArea?: string;
  minQuantity?: number;
  productionTime?: number;
  notes?: string;
  status?: DesignStatus; // Optionnel, défaut 'draft' côté serveur
  
  // Champs spécifiques ByGagoos
  collection?: string;
  ethnicGroup?: string;
  featured?: boolean;
  new?: boolean;
  artist?: string;
}

export interface UpdateDesignDto extends Partial<
  Omit<CreateDesignDto, "images" | "image">
> {
  images?: File[] | string[];
  image?: File | string;
  /** @deprecated Utiliser `status` à la place */
  isActive?: boolean; // Conservé pour compatibilité
  status?: DesignStatus;
  popularity?: number;
  likes?: number;
}

// Interface pour la réponse de l'API (correspond au format renvoyé par le backend)
export interface ApiDesign {
  _id: string;
  title: string;
  description?: string;
  category: string;
  style?: string;
  colors?: string[];
  sizes?: string[];
  basePrice?: number;
  images?: string[];
  image?: string;
  thumbnail?: string;
  status?: DesignStatus;
  isActive?: boolean; // Compatibilité
  tags?: string[];
  popularity?: number;
  printType?: string;
  printArea?: string;
  minQuantity?: number;
  productionTime?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  
  // Champs spécifiques ByGagoos
  collection?: string;
  ethnicGroup?: string;
  featured?: boolean;
  new?: boolean;
  likes?: number;
  artist?: string;
}

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Fonction utilitaire pour convertir ApiDesign en Design
export const apiToDesign = (apiData: ApiDesign): Design => {
  // Déterminer le statut : priorité à `status`, sinon déduire de `isActive`
  let status: DesignStatus = apiData.status || "draft";
  if (!apiData.status && apiData.isActive !== undefined) {
    status = apiData.isActive ? "active" : "inactive";
  }

  return {
    _id: apiData._id,
    id: apiData._id,
    name: apiData.title,
    title: apiData.title,
    description: apiData.description,
    category: apiData.category as DesignCategory,
    style: apiData.style as DesignStyle,
    colors: apiData.colors || [],
    sizes: apiData.sizes || [],
    basePrice: apiData.basePrice,
    price: apiData.basePrice,
    image: apiData.image || apiData.thumbnail || (apiData.images?.[0] ?? ''),
    images: apiData.images || (apiData.image ? [apiData.image] : []),
    thumbnail: apiData.thumbnail,
    isActive: status === "active",
    status,
    tags: apiData.tags || [],
    popularity: apiData.popularity || 0,
    printType: apiData.printType as
      | "screen_print"
      | "digital_print"
      | "embroidery"
      | "vinyl"
      | undefined,
    printArea: apiData.printArea,
    minQuantity: apiData.minQuantity,
    productionTime: apiData.productionTime,
    notes: apiData.notes,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    createdBy: apiData.createdBy,
    
    // Champs spécifiques ByGagoos
    collection: apiData.collection,
    ethnicGroup: apiData.ethnicGroup,
    featured: apiData.featured || false,
    new: apiData.new || false,
    likes: apiData.likes || 0,
    artist: apiData.artist || 'ByGagoos Ink',
  };
};

// Interface pour les statistiques designs
export interface DesignStats {
  total: number;
  active: number;
  byCategory: Record<DesignCategory, number>;
  popular: Design[];
  revenueGenerated: number;
}

// Interface pour les filtres designs
export interface DesignFilters {
  search?: string;
  category?: DesignCategory | string;
  style?: DesignStyle;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  status?: DesignStatus;
  isActive?: boolean; // Conservé pour compatibilité
  createdAfter?: string;
  createdBefore?: string;
  collection?: string;
  ethnicGroup?: string;
  featured?: boolean;
  new?: boolean;
}

// Interface pour le téléchargement d'images
export interface DesignImageUpload {
  file: File;
  isThumbnail?: boolean;
  caption?: string;
}

// Type guard pour vérifier si un objet est un Design
export const isDesign = (obj: any): obj is Design => {
  return obj && typeof obj === 'object' && '_id' in obj && 'title' in obj;
};

// Type pour la réponse de l'API publique (format spécifique)
export interface PublicDesignsResponse {
  success: boolean;
  data: {
    designs: Design[];
    total?: number;
  };
}