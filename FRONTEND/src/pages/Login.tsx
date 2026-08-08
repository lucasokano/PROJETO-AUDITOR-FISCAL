import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (status === "authenticated") return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    try { setIsSubmitting(true); setError(""); await login(email, password); navigate("/", { replace: true }); }
    catch { setError("Email ou senha inválidos."); }
    finally { setIsSubmitting(false); }
  }

  return <main className="login-page"><section className="login-panel"><header><span className="login-mark">G</span><div><strong>GEMA</strong><small>Acesso ao sistema</small></div></header><form onSubmit={submit}><label><span>Email</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus /></label><label><span>Senha</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={12} /></label>{error && <div className="login-error">{error}</div>}<button type="submit" disabled={isSubmitting}>{isSubmitting ? "Entrando..." : "Entrar"}</button></form></section></main>;
}
