import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { getToken, setToken, clearToken } from "../lib/api";

type Role = "student" | "employer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  is_verified: boolean;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: "student" | "employer";
  company_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getToken();
    if (stored) {
      api.get<User>("/api/v1/auth/me")
        .then((u) => setUser(u))
        .catch(() => {
          clearToken();
          setTokenState(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await api.post<AuthResponse>("/api/v1/auth/login", { email, password }, false);
    setToken(resp.access_token);
    setTokenState(resp.access_token);
    setUser(resp.user);
  };

  const signup = async (data: SignupData) => {
    const resp = await api.post<AuthResponse>("/api/v1/auth/signup", data, false);
    setToken(resp.access_token);
    setTokenState(resp.access_token);
    setUser(resp.user);
  };

  const logout = () => {
    api.post("/api/v1/auth/logout", undefined, true).catch(() => {});
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function getAvatarUrl(user: User): string {
  if (user.avatar_url) return user.avatar_url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=256`;
}
