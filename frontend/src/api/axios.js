import axios from "axios";

// Detectamos si estamos en desarrollo o producción
const isDev = import.meta.env.MODE === "development";

// Prioridad: 1. Variable de entorno, 2. Localhost (si es dev), 3. Render (si es prod)
const RAW = import.meta.env.VITE_API_URL || (isDev ? "http://localhost:5000" : "https://skylog-api.onrender.com");

const BASE = RAW.replace(/\/api\/?$/, "").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 15000, // 15 segundos es suficiente
});

// INTERCEPTOR REQUEST: Agrega el token de forma segura
api.interceptors.request.use(
  (config) => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      try {
        const { token } = JSON.parse(savedUser);
        if (token) {
          // Limpieza profunda del token para evitar comillas extra
          const cleanToken = token.trim().replace(/['"]+/g, "");
          config.headers = config.headers ?? {};
          config.headers["Authorization"] = `Bearer ${cleanToken}`;
        }
      } catch (e) {
        console.error("Error al procesar token de sesión", e);
      }
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
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;