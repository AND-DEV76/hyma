import React, { useState } from 'react';
import {
  Users,
  Activity,
  Pill,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import reporteService from '../services/reporteService';

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

export default function ReportesOperativosPage() {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);

  const [descargando, setDescargando] = useState({
    pacientes: false,
    procedimientos: false,
    medicamentos: false,
  });

  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const aniosDisponibles = [];
  for (let a = hoy.getFullYear(); a >= 2024; a--) {
    aniosDisponibles.push(a);
  }

  const handleDescargar = async (tipo) => {
    setMensajeExito('');
    setMensajeError('');
    setDescargando((prev) => ({ ...prev, [tipo]: true }));

    try {
      if (tipo === 'pacientes') {
        await reporteService.descargarExcelPacientesMes(anio, mes);
        setMensajeExito(`Reporte "Pacientes Atendidos (${MESES[mes - 1].label} ${anio})" generado con éxito.`);
      } else if (tipo === 'procedimientos') {
        await reporteService.descargarExcelProcedimientosMes(anio, mes);
        setMensajeExito(`Reporte "Control de Procedimientos (${MESES[mes - 1].label} ${anio})" generado con éxito.`);
      } else if (tipo === 'medicamentos') {
        await reporteService.descargarExcelMedicamentosVendidosMes(anio, mes);
        setMensajeExito(`Reporte "Medicamentos Vendidos (${MESES[mes - 1].label} ${anio})" generado con éxito.`);
      }
    } catch (err) {
      console.error('Error al generar reporte:', err);
      setMensajeError('No se pudo generar el reporte. Verifique que existan datos en el período seleccionado.');
    } finally {
      setDescargando((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const handleMesAnterior = () => {
    if (mes === 1) {
      setMes(12);
      setAnio((prev) => prev - 1);
    } else {
      setMes((prev) => prev - 1);
    }
  };

  const handleMesSiguiente = () => {
    if (mes === 12) {
      setMes(1);
      setAnio((prev) => prev + 1);
    } else {
      setMes((prev) => prev + 1);
    }
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.container}>
        <Breadcrumb
          items={[
            { label: 'Reportes', path: '/reportes' },
            { label: 'Libros y Reportes Mensuales' },
          ]}
        />

        {/* Encabezado */}
        <div style={styles.header}>
          <div>
            <span style={styles.eyebrow}>CONTROL OPERATIVO INSTITUCIONAL</span>
            <h1 style={styles.title}>Libros y Reportes Mensuales</h1>
            <p style={styles.subtitle}>
              Generación y descarga de libros contables de atención médica, procedimientos clínicos y ventas de medicamentos en formato Excel oficial.
            </p>
          </div>

          {/* Selector de Fecha */}
          <div style={styles.dateSelectorCard}>
            <div style={styles.dateLabel}>
              <Calendar size={18} color="#0284c7" />
              <span>Período a consultar:</span>
            </div>
            <div style={styles.dateControls}>
              <button
                type="button"
                onClick={handleMesAnterior}
                style={styles.btnNav}
                title="Mes anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                style={styles.select}
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                style={styles.selectYear}
              >
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleMesSiguiente}
                style={styles.btnNav}
                title="Mes siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {mensajeExito && (
          <div style={styles.alertSuccess}>
            <CheckCircle size={20} color="#059669" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {mensajeError && (
          <div style={styles.alertError}>
            <AlertCircle size={20} color="#dc2626" />
            <span>{mensajeError}</span>
          </div>
        )}

        {/* Grilla de los 3 Reportes */}
        <div style={styles.grid}>
          {/* Tarjeta 1: Pacientes Atendidos por Día */}
          <div style={styles.card}>
            <div style={{ ...styles.cardIconWrapper, background: '#e0f2fe', color: '#0284c7' }}>
              <Users size={32} />
            </div>

            <div style={styles.cardBody}>
              <div style={styles.badgeGroup}>
                <span style={styles.tagBlue}>Clínica Médica</span>
                <span style={styles.tagGray}>Por Día</span>
              </div>

              <h2 style={styles.cardTitle}>Pacientes Atendidos por Día (Mes)</h2>
              <p style={styles.cardDesc}>
                Control diario detallado de pacientes atendidos, cobro de consultas regulares, tratamientos entregados, desglose de pacientes exonerados (S/R y Becados) y consolidado de ingresos en efectivo al pie del reporte.
              </p>

              <div style={styles.featuresList}>
                <div style={styles.featureItem}>• Desglose individual de pacientes y hora de consulta</div>
                <div style={styles.featureItem}>• Cálculo automático de costos de consulta y recetas</div>
                <div style={styles.featureItem}>• Conteo de S/R, Becados y resumen financiero general</div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <button
                type="button"
                onClick={() => handleDescargar('pacientes')}
                disabled={descargando.pacientes}
                style={styles.btnDownload}
              >
                {descargando.pacientes ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Generando Excel...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={18} />
                    <span>Descargar Excel (.xlsx)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tarjeta 2: Control de Procedimientos */}
          <div style={styles.card}>
            <div style={{ ...styles.cardIconWrapper, background: '#dcfce7', color: '#16a34a' }}>
              <Activity size={32} />
            </div>

            <div style={styles.cardBody}>
              <div style={styles.badgeGroup}>
                <span style={styles.tagGreen}>Enfermería / Procedimientos</span>
                <span style={styles.tagGray}>Mensual</span>
              </div>

              <h2 style={styles.cardTitle}>Control de Procedimientos (Mes)</h2>
              <p style={styles.cardDesc}>
                Registro mensual correlativo de procedimientos aplicados en clínica (glucometrías, nebulizaciones, curaciones de heridas, canalizaciones de sueros, etc.), observaciones médicas y costo unitario recaudado.
              </p>

              <div style={styles.featuresList}>
                <div style={styles.featureItem}>• Nombre completo del paciente atendido</div>
                <div style={styles.featureItem}>• Procedimiento aplicado e instrucciones médicas</div>
                <div style={styles.featureItem}>• Total global de procedimientos en Quetzales</div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <button
                type="button"
                onClick={() => handleDescargar('procedimientos')}
                disabled={descargando.procedimientos}
                style={{ ...styles.btnDownload, background: '#059669' }}
              >
                {descargando.procedimientos ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Generando Excel...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={18} />
                    <span>Descargar Excel (.xlsx)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tarjeta 3: Medicamentos Vendidos (Ventas Externas) */}
          <div style={styles.card}>
            <div style={{ ...styles.cardIconWrapper, background: '#fef3c7', color: '#d97706' }}>
              <Pill size={32} />
            </div>

            <div style={styles.cardBody}>
              <div style={styles.badgeGroup}>
                <span style={styles.tagAmber}>Farmacia / Mostrador</span>
                <span style={styles.tagGray}>Solo Venta Externa</span>
              </div>

              <h2 style={styles.cardTitle}>Medicamentos Vendidos (Mes)</h2>
              <p style={styles.cardDesc}>
                Reporte exclusivo de medicamentos despachados en mostrador sin consulta médica previa, detallando cantidad, precio base de costo, el 25% de incremento institucional y el total recaudado.
              </p>

              <div style={styles.featuresList}>
                <div style={styles.featureItem}>• Solo ventas externas en mostrador (sin duplicar consulta)</div>
                <div style={styles.featureItem}>• Desglose de Precio Base + 25% de incremento</div>
                <div style={styles.featureItem}>• Total acumulado mensual de recaudación</div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <button
                type="button"
                onClick={() => handleDescargar('medicamentos')}
                disabled={descargando.medicamentos}
                style={{ ...styles.btnDownload, background: '#d97706' }}
              >
                {descargando.medicamentos ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Generando Excel...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={18} />
                    <span>Descargar Excel (.xlsx)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: '30px 40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '4px 0 8px 0',
  },
  subtitle: {
    fontSize: '14.5px',
    color: '#64748b',
    maxWidth: '680px',
    lineHeight: '1.5',
    margin: 0,
  },
  dateSelectorCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: '#ffffff',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  dateLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },
  dateControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  btnNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '34px',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  select: {
    padding: '6px 10px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#0f172a',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    outline: 'none',
  },
  selectYear: {
    padding: '6px 10px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#0f172a',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    outline: 'none',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    color: '#065f46',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    transition: 'all 0.2s ease',
  },
  cardIconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  cardBody: {
    flex: 1,
  },
  badgeGroup: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  },
  tagBlue: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    background: '#e0f2fe',
    color: '#0369a1',
  },
  tagGreen: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    background: '#dcfce7',
    color: '#15803d',
  },
  tagAmber: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    background: '#fef3c7',
    color: '#b45309',
  },
  tagGray: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    background: '#f1f5f9',
    color: '#475569',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 10px 0',
  },
  cardDesc: {
    fontSize: '13.5px',
    color: '#64748b',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    marginBottom: '20px',
  },
  featureItem: {
    fontSize: '12.5px',
    color: '#334155',
    fontWeight: '500',
  },
  cardFooter: {
    marginTop: 'auto',
  },
  btnDownload: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#0284c7',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
  },
};
