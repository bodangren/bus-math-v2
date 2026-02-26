'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Legacy Supabase types for compatibility
interface User {
  id: string;
  email?: string;
}

// Profile type from database schema (using snake_case to match DB for legacy components)
interface Profile {
  id: string;
  organization_id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  display_name: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface AuthContext {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

/**
 * Convert username to internal email format
 */
function usernameToEmail(username: string): string {
  return `${username}@internal.domain`;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/session', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Unable to load auth session');
        }

        const payload = await response.json();
        if (cancelled) return;

        if (payload?.authenticated && payload?.user && payload?.profile) {
          setUser({ id: payload.user.id });
          setProfile(payload.profile as Profile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Invalid login credentials');
      }

      const sessionResponse = await fetch('/api/auth/session', { method: 'GET' });
      if (!sessionResponse.ok) {
        throw new Error('Unable to load auth session');
      }

      const sessionPayload = await sessionResponse.json();
      if (!sessionPayload?.authenticated || !sessionPayload?.user || !sessionPayload?.profile) {
        throw new Error('Invalid login credentials');
      }

      setUser({ id: sessionPayload.user.id });
      setProfile(sessionPayload.profile as Profile);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { usernameToEmail };
