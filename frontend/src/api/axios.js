import axios from "axios";

// Detectamos si estamos en desarrollo o producción
const isDev = import.meta.env.MODE === "development";

// Prioridad: 1) VITE_API_URL, 2) localhost (dev), 3) Render (prod)
const RAW = (
  import.meta.env.VITE_API_URL ||
  (isDev ? "http://localhost:5000" : "https://skylog-api.onrender.com")
).trim();

// Normalizamos:
// - si te pasan .../api o .../api/ lo quitamos
// - quitamos el último slash
const BASE = RAW.replace(/\/api\/?$/, "").replace(/\/$/, "");

// ✅ URL final efectiva del axios
export const API_BASE_URL = `${BASE}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ─────────────────────────────────────────────────────────────
   Helpers token
───────────────────────────────────────────────────────────── */
const getTokenFromStorage = () => {
  // 1) session user
  const savedUserSession = sessionStorage.getItem("user");
  if (savedUserSession) {
    try {
      const parsed = JSON.parse(savedUserSession);
      if (parsed?.token) return parsed.token;
    } catch (e) {
      console.error("Error al parsear user en sessionStorage", e);
    }
  }

  // 2) local user (por si en otro lado lo guardaste ahí)
  const savedUserLocal = localStorage.getItem("user");
  if (savedUserLocal) {
    try {
      const parsed = JSON.parse(savedUserLocal);
      if (parsed?.token) return parsed.token;
    } catch (e) {
      console.error("Error al parsear user en localStorage", e);
    }
  }

  // 3) token plano (fallback)
  return sessionStorage.getItem("token") || localStorage.getItem("token") || "";
};

const cleanToken = (token) => {
  if (!token) return "";
  // Limpieza profunda: quita comillas y prefijo Bearer si viene incluido
  return token
    .toString()
    .trim()
    .replace(/['"]+/g, "")
    .replace(/^Bearer\s+/i, "");
};

// INTERCEPTOR REQUEST: Agrega el token de forma segura
api.interceptors.request.use(
  (config) => {
    const token = cleanToken(getTokenFromStorage());
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR RESPONSE: Manejo de errores de sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Si el servidor dice 401 (No autorizado), limpiamos y mandamos al Login
    if (status === 401 && !window.location.pathname.includes("/login")) {
      sessionStorage.clear();
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default api;
