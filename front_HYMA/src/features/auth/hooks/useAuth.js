import { useState } from 'react';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginService(username, password);
      // Guardar sesión básica en localStorage
      localStorage.setItem('user', JSON.stringify(data.usuario));
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
  };

  return { login, logout, loading, error };
};