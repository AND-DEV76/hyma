import { useCallback, useEffect, useState } from 'react';

import {
  agregarACola,
  buscarPacientes,
  cambiarEstadoCola,
  crearPaciente,
  obtenerCola,
} from '../services/recepcionService';

export const useRecepcion = () => {
  const [pacientes, setPacientes] = useState([]);
  const [cola, setCola] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [cargandoPacientes, setCargandoPacientes] = useState(false);
  const [cargandoCola, setCargandoCola] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState('');

  // ==========================================================
  // CARGAR SOLAMENTE PACIENTES PENDIENTES
  // ==========================================================

  const cargarCola = useCallback(async () => {
    try {
      setCargandoCola(true);
      setError('');

      // IMPORTANTE:
      // Solo pedimos pacientes con estado PENDIENTE
      const data = await obtenerCola('PENDIENTE');

      setCola(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo cargar la cola de atención.'
      );
    } finally {
      setCargandoCola(false);
    }
  }, []);

  // ==========================================================
  // BUSCAR PACIENTES
  // ==========================================================

  const buscar = useCallback(async (texto) => {
    if (!texto.trim()) {
      setPacientes([]);
      return;
    }

    try {
      setCargandoPacientes(true);
      setError('');

      const data = await buscarPacientes(texto);

      setPacientes(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudieron buscar los pacientes.'
      );
    } finally {
      setCargandoPacientes(false);
    }
  }, []);

  // ==========================================================
  // AGREGAR PACIENTE EXISTENTE A LA COLA
  // ==========================================================

  const agregarPaciente = async (idPaciente, prioridad = 0) => {
    try {
      setGuardando(true);
      setError('');

      await agregarACola(idPaciente, prioridad);

      // Recargar solamente los PENDIENTES
      await cargarCola();

      setPacientes([]);

      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo agregar el paciente a la cola.'
      );

      return false;
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================================
  // CREAR PACIENTE Y AGREGARLO A LA COLA
  // ==========================================================

  const crearNuevoPaciente = async (datos) => {
    try {
      setGuardando(true);
      setError('');

      const paciente = await crearPaciente(datos);

      await agregarACola(paciente.idPaciente, 0);

      // Recargar solamente los PENDIENTES
      await cargarCola();

      return paciente;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo registrar el paciente.'
      );

      throw err;
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================================
  // QUITAR PACIENTE DE LA COLA
  // ==========================================================

  const quitarDeCola = async (idCola) => {
    try {
      setGuardando(true);
      setError('');

      // NO borramos el registro.
      // Lo marcamos como CANCELADO para conservar el historial.
      await cambiarEstadoCola(idCola, 'CANCELADO');

      // Al recargar, como solo buscamos PENDIENTE,
      // el paciente desaparecerá automáticamente.
      await cargarCola();

      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo quitar al paciente de la cola.'
      );

      return false;
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================================
  // CARGAR COLA AL ENTRAR A RECEPCIÓN
  // ==========================================================

  useEffect(() => {
    cargarCola();
  }, [cargarCola]);

  return {
    pacientes,
    cola,
    busqueda,
    setBusqueda,
    buscar,
    agregarPaciente,
    crearNuevoPaciente,
    quitarDeCola,
    cargarCola,
    cargandoPacientes,
    cargandoCola,
    guardando,
    error,
  };
};