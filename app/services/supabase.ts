import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * This file sets up the Supabase client with the appropriate URL and anonymous key
 * from environment variables.
 */

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types for better type safety throughout the application
export type SupabaseClient = typeof supabase;

/**
 * Gets the current user from Supabase Auth
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Sign out the current user
 * @returns Result of the sign out operation
 */
export const signOut = async () => {
  return await supabase.auth.signOut();
};

/**
 * Retrieves the user's role from the database
 * @param userId The user's ID
 * @returns The user's role or null if not found
 */
export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
  
  return data?.role;
};

