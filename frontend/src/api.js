import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/v1`,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pulsewatch_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email, password) {
  const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/login`, { user: { email, password } });
  const token = response.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token) localStorage.setItem("pulsewatch_token", token);
  return response.data;
}

export async function register(email, password, passwordConfirmation) {
  const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/register`, {
    user: { email, password, password_confirmation: passwordConfirmation }
  });
  const token = response.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token) localStorage.setItem("pulsewatch_token", token);
  return response.data;
}

export function logout() {
  localStorage.removeItem("pulsewatch_token");
}

export default api;
