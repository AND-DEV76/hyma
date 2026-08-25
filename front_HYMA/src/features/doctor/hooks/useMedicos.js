import { useState, useEffect, useCallback } from 'react';
import {
  getMedicos,
  getUsuariosMedicos,
  createMedico,
  updateMedico,
  deleteMedico
} from '../services/medicoService';

export const useMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [usuariosMedicos, setUsuariosMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listaMedicos, listaUsuarios] = await Promise.all([
        getMedicos(),
        getUsuariosMedicos()
      ]);
      setMedicos(listaMedicos);
      setUsuariosMedicos(listaUsuarios);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const handleCreate = async (data) => {
    try {
      await createMedico(data);
      await fetchDatos();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el médico.';
      return { success: false, error: msg };
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateMedico(id, data);
      await fetchDatos();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar el médico.';
      return { success: false, error: msg };
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro de médico?')) return;
    try {
      await deleteMedico(id);
      await fetchDatos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el médico.');
    }
  };

  return {
    medicos,
    usuariosMedicos,
    loading,
    error,
    createMedico: handleCreate,
    updateMedico: handleUpdate,
    deleteMedico: handleDelete,
    refresh: fetchDatos
  };
};