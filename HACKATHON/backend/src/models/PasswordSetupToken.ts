import { Schema, model, type Document, type Types } from 'mongoose';

/**
 * Shared by two flows that both end in "let this user set a password":
 * - Forgot password (existing account, wants to reset).
 * - Migrated-from-Supabase account (never had a Mongo-compatible password,
 *   see scripts/migrateSupabaseToMongo.ts) setting one for the first time.
 */
export interface IPasswordSetupToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

const passwordSetupTokenSchema = new Schema<IPasswordSetupToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

passwordSetupTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordSetupToken = model<IPasswordSetupToken>('PasswordSetupToken', passwordSetupTokenSchema);
