import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartHandshake,
  Download,
  RefreshCw,
  Search,
  DollarSign,
  Calendar,
  Pill,
  AlertCircle
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

export default function CasosEspecialesPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // Estados reporte casos especiales
  const [casosData, setCasosData] = useState(null);
  const [loadingCasos, setLoadingCasos] = useState(false);
  const [errorCasos, setErrorCasos] = useState('');
  const [downloadingCasos, setDownloadingCasos] = useState(false);
  const [searchCasos, setSearchCasos] = useState('');

  const cargarCasosEspeciales = async () => {
    setLoadingCasos(true);
    setErrorCasos('');
    try {
      const res = await reporteService.obtenerCasosEspeciales(selectedYear, selectedMonth);
      setCasosData(res);
    } catch (err) {
      console.error('Error al cargar casos especiales:', err);
      const serverMsg = err.response?.data?.message || err.message;
      setErrorCasos(serverMsg ? `Error al cargar casos especiales: ${serverMsg}` : 'No se pudo cargar el reporte de casos especiales.');
    } finally {
      setLoadingCasos(false);
    }
  };

  useEffect(() => {
    cargarCasosEspeciales();
  }, [selectedYear, selectedMonth]);

  const handleDescargarExcelCasos = async () => {
    setDownloadingCasos(true);
    try {
      await reporteService.descargarExcelCasosEspeciales(selectedYear, selectedMonth);
    } catch (err) {
      console.error('Error descargando Excel de Casos Especiales:', err);
      alert('Error al descargar el reporte de casos especiales en Excel.');
    } finally {
      setDownloadingCasos(false);
    }
  };

  // Casos filtrados por término de búsqueda
  const itemsCasosFiltrados = useMemo(() => {
    if (!casosData || !casosData.items) return [];
    if (!searchCasos.trim()) return casosData.items;
    const term = searchCasos.toLowerCase();
    return casosData.items.filter((item) => {
      const matchPaciente = item.nombrePaciente?.toLowerCase().includes(term);
      const matchDiag = item.diagnosticos?.some((d) => d.toLowerCase().includes(term));
      const matchMeds = item.medicamentos?.some((m) => m.nombre?.toLowerCase().includes(term));
      return matchPaciente || matchDiag || matchMeds;
    });
  }, [casosData, searchCasos]);

  // Total de unidades de medicamentos exonerados
  const totalUnidadesMedsCasos = useMemo(() => {
    if (!casosData || !casosData.items) return 0;
    return casosData.items.reduce((acc, item) => {
      const sum = (item.medicamentos || []).reduce((mAcc, m) => mAcc + (m.cantidad || 0), 0);
      return acc + sum;
    }, 0);
  }, [casosData]);

  const formatearMoneda = (val) => {
    const num = Number(val) || 0;
    return `Q ${num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="reportes-container">
      <AdminNavbar />

      <main className="reportes-content">
        {/* Breadcrumb de navegación */}
        <Breadcrumb
          items={[
            { label: 'Reportes', to: '/reportes' },
            { label: 'Casos Especiales' }
          ]}
        />

        {/* Header principal */}
        <div className="reportes-header">
          <div className="reportes-header-info">
            <h1>
              <HeartHandshake size={26} className="text-amber-600" />
              Reporte de Casos Especiales (Exoneraciones)
            </h1>
            <p>
              Obras Sociales San Martín • Registro de atenciones y medicamentos 100% donados / exonerados
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

            {/* Descargar Excel Casos Especiales */}
            <button
              className="btn-excel"
              onClick={handleDescargarExcelCasos}
              disabled={downloadingCasos || loadingCasos || !casosData}
              title="Descargar listado de Casos Especiales en Excel .xlsx"
            >
              <Download size={18} />
              {downloadingCasos ? 'Generando Excel...' : 'Descargar Excel (.xlsx)'}
            </button>

            {/* Refrescar */}
            <button
              className="btn-refresh"
              onClick={cargarCasosEspeciales}
              disabled={loadingCasos}
              title="Recargar datos"
            >
              <RefreshCw
                size={18}
                className={loadingCasos ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        {/* KPI Cards de Casos Especiales */}
        {casosData && (
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon bg-amber-100 text-amber-700">
                <HeartHandshake size={24} />
              </div>
              <div className="kpi-info">
                <div className="kpi-label">Pacientes Exonerados</div>
                <div className="kpi-val">{casosData.totalCasos}</div>
                <div className="kpi-sub">
                  Casos especiales registrados en el mes
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon bg-emerald-100 text-emerald-600">
                <DollarSign size={24} />
              </div>
              <div className="kpi-info">
                <div className="kpi-label">Monto Total Exonerado</div>
                <div className="kpi-val" style={{ color: '#059669' }}>
                  {formatearMoneda(casosData.totalMontoExonerado)}
                </div>
                <div className="kpi-sub">
                  Valor donado / absorbido por el programa
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon bg-blue-100 text-blue-600">
                <Pill size={24} />
              </div>
              <div className="kpi-info">
                <div className="kpi-label">Medicamentos Entregados</div>
                <div className="kpi-val">{totalUnidadesMedsCasos} uds</div>
                <div className="kpi-sub">
                  Unidades físicas dispensadas del inventario
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barra de control para Casos Especiales */}
        <div className="table-control-bar">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              Mostrando <strong>{itemsCasosFiltrados.length}</strong> de <strong>{casosData?.totalCasos || 0}</strong> caso(s)
            </span>
          </div>

          <div className="search-diag">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar por paciente, diagnóstico o medicamento..."
              value={searchCasos}
              onChange={(e) => setSearchCasos(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla de Casos Especiales */}
        <div className="casos-table-container">
          {loadingCasos ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-blue-600" />
              <p>Cargando reporte de casos especiales...</p>
            </div>
          ) : errorCasos ? (
            <div className="p-8 text-center text-red-600">
              <AlertCircle size={28} className="mx-auto mb-2" />
              <p>{errorCasos}</p>
            </div>
          ) : !casosData || itemsCasosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <HeartHandshake size={36} className="mx-auto mb-2 text-slate-400" />
              <p className="font-semibold text-slate-600">
                {searchCasos ? 'No se encontraron casos que coincidan con la búsqueda.' : 'No se registraron casos especiales en el mes seleccionado.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Cuando un paciente reciba atención y medicinas 100% exoneradas como Caso Especial en farmacia, aparecerá en esta lista.
              </p>
            </div>
          ) : (
            <table className="casos-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th style={{ width: '105px' }}>Fecha</th>
                  <th style={{ width: '220px' }}>Paciente</th>
                  <th style={{ width: '230px' }}>Diagnósticos</th>
                  <th>Medicamentos Entregados (Exonerados)</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Total Exonerado</th>
                </tr>
              </thead>
              <tbody>
                {itemsCasosFiltrados.map((item, idx) => (
                  <tr key={item.idSalida || idx}>
                    <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>
                        {item.fecha}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ color: '#03045e', fontSize: '13px' }}>
                          {item.nombrePaciente}
                        </strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {item.edad ? `${item.edad} años` : 'Edad N/D'}
                          {item.sexo ? ` • ${item.sexo}` : ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      {item.diagnosticos && item.diagnosticos.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {item.diagnosticos.map((diag, dIdx) => (
                            <span key={dIdx} className="diag-tag">
                              {diag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                          Sin diagnóstico
                        </span>
                      )}
                    </td>
                    <td>
                      {item.medicamentos && item.medicamentos.length > 0 ? (
                        <div className="meds-mini-list">
                          {item.medicamentos.map((m, mIdx) => (
                            <div key={mIdx} className="med-mini-item">
                              <div>
                                <strong style={{ color: '#1e293b' }}>{m.nombre}</strong>
                                {(m.presentacion || m.concentracion) && (
                                  <span style={{ color: '#64748b', marginLeft: '4px', fontSize: '11px' }}>
                                    ({[m.presentacion, m.concentracion].filter(Boolean).join(' - ')})
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                                  {m.cantidad} {m.cantidad === 1 ? 'ud' : 'uds'}
                                </span>
                                <span style={{ color: '#64748b', fontSize: '11px' }}>
                                  × Q{Number(m.precioUnitario || 0).toFixed(2)}
                                </span>
                                <strong style={{ color: '#0369a1', fontSize: '12px' }}>
                                  = Q{Number(m.subtotal || 0).toFixed(2)}
                                </strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                          No requirió medicamentos
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <strong style={{ color: '#059669', fontSize: '14px' }}>
                          {formatearMoneda(item.totalExonerado)}
                        </strong>
                        <span className="badge-exonerado">
                          ★ Caso Especial
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', paddingRight: '1rem', fontSize: '13px', textTransform: 'uppercase', color: '#1e293b' }}>
                    Total General Exonerado del Mes:
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '15px', color: '#059669' }}>
                    {formatearMoneda(casosData.totalMontoExonerado)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
