import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  AlertCircle,
  FileText,
  User,
  Stethoscope,
  Filter,
  Check,
  X
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import procedimientoService from '../services/procedimientoService';

export default function PacientesProcedimientosPage() {
  const location = useLocation();
  const [procedimientos, setProcedimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(() => {
    return location.pathname.includes('/historial') ? 'ATENDIDO' : 'ESPERA';
  }); // 'ESPERA' | 'ATENDIDO' | 'CANCELADO' | 'TODOS'
  const [busqueda, setBusqueda] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [conteoPendientes, setConteoPendientes] = useState(0);

  // Modal confirmación cancelar
  const [itemACancelar, setItemACancelar] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const normalizeRole = (r) => {
    if (!r) return '';
    const str = String(r).trim().toUpperCase();
    return str.startsWith('ROLE_') ? str.substring(5) : str;
  };
  const userRoles = [
    ...(Array.isArray(user.roles) ? user.roles : []),
    ...(user.nombreRol ? [user.nombreRol] : [])
  ].map(normalizeRole);
  const canAtender = userRoles.some(r => ['ADMIN', 'ENFERMERA', 'FARMACIA'].includes(r));

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [lista, conteoRes] = await Promise.all([
        procedimientoService.listarPacientesPorEstado(filtroEstado),
        procedimientoService.conteoPendientes(),
      ]);
      setProcedimientos(lista || []);
      setConteoPendientes(conteoRes?.pendientes ?? 0);
    } catch (err) {
      console.error('Error al cargar procedimientos de pacientes:', err);
      setErrorMsg('No se pudieron cargar los registros de procedimientos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado]);

  const handleCancelar = async () => {
    if (!itemACancelar || procesando) return;
    setProcesando(true);
    try {
      await procedimientoService.cancelarProcedimiento(itemACancelar.idConsultaProcedimiento);
      setSuccessMsg(`Procedimiento "${itemACancelar.nombreProcedimiento}" cancelado.`);
      setItemACancelar(null);
      await cargarDatos();
    } catch (err) {
      console.error('Error al cancelar:', err);
      setErrorMsg('Error al cancelar el procedimiento.');
    } finally {
      setProcesando(false);
    }
  };

  const handleMarcarAtendido = async (item) => {
    if (procesando) return;
    setProcesando(true);
    try {
      await procedimientoService.marcarAtendido(item.idConsultaProcedimiento);
      setSuccessMsg(`Procedimiento "${item.nombreProcedimiento}" marcado como ATENDIDO.`);
      await cargarDatos();
    } catch (err) {
      console.error('Error al atender:', err);
      setErrorMsg('Error al registrar la atención del procedimiento.');
    } finally {
      setProcesando(false);
    }
  };

  const formatFechaHora = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const filtrados = procedimientos.filter((p) => {
    const q = busqueda.toLowerCase();
    const paciente = (p.pacienteNombreCompleto || '').toLowerCase();
    const proc = (p.nombreProcedimiento || '').toLowerCase();
    const medico = (p.medicoNombreCompleto || '').toLowerCase();
    return paciente.includes(q) || proc.includes(q) || medico.includes(q);
  });

  return (
    <div style={styles.container}>
      <AdminNavbar />

      <main style={styles.main}>
        <Breadcrumb
          items={[
            { label: 'Procedimientos', to: '/procedimientos' },
            { label: 'Pacientes por Aplicar Procedimiento' }
          ]}
        />

        {/* Encabezado */}
        <div style={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.headerIconWrap}>
                <Stethoscope size={24} color="#0284c7" />
              </div>
              <h1 style={styles.headerTitle}>Pacientes por Aplicar Procedimiento</h1>
            </div>
            <p style={styles.headerSubtitle}>
              Lista operativa de pacientes con procedimientos clínicos solicitados y pendientes de atención
            </p>
          </div>

          <button
            onClick={cargarDatos}
            disabled={loading}
            style={styles.btnRefresh}
            title="Recargar lista"
          >
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        {/* Notificación informativa si hay pendientes */}
        {conteoPendientes > 0 && (
          <div style={styles.pendingNotificationBanner}>
            <Clock size={20} color="#b45309" />
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#92400e' }}>
                Atención requerida:
              </strong>{' '}
              Hay <strong>{conteoPendientes}</strong> procedimiento{conteoPendientes === 1 ? '' : 's'} clínico{conteoPendientes === 1 ? '' : 's'} en espera de aplicación.
            </div>
          </div>
        )}

        {/* Alertas */}
        {successMsg && (
          <div style={styles.alertSuccess}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={styles.alertError}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tarjeta de Contenido */}
        <div style={styles.card}>
          {/* Barra superior de pestañas y búsqueda */}
          <div style={styles.cardHeader}>
            <div style={styles.tabsContainer}>
              <button
                type="button"
                onClick={() => setFiltroEstado('ESPERA')}
                style={{
                  ...styles.tabBtn,
                  ...(filtroEstado === 'ESPERA' ? styles.tabBtnActive : {})
                }}
              >
                <Clock size={16} />
                <span>Por Aplicar (En Espera)</span>
                {conteoPendientes > 0 && (
                  <span style={styles.tabBadgeAmber}>{conteoPendientes}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('ATENDIDO')}
                style={{
                  ...styles.tabBtn,
                  ...(filtroEstado === 'ATENDIDO' ? styles.tabBtnActive : {})
                }}
              >
                <CheckCircle2 size={16} />
                <span>Atendidos</span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('CANCELADO')}
                style={{
                  ...styles.tabBtn,
                  ...(filtroEstado === 'CANCELADO' ? styles.tabBtnActive : {})
                }}
              >
                <XCircle size={16} />
                <span>Cancelados</span>
              </button>

              <button
                type="button"
                onClick={() => setFiltroEstado('TODOS')}
                style={{
                  ...styles.tabBtn,
                  ...(filtroEstado === 'TODOS' ? styles.tabBtnActive : {})
                }}
              >
                <Filter size={16} />
                <span>Todos los Registros</span>
              </button>
            </div>

            <div style={styles.searchBox}>
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Buscar paciente, procedimiento o médico..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Tabla de Registros */}
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '50px', textAlign: 'center' }}>#</th>
                  <th style={{ ...styles.th, width: '22%' }}>Paciente</th>
                  <th style={{ ...styles.th, width: '20%' }}>Procedimiento</th>
                  <th style={{ ...styles.th, width: '9%', textAlign: 'center' }}>Cant.</th>
                  <th style={{ ...styles.th, width: '13%', textAlign: 'right' }}>Total (Q)</th>
                  <th style={{ ...styles.th, width: '20%' }}>Instrucciones</th>
                  <th style={{ ...styles.th, width: '11%', textAlign: 'center' }}>Estado</th>
                  <th style={{ ...styles.th, width: '14%', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && procedimientos.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ ...styles.td, textAlign: 'center', padding: '36px' }}>
                      <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite', color: '#0284c7' }} />
                      <div style={{ marginTop: '10px', color: '#64748b' }}>Cargando procedimientos...</div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ ...styles.td, textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <Users size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                      <div>No hay pacientes en este estado ({filtroEstado}).</div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((item, index) => {
                    const esEspera = item.estado === 'ESPERA';
                    const esAtendido = item.estado === 'ATENDIDO';
                    const esCancelado = item.estado === 'CANCELADO';

                    return (
                      <tr key={item.idConsultaProcedimiento} style={styles.tr}>
                        <td style={{ ...styles.td, textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                          {index + 1}
                        </td>

                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <strong style={{ color: '#03045e', fontSize: '14px' }}>
                              {item.pacienteNombreCompleto || 'Paciente sin nombre'}
                            </strong>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                              {item.pacienteEdad !== null && (
                                <span>{item.pacienteEdad} años</span>
                              )}
                              {item.pacienteIdentificacion && (
                                <span>Tel: {item.pacienteIdentificacion}</span>
                              )}
                            </div>
                            {item.medicoNombreCompleto && (
                              <div style={{ fontSize: '11px', color: '#0284c7' }}>
                                Solicitado por: Dr. {item.medicoNombreCompleto}
                              </div>
                            )}
                          </div>
                        </td>

                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                              {item.nombreProcedimiento}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Fecha: {formatFechaHora(item.fechaRegistro)}
                            </span>
                          </div>
                        </td>

                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <span style={styles.cantBadge}>
                            {item.cantidad}
                          </span>
                        </td>

                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontWeight: '800', color: '#0284c7', fontSize: '14px' }}>
                              Q {Number(item.subtotal || 0).toFixed(2)}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              Q {Number(item.precioUnitario || 0).toFixed(2)} c/u
                            </span>
                          </div>
                        </td>

                        <td style={styles.td}>
                          {item.instrucciones ? (
                            <div style={styles.instruccionesBox} title={item.instrucciones}>
                              <FileText size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span style={{ fontSize: '13px', color: '#334155' }}>
                                {item.instrucciones}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                              Sin instrucciones especiales
                            </span>
                          )}
                        </td>

                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          {esEspera && (
                            <span style={styles.badgeEspera}>
                              <Clock size={12} />
                              <span>Por Aplicar</span>
                            </span>
                          )}
                          {esAtendido && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span style={styles.badgeAtendido}>
                                <CheckCircle2 size={12} />
                                <span>Atendido</span>
                              </span>
                              {item.fechaAtencion && (
                                <span style={{ fontSize: '10px', color: '#047857' }}>
                                  {formatFechaHora(item.fechaAtencion)}
                                </span>
                              )}
                            </div>
                          )}
                          {esCancelado && (
                            <span style={styles.badgeCancelado}>
                              <XCircle size={12} />
                              <span>Cancelado</span>
                            </span>
                          )}
                        </td>

                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          {esEspera && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              {canAtender && (
                                <button
                                  type="button"
                                  onClick={() => handleMarcarAtendido(item)}
                                  disabled={procesando}
                                  style={styles.btnAtender}
                                  title="Marcar procedimiento como atendido"
                                >
                                  <Check size={14} />
                                  <span>Atender</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setItemACancelar(item)}
                                disabled={procesando}
                                style={styles.btnCancelarItem}
                                title="Cancelar este procedimiento"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          {!esEspera && (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Confirmación para Cancelar */}
        {itemACancelar && (
          <div style={styles.modalBackdrop}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <div style={styles.modalAlertIcon}>
                  <AlertCircle size={22} color="#dc2626" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>¿Cancelar Procedimiento?</h3>
                  <p style={styles.modalSubtitle}>
                    Esta acción marcará el procedimiento como CANCELADO en el expediente del paciente.
                  </p>
                </div>
              </div>

              <div style={styles.modalBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#334155' }}>
                  <div><strong>Paciente:</strong> {itemACancelar.pacienteNombreCompleto}</div>
                  <div><strong>Procedimiento:</strong> {itemACancelar.nombreProcedimiento} (x{itemACancelar.cantidad})</div>
                  <div><strong>Total:</strong> Q {Number(itemACancelar.subtotal || 0).toFixed(2)}</div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setItemACancelar(null)}
                  disabled={procesando}
                  style={styles.modalBtnBack}
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  disabled={procesando}
                  style={styles.modalBtnDanger}
                >
                  {procesando ? 'Cancelando...' : 'Sí, Cancelar Procedimiento'}
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
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
  },
  main: {
    flex: 1,
    padding: '28px 36px',
    maxWidth: '1350px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 52px',
  },
  btnRefresh: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#0284c7',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  pendingNotificationBanner: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#92400e',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  alertSuccess: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    gap: '16px',
    flexWrap: 'wrap',
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    borderColor: '#0284c7',
  },
  tabBadgeAmber: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: '700',
    marginLeft: '4px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '8px 14px',
    width: '320px',
    maxWidth: '100%',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#0f172a',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  cantBadge: {
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    padding: '3px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  instruccionesBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '6px 10px',
    borderRadius: '6px',
    maxWidth: '280px',
    lineHeight: '1.4',
  },
  badgeEspera: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
  },
  badgeAtendido: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
  },
  badgeCancelado: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  btnAtender: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#059669',
    border: 'none',
    color: '#ffffff',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnCancelarItem: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    border: '1px solid #fecdd3',
    color: '#e11d48',
    padding: '6px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '20px',
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f1f5f9',
  },
  modalAlertIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px',
  },
  modalSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.4',
  },
  modalBody: {
    padding: '18px 20px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #f1f5f9',
  },
  modalFooter: {
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  modalBtnBack: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  modalBtnDanger: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
};
