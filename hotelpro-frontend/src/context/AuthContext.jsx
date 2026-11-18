import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("hotelpro_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const response = await authService.profile();
      setUser(response.user || null);
      return response.user || null;
    } catch {
      localStorage.removeItem("hotelpro_token");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (!response.token) throw new Error("Login response did not include a token.");
    localStorage.setItem("hotelpro_token", response.token);
    setUser(response.user || null);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("hotelpro_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout, refreshUser }), [user, loading, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}