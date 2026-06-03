import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserRole } from '../../core/types/userRoles';

export interface IPushSubscription extends Document {
  user: Types.ObjectId;
  role?: UserRole;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(UserRole) },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ user: 1, isActive: 1 });
pushSubscriptionSchema.index({ role: 1, isActive: 1 });

const PushSubscription = mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);

export default PushSubscription;
