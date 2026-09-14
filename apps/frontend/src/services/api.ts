import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
  withCredentials: true, // Garante o envio automático de cookies HttpOnly
});

// Interceptor para capturar respostas não autorizadas (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 em /auth/me é o comportamento padrão quando o visitante ainda não fez login
    if (error.response && error.response.status === 401) {
      if (!error.config?.url?.includes('/auth/me')) {
        console.warn('Sessão expirada ou não autorizada.');
      }
    }
    return Promise.reject(error);
  }
);
