import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Interface for email template variables
 */
export interface IEmailTemplate extends Document {
  _id: Types.ObjectId;
  key: string;                    // Unique identifier (e.g., 'order-confirmation')
  name: string;                   // Display name
  type: 'transactional' | 'marketing' | 'system';
  subject: string;                // Email subject with variables support
  body: string;                   // Email body (HTML/Markdown with variables)
  variables: string[];            // List of available variables (e.g., ['client_name', 'order_id'])
  isActive: boolean;
  version: number;                // Version tracking for rollback
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: Types.ObjectId;     // Admin who last updated
}

/**
 * Interface for global system settings
 */
export interface ISystemSettings extends Document {
  _id: Types.ObjectId;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  siteTitle: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;                  // URL or path to logo
  favicon?: string;               // URL or path to favicon
  contactEmail: string;
  supportPhoneNumber?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: Types.ObjectId;
}

// ========== SCHEMAS ==========

const EmailTemplateSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['transactional', 'marketing', 'system'],
    default: 'transactional'
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  variables: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'email_templates'
});

const SystemSettingsSchema: Schema = new Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'Le site est actuellement en maintenance. Merci de votre patience.'
  },
  siteTitle: {
    type: String,
    required: true,
    default: 'ByGagoos Ink'
  },
  siteDescription: {
    type: String,
    default: 'Spécialiste de la sérigraphie à Antananarivo'
  },
  primaryColor: {
    type: String,
    default: '#2563eb',
    validate: {
      validator: (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v),
      message: 'Invalid color format'
    }
  },
  secondaryColor: {
    type: String,
    default: '#4f46e5',
    validate: {
      validator: (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v),
      message: 'Invalid color format'
    }
  },
  logo: {
    type: String
  },
  favicon: {
    type: String
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  supportPhoneNumber: {
    type: String
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'system_settings'
});

// ========== MODELS ==========

export const EmailTemplate = mongoose.model<IEmailTemplate>(
  'EmailTemplate',
  EmailTemplateSchema
);

export const SystemSettings = mongoose.model<ISystemSettings>(
  'SystemSettings',
  SystemSettingsSchema
);

/**
 * Initialize default system settings if they don't exist
 */
export async function initializeSystemSettings(): Promise<void> {
  try {
    const exists = await SystemSettings.findOne({});
    if (!exists) {
      await SystemSettings.create({
        siteTitle: 'ByGagoos Ink',
        siteDescription: 'Spécialiste de la sérigraphie à Antananarivo',
        primaryColor: '#2563eb',
        secondaryColor: '#4f46e5',
        contactEmail: 'contact@bygagoos.com'
      });
    }
  } catch (error) {
    console.error('Error initializing system settings:', error);
  }
}

/**
 * Initialize default email templates if they don't exist
 */
export async function initializeEmailTemplates(): Promise<void> {
  const defaultTemplates = [
    {
      key: 'order-confirmation',
      name: 'Confirmation de Commande',
      type: 'transactional' as const,
      subject: 'Merci pour votre commande #{{order_id}}',
      body: `
        <h2>Bonjour {{client_name}},</h2>
        <p>Nous avons bien reçu votre commande.</p>
        <p><strong>Numéro de commande :</strong> {{order_id}}</p>
        <p><strong>Total :</strong> {{total_amount}} Ar</p>
        <p>Nous vous confirmerons le statut dans les 24 heures.</p>
      `,
      variables: ['client_name', 'order_id', 'total_amount']
    },
    {
      key: 'quote-request',
      name: 'Demande de Devis',
      type: 'transactional' as const,
      subject: 'Votre demande de devis a été reçue',
      body: `
        <h2>Bonjour {{client_name}},</h2>
        <p>Nous avons reçu votre demande de devis pour {{product_type}}.</p>
        <p>Nous vous répondrons dans les 48 heures.</p>
      `,
      variables: ['client_name', 'product_type']
    }
  ];

  for (const template of defaultTemplates) {
    const exists = await EmailTemplate.findOne({ key: template.key });
    if (!exists) {
      await EmailTemplate.create(template);
    }
  }
}
