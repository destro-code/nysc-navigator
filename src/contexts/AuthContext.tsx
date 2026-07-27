import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { normalizeApiError } from "@/lib/api-error";
import type { Session } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
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

const toUser = (session: Session): AuthUser => ({ id: session.id, email: session.email, username: session.username });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applySession = (session: Session | null) => {
    if (session) {
      setUser(toUser(session));
      setIsAdmin(session.isAdmin);
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    try {
      applySession(authService.getSession());
    } catch (err) {
      setError(normalizeApiError(err, "Unable to restore auth state."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    const result = await authService.login(email, password);
    if (result.success) {
      applySession(result.session);
      return { success: true as const };
    }
    return { success: false as const, error: result.error };
  };

  const signup = async (email: string, password: string, confirmPassword: string) => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || !confirmPassword) return { success: false, error: "Please fill in all fields" };
    if (password !== confirmPassword) return { success: false, error: "Passwords do not match" };
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) return { success: false, error: passwordValidationError };

    const result = await authService.signup(normalizedEmail, password);
    if (result.success) {
      applySession(result.session);
      return { success: true as const };
    }
    return { success: false as const, error: result.error };
  };

  const logout = async () => {
    await authService.logout();
    applySession(null);
  };

  const forgotPassword = async (email: string) => {
    const result = await authService.forgotPassword(email);
    if (result.success) return { success: true as const };
    return { success: false as const, error: result.error };
  };

  const resetPassword = async (newPassword: string) => {
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) return { success: false, error: passwordValidationError };
    const result = await authService.resetPassword(newPassword);
    if (result.success) return { success: true as const };
    return { success: false as const, error: result.error };
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
