import { useState, useEffect, useCallback } from 'react';
import { getUsuarios, createUsuario, updateUsuario, toggleEstadoUsuario, deleteUsuario } from '../services/usuarioService';

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

  const toggleEstado = async (id, nuevoEstado) => {
    // Actualización optimista inmediata en la UI
    setUsuarios((prev) =>
      prev.map((u) => (u.idUsuario === id ? { ...u, estado: nuevoEstado } : u))
    );
    try {
      await toggleEstadoUsuario(id, nuevoEstado);
    } catch (err) {
      // Revertir en caso de error
      await fetchUsuarios();
      throw err;
    }
  };

  const removeUsuario = async (id) => {
    await deleteUsuario(id);
    await fetchUsuarios();
  };

  return { usuarios, loading, error, refetch: fetchUsuarios, addUsuario, editUsuario, toggleEstado, removeUsuario };
};