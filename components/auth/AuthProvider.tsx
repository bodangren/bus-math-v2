'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

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
  // We use a mock state for "currently logged in user ID" for now 
  // until Task 4's full @convex-dev/auth migration
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage for demo purposes
  useEffect(() => {
    const savedId = localStorage.getItem('convex_user_id');
    if (savedId) {
      setCurrentUserId(savedId);
    }
    setLoading(false);
  }, []);

  // Fetch profile when user changes
  const convexProfile = useQuery(api.teacher.getTeacherDashboardData, 
    currentUserId ? { userId: currentUserId as Id<"profiles"> } : "skip"
  );

  // Fallback for student profile if teacher query fails/returns null
  // In a real migration we'd have a unified getCurrentProfile query
  const studentProfile = useQuery(api.student.getDashboardData,
    currentUserId ? { userId: currentUserId as Id<"profiles"> } : "skip"
  );

  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUserId && (convexProfile || studentProfile)) {
      setUser({ id: currentUserId });
      
      // Map Convex profile to legacy Profile type
      // This is a bridge until all components use Convex directly
      if (convexProfile?.teacher) {
        setProfile({
          id: currentUserId,
          organization_id: convexProfile.teacher.organizationId,
          username: convexProfile.teacher.username,
          role: 'teacher', // or 'admin' depending on data
          display_name: convexProfile.teacher.username,
          avatar_url: null,
          metadata: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      setUser(null);
      setProfile(null);
    }
  }, [currentUserId, convexProfile, studentProfile]);

  const signIn = async (username: string, password: string) => {
    // TEMPORARY: Simulate sign in by finding profile by username
    // Task 4 will replace this with real auth
    setLoading(true);
    try {
      // For now, we'll use a fetch-based approach to "sign in" for demo users
      // This matches the existing LoginForm's expectation
      const response = await fetch('/api/users/ensure-demo', { method: 'POST' });
      if (response.ok) {
        // Just hardcode demo IDs for now as a bridge
        if (username === 'demo_student') {
          const id = 'student_id_placeholder'; // Needs to be real ID from seed
          setCurrentUserId(id);
          localStorage.setItem('convex_user_id', id);
        } else if (username === 'demo_teacher') {
          const id = 'teacher_id_placeholder';
          setCurrentUserId(id);
          localStorage.setItem('convex_user_id', id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setCurrentUserId(null);
    localStorage.removeItem('convex_user_id');
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
