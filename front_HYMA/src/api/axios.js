import axios from 'axios';

/**
 * Instancia centralizada de Axios para la comunicación con la API Backend (Spring Boot).
 * Incluye la URL base configurada en .env y maneja automáticamente la inyección del JWT.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Interceptor de Solicitudes (Request):
 * Inyecta automáticamente el token JWT en la cabecera 'Authorization: Bearer <token>'
 * si el usuario ha iniciado sesión previamente.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuestas (Response):
 * Detecta respuestas 401 (No autorizado / Token expirado o inválido),
 * limpia la sesión local y redirige al usuario a la pantalla de login.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si la URL que falló no era el propio login, limpiar sesión y redirigir
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;