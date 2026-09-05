import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Users,
  Clock,
  ArrowRight,
  Trash2,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  X,
  UserCheck,
} from 'lucide-react';
import { usePreconsulta } from '../hooks/usePreconsulta';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import userImg from '../../../assets/images/user.png';

export default function PreconsultaPage() {
  const navigate = useNavigate();

  const {
    colaPreconsulta,
    colaPendiente,
    loading,
    error,
    cargarColas,
    atenderTurno,
    cancelarTurno,
  } = usePreconsulta();

  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar colas al montar
  useEffect(() => {
    cargarColas();
  }, [cargarColas]);

  // Lista unificada de pacientes en cola de preconsulta
  const todosLosPacientes = useMemo(() => {
    return [...colaPreconsulta, ...colaPendiente];
  }, [colaPreconsulta, colaPendiente]);

  const handleAbrirPaciente = async (item) => {
    if (item.estado === 'PENDIENTE') {
      await atenderTurno(item.idCola);
    }
    navigate(`/preconsulta/signos?idPaciente=${item.idPaciente}&idCola=${item.idCola}`);
  };

  const handleConfirmarEliminar = async () => {
    if (!pacienteAEliminar) return;
    setEliminando(true);
    await cancelarTurno(pacienteAEliminar.idCola);
    setEliminando(false);
    setPacienteAEliminar(null);
  };

  const formatHora = (fecha) => {
    if (!fecha) return '--:--';
    try {
      const d = new Date(fecha);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.content}>
        {/* Panel Superior estilo Odoo */}
        <header style={styles.headerBar}>
          <div>
            <span style={styles.eyebrow}>MÓDULO DE ENFERMERÍA</span>
            <h1 style={styles.title}>Lista de Preconsulta</h1>
          </div>
          <div style={styles.headerActions}>
            <span style={styles.countBadge}>
              <Users size={14} />
              <span>{todosLosPacientes.length} en espera</span>
            </span>
            <button
              onClick={() => cargarColas()}
              style={styles.btnRefresh}
              title="Recargar lista"
              disabled={loading}
            >
              <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </header>

        {/* Alerta de Error */}
        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Espacio de Trabajo en 2 Columnas (según diseño bosquejado) */}
        <div style={styles.workspaceGrid}>
          {/* Columna Izquierda: Tarjeta Gráfica con USER.PNG */}
          <aside style={styles.brandCard}>
            <div style={styles.avatarGlowContainer}>
              <div style={styles.bigAvatarWrapper}>
                <img src={userImg} alt="Ilustración Preconsulta" style={styles.bigAvatarImg} />
              </div>
            </div>

            <div style={styles.brandContent}>
              <h2 style={styles.brandTitle}>Preconsulta Médica</h2>
              <p style={styles.brandDesc}>
                Registro y evaluación de signos vitales del paciente previos a la consulta médica.
              </p>

              <div style={styles.brandStats}>
                <div style={styles.statPill}>
                  <span style={styles.statDotActive} />
                  <span>{colaPreconsulta.length} en atención</span>
                </div>
                <div style={styles.statPill}>
                  <span style={styles.statDotPending} />
                  <span>{colaPendiente.length} pendientes</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Columna Derecha: Lista de Pacientes en Espera */}
          <section style={styles.listSection}>
            {loading && todosLosPacientes.length === 0 ? (
              <div style={styles.loadingBox}>
                <p style={{ margin: 0, color: '#0077b6', fontWeight: 600 }}>
                  Cargando pacientes en espera...
                </p>
              </div>
            ) : todosLosPacientes.length === 0 ? (
              <div style={styles.emptyState}>
                <img src={userImg} alt="Sin pacientes" style={styles.emptyImg} />
                <h3 style={{ color: '#03045e', margin: '14px 0 6px', fontSize: '18px' }}>
                  No hay pacientes en cola de preconsulta
                </h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                  Los pacientes derivados desde recepción aparecerán aquí automáticamente.
                </p>
              </div>
            ) : (
              <div style={styles.patientsStack}>
                {todosLosPacientes.map((item, index) => {
                  const isEnAtencion = item.estado === 'EN_PRECONSULTA';

                  return (
                    <div key={item.idCola} style={styles.patientRowCard}>
                      {/* Información del Paciente */}
                      <div style={styles.patientInfoCol}>
                        <div style={styles.nameRow}>
                          <h3 style={styles.patientName}>
                            {item.nombresPaciente} {item.apellidosPaciente}
                          </h3>
                          <span
                            style={
                              isEnAtencion
                                ? styles.statusBadgeActive
                                : styles.statusBadgePending
                            }
                          >
                            {isEnAtencion ? 'En atención' : 'En espera'}
                          </span>
                        </div>

                        <div style={styles.metaRow}>
                          <Clock size={13} color="#0077b6" />
                          <span style={styles.metaText}>
                            Hora de llegada: <strong>{formatHora(item.fechaIngreso)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Botones de Acción: [Abrir] y [Eliminar] */}
                      <div style={styles.actionsCol}>
                        <button
                          type="button"
                          onClick={() => handleAbrirPaciente(item)}
                          style={styles.btnAbrir}
                          title="Abrir formulario de signos vitales"
                        >
                          <span>{isEnAtencion ? 'Continuar' : 'Abrir'}</span>
                          <ArrowRight size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPacienteAEliminar(item)}
                          style={styles.btnEliminar}
                          title="Eliminar paciente de la cola"
                        >
                          <Trash2 size={15} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Modal de Confirmación para Eliminar/Cancelar de la cola */}
        {pacienteAEliminar && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <div style={styles.modalIconBox}>
                  <AlertTriangle size={22} color="#dc2626" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.modalTitle}>¿Retirar de la cola de preconsulta?</h3>
                  <p style={styles.modalSubtitle}>
                    El turno pasará a estado <strong>CANCELADO</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPacienteAEliminar(null)}
                  style={styles.btnModalClose}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                  ¿Desea retirar a{' '}
                  <strong>
                    {pacienteAEliminar.nombresPaciente} {pacienteAEliminar.apellidosPaciente}
                  </strong>{' '}
                  de la lista de preconsulta? El paciente se marcará como cancelado y ya no figurará en la lista.
                </p>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setPacienteAEliminar(null)}
                  style={styles.btnModalCancel}
                  disabled={eliminando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarEliminar}
                  style={styles.btnModalConfirm}
                  disabled={eliminando}
                >
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    background: 'white',
    padding: '20px 24px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  eyebrow: {
    color: '#0077b6',
    fontWeight: '700',
    fontSize: '12px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '4px',
  },
  title: {
    color: '#03045e',
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#caf0f8',
    color: '#03045e',
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #90e0ef',
  },
  btnRefresh: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    color: '#0077b6',
    transition: 'all 0.2s',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fee2e2',
    color: '#991b1b',
    padding: '14px 18px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #fecaca',
  },
  workspaceGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  brandCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  avatarGlowContainer: {
    padding: '8px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #caf0f8 0%, #e0f2fe 100%)',
    marginBottom: '20px',
  },
  bigAvatarWrapper: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'white',
    border: '3px solid #00b4d8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 180, 216, 0.15)',
  },
  bigAvatarImg: {
    width: '85%',
    height: '85%',
    objectFit: 'contain',
  },
  brandContent: {
    width: '100%',
  },
  brandTitle: {
    color: '#03045e',
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px',
  },
  brandDesc: {
    color: '#64748b',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: '0 0 20px',
  },
  brandStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  statPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
  },
  statDotActive: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#0077b6',
  },
  statDotPending: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#d97706',
  },
  listSection: {
    minWidth: 0,
  },
  loadingBox: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '40px',
    textAlign: 'center',
  },
  emptyState: {
    padding: '48px 24px',
    textAlign: 'center',
    background: 'white',
    borderRadius: '10px',
    border: '1px dashed #cbd5e1',
  },
  emptyImg: {
    width: '64px',
    height: '64px',
    opacity: 0.5,
    filter: 'grayscale(1)',
  },
  patientsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  patientRowCard: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s ease',
    gap: '16px',
  },
  patientInfoCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  patientName: {
    margin: 0,
    color: '#03045e',
    fontSize: '16px',
    fontWeight: '700',
  },
  statusBadgeActive: {
    background: '#caf0f8',
    color: '#0077b6',
    border: '1px solid #90e0ef',
    borderRadius: '12px',
    padding: '2px 10px',
    fontSize: '11px',
    fontWeight: '700',
  },
  statusBadgePending: {
    background: '#fef3c7',
    color: '#b45309',
    border: '1px solid #fde68a',
    borderRadius: '12px',
    padding: '2px 10px',
    fontSize: '11px',
    fontWeight: '700',
  },
  metaRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  metaText: {
    color: '#64748b',
    fontSize: '13px',
  },
  actionsCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  btnAbrir: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnEliminar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fff5f5',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '9px 14px',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3, 4, 94, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1050,
    padding: '16px',
  },
  modalCard: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '460px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },
  modalIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#03045e',
  },
  modalSubtitle: {
    margin: '2px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  btnModalClose: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    background: '#f8fafc',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '20px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnModalCancel: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnModalConfirm: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
