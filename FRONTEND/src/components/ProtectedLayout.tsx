import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { StudyProvider } from "../contexts/StudyContext";
import { Layout } from "./Layout";

export function ProtectedLayout() {
  const { status } = useAuth();
  if (status === "loading") return <div className="auth-loading">Carregando...</div>;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  return <StudyProvider><Layout /></StudyProvider>;
}
