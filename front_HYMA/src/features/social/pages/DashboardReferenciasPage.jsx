import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  Calendar, 
  FileSpreadsheet,
  AlertCircle,
  Layers,
  TrendingUp,
  Stethoscope,
  Building2
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import socialService from '../services/socialService';
import '../styles/social.css';

export default function DashboardReferenciasPage() {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [anio, setAnio] = useState(currentDate.getFullYear());
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const meses = [
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
    { value: 12, label: 'Diciembre' }
  ];

  const anios = [
    currentDate.getFullYear() - 2,
    currentDate.getFullYear() - 1,
    currentDate.getFullYear(),
    currentDate.getFullYear() + 1
  ];

  useEffect(() => {
    cargarDashboard();
  }, [anio, mes]);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await socialService.getDashboard(anio, mes);
      setDashboardData(data);
    } catch (err) {
      console.error('Error al cargar dashboard de referencias:', err);
      setError('No se pudo cargar la información estadística de referencias.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const blob = await socialService.exportarExcelDashboard(anio, mes);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const mesNombre = meses.find(m => m.value === mes)?.label || `Mes_${mes}`;
      a.download = `Referencias_Medicas_${mesNombre}_${anio}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Error exportando a Excel:', err);
      alert('Error al generar el archivo Excel.');
    } finally {
      setExporting(false);
    }
  };

  const filas = dashboardData?.filas || [];
  const totalReferencias = dashboardData?.totalReferencias || 0;
  const mesActualNombre = meses.find(m => m.value === mes)?.label || '';

  // Especialidad con mayor número de referencias
  const topEspecialidad = filas.length > 0 
    ? [...filas].sort((a, b) => (Number(b.referencias) || 0) - (Number(a.referencias) || 0))[0]
    : null;

  // Preparar datos para el gráfico de barras verticales (incluyendo la barra final TOTAL)
  const chartItems = filas.length > 0 
    ? [...filas, { especialidad: 'TOTAL', referencias: totalReferencias, isTotal: true }]
    : [];

  // Configuración de escalas para el gráfico SVG
  const maxVal = totalReferencias > 0 ? totalReferencias : 5;
  const step = maxVal <= 10 ? 2 : maxVal <= 25 ? 5 : maxVal <= 50 ? 10 : Math.ceil(maxVal / 5);
  const yAxisMax = Math.ceil(maxVal / step) * step;
  const yTicks = [];
  for (let i = 0; i <= yAxisMax; i += step) {
    yTicks.push(i);
  }

  // Dimensiones del gráfico SVG
  const svgWidth = Math.max(700, chartItems.length * 56 + 110);
  const svgHeight = 390;
  const plotLeft = 60;
  const plotRight = svgWidth - 30;
  const plotTop = 55;
  const plotBottom = 265;
  const plotHeight = plotBottom - plotTop;
  const plotWidth = plotRight - plotLeft;

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="social-page-container">
        {/* Breadcrumb de navegación */}
        <Breadcrumb 
          items={[
            { label: 'Trabajo Social', to: '/social' },
            { label: 'Dashboard Referencias Médicas' }
          ]} 
          showHome={true} 
        />

        {/* HEADER BAR ELEGANTE */}
        <div className="social-header">
          <div className="social-header-title">
            <button 
              className="social-btn-back"
              onClick={() => navigate('/social')}
              title="Volver al portal de Trabajo Social"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1>Dashboard de Referencias Médicas</h1>
              <p className="social-subtitle">
                Estadísticas mensuales, concentrado por especialidad y exportación estructurada
              </p>
            </div>
          </div>

          {/* CONTROLES / FILTROS */}
          <div className="social-controls-wrapper">
            <div className="social-filter-group">
              <Calendar size={16} className="social-filter-icon" />
              <select 
                value={mes} 
                onChange={(e) => setMes(Number(e.target.value))}
                className="social-select"
              >
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select 
                value={anio} 
                onChange={(e) => setAnio(Number(e.target.value))}
                className="social-select"
              >
                {anios.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleExportExcel}
              disabled={exporting || loading || filas.length === 0}
              className="social-btn-excel"
              title="Exportar reporte y gráfico en hoja de Excel"
            >
              <FileSpreadsheet size={16} />
              <span>{exporting ? 'Generando Excel...' : 'Exportar Excel'}</span>
            </button>
          </div>
        </div>

        {/* TARJETAS KPI DE RESUMEN EJECUTIVO */}
        {!loading && (
          <div className="social-kpi-grid">
            <div className="social-kpi-card">
              <div className="social-kpi-icon-box primary">
                <Layers size={22} />
              </div>
              <div className="social-kpi-info">
                <span className="social-kpi-label">Total Referencias</span>
                <strong className="social-kpi-val primary">{totalReferencias}</strong>
                <span className="social-kpi-sub">Mes de {mesActualNombre} {anio}</span>
              </div>
            </div>

            <div className="social-kpi-card">
              <div className="social-kpi-icon-box secondary">
                <Stethoscope size={22} />
              </div>
              <div className="social-kpi-info">
                <span className="social-kpi-label">Especialidades con Demanda</span>
                <strong className="social-kpi-val secondary">{filas.length}</strong>
                <span className="social-kpi-sub">Áreas médicas requeridas</span>
              </div>
            </div>

            <div className="social-kpi-card">
              <div className="social-kpi-icon-box accent">
                <TrendingUp size={22} />
              </div>
              <div className="social-kpi-info">
                <span className="social-kpi-label">Mayor Frecuencia</span>
                <strong className="social-kpi-val accent" style={{ fontSize: '1.15rem' }}>
                  {topEspecialidad ? topEspecialidad.especialidad : 'Sin registros'}
                </strong>
                <span className="social-kpi-sub">
                  {topEspecialidad ? `${topEspecialidad.referencias} paciente(s) referidos` : 'Período actual'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="social-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="social-loading-state">
            <div className="social-spinner" />
            <p>Cargando información estadística...</p>
          </div>
        ) : (
          <div className="social-dashboard-grid">
            {/* COLUMNA IZQUIERDA: TABLA CONCENTRADA */}
            <div className="social-card-excel">
              <div className="social-excel-header">
                <div className="social-excel-title">
                  <span className="social-excel-tag">TABLA RESUMEN</span>
                  <span className="social-excel-main-heading">REFERENCIAS POR ESPECIALIDAD</span>
                  <span className="social-excel-periodo">
                    {mesActualNombre.toUpperCase()} {anio}
                  </span>
                </div>
              </div>

              <div className="social-table-container">
                <table className="social-excel-table">
                  <thead>
                    <tr>
                      <th className="th-especialidad">Especialidad Médica</th>
                      <th className="th-conteo">Referencias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.length > 0 ? (
                      filas.map((fila, idx) => (
                        <tr key={idx}>
                          <td className="td-especialidad">
                            <span className="td-especialidad-text">{fila.especialidad}</span>
                          </td>
                          <td className="td-conteo">
                            <span className="td-conteo-pill">{fila.referencias}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="td-empty">
                          No hay referencias registradas en este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filas.length > 0 && (
                    <tfoot>
                      <tr className="tr-total">
                        <td className="td-total-label">TOTAL GENERAL</td>
                        <td className="td-total-val">{totalReferencias}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              <div className="social-excel-footer-note">
                Mostrando especialidades con derivaciones en el mes seleccionado.
              </div>
            </div>

            {/* COLUMNA DERECHA: GRÁFICO DE BARRAS ELEGANTE */}
            <div className="social-card-excel-chart">
              <div className="social-chart-header">
                <div className="social-chart-header-left">
                  <BarChart3 size={18} color="#0077b6" />
                  <h3 className="social-chart-heading">Distribución Gráfica Mensual</h3>
                </div>
                <span className="social-chart-badge">
                  {totalReferencias} referencias totales
                </span>
              </div>

              <div className="social-chart-scroll-wrapper">
                {chartItems.length > 0 ? (
                  <svg 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                    className="social-excel-svg"
                    style={{ width: '100%', minWidth: `${Math.min(svgWidth, 680)}px`, height: 'auto' }}
                  >
                    <defs>
                      {/* Degradado para barras regulares */}
                      <linearGradient id="barRegularGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00b4d8" />
                        <stop offset="100%" stopColor="#0077b6" />
                      </linearGradient>
                      {/* Degradado para barra de TOTAL */}
                      <linearGradient id="barTotalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#03045e" />
                      </linearGradient>
                      {/* Filtro de sombra suave */}
                      <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.15" />
                      </filter>
                    </defs>

                    {/* LÍNEAS DE CUADRÍCULA HORIZONTALES Y ETIQUETAS EJE Y */}
                    {yTicks.map((val) => {
                      const yPos = plotBottom - (val / yAxisMax) * plotHeight;
                      return (
                        <g key={val}>
                          <line 
                            x1={plotLeft} 
                            y1={yPos} 
                            x2={plotRight} 
                            y2={yPos} 
                            className="svg-grid-line"
                          />
                          <text 
                            x={plotLeft - 10} 
                            y={yPos + 4} 
                            textAnchor="end" 
                            className="svg-y-axis-label"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* LÍNEA BASE EJE X */}
                    <line 
                      x1={plotLeft} 
                      y1={plotBottom} 
                      x2={plotRight} 
                      y2={plotBottom} 
                      className="svg-axis-line"
                    />

                    {/* COLUMNAS VERTICALES Y ETIQUETAS ROTADAS */}
                    {chartItems.map((item, idx) => {
                      const totalBars = chartItems.length;
                      const slotWidth = plotWidth / totalBars;
                      const barWidth = Math.min(28, Math.max(16, slotWidth * 0.48));
                      const xCenter = plotLeft + slotWidth * idx + slotWidth / 2;
                      const xBar = xCenter - barWidth / 2;
                      const count = Number(item.referencias) || 0;
                      const barHeight = (count / yAxisMax) * plotHeight;
                      const yBar = plotBottom - barHeight;

                      return (
                        <g key={idx} className="svg-bar-group">
                          {/* Columna Vertical con esquinas redondeadas y degradado */}
                          {count > 0 && (
                            <>
                              <rect
                                x={xBar}
                                y={yBar}
                                width={barWidth}
                                height={barHeight}
                                rx="5"
                                ry="5"
                                fill={item.isTotal ? "url(#barTotalGradient)" : "url(#barRegularGradient)"}
                                filter="url(#barShadow)"
                                className={item.isTotal ? 'svg-bar-rect-total' : 'svg-bar-rect'}
                              >
                                <title>{`${item.especialidad}: ${count} referencias`}</title>
                              </rect>

                              {/* Valor numérico flotando sobre la barra */}
                              <text
                                x={xCenter}
                                y={yBar - 6}
                                textAnchor="middle"
                                className={item.isTotal ? 'svg-bar-val-total' : 'svg-bar-val'}
                              >
                                {count}
                              </text>
                            </>
                          )}

                          {/* Etiqueta de Texto Inclinada a -45 Grados */}
                          <text
                            x={xCenter}
                            y={plotBottom + 16}
                            transform={`rotate(-45, ${xCenter}, ${plotBottom + 16})`}
                            textAnchor="end"
                            className={item.isTotal ? 'svg-x-label-total' : 'svg-x-label'}
                          >
                            {item.especialidad}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="social-chart-empty">
                    <Layers size={44} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <p>No hay datos disponibles para graficar en este período.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
