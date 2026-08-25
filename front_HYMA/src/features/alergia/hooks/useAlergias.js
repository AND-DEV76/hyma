import { useState, useEffect, useCallback } from 'react';
import * as alergiaApi from '../api/alergiaApi';

export const useAlergias = () => {
  const [alergias, setAlergias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlergias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alergiaApi.getAlergias();
      setAlergias(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las alergias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlergias();
  }, [fetchAlergias]);

  const agregarAlergia = async (alergia) => {
    try {
      const nueva = await alergiaApi.createAlergia(alergia);
      setAlergias((prev) => [...prev, nueva]);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.errors?.nombre || err.response?.data?.message || 'Error al guardar';
      return { success: false, error: msg };
    }
  };

  const editarAlergia = async (id, alergia) => {
    try {
      const actualizada = await alergiaApi.updateAlergia(id, alergia);
      setAlergias((prev) => prev.map((item) => (item.idAlergia === id ? actualizada : item)));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.errors?.nombre || err.response?.data?.message || 'Error al actualizar';
      return { success: false, error: msg };
    }
  };

  const borrarAlergia = async (id) => {
    try {
      await alergiaApi.deleteAlergia(id);
      setAlergias((prev) => prev.filter((item) => item.idAlergia !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  return {
    alergias,
    loading,
    error,
    agregarAlergia,
    editarAlergia,
    borrarAlergia,
    fetchAlergias
  };
};