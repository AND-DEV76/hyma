import { useState } from 'react';
import { loginService } from '../services/authService';

/**
 * Hook personalizado para la gestión de autenticación y sesión del usuario.
 * Proporciona métodos para iniciar y cerrar sesión, además de estados de carga y error.
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Inicia sesión enviando credenciales al backend,
   * y persiste tanto el token JWT como los datos del usuario en localStorage.
   */
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginService(username, password);
      
      // Guardar token JWT y datos de usuario en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.usuario) {
        localStorage.setItem('user', JSON.stringify(data.usuario));
      }

      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión eliminando el token y los datos de usuario de localStorage.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Obtiene el usuario autenticado actualmente desde localStorage.
   */
  const getUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  /**
   * Verifica si existe una sesión activa con token.
   */
  const isAuthenticated = () => {
    return Boolean(localStorage.getItem('token'));
  };

  return {
    login,
    logout,
    getUser,
    isAuthenticated,
    loading,
    error
  };
};