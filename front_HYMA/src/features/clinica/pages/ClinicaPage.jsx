import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Stethoscope, Trash2, AlertCircle, RefreshCw, AlertTriangle, X, Loader2, Activity } from 'lucide-react';
import { useClinica } from '../hooks/useClinica';
import { evaluarTriajePaciente } from '../utils/triajeSignosVitales';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import userImg from '../../../assets/images/user.png';
import '../styles/clinica.css';

export default function ClinicaPage() {
  const navigate = useNavigate();
  const { cola, loading, error, cargarCola, cancelarAtencion } = useClinica();
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Obtener roles del usuario actual
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = (user.roles && user.roles.length > 0)
    ? user.roles
    : (user.nombreRol ? [user.nombreRol] : []);
  const canAtender = userRoles.includes('ADMIN') || userRoles.includes('MEDICO');

  // Cargar cola y mantener en tiempo real
  useEffect(() => {
    cargarCola(false);

    // Polling ligero cada 5s para evitar datos fantasmas
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        cargarCola(true);
      }
    }, 5000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        cargarCola(true);
      }
    };

    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [cargarCola]);

  const handleAtender = (idPaciente, idCola) => {
    navigate('/clinica/atencion?idPaciente=' + idPaciente + '&idCola=' + idCola);
  };

  const handleConfirmarEliminar = async () => {
    if (!pacienteAEliminar || eliminando) return;
    setEliminando(true);
    try {
      await cancelarAtencion(pacienteAEliminar.idCola);
      setPacienteAEliminar(null);
    } finally {
      setEliminando(false);
    }
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
      <main className="clinica-content" style={styles.content}>
        {/* Odoo Control Panel / Header */}
        <section className="clinica-header-bar" style={styles.headerBar}>
          <div>
            <span style={styles.eyebrow}>CLINICA MEDICA</span>
            <h1 style={styles.title}>Pacientes en Espera de Consulta</h1>
          </div>
          <div className="clinica-header-bar-actions" style={styles.headerActions}>
            <span style={styles.countBadge}>
              {cola.length} {cola.length === 1 ? 'paciente' : 'pacientes'} en espera
            </span>
            <button
              onClick={() => cargarCola()}
              style={styles.btnRefresh}
              title="Recargar lista"
              disabled={loading}
            >
              <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </section>

        {/* Leyenda de Triaje Clínico estilo Odoo */}
        <section className="clinica-triaje-legend">
          <span className="clinica-triaje-legend-title">
            <Activity size={14} color="#0077b6" /> Triaje de Signos Vitales:
          </span>
          <div className="clinica-triaje-legend-items">
            <span className="clinica-triaje-legend-item">
              <span className="clinica-triaje-dot clinica-triaje-dot-rojo" />
              <span><strong>Rojo:</strong> Crítico Alto</span>
            </span>
            <span className="clinica-triaje-legend-item">
              <span className="clinica-triaje-dot clinica-triaje-dot-azul" />
              <span><strong>Azul:</strong> Crítico Bajo</span>
            </span>
            <span className="clinica-triaje-legend-item">
              <span className="clinica-triaje-dot clinica-triaje-dot-amarillo" />
              <span><strong>Amarillo:</strong> Alerta Leve</span>
            </span>
            <span className="clinica-triaje-legend-item">
              <span className="clinica-triaje-dot clinica-triaje-dot-normal" />
              <span><strong>Verde:</strong> Normal</span>
            </span>
          </div>
        </section>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading && cola.length === 0 ? (
          <div style={styles.loadingBox}>
            <p style={{ margin: 0, color: '#0077b6', fontWeight: 600 }}>Cargando pacientes en espera...</p>
          </div>
        ) : cola.length === 0 ? (
          <div style={styles.emptyState}>
            <img src={userImg} alt="Sin pacientes" style={styles.emptyImg} />
            <h3 style={{ color: '#03045e', margin: '14px 0 6px', fontSize: '18px' }}>
              No hay pacientes esperando consulta
            </h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Los pacientes en espera aparecerán listados aquí cuando sean derivados a consulta médica.
            </p>
          </div>
        ) : (
          <div style={styles.patientList}>
            {cola.map((item) => {
              const triaje = evaluarTriajePaciente(item.ultimoSignoVital);

              return (
                <div key={item.idCola} className="clinica-patient-card" style={styles.patientCard}>
                  <div className="clinica-card-top-row" style={styles.cardTopRow}>
                    {/* Avatar USER.PNG */}
                    <div style={styles.avatarContainer}>
                      <img src={userImg} alt="Avatar Paciente" style={styles.avatarImg} />
                    </div>

                    {/* Separator | */}
                    <div className="clinica-card-divider" style={styles.divider} />

                    {/* Paciente: Nombre, Estado, Badge Triaje y Signos Vitales */}
                    <div className="clinica-card-info" style={styles.infoCol}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={styles.patientName}>
                          {item.nombresPaciente} {item.apellidosPaciente}
                        </h3>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: item.estado === 'EN_CONSULTA' ? '#dcfce7' : '#e0f2fe',
                            color: item.estado === 'EN_CONSULTA' ? '#166534' : '#0369a1',
                            border: `1px solid ${item.estado === 'EN_CONSULTA' ? '#bbf7d0' : '#bae6fd'}`,
                          }}
                        >
                          {item.estado === 'EN_CONSULTA' ? 'EN CONSULTA' : 'ESPERA CONSULTA'}
                        </span>

                        {/* Badge de Estado General (Prioridad Máxima) */}
                        {triaje.tieneSignos && (
                          <span
                            className={`clinica-badge-triaje ${triaje.estadoGeneral.toLowerCase()}`}
                            title={
                              triaje.alertas.length > 0
                                ? `Alertas: ${triaje.alertas.map((a) => `${a.signo} (${a.label})`).join(', ')}`
                                : 'Todos los signos vitales registrados están en rango normal'
                            }
                          >
                            <span
                              className="clinica-triaje-dot"
                              style={{ backgroundColor: triaje.badge.dot }}
                            />
                            {triaje.badge.text}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <div style={styles.horaBadge}>
                          <Clock size={14} color="#0077b6" />
                          <span style={styles.horaText}>
                            Hora: <strong>{formatHora(item.fechaIngreso)}</strong>
                          </span>
                        </div>

                        {triaje.alertas.length > 0 && (
                          <span style={{ fontSize: '12px', color: triaje.badge.color, fontWeight: 600 }}>
                            ⚠️ {triaje.alertas.length} {triaje.alertas.length === 1 ? 'signo en alerta' : 'signos en alerta'} ({triaje.alertas.map((a) => a.signo).join(', ')})
                          </span>
                        )}
                      </div>

                      {/* Desglose de Signos Vitales (Odoo style chips) */}
                      <div className="clinica-vitals-container">
                        <div className="clinica-vitals-chips-row">
                          {triaje.chips.length > 0 ? (
                            triaje.chips.map((chip, idx) => (
                              <span
                                key={idx}
                                className={`clinica-vital-chip ${chip.estado.toLowerCase()}`}
                                title={`${chip.nombre}: ${chip.valor} — ${chip.label} (${chip.tipo})`}
                              >
                                <span className="clinica-vital-chip-sigla">{chip.sigla}:</span>
                                <span className="clinica-vital-chip-valor">{chip.valor}</span>
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                              Sin signos vitales registrados en preconsulta
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opciones: Atender (solo Médico/Admin) y Eliminar */}
                  <div className="clinica-card-actions" style={styles.actionsCol}>
                    {canAtender && (
                      <button
                        onClick={() => handleAtender(item.idPaciente, item.idCola)}
                        style={styles.btnAtender}
                        title="Iniciar atención médica"
                      >
                        <Stethoscope size={16} />
                        <span>Atender</span>
                      </button>
                    )}

                    <button
                      onClick={() => setPacienteAEliminar(item)}
                      style={styles.btnEliminar}
                      title="Eliminar de la cola de espera"
                    >
                      <Trash2 size={16} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Confirmación para Eliminar/Cancelar */}
        {pacienteAEliminar && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <div style={styles.modalIconBox}>
                  <AlertTriangle size={22} color="#dc2626" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.modalTitle}>¿Retirar de la cola de espera?</h3>
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
                  de la lista de espera? Ya no figurará en la lista de consulta.
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
                  {eliminando ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '6px' }} />
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    'Sí, eliminar'
                  )}
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
    maxWidth: '1100px',
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
  patientList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  patientCard: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '16px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  avatarContainer: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: '#caf0f8',
    border: '2px solid #90e0ef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  divider: {
    width: '1px',
    height: '38px',
    background: '#e2e8f0',
    margin: '0 20px',
    flexShrink: 0,
  },
  infoCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  patientName: {
    margin: 0,
    color: '#03045e',
    fontSize: '17px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  horaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  horaText: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '400',
  },
  actionsCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: '16px',
    flexShrink: 0,
  },
  btnAtender: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '7px',
    fontSize: '14px',
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
    padding: '9px 15px',
    borderRadius: '7px',
    fontSize: '14px',
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
