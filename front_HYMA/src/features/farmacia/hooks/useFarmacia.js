import { useCallback, useEffect, useState } from 'react';
import {
  actualizarCategoria,
  actualizarCasaFarmaceutica,
  crearCategoria,
  crearCasaFarmaceutica,
  eliminarCategoria,
  eliminarCasaFarmaceutica,
  listarCategorias,
  listarCasasFarmaceuticas,
} from '../services/catalogoService';
import {
  actualizarMedicamento,
  crearMedicamento,
  listarMedicamentos,
} from '../services/medicamentoService';
import { listarLotes } from '../services/loteService';
import { listarEntradas, registrarEntrada } from '../services/entradaService';
import { obtenerDashboardFarmacia } from '../services/dashboardService';
import { actualizarParametro, listarParametros } from '../services/parametroService';

export const useFarmacia = () => {
  const [dashboard, setDashboard] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [casas, setCasas] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [parametros, setParametros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const messageFromError = (err) => (
    err.response?.data?.message || 'No se pudo completar la operación.'
  );

  const cargarCatalogos = useCallback(async () => {
    const [categoriasData, casasData, medicamentosData] = await Promise.all([
      listarCategorias(),
      listarCasasFarmaceuticas(),
      listarMedicamentos(),
    ]);
    setCategorias(categoriasData);
    setCasas(casasData);
    setMedicamentos(medicamentosData);
  }, []);

  const cargarInventario = useCallback(async () => {
    const [dashboardData, lotesData, entradasData, parametrosData] = await Promise.all([
      obtenerDashboardFarmacia(),
      listarLotes({ estado: 'ACTIVO' }),
      listarEntradas(),
      listarParametros(),
    ]);
    setDashboard(dashboardData);
    setLotes(lotesData);
    setEntradas(entradasData);
    setParametros(parametrosData);
  }, []);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([cargarCatalogos(), cargarInventario()]);
    } catch (err) {
      setError(messageFromError(err));
    } finally {
      setLoading(false);
    }
  }, [cargarCatalogos, cargarInventario]);

  useEffect(() => {
    // La carga inicial sincroniza el estado con las APIs del módulo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTodo();
  }, [cargarTodo]);

  const ejecutar = async (operation, refresh = cargarTodo) => {
    setError('');
    try {
      const result = await operation();
      await refresh();
      return { success: true, data: result };
    } catch (err) {
      const message = messageFromError(err);
      setError(message);
      return { success: false, error: message };
    }
  };

  return {
    dashboard,
    categorias,
    casas,
    medicamentos,
    lotes,
    entradas,
    parametros,
    loading,
    error,
    refresh: cargarTodo,
    guardarCategoria: (id, data) => ejecutar(
      () => id ? actualizarCategoria(id, data) : crearCategoria(data),
      cargarCatalogos
    ),
    borrarCategoria: (id) => ejecutar(
      () => eliminarCategoria(id),
      cargarCatalogos
    ),
    guardarCasa: (id, data) => ejecutar(
      () => id ? actualizarCasaFarmaceutica(id, data) : crearCasaFarmaceutica(data),
      cargarCatalogos
    ),
    borrarCasa: (id) => ejecutar(
      () => eliminarCasaFarmaceutica(id),
      cargarCatalogos
    ),
    guardarMedicamento: (id, data) => ejecutar(
      () => id ? actualizarMedicamento(id, data) : crearMedicamento(data),
      cargarCatalogos
    ),
    guardarEntrada: (data) => ejecutar(
      () => registrarEntrada(data),
      cargarInventario
    ),
    actualizarParametro: (clave, data) => ejecutar(
      () => actualizarParametro(clave, data),
      cargarInventario
    ),
  };
};
