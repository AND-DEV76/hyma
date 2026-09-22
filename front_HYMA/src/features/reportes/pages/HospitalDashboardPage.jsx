import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Clock,
  CircleDollarSign,
  AlertTriangle,
  Pill,
  RefreshCw,
  Activity,
  HeartPulse,
  Award,
  TrendingUp,
  User,
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import dashboardHospitalarioService from '../services/dashboardHospitalarioService';
import '../styles/hospitalDashboard.css';

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

export default function HospitalDashboardPage() {
  const currentDate = new Date();
  const [selectedAnio, setSelectedAnio] = useState(currentDate.getFullYear());
  const [selectedMes, setSelectedMes] = useState(currentDate.getMonth() + 1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardHospitalarioService.obtenerDashboardHospitalario(
        selectedAnio,
        selectedMes
      );
      setDashboardData(data);
    } catch (err) {
      console.error('Error al cargar dashboard hospitalario:', err);
      setError('No se pudieron cargar los indicadores del hospital. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [selectedAnio, selectedMes]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const kpis = dashboardData?.kpis || {};
  const demografia = dashboardData?.demografia || {};
  const topDiagnosticos = dashboardData?.topDiagnosticos || [];
  const topMedicamentos = dashboardData?.topMedicamentos || [];

  const aniosDisponibles = [
    currentDate.getFullYear() - 2,
    currentDate.getFullYear() - 1,
    currentDate.getFullYear(),
    currentDate.getFullYear() + 1,
  ];

  return (
    <div className="dashboard-page-container">
      <AdminNavbar />

      <main className="dashboard-main-content">
        {/* Breadcrumb */}
        <Breadcrumb
          showHome={false}
          items={[
            { label: 'Dashboard Hospitalario' },
          ]}
        />

        {/* Encabezado */}
        <div className="dashboard-header">
          <div className="dashboard-header-titles">
            <h1>
              <LayoutDashboard size={26} color="#0284c7" />
              Dashboard Hospitalario
            </h1>
            <p>
              Métricas clínicas clave, epidemiología, demografía y flujo de medicamentos
            </p>
          </div>

          <div className="dashboard-header-controls">
            <div className="dashboard-period-selector">
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(Number(e.target.value))}
                aria-label="Seleccionar mes"
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedAnio}
                onChange={(e) => setSelectedAnio(Number(e.target.value))}
                aria-label="Seleccionar año"
              >
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="dashboard-btn-refresh"
              onClick={fetchDashboard}
              disabled={loading}
              title="Actualizar datos"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading-box">
            <div className="dashboard-spinner"></div>
            <p>Calculando y agregando indicadores hospitalarios...</p>
          </div>
        ) : (
          <>
            {/* 1. FILA DE KPIS */}
            <div className="dashboard-kpis-grid">
              {/* Pacientes del Mes */}
              <div className="dashboard-kpi-card">
                <div className="kpi-card-header">
                  <span className="kpi-card-title">Pacientes del Mes</span>
                  <div className="kpi-card-icon kpi-icon-blue">
                    <Users size={20} />
                  </div>
                </div>
                <div className="kpi-card-value">
                  {kpis.pacientesMesTotal ?? 0}
                </div>
                <div className="kpi-card-footer">
                  <span className="kpi-badge kpi-badge-teal">
                    Nuevos: {kpis.pacientesNuevos ?? 0} ({kpis.porcentajeNuevos ?? 0}%)
                  </span>
                  <span className="kpi-badge kpi-badge-blue">
                    Reconsulta: {kpis.pacientesReconsulta ?? 0} ({kpis.porcentajeReconsulta ?? 0}%)
                  </span>
                </div>
              </div>

              {/* Pacientes de Hoy */}
              <div className="dashboard-kpi-card">
                <div className="kpi-card-header">
                  <span className="kpi-card-title">Atención en Tiempo Real</span>
                  <div className="kpi-card-icon kpi-icon-emerald">
                    <UserCheck size={20} />
                  </div>
                </div>
                <div className="kpi-card-value">
                  {kpis.atendidosHoy ?? 0}
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>
                    atendidos hoy
                  </span>
                </div>
                <div className="kpi-card-footer">
                  <span className="kpi-badge kpi-badge-amber">
                    <Clock size={12} /> {kpis.enEsperaHoy ?? 0} en cola hoy
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    P:{kpis.enEsperaPreconsulta ?? 0} | C:{kpis.enEsperaClinica ?? 0} | F:{kpis.enEsperaFarmacia ?? 0}
                  </span>
                </div>
              </div>

              {/* Recaudación del Mes */}
              <div className="dashboard-kpi-card">
                <div className="kpi-card-header">
                  <span className="kpi-card-title">Recaudación del Mes</span>
                  <div className="kpi-card-icon kpi-icon-violet">
                    <CircleDollarSign size={20} />
                  </div>
                </div>
                <div className="kpi-card-value">
                  Q {Number(kpis.recaudacionMesTotal || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="kpi-card-footer">
                  <span>Consultas: Q {Number(kpis.recaudacionConsultas || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                  <span>Farmacia: Q {Number(kpis.recaudacionMedicamentos || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Alertas de Farmacia */}
              <div className="dashboard-kpi-card">
                <div className="kpi-card-header">
                  <span className="kpi-card-title">Alertas Farmacia</span>
                  <div className="kpi-card-icon kpi-icon-amber">
                    <AlertTriangle size={20} />
                  </div>
                </div>
                <div className="kpi-card-value">
                  {kpis.medicamentosAgotados ?? 0}
                  <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, marginLeft: '6px' }}>
                    agotados
                  </span>
                </div>
                <div className="kpi-card-footer">
                  <span className="kpi-badge kpi-badge-orange">
                    {kpis.lotesPorVencer30Dias ?? 0} lotes por vencer (&lt;30d)
                  </span>
                </div>
              </div>
            </div>

            {/* 2. PANELES ANALÍTICOS: TOP 10 DIAGNÓSTICOS + DEMOGRAFÍA */}
            <div className="dashboard-analytics-grid">
              {/* Top 10 Diagnósticos */}
              <div className="dashboard-panel">
                <div className="panel-header">
                  <div className="panel-header-title">
                    <HeartPulse size={20} color="#0284c7" />
                    <span>Top 10 Diagnósticos Más Comunes</span>
                  </div>
                  <span className="panel-header-badge">
                    {topDiagnosticos.reduce((acc, curr) => acc + curr.cantidad, 0)} atenciones
                  </span>
                </div>

                {topDiagnosticos.length === 0 ? (
                  <div className="dashboard-empty-box">
                    <Activity size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>No se registraron diagnósticos en este mes seleccionado.</p>
                  </div>
                ) : (
                  <div className="top-diagnosticos-list">
                    {topDiagnosticos.map((item, idx) => (
                      <div key={item.codigo + idx} className="top-diag-item">
                        <div className="top-diag-rank">{idx + 1}</div>
                        <div className="top-diag-info">
                          <div className="top-diag-header">
                            <span className="top-diag-code">{item.codigo}</span>
                            <span className="top-diag-desc" title={item.descripcion}>
                              {item.descripcion}
                            </span>
                          </div>
                          <div className="top-diag-progress-bar">
                            <div
                              className="top-diag-progress-fill"
                              style={{ width: `${Math.min(100, Math.max(8, item.porcentaje))}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="top-diag-metrics">
                          <span className="top-diag-count">{item.cantidad} casos</span>
                          <span className="top-diag-percent">{item.porcentaje}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Demografía (Hombres vs Mujeres + Grupos de Edad) */}
              <div className="dashboard-panel">
                <div className="panel-header">
                  <div className="panel-header-title">
                    <Users size={20} color="#0284c7" />
                    <span>Demografía de Pacientes</span>
                  </div>
                  <span className="panel-header-badge">
                    {demografia.totalPacientes ?? 0} pacientes únicos
                  </span>
                </div>

                <div className="demografia-container">
                  {/* Distribución por Sexo */}
                  <div>
                    <div className="demo-age-section-title">Distribución por Sexo</div>
                    <div className="demo-sexo-cards">
                      <div className="demo-sex-box demo-box-men">
                        <div className="demo-sex-icon">♂</div>
                        <div className="demo-sex-details">
                          <span className="demo-sex-label">Hombres</span>
                          <span className="demo-sex-count">{demografia.hombres ?? 0}</span>
                          <span className="demo-sex-pct">{demografia.porcentajeHombres ?? 0}%</span>
                        </div>
                      </div>

                      <div className="demo-sex-box demo-box-women">
                        <div className="demo-sex-icon">♀</div>
                        <div className="demo-sex-details">
                          <span className="demo-sex-label">Mujeres</span>
                          <span className="demo-sex-count">{demografia.mujeres ?? 0}</span>
                          <span className="demo-sex-pct">{demografia.porcentajeMujeres ?? 0}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="demo-sex-bar-wrapper" style={{ marginTop: '0.75rem' }}>
                      <div className="demo-sex-ratio-bar">
                        <div
                          className="demo-ratio-hombres"
                          style={{ width: `${demografia.porcentajeHombres ?? 50}%` }}
                          title={`Hombres: ${demografia.porcentajeHombres ?? 0}%`}
                        ></div>
                        <div
                          className="demo-ratio-mujeres"
                          style={{ width: `${demografia.porcentajeMujeres ?? 50}%` }}
                          title={`Mujeres: ${demografia.porcentajeMujeres ?? 0}%`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Distribución por Grupos de Edad */}
                  <div>
                    <div className="demo-age-section-title">Distribución por Edades</div>
                    <div className="demo-age-list">
                      {/* Pediátricos */}
                      <div className="demo-age-row">
                        <div className="demo-age-row-labels">
                          <span className="demo-age-name">Pediátricos (&lt; 12 años)</span>
                          <span className="demo-age-val">
                            {demografia.pediatricos ?? 0} ({demografia.porcentajePediatricos ?? 0}%)
                          </span>
                        </div>
                        <div className="demo-age-progress">
                          <div
                            className="demo-age-progress demo-age-fill-blue"
                            style={{ width: `${demografia.porcentajePediatricos ?? 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Jóvenes */}
                      <div className="demo-age-row">
                        <div className="demo-age-row-labels">
                          <span className="demo-age-name">Jóvenes (12 - 25 años)</span>
                          <span className="demo-age-val">
                            {demografia.jovenes ?? 0} ({demografia.porcentajeJovenes ?? 0}%)
                          </span>
                        </div>
                        <div className="demo-age-progress">
                          <div
                            className="demo-age-progress demo-age-fill-cyan"
                            style={{ width: `${demografia.porcentajeJovenes ?? 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Adultos */}
                      <div className="demo-age-row">
                        <div className="demo-age-row-labels">
                          <span className="demo-age-name">Adultos (26 - 59 años)</span>
                          <span className="demo-age-val">
                            {demografia.adultos ?? 0} ({demografia.porcentajeAdultos ?? 0}%)
                          </span>
                        </div>
                        <div className="demo-age-progress">
                          <div
                            className="demo-age-progress demo-age-fill-amber"
                            style={{ width: `${demografia.porcentajeAdultos ?? 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Adultos Mayores */}
                      <div className="demo-age-row">
                        <div className="demo-age-row-labels">
                          <span className="demo-age-name">Adultos Mayores (60+ años)</span>
                          <span className="demo-age-val">
                            {demografia.adultosMayores ?? 0} ({demografia.porcentajeAdultosMayores ?? 0}%)
                          </span>
                        </div>
                        <div className="demo-age-progress">
                          <div
                            className="demo-age-progress demo-age-fill-violet"
                            style={{ width: `${demografia.porcentajeAdultosMayores ?? 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FILA: TOP 10 MEDICAMENTOS MÁS DISPENSADOS */}
            <div className="dashboard-meds-panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Pill size={20} color="#0284c7" />
                  <span>Top 10 Medicamentos Más Dispensados</span>
                </div>
                <span className="panel-header-badge">
                  {topMedicamentos.reduce((acc, curr) => acc + curr.unidadesDispensadas, 0)} unidades en el mes
                </span>
              </div>

              {topMedicamentos.length === 0 ? (
                <div className="dashboard-empty-box">
                  <Pill size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p>No se registraron medicamentos dispensados en este mes.</p>
                </div>
              ) : (
                <div className="meds-grid">
                  {topMedicamentos.map((med, idx) => (
                    <div key={med.idMedicamento || idx} className="med-card-item">
                      <div className="med-rank-badge">#{idx + 1}</div>
                      <div className="med-card-details">
                        <div className="med-card-name" title={med.nombre}>
                          {med.nombre}
                        </div>
                        <div className="med-card-spec">
                          {med.presentacion || 'General'} {med.concentracion ? `• ${med.concentracion}` : ''}
                        </div>
                        <span className="med-card-cat-tag">
                          {med.categoria || 'Farmacia'}
                        </span>
                      </div>
                      <div className="med-card-stats">
                        <span className="med-stat-units">{med.unidadesDispensadas}</span>
                        <span className="med-stat-label">unidades</span>
                        {med.totalGenerado && (
                          <span className="med-stat-revenue">
                            Q {Number(med.totalGenerado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
