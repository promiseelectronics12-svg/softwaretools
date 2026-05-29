"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";

interface AuthContextType {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser: SessionUser | null }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);

  const logout = useCallback(() => {
    setUser(null);
    document.cookie = "session=; path=/; max-age=0";
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
