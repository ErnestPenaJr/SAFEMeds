import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  role?: 'user' | 'premium' | 'moderator' | 'admin';
  is_active?: boolean;
  is_online?: boolean;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  medication_count?: number;
  login_count?: number;
  report_count?: number;
}

export interface UserStats {
  total: number;
  active: number;
  admin: number;
  premium: number;
  new_this_week: number;
}

export function useUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user has admin privileges
  const isAdmin = currentUser?.user_metadata?.role === 'admin';

  const searchUsers = async (query: string = '', filters: any = {}) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      setLoading(true);
      setError(null);

      let queryBuilder = supabase
        .from('user_profiles')
        .select(`
          *,
          auth.users!inner(
            id,
            email,
            last_sign_in_at,
            created_at,
            user_metadata
          )
        `);

      // Apply search filter
      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `full_name.ilike.%${query}%,email.ilike.%${query}%`
        );
      }

      // Apply role filter
      if (filters.role) {
        queryBuilder = queryBuilder.eq('role', filters.role);
      }

      // Apply status filter
      if (filters.is_active !== undefined) {
        queryBuilder = queryBuilder.eq('is_active', filters.is_active);
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transform the data to match our User interface
      const transformedUsers = data?.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        location: profile.location,
        role: profile.role || 'user',
        is_active: profile.is_active !== false,
        is_online: profile.is_online || false,
        last_sign_in_at: profile.last_sign_in_at,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        medication_count: profile.medication_count || 0,
        login_count: profile.login_count || 0,
        report_count: profile.report_count || 0,
      })) || [];

      setUsers(transformedUsers);
      return transformedUsers;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (userId: string): Promise<User | null> => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          auth.users!inner(
            id,
            email,
            last_sign_in_at,
            created_at,
            user_metadata
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        phone: data.phone,
        location: data.location,
        role: data.role || 'user',
        is_active: data.is_active !== false,
        is_online: data.is_online || false,
        last_sign_in_at: data.last_sign_in_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        medication_count: data.medication_count || 0,
        login_count: data.login_count || 0,
        report_count: data.report_count || 0,
      };
    } catch (err) {
      console.error('Error fetching user:', err);
      throw err;
    }
  };

  const getUserStats = async (): Promise<UserStats> => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Get total users
      const { count: total } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (signed in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: active } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', thirtyDaysAgo.toISOString());

      // Get admin users
      const { count: admin } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // Get premium users
      const { count: premium } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'premium');

      // Get new users this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: new_this_week } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      return {
        total: total || 0,
        active: active || 0,
        admin: admin || 0,
        premium: premium || 0,
        new_this_week: new_this_week || 0,
      };
    } catch (err) {
      console.error('Error fetching user stats:', err);
      throw err;
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
    } catch (err) {
      console.error('Error updating user role:', err);
      throw err;
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // First delete from user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Then delete from auth.users (requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn('Could not delete auth user:', authError);
        // Continue anyway as profile is deleted
      }

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  const createUser = async (userData: {
    email: string;
    password: string;
    full_name?: string;
    role?: string;
  }) => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role || 'user',
        }
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('Failed to create user');

      // Create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'user',
        });

      if (profileError) throw profileError;

      // Refresh users list
      await searchUsers();

      return authData.user;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    isAdmin,
    searchUsers,
    getUserById,
    getUserStats,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    createUser,
  };
}