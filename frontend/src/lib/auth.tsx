"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearToken, getToken, setToken } from "@/lib/api";
import type { AuthResponse, Role } from "@/lib/types";

interface SessionUser {
  id: number;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<SessionUser>;
  loginWithToken: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const SESSION_KEY = "esp_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null;
    if (token && raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        clearToken();
      }
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((auth: AuthResponse) => {
    setToken(auth.access_token);
    const sessionUser: SessionUser = { id: auth.user_id, name: auth.name, role: auth.role };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const auth = await api.post<AuthResponse>("/api/auth/login", { identifier, password });
      persistSession(auth);
      return { id: auth.user_id, name: auth.name, role: auth.role };
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    clearToken();
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken: persistSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
