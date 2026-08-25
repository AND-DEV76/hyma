import { useState, useEffect, useCallback } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/usuarioService';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const addUsuario = async (data) => {
    await createUsuario(data);
    await fetchUsuarios();
  };

  const editUsuario = async (id, data) => {
    await updateUsuario(id, data);
    await fetchUsuarios();
  };

  const removeUsuario = async (id) => {
    await deleteUsuario(id);
    await fetchUsuarios();
  };

  return { usuarios, loading, error, refetch: fetchUsuarios, addUsuario, editUsuario, removeUsuario };
};