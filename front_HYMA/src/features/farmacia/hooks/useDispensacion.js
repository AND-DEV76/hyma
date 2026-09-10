import { useState, useCallback } from 'react';
import * as dispensacionService from '../services/dispensacionService';

export const useDispensacion = () => {
  const [loading, setLoading] = useState(false);
  const [entregando, setEntregando] = useState(false);
  const [error, setError] = useState(null);
  const [cola, setCola] = useState([]);
  const [receta, setReceta] = useState(null);

  const cargarCola = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dispensacionService.obtenerColaDispensacion();
      setCola(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la cola de farmacia');
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarReceta = useCallback(async (idCola, idPaciente) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dispensacionService.obtenerRecetaDispensacion(idCola, idPaciente);
      setReceta(data);
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar la receta médica';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const entregarMedicamentos = async (idCola) => {
    setEntregando(true);
    setError(null);
    try {
      const res = await dispensacionService.entregarMedicamentos(idCola);
      return { success: true, data: res };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al entregar los medicamentos';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setEntregando(false);
    }
  };

  const cancelarTurno = async (idCola) => {
    setLoading(true);
    setError(null);
    try {
      await dispensacionService.cancelarTurnoDispensacion(idCola);
      await cargarCola();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cancelar el turno';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    cola,
    receta,
    loading,
    entregando,
    error,
    cargarCola,
    cargarReceta,
    entregarMedicamentos,
    cancelarTurno,
  };
};
