import { Schema, model, type Document, type Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string | null;
  location: string | null;
  landSize: string | null;
  primaryCrops: string[];
  experience: string | null;
  phone: string | null;
  role: 'farmer' | 'buyer';
  /** True for accounts created by the one-time Supabase migration script. */
  migratedFromSupabase: boolean;
  /** True until a migrated (or password-reset) account sets a real password via the emailed link. */
  requiresPasswordSetup: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: null, select: false },
    location: { type: String, default: null, trim: true },
    landSize: { type: String, default: null, trim: true },
    primaryCrops: { type: [String], default: [] },
    experience: { type: String, default: null, trim: true },
    phone: { type: String, default: null, trim: true },
    role: { type: String, enum: ['farmer', 'buyer'], default: 'farmer' },
    migratedFromSupabase: { type: Boolean, default: false },
    requiresPasswordSetup: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
