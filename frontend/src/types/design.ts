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

export interface Design {
  _id: string;
  title: string;
  description?: string;
  category: DesignCategory;
  style: DesignStyle;
  colors: string[]; // Codes hexadécimaux
  sizes: string[]; // ['S', 'M', 'L', 'XL', 'XXL']
  basePrice: number;
  images: string[]; // URLs des images
  thumbnail?: string; // URL de la miniature
  /** @deprecated Utiliser `status` à la place */
  isActive: boolean; // Conservé pour compatibilité, sera dérivé de `status` si possible
  status: DesignStatus; // ← AJOUTÉ : statut complet du design
  tags: string[];
  popularity: number;
  printType?: "screen_print" | "digital_print" | "embroidery" | "vinyl";
  printArea?: string; // Zone d'impression
  minQuantity?: number;
  productionTime?: number; // En jours
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateDesignDto {
  title: string;
  description?: string;
  category: DesignCategory;
  style: DesignStyle;
  colors: string[];
  sizes: string[];
  basePrice: number;
  images: File[];
  tags?: string[];
  printType?: "screen_print" | "digital_print" | "embroidery" | "vinyl";
  printArea?: string;
  minQuantity?: number;
  productionTime?: number;
  notes?: string;
  status?: DesignStatus; // ← AJOUTÉ : optionnel, défaut 'draft' côté serveur
}

export interface UpdateDesignDto extends Partial<
  Omit<CreateDesignDto, "images">
> {
  images?: File[];
  /** @deprecated Utiliser `status` à la place */
  isActive?: boolean; // Conservé pour compatibilité
  status?: DesignStatus; // ← AJOUTÉ
  popularity?: number;
}

// Interface pour la réponse de l'API (correspond au format renvoyé par le backend)
export interface ApiDesign {
  _id: string;
  title: string;
  description?: string;
  category: string;
  style: string;
  colors: string[];
  sizes: string[];
  basePrice: number;
  images: string[];
  thumbnail?: string;
  status: DesignStatus; // ← MODIFIÉ : remplace `isActive` pour coller au modèle backend
  tags: string[];
  popularity: number;
  printType?: string;
  printArea?: string;
  minQuantity?: number;
  productionTime?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  // Optionnel : certains endpoints renvoient encore `isActive` pour compatibilité
  isActive?: boolean;
}

// Fonction utilitaire pour convertir ApiDesign en Design (avec gestion de la rétrocompatibilité)
export const apiToDesign = (apiData: ApiDesign): Design => {
  // Déterminer le statut : priorité à `status`, sinon déduire de `isActive`
  let status: DesignStatus = apiData.status || "draft";
  if (!apiData.status && apiData.isActive !== undefined) {
    status = apiData.isActive ? "active" : "inactive";
  }

  return {
    _id: apiData._id,
    title: apiData.title,
    description: apiData.description,
    category: apiData.category as DesignCategory,
    style: apiData.style as DesignStyle,
    colors: apiData.colors || [],
    sizes: apiData.sizes || [],
    basePrice: apiData.basePrice,
    images: apiData.images || [],
    thumbnail: apiData.thumbnail,
    // isActive est dérivé du statut (actif = 'active')
    isActive: status === "active",
    status, // ← AJOUTÉ
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
  category?: DesignCategory;
  style?: DesignStyle;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  status?: DesignStatus; // ← AJOUTÉ
  isActive?: boolean; // Conservé pour compatibilité
  createdAfter?: string;
  createdBefore?: string;
}

// Interface pour le téléchargement d'images
export interface DesignImageUpload {
  file: File;
  isThumbnail?: boolean;
  caption?: string;
}
