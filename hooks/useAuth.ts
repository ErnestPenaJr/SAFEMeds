import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { router } from 'expo-router';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  role?: 'user' | 'premium' | 'moderator' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  sendVerificationCode: (email: string, type?: 'verification' | 'reset') => Promise<{ error?: string; code?: string }>;
  verifyCode: (email: string, code: string) => Promise<{ error?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the admin UID - your specific account
const ADMIN_UID = 'e89a8274-4d7c-4c57-b8a0-243ab71a0960';

// Helper function to check if error is rate limit related
const isRateLimitError = (error: any): boolean => {
  if (!error) return false;
  
  // Check status code
  if (error.status === 429) return true;
  
  // Check error message
  const message = error.message || '';
  if (message.includes('over_email_send_rate_limit') || 
      message.includes('email rate limit exceeded') ||
      message.includes('rate limit')) return true;
  
  // Check error code
  if (error.code === 'over_email_send_rate_limit') return true;
  
  // Check body for rate limit indicators
  if (error.body) {
    try {
      const body = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
      if (body.code === 'over_email_send_rate_limit' || 
          body.message?.includes('rate limit')) return true;
    } catch {
      // Failed to parse body, continue with other checks
    }
  }
  
  // Check if error is a string containing rate limit info
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      if (parsed.code === 'over_email_send_rate_limit') return true;
    } catch {
      // Not JSON, check string directly
      if (error.includes('rate limit') || error.includes('over_email_send_rate_limit')) return true;
    }
  }
  
  return false;
};

// Helper function to parse Supabase errors and return user-friendly messages
const parseSupabaseError = (error: any): string => {
  if (!error) return 'An unexpected error occurred';

  // Check for rate limit errors first
  if (isRateLimitError(error)) {
    return 'Email verification is temporarily unavailable due to high demand. Please try again in a few minutes, or contact support if this persists.';
  }

  // Handle string error messages
  if (typeof error === 'string') {
    // Check if it's a JSON string containing error details
    try {
      const parsed = JSON.parse(error);
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      // Not JSON, return as is
      return error;
    }
  }

  // Handle error objects with message property
  if (error.message) {
    const message = error.message;
    
    // Check for other common errors
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (message.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    
    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    
    if (message.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    
    return message;
  }

  // Handle HTTP status codes
  if (error.status === 400) {
    return 'Invalid request. Please check your input and try again.';
  }
  
  if (error.status === 422) {
    return 'Invalid email or password format.';
  }

  // Check if error body contains JSON with error details
  if (error.body) {
    try {
      const parsed = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      // Failed to parse body
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin based on UID
  const isAdmin = user?.id === ADMIN_UID;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          // Redirect to sign-in when user is signed out
          if (event === 'SIGNED_OUT') {
            console.log('User signed out, redirecting to sign-in');
            router.replace('/(auth)/sign-in');
          }
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      // Check if data array has any results
      if (data && data.length > 0) {
        let profileData = data[0];
        
        // Automatically set admin role if this is the admin UID
        if (userId === ADMIN_UID && profileData.role !== 'admin') {
          console.log('Setting admin role for admin UID');
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ role: 'admin' })
            .eq('id', userId);
          
          if (!updateError) {
            profileData = { ...profileData, role: 'admin' };
          }
        }
        
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      console.log('Attempting to sign up user:', email);
      
      // Attempt to sign up with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation redirect
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        
        // Check if it's a rate limit error
        if (isRateLimitError(error)) {
          console.log('Rate limit detected during signup, attempting alternative flow');
          
          // For rate limit scenarios, inform user that account creation may still work
          // but email verification is temporarily unavailable
          return { 
            error: 'Email verification is temporarily unavailable due to high demand. Your account may have been created successfully - please try signing in. If you continue having issues, please contact support.' 
          };
        }
        
        // Handle user already exists error
        if (error.message?.includes('User already registered')) {
          return { 
            error: 'An account with this email already exists. Please try signing in instead.' 
          };
        }
        
        return { error: parseSupabaseError(error) };
      }

      // Create user profile if signup was successful
      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        // Determine role based on UID
        const role = data.user.id === ADMIN_UID ? 'admin' : 'user';
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role: role,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: parseSupabaseError(profileError) };
        } else {
          console.log(`Created profile with role: ${role} for UID: ${data.user.id}`);
        }
      }

      return {};
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      
      // Check if the caught error is rate limit related
      if (isRateLimitError(error)) {
        return { 
          error: 'Email verification is temporarily unavailable due to high demand. Your account may have been created successfully - please try signing in. If you continue having issues, please contact support.' 
        };
      }
      
      return { error: parseSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: parseSupabaseError(error) };
      }

      return {};
    } catch (error) {
      return { error: parseSupabaseError(error) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      setLoading(true);
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all sessions
      });
      
      if (error) {
        console.error('Error signing out from Supabase:', error);
        // Continue with local cleanup even if Supabase signout fails
      } else {
        console.log('Successfully signed out from Supabase');
      }
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Navigate to sign-in screen
      console.log('Navigating to sign-in screen');
      router.replace('/(auth)/sign-in');
      
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      // Clear state even on error to ensure user appears signed out
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Still navigate to sign-in
      router.replace('/(auth)/sign-in');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (email: string, type: 'verification' | 'reset' = 'verification') => {
    try {
      console.log(`Sending verification code to ${email}, type: ${type}`);
      
      // Generate verification code
      const { data, error } = await supabase.rpc('generate_verification_code', {
        user_email: email
      });

      if (error) {
        console.error('Error generating verification code:', error);
        return { error: parseSupabaseError(error) };
      }

      console.log('Generated verification code:', data);

      // Send email via edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke(
        'send-verification-email',
        {
          body: { email, code: data, type }
        }
      );

      if (emailError) {
        console.error('Error calling email function:', emailError);
        
        // Check if it's a rate limit error
        if (isRateLimitError(emailError)) {
          return { 
            error: 'Email sending is temporarily limited due to high demand. Please try again in a few minutes, or contact support if this persists.',
            code: data // Still return the code for development/testing
          };
        }
        
        return { error: parseSupabaseError(emailError) };
      }

      console.log('Email function response:', emailData);

      return { code: emailData?.code }; // Only returned in development
    } catch (error) {
      console.error('Unexpected error in sendVerificationCode:', error);
      return { error: parseSupabaseError(error) };
    }
  };

  const verifyCode = async (email: string, code: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_email_code', {
        user_email: email,
        input_code: code
      });

      if (error) {
        return { error: parseSupabaseError(error) };
      }

      if (!data) {
        return { error: 'Invalid or expired verification code' };
      }

      return {};
    } catch (error) {
      return { error: parseSupabaseError(error) };
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      // First verify the code
      const verifyResult = await verifyCode(email, code);
      if (verifyResult.error) {
        return verifyResult;
      }

      // Reset password using Supabase admin API
      // Note: This requires the reset to be handled server-side in production
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error: parseSupabaseError(error) };
      }

      return {};
    } catch (error) {
      return { error: parseSupabaseError(error) };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: 'Not authenticated' };
      }

      // Prevent role changes unless user is admin
      if (updates.role && !isAdmin) {
        delete updates.role;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        return { error: parseSupabaseError(error) };
      }

      // Reload profile to get updated data
      await loadUserProfile(user.id);
      return {};
    } catch (error) {
      return { error: parseSupabaseError(error) };
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    sendVerificationCode,
    verifyCode,
    resetPassword,
    updateProfile,
  };
}

export { AuthContext };