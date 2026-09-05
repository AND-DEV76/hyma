import { useState, useCallback } from 'react';
import * as diagService from '../services/diagnosticoService';

export const useDiagnosticos = () => {
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Categorías
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [errorCategorias, setErrorCategorias] = useState(null);

  const cargarDatos = useCallback(async (buscar = '', idCategoria = null, page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await diagService.listarCie10(buscar, idCategoria, page);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar diagnósticos');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    setLoadingCategorias(true);
    setErrorCategorias(null);
    try {
      const res = await diagService.listarCategoriasDiagnostico();
      setCategorias(res || []);
    } catch (err) {
      setErrorCategorias(err.response?.data?.message || 'Error al cargar categorías');
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  const crear = async (payload) => {
    try {
      await diagService.crearCie10(payload);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al crear diagnóstico' };
    }
  };

  const actualizar = async (id, payload) => {
    try {
      await diagService.actualizarCie10(id, payload);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al actualizar diagnóstico' };
    }
  };

  const eliminar = async (id) => {
    try {
      await diagService.eliminarCie10(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al eliminar diagnóstico' };
    }
  };

  const crearCategoria = async (payload) => {
    try {
      const res = await diagService.crearCategoriaDiagnostico(payload);
      await cargarCategorias();
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al crear categoría' };
    }
  };

  const actualizarCategoria = async (id, payload) => {
    try {
      const res = await diagService.actualizarCategoriaDiagnostico(id, payload);
      await cargarCategorias();
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al actualizar categoría' };
    }
  };

  const eliminarCategoria = async (id) => {
    try {
      await diagService.eliminarCategoriaDiagnostico(id);
      await cargarCategorias();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al eliminar categoría' };
    }
  };

  return {
    data,
    loading,
    error,
    cargarDatos,
    crear,
    actualizar,
    eliminar,
    categorias,
    loadingCategorias,
    errorCategorias,
    cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  };
};
