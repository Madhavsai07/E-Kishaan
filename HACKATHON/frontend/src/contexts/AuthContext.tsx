import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, setAccessToken, refreshAccessToken } from '@/lib/apiClient';

/**
 * Minimal auth-identity shape. Kept close to Supabase's old `User` type
 * (`id`, `email`, `user_metadata.full_name`) purely so existing consumers
 * (UserProfile.tsx, Index.tsx) that read those exact fields didn't need to
 * change when auth moved off Supabase onto our own JWT/MongoDB backend.
 */
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

/** Mirrors the old Supabase `profiles` row shape 1:1 — see backend/src/controllers/authController.ts's toProfileResponse(). */
export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  location: string | null;
  land_size: string | null;
  primary_crops: string[];
  experience: string | null;
  phone: string | null;
  role?: 'farmer' | 'buyer';
  created_at: string;
  updated_at: string;
}

interface AuthPayload {
  success: true;
  accessToken: string;
  user: { id: string; email: string };
  profile: Profile;
}

interface MePayload {
  success: true;
  user: { id: string; email: string };
  profile: Profile;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  /** Kept for interface-compatibility with the old Supabase flow (email confirmation) — this backend logs the user in immediately, so it always resolves `false`. */
  signup: (name: string, email: string, password: string, location?: string) => Promise<{ needsEmailConfirmation: boolean }>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Completes a "forgot password" / migrated-account setup link (see SetPassword.tsx) and logs the user in. */
  setNewPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, 'name' | 'location' | 'land_size' | 'primary_crops' | 'experience' | 'phone'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAuthUser(id: string, email: string, name: string | null): AuthUser {
  return { id, email, user_metadata: name ? { full_name: name } : undefined };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: try a silent refresh using the httpOnly cookie (survives page
  // reloads even though the access token itself lives only in memory).
  useEffect(() => {
    (async () => {
      const token = await refreshAccessToken();
      if (token) {
        try {
          const me = await apiFetch<MePayload>('/api/auth/me');
          setUser(toAuthUser(me.user.id, me.user.email, me.profile.name));
          setProfile(me.profile);
        } catch {
          setAccessToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, location?: string) => {
    const data = await apiFetch<AuthPayload>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, location }),
    });
    setUser(toAuthUser(data.user.id, data.user.email, data.profile.name));
    setProfile(data.profile);
    return { needsEmailConfirmation: false };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<AuthPayload>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(toAuthUser(data.user.id, data.user.email, data.profile.name));
    setProfile(data.profile);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST', allowRefreshRetry: false });
    } finally {
      setAccessToken(null);
      setUser(null);
      setProfile(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  }, []);

  const setNewPassword = useCallback(async (token: string, password: string) => {
    const data = await apiFetch<AuthPayload>('/api/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    setUser(toAuthUser(data.user.id, data.user.email, data.profile.name));
    setProfile(data.profile);
  }, []);

  const updateProfile: AuthContextValue['updateProfile'] = useCallback(
    async (patch) => {
      if (!user) throw new Error('You must be logged in to update your profile.');
      const data = await apiFetch<{ success: true; profile: Profile }>('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      setProfile(data.profile);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout, resetPassword, setNewPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
