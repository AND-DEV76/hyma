import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Users,
  Clock,
  Trash2,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  X,
  PackageCheck,
} from 'lucide-react';
import { useDispensacion } from '../hooks/useDispensacion';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import userImg from '../../../assets/images/user.png';

export default function DispensacionColaPage() {
  const navigate = useNavigate();
  const { cola, loading, error, cargarCola, cancelarTurno } = useDispensacion();

  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Cargar cola al montar y sincronizar en tiempo real
  useEffect(() => {
    cargarCola(false);

    // Polling ligero cada 5s para evitar pacientes fantasmas en farmacia
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

  const handleAtender = (item) => {
    navigate(`/farmacia/dispensar?idCola=${item.idCola}&idPaciente=${item.idPaciente}`);
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
        {/* Breadcrumb de navegación */}
        <Breadcrumb
          items={[
            { label: 'Farmacia', to: '/farmacia' },
            { label: 'Dispersión' }
          ]}
        />

        {/* Panel Superior estilo Odoo */}
        <header style={styles.headerBar}>
          <div>
            <span style={styles.eyebrow}>MÓDULO DE FARMACIA</span>
            <h1 style={styles.title}>Pacientes en Espera de Medicamentos</h1>
          </div>
          <div style={styles.headerActions}>
            <span style={styles.countBadge}>
              <Users size={14} />
              <span>{cola.length} en espera</span>
            </span>
            <button
              onClick={() => cargarCola()}
              style={styles.btnRefresh}
              title="Recargar lista"
              disabled={loading}
            >
              <RefreshCw
                size={16}
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
              />
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

        {/* Espacio de Trabajo en 2 Columnas */}
        <div style={styles.workspaceGrid}>
          {/* Columna Izquierda: Tarjeta Gráfica con USER.PNG */}
          <aside style={styles.brandCard}>
            <div style={styles.avatarGlowContainer}>
              <div style={styles.bigAvatarWrapper}>
                <img
                  src={userImg}
                  alt="Ilustración Dispensación"
                  style={styles.bigAvatarImg}
                />
              </div>
            </div>

            <div style={styles.brandContent}>
              <h2 style={styles.brandTitle}>Dispensación Farmacia</h2>
              <p style={styles.brandDesc}>
                Entrega y despacho de recetas médicas derivadas tras la consulta médica.
              </p>

              <div style={styles.brandStats}>
                <div style={styles.statPill}>
                  <span style={styles.statDotActive} />
                  <span>{cola.length} recetas por entregar</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Columna Derecha: Lista de Pacientes en Espera */}
          <section style={styles.listSection}>
            {loading && cola.length === 0 ? (
              <div style={styles.loadingBox}>
                <p style={{ margin: 0, color: '#0077b6', fontWeight: 600 }}>
                  Cargando pacientes en espera de farmacia...
                </p>
              </div>
            ) : cola.length === 0 ? (
              <div style={styles.emptyState}>
                <img src={userImg} alt="Sin pacientes" style={styles.emptyImg} />
                <h3 style={{ color: '#03045e', margin: '14px 0 6px', fontSize: '18px' }}>
                  No hay pacientes esperando medicamentos
                </h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                  Cuando el médico finalice una consulta con receta médica, el paciente aparecerá listado aquí en orden de salida.
                </p>
              </div>
            ) : (
              <div style={styles.patientsStack}>
                {cola.map((item) => (
                  <div key={item.idCola} style={styles.patientRowCard}>
                    {/* Avatar miniatura USER.PNG */}
                    <div style={styles.avatarThumbWrapper}>
                      <img src={userImg} alt="Paciente" style={styles.avatarThumbImg} />
                    </div>

                    <div style={styles.verticalDivider} />

                    {/* Información del Paciente */}
                    <div style={styles.patientInfoCol}>
                      <div style={styles.nameRow}>
                        <h3 style={styles.patientName}>
                          {item.nombresPaciente} {item.apellidosPaciente}
                        </h3>
                        <span style={styles.statusBadgeActive}>EN FARMACIA</span>
                      </div>

                      <div style={styles.metaRow}>
                        <Clock size={14} color="#0077b6" />
                        <span style={styles.metaText}>
                          Derivado de consulta:{' '}
                          <strong>{formatHora(item.fechaAtencion || item.fechaIngreso)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Botones de Acción: Atender y Eliminar */}
                    <div style={styles.actionsCol}>
                      <button
                        onClick={() => handleAtender(item)}
                        style={styles.btnAbrir}
                        title="Despachar receta médica"
                      >
                        <PackageCheck size={16} />
                        <span>Atender</span>
                      </button>

                      <button
                        onClick={() => setPacienteAEliminar(item)}
                        style={styles.btnEliminar}
                        title="Cancelar turno de farmacia"
                      >
                        <Trash2 size={16} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Modal de Confirmación para Eliminar/Cancelar */}
        {pacienteAEliminar && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <div style={styles.modalIconAlert}>
                  <AlertTriangle size={20} color="#dc2626" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>¿Cancelar turno de farmacia?</h3>
                  <p style={styles.modalSub}>
                    Esta acción quitará al paciente de la cola de dispensación.
                  </p>
                </div>
                <button
                  onClick={() => setPacienteAEliminar(null)}
                  style={styles.modalCloseBtn}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <p style={{ margin: 0, color: '#334155', fontSize: '14px' }}>
                  El paciente{' '}
                  <strong>
                    {pacienteAEliminar.nombresPaciente} {pacienteAEliminar.apellidosPaciente}
                  </strong>{' '}
                  pasará al estado <strong>CANCELADO</strong>. Esta acción se utiliza si el paciente se ha retirado de la clínica sin recoger sus medicamentos.
                </p>
              </div>

              <div style={styles.modalFooter}>
                <button
                  onClick={() => setPacienteAEliminar(null)}
                  style={styles.btnModalCancel}
                  disabled={eliminando}
                >
                  Regresar
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  style={styles.btnModalConfirmDelete}
                  disabled={eliminando}
                >
                  {eliminando ? 'Cancelando...' : 'Confirmar Cancelación'}
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
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '24px 32px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#0077b6',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  title: {
    margin: '2px 0 0',
    color: '#03045e',
    fontSize: '24px',
    fontWeight: '700',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#e0f2fe',
    color: '#0077b6',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid #bae6fd',
  },
  btnRefresh: {
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 10px',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  workspaceGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  brandCard: {
    background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 119, 182, 0.05)',
  },
  avatarGlowContainer: {
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #e0f2fe 0%, #ffffff 80%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #90e0ef',
    marginBottom: '16px',
  },
  bigAvatarWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
  },
  bigAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  brandContent: {
    width: '100%',
  },
  brandTitle: {
    margin: '0 0 6px',
    color: '#03045e',
    fontSize: '18px',
    fontWeight: '800',
  },
  brandDesc: {
    margin: '0 0 16px',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  brandStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  statPill: {
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '12px',
    color: '#334155',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  statDotActive: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#0077b6',
  },
  listSection: {
    minWidth: 0,
  },
  loadingBox: {
    padding: '40px',
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
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
  avatarThumbWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#f1f5f9',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #cbd5e1',
  },
  avatarThumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  verticalDivider: {
    width: '1px',
    height: '36px',
    background: '#e2e8f0',
    flexShrink: 0,
  },
  patientInfoCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
  modalIconAlert: {
    background: '#fee2e2',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
  },
  modalTitle: {
    margin: '0 0 4px',
    fontSize: '16px',
    color: '#0f172a',
    fontWeight: '700',
  },
  modalSub: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
  modalCloseBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  modalBody: {
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
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
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnModalConfirmDelete: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
