import { supabase } from '@/lib/supabase';
import type { Session } from '@/types';

const mapSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;

  const user = data.session.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? '',
    username: profile?.username ?? user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'corper',
    isAdmin: (user.email ?? '').toLowerCase() === 'admin@demo.nysc',
    createdAt: user.created_at,
  };
};

export const authService = {
  async getSession(): Promise<Session | null> {
    return mapSession();
  },

  async login(email: string, password: string): Promise<{ success: true; session: Session } | { success: false; error: string }> {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) return { success: false, error: 'Please enter both email and password' };

    const { error } = await supabase.auth.signInWithPassword({ email: normalized, password });
    if (error) return { success: false, error: error.message };

    const session = await mapSession();
    if (!session) return { success: false, error: 'Unable to establish your session. Please try again.' };
    return { success: true, session };
  },

  async signup(email: string, password: string): Promise<{ success: true; session: Session } | { success: false; error: string }> {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) return { success: false, error: 'Please enter both email and password' };
    if (password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };

    const { data, error } = await supabase.auth.signUp({
      email: normalized,
      password,
      options: { data: { username: normalized.split('@')[0] || 'corper' } },
    });

    if (error) return { success: false, error: error.message };

    // If email confirmation is enabled, Supabase returns a user without a session.
    if (!data.session) {
      return { success: false, error: 'Account created. Please check your email to verify your account before signing in.' };
    }

    const session = await mapSession();
    if (!session) return { success: false, error: 'Account created, but your session could not be established.' };
    return { success: true, session };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async forgotPassword(email: string): Promise<{ success: true } | { success: false; error: string }> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return { success: false, error: 'Please enter your email' };

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(normalized, { redirectTo });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async resetPassword(newPassword: string): Promise<{ success: true } | { success: false; error: string }> {
    if (newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
