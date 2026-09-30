import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Download,
  Calendar,
  Package,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import reporteService from '../services/reporteService';
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

export default function InventarioFarmaciaReportePage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const cargarReporte = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reporteService.obtenerInventarioFarmacia(selectedYear, selectedMonth);
      setData(res);
    } catch (err) {
      console.error('Error al cargar reporte de inventario:', err);
      const serverMsg = err.response?.data?.message || err.message;
      setError(serverMsg ? `Error al cargar reporte: ${serverMsg}` : 'No se pudo cargar el inventario mensual.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [selectedYear, selectedMonth]);

  const handleDescargarExcel = async () => {
    setDownloading(true);
    try {
      await reporteService.descargarExcelInventarioFarmacia(selectedYear, selectedMonth);
    } catch (err) {
      console.error('Error descargando Excel:', err);
      alert('Error al descargar el archivo Excel.');
    } finally {
      setDownloading(false);
    }
  };

  const filas = data?.filas || [];
  const totales = data?.totales;

  return (
    <div className="reportes-container">
      <AdminNavbar />

      <main className="reportes-content">
        {/* Breadcrumb de navegación */}
        <Breadcrumb
          items={[
            { label: 'Reportes', to: '/reportes' },
            { label: 'Inventario Farmacia' },
          ]}
        />

        {/* Header Principal con Selectores y Botón Descargar Excel */}
        <div className="reportes-header">
          <div className="reportes-header-info">
            <h1>
              <Boxes size={26} style={{ color: '#2563eb' }} />
              Control Mensual de Inventario Farmacéutico
            </h1>
            <p>
              Obras Sociales San Martín • Matriz de existencias físicas, ingresos, salidas semanales y saldos conciliados
            </p>
          </div>

          <div className="reportes-header-actions">
            {/* Selector de Mes y Año */}
            <div className="selector-mes-anio">
              <Calendar size={18} style={{ color: '#64748b' }} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                aria-label="Seleccionar Mes"
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
                aria-label="Seleccionar Año"
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
              type="button"
              className="btn-excel"
              onClick={handleDescargarExcel}
              disabled={downloading || loading || !data}
              title="Descargar matriz en formato Excel .xlsx oficial"
            >
              <Download size={18} />
              {downloading ? 'Generando Excel...' : 'Descargar Excel (.xlsx)'}
            </button>
          </div>
        </div>

        {/* Tarjetas KPI de Resumen */}
        {totales && (
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon blue">
                <Boxes size={24} />
              </div>
              <div className="kpi-info">
                <div className="kpi-label">Ítems / Lotes</div>
                <div className="kpi-val">{totales.totalMedicamentos}</div>
                <div className="kpi-sub">Lotes registrados en control</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon green">
                <Package size={24} />
              </div>
              <div className="kpi-info">
                <div className="kpi-label">Físico Mes Anterior</div>
                <div className="kpi-val">{totales.sumFisicoMesAnterior.toLocaleString('es-GT')}</div>
                <div className="kpi-sub">Saldo inicial físico</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon orange">
                <ArrowUpRight size={24} />
              </div>
              <div className="kpi-info">
                <div className="kpi-label">Entradas del Mes</div>
                <div className="kpi-val">
                  {(totales.sumPedidosCompras + totales.sumDonaciones).toLocaleString('es-GT')}
                </div>
                <div className="kpi-sub">
                  {totales.sumPedidosCompras} pedidos + {totales.sumDonaciones} donaciones
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon purple">
                <TrendingDown size={24} />
              </div>
              <div className="kpi-info">
                <div className="kpi-label">Total Entregado</div>
                <div className="kpi-val">{totales.sumTotalEntregado.toLocaleString('es-GT')}</div>
                <div className="kpi-sub">Semanas 1 a 4 dispensadas</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon emerald">
                <DollarSign size={24} />
              </div>
              <div className="kpi-info">
                <div className="kpi-label">Saldo en Stock</div>
                <div className="kpi-val">{totales.sumSaldoActual.toLocaleString('es-GT')}</div>
                <div className="kpi-sub">
                  Valor: Q {totales.sumValorTotalInventario?.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="reportes-alert-error" role="alert" style={{ marginBottom: '16px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Tarjeta con la Matriz de Inventario */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="reportes-spinner" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando matriz de inventario...</p>
            </div>
          ) : !filas.length ? (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <FileSpreadsheet size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h3 style={{ color: '#1e293b', marginBottom: '6px' }}>No se encontraron registros de inventario</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No hay lotes ni movimientos registrados para el mes seleccionado.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '720px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.8rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <thead>
                  {/* Encabezados con los colores exactos de la plantilla oficial */}
                  <tr style={{ height: '46px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ background: '#DC2626', color: '#fff', padding: '10px 8px', textAlign: 'center', minWidth: '95px', position: 'sticky', top: 0, zIndex: 5 }}>FECHA EXPIRACION</th>
                    <th style={{ background: '#DC2626', color: '#fff', padding: '10px 12px', textAlign: 'left', minWidth: '190px', position: 'sticky', top: 0, zIndex: 5 }}>NOMBRE</th>
                    <th style={{ background: '#DC2626', color: '#fff', padding: '10px 12px', textAlign: 'left', minWidth: '150px', position: 'sticky', top: 0, zIndex: 5 }}>PRESENTACION</th>
                    <th style={{ background: '#DC2626', color: '#fff', padding: '10px 12px', textAlign: 'left', minWidth: '130px', position: 'sticky', top: 0, zIndex: 5 }}>CASA FARMACEUTICA</th>
                    <th style={{ background: '#059669', color: '#fff', padding: '10px 8px', textAlign: 'center', minWidth: '95px', position: 'sticky', top: 0, zIndex: 5 }}>TOTAL FISICO DEL MES ANTERIOR</th>
                    <th style={{ background: '#D97706', color: '#fff', padding: '10px 8px', textAlign: 'center', minWidth: '90px', position: 'sticky', top: 0, zIndex: 5 }}>PEDIDOS / COMPRAS</th>
                    <th style={{ background: '#DB2777', color: '#fff', padding: '10px 8px', textAlign: 'center', minWidth: '85px', position: 'sticky', top: 0, zIndex: 5 }}>DONACIÓN</th>
                    <th style={{ background: '#16A34A', color: '#fff', padding: '10px 8px', textAlign: 'center', minWidth: '95px', position: 'sticky', top: 0, zIndex: 5 }}>TOTAL FISICO PARA EL MES</th>
                    <th style={{ background: '#7C3AED', color: '#fff', padding: '10px 6px', textAlign: 'center', minWidth: '65px', position: 'sticky', top: 0, zIndex: 5 }}>SEMANA 1</th>
                    <th style={{ background: '#7C3AED', color: '#fff', padding: '10px 6px', textAlign: 'center', minWidth: '65px', position: 'sticky', top: 0, zIndex: 5 }}>SEMANA 2</th>
                    <th style={{ background: '#7C3AED', color: '#fff', padding: '10px 6px', textAlign: 'center', minWidth: '65px', position: 'sticky', top: 0, zIndex: 5 }}>SEMANA 3</th>
                    <th style={{ background: '#7C3AED', color: '#fff', padding: '10px 6px', textAlign: 'center', minWidth: '65px', position: 'sticky', top: 0, zIndex: 5 }}>SEMANA 4</th>
                    <th style={{ background: '#B91C1C', color: '#fff', padding: '10px 6px', textAlign: 'center', minWidth: '85px', position: 'sticky', top: 0, zIndex: 5 }}>MEDICAMENTO VENCIDO</th>
                    <th style={{ background: '#B91C1C', color: '#fff', padding: '10px 8px', textAlign: 'center', minWidth: '85px', position: 'sticky', top: 0, zIndex: 5 }}>TOTAL ENTREGADO</th>
                    <th style={{ background: '#2563EB', color: '#fff', padding: '10px 8px', textAlign: 'center', minWidth: '80px', position: 'sticky', top: 0, zIndex: 5 }}>SALDO ACTUAL</th>
                    <th style={{ background: '#CA8A04', color: '#fff', padding: '10px 8px', textAlign: 'center', minWidth: '85px', position: 'sticky', top: 0, zIndex: 5 }}>INVENTARIO FÍSICO</th>
                    <th style={{ background: '#0D9488', color: '#fff', padding: '10px 6px', textAlign: 'center', minWidth: '75px', position: 'sticky', top: 0, zIndex: 5 }}>DIFERENCIA</th>
                    <th style={{ background: '#4F46E5', color: '#fff', padding: '10px 10px', textAlign: 'right', minWidth: '85px', position: 'sticky', top: 0, zIndex: 5 }}>PRECIO POR UNIDAD</th>
                    <th style={{ background: '#4F46E5', color: '#fff', padding: '10px 10px', textAlign: 'right', minWidth: '80px', position: 'sticky', top: 0, zIndex: 5 }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f, idx) => (
                    <tr
                      key={f.idLote ? `${f.idMedicamento}-${f.idLote}` : `${f.idMedicamento}-${idx}`}
                      style={{
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'; }}
                    >
                      <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600, color: '#b91c1c' }}>
                        {f.fechaExpiracion}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                        {f.nombre}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#334155' }}>
                        {f.presentacion}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>
                        {f.casaFarmaceutica}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600, color: '#065f46' }}>
                        {f.totalFisicoMesAnterior}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', color: f.pedidosCompras > 0 ? '#b45309' : '#94a3b8' }}>
                        {f.pedidosCompras > 0 ? f.pedidosCompras : ''}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', color: f.donaciones > 0 ? '#be185d' : '#94a3b8' }}>
                        {f.donaciones > 0 ? f.donaciones : ''}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 700, color: '#15803d', background: '#f0fdf4' }}>
                        {f.totalFisicoParaElMes}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: f.semana1 > 0 ? '#6d28d9' : '#cbd5e1' }}>
                        {f.semana1 > 0 ? f.semana1 : ''}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: f.semana2 > 0 ? '#6d28d9' : '#cbd5e1' }}>
                        {f.semana2 > 0 ? f.semana2 : ''}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: f.semana3 > 0 ? '#6d28d9' : '#cbd5e1' }}>
                        {f.semana3 > 0 ? f.semana3 : ''}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: f.semana4 > 0 ? '#6d28d9' : '#cbd5e1' }}>
                        {f.semana4 > 0 ? f.semana4 : ''}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: f.medicamentoVencido > 0 ? '#dc2626' : '#cbd5e1' }}>
                        {f.medicamentoVencido > 0 ? f.medicamentoVencido : ''}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 700, color: '#991b1b', background: '#fef2f2' }}>
                        {f.totalEntregado}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff' }}>
                        {f.saldoActual}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600, color: '#854d0e', background: '#fefce8' }}>
                        {f.inventarioFisico}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, color: f.diferencia === 0 ? '#0f766e' : '#b91c1c' }}>
                        {f.diferencia}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#1e293b' }}>
                        {Number(f.precioPorUnidad || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                        {Number(f.total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Fila de Totales Consolidados */}
                {totales && (
                  <tfoot>
                    <tr
                      style={{
                        background: '#f1f5f9',
                        fontWeight: 700,
                        borderTop: '2px solid #0f172a',
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 4,
                      }}
                    >
                      <td colSpan={4} style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>
                        TOTALES CONSOLIDADOS:
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#065f46' }}>
                        {totales.sumFisicoMesAnterior.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#b45309' }}>
                        {totales.sumPedidosCompras.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#be185d' }}>
                        {totales.sumDonaciones.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#15803d', background: '#dcfce7' }}>
                        {totales.sumFisicoParaElMes.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'center', color: '#6d28d9' }}>
                        {totales.sumSemana1.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'center', color: '#6d28d9' }}>
                        {totales.sumSemana2.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'center', color: '#6d28d9' }}>
                        {totales.sumSemana3.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'center', color: '#6d28d9' }}>
                        {totales.sumSemana4.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'center', color: '#dc2626' }}>
                        {totales.sumMedicamentoVencido.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#991b1b', background: '#fee2e2' }}>
                        {totales.sumTotalEntregado.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#1d4ed8', background: '#dbeafe' }}>
                        {totales.sumSaldoActual.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#854d0e', background: '#fef9c3' }}>
                        {totales.sumInventarioFisico.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'center', color: '#0f766e' }}>
                        {totales.sumDiferencia.toLocaleString('es-GT')}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#64748b' }}>
                        —
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#0f172a' }}>
                        {Number(totales.sumTotal || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
