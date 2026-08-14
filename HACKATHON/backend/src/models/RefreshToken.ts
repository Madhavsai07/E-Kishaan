import { Schema, model, type Document, type Types } from 'mongoose';

export interface IRefreshToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  /** SHA-256 hash of the raw token — the raw value is never persisted. */
  tokenHash: string;
  expiresAt: Date;
  createdByIp: string | null;
  revokedAt: Date | null;
  /** Set when this token was rotated out in favor of a new one, for audit/reuse-detection. */
  replacedByTokenHash: string | null;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    createdByIp: { type: String, default: null },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// MongoDB TTL index: documents are auto-deleted once expired, so revoked/
// expired refresh tokens don't accumulate forever.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
