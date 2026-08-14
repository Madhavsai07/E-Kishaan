import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, type Profile } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /** True once signup succeeds but Supabase requires email confirmation before a session exists. */
  signup: (name: string, email: string, password: string, location?: string) => Promise<{ needsEmailConfirmation: boolean }>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, 'name' | 'location' | 'land_size' | 'primary_crops' | 'experience' | 'phone'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[supabase] Failed to load profile:', error.message);
      return;
    }
    setProfile(data);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const assertConfigured = () => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured yet. Add your project keys to .env.local (see .env.local.example).'
      );
    }
  };

  const signup = async (name: string, email: string, password: string, location?: string) => {
    assertConfigured();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name, location } },
    });
    if (error) throw error;
    // Supabase deliberately returns no error for a duplicate signup (to avoid
    // leaking which emails are registered) — instead it returns a user object
    // with an empty `identities` array. Surface that as a real error so it's
    // never confused with "brand new signup, awaiting email confirmation".
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Try logging in instead.');
    }
    // A profile row is created automatically by the handle_new_user trigger
    // (see supabase/schema.sql). If email confirmation is required, Supabase
    // returns no session here — the caller should tell the user to check email.
    return { needsEmailConfirmation: !data.session };
  };

  const login = async (email: string, password: string) => {
    assertConfigured();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    assertConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    assertConfigured();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (patch) => {
    assertConfigured();
    if (!user) throw new Error('You must be logged in to update your profile.');
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', user.id).select().single();
    if (error) throw error;
    setProfile(data);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout, resetPassword, updateProfile }}>
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
