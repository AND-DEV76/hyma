import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  Calendar, 
  FileSpreadsheet,
  AlertCircle,
  Layers
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

  // Preparar datos para el gráfico de barras verticales (incluyendo la barra final TOTAL)
  const chartItems = filas.length > 0 
    ? [...filas, { especialidad: 'TOTAL', referencias: totalReferencias, isTotal: true }]
    : [];

  // Configuración de escalas para el gráfico SVG
  const maxVal = totalReferencias > 0 ? totalReferencias : 5;
  // Redondear hacia arriba para los pasos del eje Y (5, 10, 15, 20, 25, 30...)
  const step = maxVal <= 10 ? 2 : maxVal <= 25 ? 5 : maxVal <= 50 ? 10 : Math.ceil(maxVal / 5);
  const yAxisMax = Math.ceil(maxVal / step) * step;
  const yTicks = [];
  for (let i = 0; i <= yAxisMax; i += step) {
    yTicks.push(i);
  }

  // Dimensiones del gráfico SVG
  const svgWidth = Math.max(680, chartItems.length * 52 + 100);
  const svgHeight = 380;
  const plotLeft = 55;
  const plotRight = svgWidth - 25;
  const plotTop = 55;
  const plotBottom = 260;
  const plotHeight = plotBottom - plotTop;
  const plotWidth = plotRight - plotLeft;

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="social-page-container">
        {/* Breadcrumb de navegación */}
        <Breadcrumb 
          items={[
            { label: 'Trabajo Social', path: '/social' },
            { label: 'Dashboard Referencias Médicas' }
          ]} 
          showHome={true} 
        />

        {/* HEADER BAR */}
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
                Estadísticas mensuales, concentrado por especialidad y exportación con gráfico en Excel
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
              title="Exportar reporte y gráfico en la misma hoja de Excel (Times New Roman)"
            >
              <FileSpreadsheet size={16} />
              {exporting ? 'Generando Excel...' : 'Exportar Excel'}
            </button>
          </div>
        </div>

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
            <p>Cargando reporte de referencias...</p>
          </div>
        ) : (
          <div className="social-dashboard-grid">
            {/* COLUMNA IZQUIERDA: TABLA ESTILO HOJA EXCEL */}
            <div className="social-card-excel">
              <div className="social-excel-header">
                <div className="social-excel-title">
                  <span>REFERENCIAS MÉDICAS</span>
                  <span className="social-excel-periodo">
                    {mesActualNombre.toUpperCase()} {anio}
                  </span>
                </div>
              </div>

              <div className="social-table-container">
                <table className="social-excel-table">
                  <thead>
                    <tr>
                      <th className="th-especialidad">Specialty</th>
                      <th className="th-conteo">Referencias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.length > 0 ? (
                      filas.map((fila, idx) => (
                        <tr key={idx}>
                          <td className="td-especialidad">{fila.especialidad}</td>
                          <td className="td-conteo">{fila.referencias}</td>
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
                        <td className="td-total-label">TOTAL</td>
                        <td className="td-total-val">{totalReferencias}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              <div className="social-excel-footer-note">
                * Se muestran únicamente las especialidades con al menos una referencia en el período.
              </div>
            </div>

            {/* COLUMNA DERECHA: GRÁFICO DE COLUMNAS VERTICALES EXACTO AL EXCEL */}
            <div className="social-card-excel-chart">
              <div className="social-chart-scroll-wrapper">
                {chartItems.length > 0 ? (
                  <svg 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                    className="social-excel-svg"
                    style={{ width: '100%', minWidth: `${Math.min(svgWidth, 680)}px`, height: 'auto' }}
                  >
                    {/* TÍTULO DEL GRÁFICO ESTILO EXCEL */}
                    <text 
                      x={svgWidth / 2} 
                      y={28} 
                      textAnchor="middle" 
                      className="svg-chart-main-title"
                    >
                      REFERENCIAS MÉDICAS {mesActualNombre.toUpperCase()} {anio}
                    </text>

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
                            x={plotLeft - 8} 
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
                      const barWidth = Math.min(26, Math.max(14, slotWidth * 0.45));
                      const xCenter = plotLeft + slotWidth * idx + slotWidth / 2;
                      const xBar = xCenter - barWidth / 2;
                      const count = Number(item.referencias) || 0;
                      const barHeight = (count / yAxisMax) * plotHeight;
                      const yBar = plotBottom - barHeight;

                      return (
                        <g key={idx} className="svg-bar-group">
                          {/* Columna Vertical */}
                          {count > 0 && (
                            <rect
                              x={xBar}
                              y={yBar}
                              width={barWidth}
                              height={barHeight}
                              className={item.isTotal ? 'svg-bar-rect-total' : 'svg-bar-rect'}
                            >
                              <title>{`${item.especialidad}: ${count} referencias`}</title>
                            </rect>
                          )}

                          {/* Etiqueta de Texto Inclinada a -45 Grados */}
                          <text
                            x={xCenter}
                            y={plotBottom + 14}
                            transform={`rotate(-45, ${xCenter}, ${plotBottom + 14})`}
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
                    <Layers size={48} className="text-gray-300 mb-2" />
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
