import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "nysc_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Validation
    if (!email || !password) {
      setIsLoading(false);
      return { success: false, error: "Please enter both email and password" };
    }
    
    if (!email.includes("@")) {
      setIsLoading(false);
      return { success: false, error: "Please enter a valid email address" };
    }
    
    if (password.length < 6) {
      setIsLoading(false);
      return { success: false, error: "Password must be at least 6 characters" };
    }
    
    // Mock login - in production would hit backend
    const authUser: AuthUser = {
      id: "current_user",
      email,
      isAdmin: email.includes("admin"),
    };
    
    setUser(authUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (email: string, password: string, confirmPassword: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (!email || !password || !confirmPassword) {
      setIsLoading(false);
      return { success: false, error: "Please fill in all fields" };
    }
    
    if (!email.includes("@")) {
      setIsLoading(false);
      return { success: false, error: "Please enter a valid email address" };
    }
    
    if (password.length < 6) {
      setIsLoading(false);
      return { success: false, error: "Password must be at least 6 characters" };
    }
    
    if (password !== confirmPassword) {
      setIsLoading(false);
      return { success: false, error: "Passwords do not match" };
    }
    
    const authUser: AuthUser = {
      id: "current_user",
      email,
      isAdmin: false,
    };
    
    setUser(authUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" };
    }
    
    return { success: true };
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (!token) {
      return { success: false, error: "Invalid reset token" };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }
    
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
