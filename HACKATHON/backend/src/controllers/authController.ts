import type { Request, Response } from 'express';
import { User, type IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { PasswordSetupToken } from '../models/PasswordSetupToken';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, generateOpaqueToken, hashToken } from '../utils/jwt';
import { parseDurationToMs } from '../utils/time';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendPasswordResetEmail, sendPasswordSetupEmail } from '../utils/email';
import { env } from '../config/env';
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  setPasswordSchema,
} from './authSchemas';

const REFRESH_COOKIE_NAME = 'ek_refresh';
const REFRESH_COOKIE_PATH = '/api/auth';

/**
 * Maps a Mongo User doc onto the exact snake_case shape the frontend has
 * always consumed (mirrors the old Supabase `profiles` row), so
 * UserProfile.tsx and friends don't need to change at all.
 */
function toProfileResponse(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    location: user.location,
    land_size: user.landSize,
    primary_crops: user.primaryCrops,
    experience: user.experience,
    phone: user.phone,
    role: user.role,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    // `Secure` cookies work over plain http://localhost too — browsers treat
    // localhost as a "potentially trustworthy" origin, so this one policy
    // covers both local dev and the real cross-site Vercel<->Render prod setup.
    secure: true,
    sameSite: 'none' as const,
    path: REFRESH_COOKIE_PATH,
  };
}

/** Issues a fresh access + refresh token pair, persists the refresh token (hashed), and sets the cookie. */
async function issueTokenPair(res: Response, user: IUser, req: Request) {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });

  const rawRefreshToken = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRY));
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt,
    createdByIp: req.ip ?? null,
  });

  res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, {
    ...refreshCookieOptions(),
    expires: expiresAt,
  });

  return accessToken;
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const body = signupSchema.parse(req.body);

  const existing = await User.findOne({ email: body.email });
  if (existing) throw AppError.conflict('An account with this email already exists.');

  const user = await User.create({
    name: body.name,
    email: body.email,
    passwordHash: await hashPassword(body.password),
    location: body.location ?? null,
    role: body.role,
  });

  const accessToken = await issueTokenPair(res, user, req);
  res.status(201).json({
    success: true,
    accessToken,
    user: { id: user._id.toString(), email: user.email },
    profile: toProfileResponse(user),
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);

  const user = await User.findOne({ email: body.email }).select('+passwordHash');
  if (!user) throw AppError.unauthorized('Invalid email or password.');

  if (user.requiresPasswordSetup || !user.passwordHash) {
    throw new AppError(
      'This account needs a password set up before you can log in. Use "Forgot password" to get a setup link.',
      401,
      'PASSWORD_SETUP_REQUIRED',
    );
  }

  const valid = await comparePassword(body.password, user.passwordHash);
  if (!valid) throw AppError.unauthorized('Invalid email or password.');

  const accessToken = await issueTokenPair(res, user, req);
  res.json({
    success: true,
    accessToken,
    user: { id: user._id.toString(), email: user.email },
    profile: toProfileResponse(user),
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!rawToken) throw AppError.unauthorized('No refresh token.');

  const tokenHash = hashToken(rawToken);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    throw AppError.unauthorized('Refresh token invalid or expired. Please log in again.');
  }

  const user = await User.findById(stored.userId);
  if (!user) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    throw AppError.unauthorized('Account no longer exists.');
  }

  // Rotate: issue a new refresh token and revoke this one, so a leaked
  // (but already-used) refresh token can't be replayed.
  const newAccessToken = await issueTokenPair(res, user, req);
  stored.revokedAt = new Date();
  await stored.save();

  res.json({
    success: true,
    accessToken: newAccessToken,
    user: { id: user._id.toString(), email: user.email },
    profile: toProfileResponse(user),
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (rawToken) {
    await RefreshToken.updateOne({ tokenHash: hashToken(rawToken) }, { revokedAt: new Date() });
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
  res.json({ success: true });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.sub);
  if (!user) throw AppError.notFound('User not found');
  res.json({ success: true, user: { id: user._id.toString(), email: user.email }, profile: toProfileResponse(user) });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const body = updateProfileSchema.parse(req.body);
  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.location !== undefined) update.location = body.location;
  if (body.land_size !== undefined) update.landSize = body.land_size;
  if (body.primary_crops !== undefined) update.primaryCrops = body.primary_crops;
  if (body.experience !== undefined) update.experience = body.experience;
  if (body.phone !== undefined) update.phone = body.phone;

  const user = await User.findByIdAndUpdate(req.user!.sub, update, { new: true, runValidators: true });
  if (!user) throw AppError.notFound('User not found');
  res.json({ success: true, profile: toProfileResponse(user) });
});

/** Shared by "forgot password" and (indirectly, via the migration script) "set up your migrated account". Always returns a generic success message so this endpoint can't be used to enumerate registered emails. */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const genericResponse = { success: true, message: 'If that email is registered, a link has been sent.' };

  const user = await User.findOne({ email });
  if (!user) {
    res.json(genericResponse);
    return;
  }

  const rawToken = generateOpaqueToken();
  await PasswordSetupToken.create({
    userId: user._id,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  const link = `${env.FRONTEND_URL}/set-password?token=${rawToken}`;
  if (user.migratedFromSupabase && user.requiresPasswordSetup) {
    await sendPasswordSetupEmail(user.email, user.name, link);
  } else {
    await sendPasswordResetEmail(user.email, user.name, link);
  }

  res.json(genericResponse);
});

export const setPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = setPasswordSchema.parse(req.body);
  const tokenHash = hashToken(token);

  const stored = await PasswordSetupToken.findOne({ tokenHash });
  if (!stored || stored.usedAt || stored.expiresAt.getTime() < Date.now()) {
    throw AppError.unauthorized('This link is invalid or has expired. Request a new one.');
  }

  const user = await User.findById(stored.userId);
  if (!user) throw AppError.notFound('User not found');

  user.passwordHash = await hashPassword(password);
  user.requiresPasswordSetup = false;
  await user.save();

  stored.usedAt = new Date();
  await stored.save();

  const accessToken = await issueTokenPair(res, user, req);
  res.json({
    success: true,
    accessToken,
    user: { id: user._id.toString(), email: user.email },
    profile: toProfileResponse(user),
  });
});
