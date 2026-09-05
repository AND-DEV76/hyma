import { useState, useCallback } from 'react';
import * as preconsultaService from '../services/preconsultaService';
import { obtenerCola } from '../../recepcion/services/recepcionService';

/**
 * Hook para la gestión integral de la toma de Signos Vitales y flujo de Preconsulta.
 */
export const usePreconsulta = () => {
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [colaPreconsulta, setColaPreconsulta] = useState([]);
  const [colaPendiente, setColaPendiente] = useState([]);
  const [ultimoSigno, setUltimoSigno] = useState(null);

  /**
   * Carga las colas de atención relevantes para la enfermera (EN_PRECONSULTA y PENDIENTE).
   */
  const cargarColas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [preconsultaData, pendienteData] = await Promise.all([
        obtenerCola('EN_PRECONSULTA'),
        obtenerCola('PENDIENTE'),
      ]);
      setColaPreconsulta(preconsultaData);
      setColaPendiente(pendienteData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la cola de preconsulta');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Inicia el proceso de preconsulta para un turno en cola.
   */
  const atenderTurno = async (idCola) => {
    try {
      const colaActualizada = await preconsultaService.iniciarPreconsulta(idCola);
      await cargarColas();
      return { success: true, data: colaActualizada };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar la preconsulta';
      return { success: false, error: msg };
    }
  };

  /**
   * Registra los signos vitales y transiciona el turno a EN_CONSULTA.
   */
  const guardarSignos = async (payload) => {
    setGuardando(true);
    setError(null);
    try {
      const data = await preconsultaService.registrarSignosVitales(payload);
      return { success: true, data };
    } catch (err) {
      const msg =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(', ')
          : err.response?.data?.message || 'Error al guardar los signos vitales';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Carga el último registro de signos vitales para comparar con mediciones previas.
   */
  const cargarUltimoSigno = useCallback(async (idPaciente) => {
    if (!idPaciente) return;
    try {
      const data = await preconsultaService.obtenerUltimosSignosVitales(idPaciente);
      setUltimoSigno(data);
    } catch {
      setUltimoSigno(null);
    }
  }, []);

  /**
   * Calcula el Índice de Masa Corporal e interpretación diagnóstica en tiempo real.
   */
  const calcularIMC = (pesoKg, tallaCm) => {
    const peso = parseFloat(pesoKg);
    const talla = parseFloat(tallaCm);

    if (!peso || !talla || peso <= 0 || talla <= 0) {
      return { imc: null, texto: '—', color: '#64748b' };
    }

    const tallaM = talla > 3 ? talla / 100 : talla;
    const imcValor = Number((peso / (tallaM * tallaM)).toFixed(2));

    if (imcValor < 18.5) return { imc: imcValor, texto: 'Bajo peso', color: '#0284c7' };
    if (imcValor < 25.0) return { imc: imcValor, texto: 'Normal', color: '#16a34a' };
    if (imcValor < 30.0) return { imc: imcValor, texto: 'Sobrepeso', color: '#d97706' };
    if (imcValor < 35.0) return { imc: imcValor, texto: 'Obesidad Grado I', color: '#ea580c' };
    if (imcValor < 40.0) return { imc: imcValor, texto: 'Obesidad Grado II', color: '#dc2626' };
    return { imc: imcValor, texto: 'Obesidad Grado III', color: '#991b1b' };
  };

  /**
   * Cancela un turno de la cola de preconsulta pasando el estado a CANCELADO.
   */
  const cancelarTurno = async (idCola) => {
    setLoading(true);
    setError(null);
    try {
      await preconsultaService.cancelarTurnoPreconsulta(idCola);
      await cargarColas();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cancelar el turno de preconsulta';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    colaPreconsulta,
    colaPendiente,
    ultimoSigno,
    loading,
    guardando,
    error,
    cargarColas,
    atenderTurno,
    cancelarTurno,
    guardarSignos,
    cargarUltimoSigno,
    calcularIMC,
  };
};
