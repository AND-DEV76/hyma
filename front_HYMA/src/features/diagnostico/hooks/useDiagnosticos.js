import { useState, useCallback } from 'react';
import * as diagService from '../services/diagnosticoService';

export const useDiagnosticos = () => {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async (buscar = '', page = 0) => {
    setLoading(true); setError(null);
    try {
      const res = await diagService.listarCie10(buscar, page);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar diagnósticos');
    } finally {
      setLoading(false);
    }
  }, []);

  const crear = async (payload) => {
    try {
      await diagService.crearCie10(payload);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const actualizar = async (id, payload) => {
    try {
      await diagService.actualizarCie10(id, payload);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const eliminar = async (id) => {
    try {
      await diagService.eliminarCie10(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  return { data, loading, error, cargarDatos, crear, actualizar, eliminar };
};
