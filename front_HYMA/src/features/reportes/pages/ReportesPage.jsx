import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Search,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Filter,
  Layers,
  Settings,
  Activity,
  ArrowRight
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import reporteService from '../services/reporteService';
import tarifaService from '../services/tarifaService';
import '../styles/reportes.css';

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export default function ReportesPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const [activeTab, setActiveTab] = useState('estadistica');

  // Estados reporte
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [filtroSoloAtendidos, setFiltroSoloAtendidos] = useState(false);
  const [searchDiag, setSearchDiag] = useState('');

  // Estados tarifas
  const [precioConsulta, setPrecioConsulta] = useState('');
  const [tarifas, setTarifas] = useState([]);
  const [loadingTarifas, setLoadingTarifas] = useState(false);
  const [savingTarifa, setSavingTarifa] = useState(false);
  const [tarifaSuccess, setTarifaSuccess] = useState('');
  const [tarifaError, setTarifaError] = useState('');

  const cargarReporte = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reporteService.obtenerEstadisticaMensual(selectedYear, selectedMonth);
      setData(res);
    } catch (err) {
      console.error('Error al cargar reporte mensual:', err);
      const serverMsg = err.response?.data?.message || err.message;
      setError(serverMsg ? `Error al cargar estadística: ${serverMsg}` : 'No se pudo cargar la estadística mensual. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const cargarTarifas = async () => {
    setLoadingTarifas(true);
    setTarifaError('');
    try {
      const [precioRes, todasRes] = await Promise.all([
        tarifaService.obtenerPrecioConsultaGeneral(),
        tarifaService.listarTodas()
      ]);
      setPrecioConsulta(precioRes?.precio ?? 50.0);
      setTarifas(todasRes || []);
    } catch (err) {
      console.error('Error al cargar tarifas:', err);
      setTarifaError('No se pudieron cargar las tarifas de consulta.');
    } finally {
      setLoadingTarifas(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (activeTab === 'tarifas') {
      cargarTarifas();
    }
  }, [activeTab]);

  const handleDescargarExcel = async () => {
    setDownloading(true);
    try {
      await reporteService.descargarExcelEstadisticaMensual(selectedYear, selectedMonth);
    } catch (err) {
      console.error('Error descargando Excel:', err);
      alert('Error al descargar el archivo Excel.');
    } finally {
      setDownloading(false);
    }
  };

  const handleGuardarPrecioConsulta = async (e) => {
    e.preventDefault();
    setSavingTarifa(true);
    setTarifaSuccess('');
    setTarifaError('');
    try {
      const num = parseFloat(precioConsulta);
      if (isNaN(num) || num < 0) {
        throw new Error('Ingrese un precio válido mayor o igual a 0');
      }
      await tarifaService.actualizarPrecioConsultaGeneral(num);
      setTarifaSuccess(`¡Tarifa de Consulta General actualizada a Q ${num.toFixed(2)} exitosamente!`);
      await cargarTarifas();
      // Recargar reporte para reflejar si corresponde
      cargarReporte();
    } catch (err) {
      setTarifaError(err.message || 'Error al actualizar la tarifa.');
    } finally {
      setSavingTarifa(false);
    }
  };

  // Filtrado de filas (todos los días vs solo con atención)
  const filasFiltradas = useMemo(() => {
    if (!data || !data.filas) return [];
    if (!filtroSoloAtendidos) return data.filas;
    return data.filas.filter((f) => f.diasAtencion > 0);
  }, [data, filtroSoloAtendidos]);

  // Filtrado de columnas diagnósticas
  const columnasDiagnosticosFiltradas = useMemo(() => {
    if (!data || !data.columnasDiagnosticos) return [];
    if (!searchDiag.trim()) return data.columnasDiagnosticos;
    const term = searchDiag.toLowerCase();
    return data.columnasDiagnosticos.filter(
      (c) =>
        c.nombre.toLowerCase().includes(term) ||
        c.categoria.toLowerCase().includes(term)
    );
  }, [data, searchDiag]);

  // Helpers de Categorías
  const getCatHeaderClass = (categoria) => {
    switch (categoria) {
      case 'INFECCIOSOS':
        return 'cat-header-infecciosos';
      case 'CRONICOS':
        return 'cat-header-cronicos';
      case 'GINECOLOGICO':
        return 'cat-header-ginecologico';
      case 'NUTRICIONAL':
        return 'cat-header-nutricional';
      default:
        return 'cat-header-otros';
    }
  };

  const formatearMoneda = (val) => {
    const num = Number(val) || 0;
    return `Q ${num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="reportes-container">
      <AdminNavbar />

      <main className="reportes-content">
        {/* Header principal */}
        <div className="reportes-header">
          <div className="reportes-header-info">
            <h1>
              <FileSpreadsheet size={26} className="text-blue-600" />
              Estadística Mensual y Reportes
            </h1>
            <p>
              Obras Sociales San Martín • Matriz de morbilidad, grupos de edades y recaudación
            </p>
          </div>

          <div className="reportes-header-actions">
            {/* Selectores de Período */}
            <div className="selector-mes-anio">
              <Calendar size={18} className="text-slate-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Descargar Excel */}
            <button
              className="btn-excel"
              onClick={handleDescargarExcel}
              disabled={downloading || loading || !data}
              title="Descargar matriz en formato Excel .xlsx oficial"
            >
              <Download size={18} />
              {downloading ? 'Generando Excel...' : 'Descargar Excel (.xlsx)'}
            </button>

            {/* Refrescar */}
            <button
              className="btn-refresh"
              onClick={cargarReporte}
              disabled={loading}
              title="Recargar datos"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="reportes-tabs">
          <button
            className={`tab-btn ${activeTab === 'estadistica' ? 'active' : ''}`}
            onClick={() => setActiveTab('estadistica')}
          >
            <Layers size={18} />
            Estadística Mensual (Matriz 52 Diagnósticos)
          </button>
          <button
            className={`tab-btn ${activeTab === 'tarifas' ? 'active' : ''}`}
            onClick={() => setActiveTab('tarifas')}
          >
            <Settings size={18} />
            Tarifas de Consulta (Precio Q)
          </button>
        </div>

        {/* TAB 1: ESTADÍSTICA MENSUAL */}
        {activeTab === 'estadistica' && (
          <>
            {/* KPI Cards */}
            {data && data.totales && (
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon bg-blue-100 text-blue-600">
                    <Users size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-label">Total Pacientes</div>
                    <div className="kpi-val">{data.totales.totalPacientes}</div>
                    <div className="kpi-sub">
                      {data.totales.nuevos} Nuevos • {data.totales.reconsulta} Re-consultas
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-emerald-100 text-emerald-600">
                    <DollarSign size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-label">Total Recaudado</div>
                    <div className="kpi-val">{formatearMoneda(data.totales.totalRecaudado)}</div>
                    <div className="kpi-sub">
                      Promedio diario: {formatearMoneda(data.promedios.totalRecaudado)}
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-purple-100 text-purple-600">
                    <Calendar size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-label">Días con Atención</div>
                    <div className="kpi-val">{data.totales.totalDiasAtencion} días</div>
                    <div className="kpi-sub">
                      Promedio: {data.promedios.totalPacientes} pacientes / día
                    </div>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-amber-100 text-amber-600">
                    <TrendingUp size={24} />
                  </div>
                  <div className="kpi-info">
                    <div className="kpi-label">Distribución Género</div>
                    <div className="kpi-val">
                      {data.totales.femenino} F / {data.totales.masculino} M
                    </div>
                    <div className="kpi-sub">
                      F: {data.totales.totalPacientes > 0 ? Math.round((data.totales.femenino / data.totales.totalPacientes) * 100) : 0}% • M: {data.totales.totalPacientes > 0 ? Math.round((data.totales.masculino / data.totales.totalPacientes) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Barra de control de la tabla */}
            <div className="table-control-bar">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={filtroSoloAtendidos}
                    onChange={(e) => setFiltroSoloAtendidos(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Mostrar solo días con atención</span>
                </label>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-500">
                  Mostrando {filasFiltradas.length} fila(s)
                </span>
              </div>

              <div className="search-diag">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Buscar columna de diagnóstico..."
                  value={searchDiag}
                  onChange={(e) => setSearchDiag(e.target.value)}
                />
              </div>
            </div>

            {/* Tabla Matricial */}
            <div className="table-wrapper">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-blue-600" />
                  <p>Cargando matriz estadística mensual...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-600">
                  <AlertCircle size={28} className="mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : !data ? null : (
                <table className="matrix-table">
                  <thead>
                    {/* Fila superior 1: Títulos de Bloques */}
                    <tr>
                      <th rowSpan={2} className="sticky-col">FECHA</th>
                      <th rowSpan={2}>DÍAS</th>
                      <th colSpan={3}>No DE PACIENTES</th>
                      <th colSpan={6}>GRUPO DE EDADES</th>
                      <th colSpan={3}>GÉNERO</th>
                      <th rowSpan={2}>TOTAL RECAUDADO</th>

                      {/* Grupos de diagnósticos si no hay filtro de búsqueda */}
                      {!searchDiag && (
                        <>
                          <th colSpan={11} className="cat-header-infecciosos">INFECCIOSOS</th>
                          <th colSpan={6} className="cat-header-cronicos">CRÓNICOS</th>
                          <th colSpan={4} className="cat-header-ginecologico">GINECOLÓGICO</th>
                          <th colSpan={10} className="cat-header-nutricional">NUTRICIONAL</th>
                          <th colSpan={21} className="cat-header-otros">OTROS</th>
                        </>
                      )}

                      {searchDiag && (
                        <th colSpan={columnasDiagnosticosFiltradas.length} className="bg-slate-800 text-white">
                          DIAGNÓSTICOS FILTRADOS ({columnasDiagnosticosFiltradas.length})
                        </th>
                      )}
                    </tr>

                    {/* Fila superior 2: Sub-encabezados */}
                    <tr>
                      <th>NUEVOS</th>
                      <th>RE-CONSULTA</th>
                      <th className="cell-highlight">TOTAL</th>

                      <th>0-5</th>
                      <th>06-12</th>
                      <th>13-17</th>
                      <th>18-59</th>
                      <th>60-+</th>
                      <th className="cell-highlight">TOTAL</th>

                      <th>F</th>
                      <th>M</th>
                      <th className="cell-highlight">TOTAL</th>

                      {columnasDiagnosticosFiltradas.map((col) => (
                        <th
                          key={col.indice}
                          title={`${col.categoria}: ${col.nombre}`}
                          className={getCatHeaderClass(col.categoria)}
                        >
                          {col.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filasFiltradas.map((f) => {
                      const isEmpty = f.diasAtencion === 0;
                      return (
                        <tr key={f.fecha} className={isEmpty ? 'row-empty' : ''}>
                          <td className={`sticky-col ${isEmpty ? 'text-slate-400' : 'font-semibold'}`}>
                            {f.fecha}
                          </td>
                          <td className={f.diasAtencion > 0 ? 'cell-active' : 'cell-zero'}>
                            {f.diasAtencion > 0 ? 1 : 0}
                          </td>
                          <td className={f.nuevos > 0 ? 'cell-active' : 'cell-zero'}>{f.nuevos}</td>
                          <td className={f.reconsulta > 0 ? 'cell-active' : 'cell-zero'}>{f.reconsulta}</td>
                          <td className={f.totalPacientes > 0 ? 'cell-highlight' : 'cell-zero'}>
                            {f.totalPacientes}
                          </td>

                          <td className={f.edad0a5 > 0 ? 'cell-active' : 'cell-zero'}>{f.edad0a5}</td>
                          <td className={f.edad6a12 > 0 ? 'cell-active' : 'cell-zero'}>{f.edad6a12}</td>
                          <td className={f.edad13a17 > 0 ? 'cell-active' : 'cell-zero'}>{f.edad13a17}</td>
                          <td className={f.edad18a59 > 0 ? 'cell-active' : 'cell-zero'}>{f.edad18a59}</td>
                          <td className={f.edad60mas > 0 ? 'cell-active' : 'cell-zero'}>{f.edad60mas}</td>
                          <td className={f.totalEdades > 0 ? 'cell-highlight' : 'cell-zero'}>
                            {f.totalEdades}
                          </td>

                          <td className={f.femenino > 0 ? 'cell-active' : 'cell-zero'}>{f.femenino}</td>
                          <td className={f.masculino > 0 ? 'cell-active' : 'cell-zero'}>{f.masculino}</td>
                          <td className={f.totalGenero > 0 ? 'cell-highlight' : 'cell-zero'}>
                            {f.totalGenero}
                          </td>

                          <td className="cell-currency">
                            {formatearMoneda(f.totalRecaudado)}
                          </td>

                          {columnasDiagnosticosFiltradas.map((col) => {
                            const val = f.diagnosticos?.[col.indice] ?? 0;
                            return (
                              <td
                                key={col.indice}
                                className={val > 0 ? 'cell-active font-bold bg-blue-50/50' : 'cell-zero'}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>

                  <tfoot>
                    {/* Fila TOTALES */}
                    <tr className="row-totales">
                      <td className="sticky-col font-bold">TOTALES</td>
                      <td>{data.totales.totalDiasAtencion}</td>
                      <td>{data.totales.nuevos}</td>
                      <td>{data.totales.reconsulta}</td>
                      <td>{data.totales.totalPacientes}</td>

                      <td>{data.totales.edad0a5}</td>
                      <td>{data.totales.edad6a12}</td>
                      <td>{data.totales.edad13a17}</td>
                      <td>{data.totales.edad18a59}</td>
                      <td>{data.totales.edad60mas}</td>
                      <td>{data.totales.totalEdades}</td>

                      <td>{data.totales.femenino}</td>
                      <td>{data.totales.masculino}</td>
                      <td>{data.totales.totalGenero}</td>

                      <td className="cell-currency">{formatearMoneda(data.totales.totalRecaudado)}</td>

                      {columnasDiagnosticosFiltradas.map((col) => {
                        const val = data.totales.diagnosticos?.[col.indice] ?? 0;
                        return (
                          <td key={col.indice} className="font-bold">
                            {val}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Fila PROMEDIO */}
                    <tr className="row-promedio">
                      <td className="sticky-col font-bold">PROMEDIO</td>
                      <td>{data.promedios.totalDiasAtencion}</td>
                      <td>{data.promedios.nuevos}</td>
                      <td>{data.promedios.reconsulta}</td>
                      <td>{data.promedios.totalPacientes}</td>

                      <td>{data.promedios.edad0a5}</td>
                      <td>{data.promedios.edad6a12}</td>
                      <td>{data.promedios.edad13a17}</td>
                      <td>{data.promedios.edad18a59}</td>
                      <td>{data.promedios.edad60mas}</td>
                      <td>{data.promedios.totalEdades}</td>

                      <td>{data.promedios.femenino}</td>
                      <td>{data.promedios.masculino}</td>
                      <td>{data.promedios.totalGenero}</td>

                      <td className="cell-currency">{formatearMoneda(data.promedios.totalRecaudado)}</td>

                      {columnasDiagnosticosFiltradas.map((col) => {
                        const val = data.promedios.diagnosticos?.[col.indice] ?? 0;
                        return (
                          <td key={col.indice} className="font-semibold">
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </>
        )}

        {/* TAB 2: CONFIGURACIÓN DE TARIFAS */}
        {activeTab === 'tarifas' && (
          <div className="tarifa-view-card">
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={24} />
              Configuración de Precio de Consulta Médica
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Este valor corresponde a la tarifa que se registra automáticamente en cada consulta médica finalizada y suma al reporte de recaudación mensual.
            </p>

            <div className="tarifa-hero-price">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                  Tarifa Vigente Actual
                </span>
                <h3 className="text-lg font-bold text-slate-800">Consulta Médica General</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aplicada a todas las atenciones médicas finalizadas en el sistema
                </p>
              </div>

              <div className="price-badge">
                Q {Number(precioConsulta || 50).toFixed(2)}
              </div>
            </div>

            <form onSubmit={handleGuardarPrecioConsulta}>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Modificar Tarifa de Consulta General (Quetzales)
              </label>
              <div className="tarifa-input-group">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    Q
                  </span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={precioConsulta}
                    onChange={(e) => setPrecioConsulta(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingTarifa || loadingTarifas}
                >
                  {savingTarifa ? 'Guardando...' : 'Guardar Nueva Tarifa'}
                </button>
              </div>
            </form>

            {tarifaSuccess && (
              <div className="alert-toast success">
                <CheckCircle2 size={18} />
                <span>{tarifaSuccess}</span>
              </div>
            )}

            {tarifaError && (
              <div className="alert-toast error">
                <AlertCircle size={18} />
                <span>{tarifaError}</span>
              </div>
            )}

            {/* Listado de tarifas activas */}
            {tarifas && tarifas.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Registro de Tarifas en Base de Datos (tarifa_servicio)
                </h4>
                <div className="space-y-2">
                  {tarifas.map((t) => (
                    <div
                      key={t.idTarifa || t.nombre}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm"
                    >
                      <div className="font-semibold text-slate-800">{t.nombre}</div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-emerald-700">
                          Q {Number(t.precio).toFixed(2)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            t.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {t.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
