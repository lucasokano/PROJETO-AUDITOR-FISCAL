import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentUser, loginUser, logoutUser, type AuthUser } from "../services/authApi";
import { clearStudyCache } from "../services/studyApi";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    let active = true;
    void getCurrentUser().then((value) => { if (active) { setUser(value); setStatus("authenticated"); } })
      .catch(() => { if (active) { setUser(null); setStatus("unauthenticated"); } });
    return () => { active = false; };
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    status, user,
    login: async (email, password) => { clearStudyCache(); const value = await loginUser(email, password); setUser(value); setStatus("authenticated"); },
    logout: async () => { try { await logoutUser(); } finally { clearStudyCache(); setUser(null); setStatus("unauthenticated"); } },
  }), [status, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return value;
}
