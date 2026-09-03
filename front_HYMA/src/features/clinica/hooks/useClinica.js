import { useState, useCallback } from 'react';
import * as clinicaService from '../services/clinicaService';

export const useClinica = () => {
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [cola, setCola] = useState([]);

  const cargarCola = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clinicaService.obtenerColaConsulta();
      setCola(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la cola de consulta');
    } finally {
      setLoading(false);
    }
  }, []);

  const finalizarAtencion = async (payload) => {
    setGuardando(true);
    setError(null);
    try {
      const result = await clinicaService.finalizarConsulta(payload);
      return { success: true, data: result };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al finalizar la consulta';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setGuardando(false);
    }
  };

  return {
    cola, loading, guardando, error,
    cargarCola, finalizarAtencion
  };
};
