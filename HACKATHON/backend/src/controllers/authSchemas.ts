import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  location: z.string().trim().max(200).optional(),
  role: z.enum(['farmer', 'buyer']).default('farmer'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().max(200).optional(),
    land_size: z.string().trim().max(100).optional(),
    primary_crops: z.array(z.string().trim()).optional(),
    experience: z.string().trim().max(200).optional(),
    phone: z.string().trim().max(30).optional(),
  })
  .partial();

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
});

export const setPasswordSchema = z.object({
  token: z.string().min(1, 'Missing token'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
