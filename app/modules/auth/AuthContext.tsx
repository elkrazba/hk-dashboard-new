'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase, getUserRole } from '../../services/supabase';

/**
 * User role types for the HK SOULUTION dashboard
 */
export type UserRole = 
  | 'superadmin'
  | 'hr_admin'
  | 'project_manager'
  | 'team_lead'
  | 'employee'
  | 'intern'
  | 'partner'
  | null;

/**
 * Authentication context state interface
 */
interface AuthContextState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: UserRole;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

// Default auth context state
const initialState: AuthContextState = {
  user: null,
  session: null,
  isLoading: true,
  userRole: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
};

// Create auth context
const AuthContext = createContext<AuthContextState>(initialState);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to the application
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Fetch and set user role
          if (currentSession.user) {
            const role = await getUserRole(currentSession.user.id);
            setUserRole(role as UserRole);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        // Update user role when auth state changes
        if (currentSession?.user) {
          const role = await getUserRole(currentSession.user.id);
          setUserRole(role as UserRole);
        } else {
          setUserRole(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // Redirect to verification page or show verification message
      router.push('/auth/verify');
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error resetting password:', error.message);
      throw error;
    }
  };

  /**
   * Update user password
   */
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Error updating password:', error.message);
      throw error;
    }
  };

  // Auth context value
  const value = {
    user,
    session,
    isLoading,
    userRole,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns Authentication context state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

