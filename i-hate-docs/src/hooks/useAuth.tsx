import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, getSession } from '@/lib/supabase';
import { useAppStore } from '@/stores/appStore';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  session: unknown | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    getSession().then((s) => {
      if (s?.user) {
        setUser({
          id: s.user.id,
          email: s.user.email ?? '',
          name: s.user.user_metadata?.name ?? undefined,
          avatar_url: s.user.user_metadata?.avatar_url ?? undefined,
          plan: s.user.user_metadata?.plan ?? 'free',
        });
      }
      setSession(s);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        setUser({
          id: s.user.id,
          email: s.user.email ?? '',
          name: s.user.user_metadata?.name ?? undefined,
          avatar_url: s.user.user_metadata?.avatar_url ?? undefined,
          plan: s.user.user_metadata?.plan ?? 'free',
        });
      } else {
        setUser(null);
      }
      setSession(s);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    addToast('Signed in successfully', 'success');
    return {};
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, plan: 'free' } },
    });
    if (error) return { error: error.message };
    addToast('Account created! Check your email to confirm.', 'success');
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    addToast('Signed out', 'info');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    addToast('Password reset email sent', 'success');
    return {};
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
