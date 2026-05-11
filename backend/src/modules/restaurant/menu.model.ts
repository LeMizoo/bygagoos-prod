import mongoose, { Schema, Document, Types } from 'mongoose';

// --- ENUMS ---
export enum MenuItemCategory {
  APPETIZERS = 'APPETIZERS',
  MAIN_COURSES = 'MAIN_COURSES',
  DESSERTS = 'DESSERTS',
  BEVERAGES = 'BEVERAGES',
  SPECIALS = 'SPECIALS'
}

// --- INTERFACES ---
export interface IMenuItem extends Document {
  _id: Types.ObjectId;
  name: string;
  category: MenuItemCategory;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens?: string[];
  preparationTime?: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMA ---
const menuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: Object.values(MenuItemCategory),
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: String,
    isAvailable: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    allergens: [String],
    preparationTime: Number
  },
  { timestamps: true }
);

const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);

export default MenuItem;
