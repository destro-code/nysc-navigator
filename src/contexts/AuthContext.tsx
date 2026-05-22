import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { normalizeApiError } from "@/lib/api-error";

export interface AuthUser {
  id: string;
  email: string;
}

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_LETTER_REGEX = /[a-zA-Z]/;
const PASSWORD_NUMBER_REGEX = /\d/;

export const PASSWORD_REQUIREMENTS = [
  { label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (password: string) => password.length >= PASSWORD_MIN_LENGTH },
  { label: "Contains a number", test: (password: string) => PASSWORD_NUMBER_REGEX.test(password) },
  { label: "Contains a letter", test: (password: string) => PASSWORD_LETTER_REGEX.test(password) },
] as const;

const validatePassword = (password: string): string | null => {
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (!PASSWORD_NUMBER_REGEX.test(password) || !PASSWORD_LETTER_REGEX.test(password)) {
    return "Password must contain at least one letter and one number";
  }
  return null;
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (error) throw error;
    setIsAdmin(!!data);
  };

  const mapUser = (supaUser: User): AuthUser => ({
    id: supaUser.id,
    email: supaUser.email || "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setError(null);
        try {
          if (session?.user) {
            setUser(mapUser(session.user));
            setTimeout(() => {
              void checkAdminRole(session.user.id).catch((err) => {
                setError(normalizeApiError(err, "Unable to verify admin role."));
              });
            }, 0);
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        } catch (err) {
          setError(normalizeApiError(err, "Unable to restore auth state."));
        } finally {
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      setError(null);
      try {
        if (sessionError) throw sessionError;
        if (session?.user) {
          setUser(mapUser(session.user));
          await checkAdminRole(session.user.id);
        }
      } catch (err) {
        setError(normalizeApiError(err, "Unable to initialize auth session."));
      } finally {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) return { success: false, error: "Please enter both email and password" };

    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signup = async (email: string, password: string, confirmPassword: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || !confirmPassword) return { success: false, error: "Please fill in all fields" };
    if (password !== confirmPassword) return { success: false, error: "Passwords do not match" };
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) return { success: false, error: passwordValidationError };

    const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });
    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return { success: false, error: "An account with this email already exists. Please log in instead." };
      }
      return { success: false, error: error.message };
    }

    if (!data.session) {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (loginError) {
        const normalizedLoginError = loginError.message.toLowerCase();
        if (normalizedLoginError.includes("email not confirmed")) {
          return {
            success: false,
            error:
              "Email confirmation is still enabled for this Supabase project. Disable it in Auth settings (Email provider) to allow instant login after signup.",
          };
        }

        return { success: false, error: loginError.message };
      }
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const forgotPassword = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return { success: false, error: "Please enter your email" };
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const resetPassword = async (newPassword: string) => {
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) return { success: false, error: passwordValidationError };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, isAdmin, login, signup, logout, forgotPassword, resetPassword, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
