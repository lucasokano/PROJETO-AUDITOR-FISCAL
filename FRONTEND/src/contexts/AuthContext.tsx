import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthRequestError, getCurrentUser, loginUser, logoutUser, type AuthUser } from "../services/authApi";
import { clearStudyCache } from "../services/studyApi";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_USER_KEY = "gema-authenticated-session";

function cachedSessionUser() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_USER_KEY) ?? "null") as AuthUser | null; }
  catch { return null; }
}

function rememberSessionUser(user: AuthUser | null) {
  if (user) sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(SESSION_USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    let active = true;
    void getCurrentUser().then((value) => {
      if (active) { rememberSessionUser(value); setUser(value); setStatus("authenticated"); }
    }).catch((error) => {
      if (!active) return;
      const offlineUser = error instanceof AuthRequestError && error.status === null ? cachedSessionUser() : null;
      setUser(offlineUser);
      setStatus(offlineUser ? "authenticated" : "unauthenticated");
      if (!offlineUser) rememberSessionUser(null);
    });
    return () => { active = false; };
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    status, user,
    login: async (email, password) => { clearStudyCache(); const value = await loginUser(email, password); rememberSessionUser(value); setUser(value); setStatus("authenticated"); },
    logout: async () => { try { await logoutUser(); } finally { clearStudyCache(); rememberSessionUser(null); setUser(null); setStatus("unauthenticated"); } },
  }), [status, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return value;
}
