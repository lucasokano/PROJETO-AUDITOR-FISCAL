export interface AuthUser { id: number; email: string; }
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/auth${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) throw new Error(response.status === 401 ? "Email ou senha inválidos." : "Não foi possível concluir a operação.");
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const getCurrentUser = () => request<AuthUser>("/me");
export const loginUser = (email: string, password: string) => request<AuthUser>("/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const logoutUser = () => request<void>("/logout", { method: "POST" });
