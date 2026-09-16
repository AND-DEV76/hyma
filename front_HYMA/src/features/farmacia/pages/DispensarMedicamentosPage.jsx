import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Pill,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  User,
  Clock,
  FileText,
  Package,
  Info,
} from 'lucide-react';
import { useDispensacion } from '../hooks/useDispensacion';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import userImg from '../../../assets/images/user.png';

export default function DispensarMedicamentosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idCola = searchParams.get('idCola');
  const idPaciente = searchParams.get('idPaciente');

  const {
    receta,
    loading,
    entregando,
    error,
    cargarReceta,
    entregarMedicamentos,
  } = useDispensacion();

  const [confirmandoEntrega, setConfirmandoEntrega] = useState(false);
  const [noPagaConsulta, setNoPagaConsulta] = useState(false);

  const precioConsultaOriginal = Number(receta?.precioConsulta || 0);
  const costoConsultaCobrar = noPagaConsulta ? 0 : precioConsultaOriginal;

  const totalMedicamentos = (receta?.lotesSugeridos || []).reduce((acc, l) => {
    const cant = Number(l.cantidadADescontar || 0);
    const precio = Number(l.precioUnitario || 0);
    return acc + (cant * precio);
  }, 0);

  const totalAPagar = costoConsultaCobrar + totalMedicamentos;

  useEffect(() => {
    if (idCola || idPaciente) {
      cargarReceta(idCola ? Number(idCola) : null, idPaciente ? Number(idPaciente) : null);
    } else {
      navigate('/farmacia/dispensacion');
    }
  }, [idCola, idPaciente, cargarReceta, navigate]);

  const handleDarMedicamentos = async () => {
    if (!idCola) {
      alert('No se cuenta con un identificador de cola para finalizar el turno.');
      return;
    }

    const res = await entregarMedicamentos(Number(idCola), {
      noPagaConsulta,
      observaciones: noPagaConsulta ? 'Exonerado de consulta médica por caso especial' : null,
    });
    if (res.success) {
      alert('Medicamentos entregados con éxito. El paciente ha finalizado su atención.');
      navigate('/farmacia/dispensacion');
    }
  };

  const formatFecha = (f) => {
    if (!f) return '--';
    try {
      if (typeof f === 'string' && f.includes('T')) {
        const d = new Date(f);
        return d.toLocaleString([], {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      const [y, m, d] = String(f).split('-').map(Number);
      if (y && m && d) {
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
      const dt = new Date(f);
      return dt.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(f);
    }
  };

  const getDosisTexto = (m) => {
    if (m.dosis && m.dosis.trim()) {
      return m.dosis;
    }
    const pres = (m.presentacion || '').toLowerCase();
    if (pres.includes('jarabe') || pres.includes('suspensi') || pres.includes('soluci')) {
      return '1 cucharadita (5 ml)';
    }
    if (pres.includes('crema') || pres.includes('ung') || pres.includes('pomada') || pres.includes('gel') || pres.includes('vaginal')) {
      return '1 aplicación tópica';
    }
    if (pres.includes('inhalad') || pres.includes('spray') || pres.includes('aerosol')) {
      return '1-2 disparos';
    }
    return '1 unidad por toma';
  };

  const getUnidadTexto = (m) => {
    const pres = (m.presentacion || '').toLowerCase();
    if (pres.includes('jarabe') || pres.includes('suspensi') || pres.includes('soluci')) {
      return Number(m.cantidad) === 1 ? 'frasco' : 'frascos';
    }
    if (pres.includes('crema') || pres.includes('ung') || pres.includes('pomada') || pres.includes('gel') || pres.includes('vaginal')) {
      return Number(m.cantidad) === 1 ? 'tubo' : 'tubos';
    }
    if (pres.includes('inhalad') || pres.includes('spray') || pres.includes('aerosol')) {
      return Number(m.cantidad) === 1 ? 'inhalador' : 'inhaladores';
    }
    return Number(m.cantidad) === 1 ? 'unidad' : 'unidades';
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.content}>
        {/* Header Odoo */}
        <div style={styles.odooHeaderCard}>
          <div style={styles.headerLeft}>
            <div style={styles.avatarThumbWrapper}>
              <img src={userImg} alt="Avatar" style={styles.avatarThumbImg} />
            </div>

            <div style={styles.verticalDivider}>|</div>

            <div>
              <span style={styles.headerEyebrow}>DISPENSACIÓN DE FARMACIA</span>
              <h1 style={styles.headerTitle}>
                Paciente: {receta?.nombreCompletoPaciente || 'Cargando...'}
              </h1>
            </div>
          </div>

          <div style={styles.headerRight}>
            <button
              type="button"
              onClick={() => navigate('/farmacia/dispensacion')}
              style={styles.btnVolver}
              title="Volver a la cola"
            >
              <ArrowLeft size={16} />
              <span>Volver a la cola</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading && !receta ? (
          <div style={styles.loadingBox}>
            <p style={{ margin: 0, color: '#0077b6', fontWeight: 600 }}>
              Cargando receta e indicaciones del paciente...
            </p>
          </div>
        ) : (
          <div style={styles.layoutGrid}>
            {/* Columna Izquierda: Tarjeta Gráfica y Botones de Acción (según boceto) */}
            <aside style={styles.leftCol}>
              <div style={styles.bigAvatarCard}>
                <div style={styles.avatarGlowContainer}>
                  <div style={styles.bigAvatarWrapper}>
                    <img src={userImg} alt="Paciente" style={styles.bigAvatarImg} />
                  </div>
                </div>

                <h3 style={styles.patientAvatarName}>
                  {receta?.nombreCompletoPaciente || 'Paciente'}
                </h3>
                <span style={styles.avatarSubtag}>Entrega de Prescripción</span>
              </div>

              {/* Tarjeta de Cobro / Resumen Financiero Dinámico */}
              <div style={styles.billingCard}>
                <div style={styles.billingHeader}>
                  <span style={styles.billingEyebrow}>RESUMEN DE PAGO</span>
                  <div style={styles.billingTotalAmount}>
                    Q {totalAPagar.toFixed(2)}
                  </div>
                </div>

                <div style={styles.billingDivider} />

                <div style={styles.billingRow}>
                  <span style={styles.billingLabel}>Tarifa Consulta:</span>
                  <div style={{ textAlign: 'right' }}>
                    {noPagaConsulta ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>
                          Q {precioConsultaOriginal.toFixed(2)}
                        </span>
                        <span style={{ color: '#059669', fontWeight: '800', fontSize: '13px' }}>
                          Q 0.00
                        </span>
                      </div>
                    ) : (
                      <span style={styles.billingVal}>
                        Q {precioConsultaOriginal.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.billingRow}>
                  <span style={styles.billingLabel}>Medicamentos:</span>
                  <span style={styles.billingVal}>
                    Q {totalMedicamentos.toFixed(2)}
                  </span>
                </div>

                {/* Checkbox No Paga Consulta */}
                <div style={styles.checkboxContainer}>
                  <label style={styles.checkboxLabelWrapper}>
                    <input
                      type="checkbox"
                      checked={noPagaConsulta}
                      onChange={(e) => setNoPagaConsulta(e.target.checked)}
                      style={styles.checkboxInput}
                    />
                    <span style={styles.checkboxText}>
                      No paga consulta (Caso Especial)
                    </span>
                  </label>
                  {noPagaConsulta && (
                    <span style={styles.exoneradoBadge}>
                      ✓ Consulta exonerada (Q 0.00)
                    </span>
                  )}
                </div>
              </div>

              {/* Botones DAR y CANCELAR (diseño de imagen) */}
              <div style={styles.actionButtonsStack}>
                <button
                  type="button"
                  onClick={() => setConfirmandoEntrega(true)}
                  disabled={entregando}
                  style={styles.btnDar}
                  title="Entregar medicamentos y finalizar atención"
                >
                  <CheckCircle2 size={18} />
                  <span>{entregando ? 'Entregando...' : 'Dar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/farmacia/dispensacion')}
                  disabled={entregando}
                  style={styles.btnCancelar}
                  title="Volver a la cola"
                >
                  <span>Cancelar</span>
                </button>
              </div>
            </aside>

            {/* Columna Derecha: Información, Indicaciones y Receta */}
            <section style={styles.rightCol}>
              {/* Tarjeta de Ficha Paciente y Médico */}
              <div style={styles.infoCard}>
                <div style={styles.infoHeader}>
                  <User size={18} color="#0077b6" />
                  <h3 style={styles.infoTitle}>Datos de la Consulta Médica</h3>
                </div>

                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Médico Tratante</span>
                    <span style={styles.summaryVal}>
                      {receta?.nombreMedico || 'No asignado'}
                    </span>
                  </div>

                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Fecha Consulta</span>
                    <span style={styles.summaryVal}>
                      {formatFecha(receta?.fechaConsulta)}
                    </span>
                  </div>

                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Edad</span>
                    <span style={styles.summaryVal}>
                      {receta?.edad !== null && receta?.edad !== undefined
                        ? `${receta.edad} años`
                        : 'No especificada'}
                    </span>
                  </div>

                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Comunidad</span>
                    <span style={styles.summaryVal}>
                      {receta?.comunidad || 'No especificada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Indicaciones Generales */}
              {receta?.observacionesTratamiento && (
                <div style={styles.indicationsCard}>
                  <div style={styles.indicationsHeader}>
                    <FileText size={18} color="#0284c7" />
                    <h3 style={styles.indicationsTitle}>
                      Indicaciones Generales del Médico
                    </h3>
                  </div>
                  <p style={styles.indicationsText}>
                    {receta.observacionesTratamiento}
                  </p>
                </div>
              )}

              {/* Tarjeta de Tabla de Medicamentos a Entregar */}
              <div style={styles.tableCard}>
                <div style={styles.tableHeaderBar}>
                  <Pill size={18} color="#0077b6" />
                  <h3 style={styles.tableTitle}>
                    Medicamentos Recetados para Entrega
                  </h3>
                </div>

                {receta?.medicamentos && receta.medicamentos.length > 0 ? (
                  <div style={styles.tableResponsive}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, width: '25%' }}>Medicamento</th>
                          <th style={{ ...styles.th, width: '18%' }}>Presentación / Conc.</th>
                          <th style={{ ...styles.th, width: '18%' }}>Dosis / Toma</th>
                          <th style={{ ...styles.th, width: '15%' }}>Frecuencia</th>
                          <th style={{ ...styles.th, width: '10%' }}>Duración</th>
                          <th style={{ ...styles.th, width: '14%', textAlign: 'center' }}>
                            Cantidad a Entregar
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {receta.medicamentos.map((m) => {
                          const stockBajo =
                            m.stockDisponible !== null &&
                            m.stockDisponible !== undefined &&
                            m.stockDisponible < m.cantidad;

                          return (
                            <tr key={m.idMedicamento} style={styles.tr}>
                              <td style={styles.td}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <strong style={{ color: '#03045e', fontSize: '14px' }}>
                                    {m.nombre}
                                  </strong>
                                  {stockBajo && (
                                    <span style={styles.warningStock}>
                                      Stock bajo en farmacia: {m.stockDisponible} disponibles
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td style={styles.td}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  {m.presentacion && (
                                    <span style={styles.badgePres}>{m.presentacion}</span>
                                  )}
                                  {m.concentracion && (
                                    <span style={styles.badgeConc}>{m.concentracion}</span>
                                  )}
                                  {!m.presentacion && !m.concentracion && (
                                    <span style={{ color: '#94a3b8' }}>—</span>
                                  )}
                                </div>
                              </td>

                              <td style={styles.td}>
                                <span style={styles.badgeDosis}>
                                  {getDosisTexto(m)}
                                </span>
                              </td>

                              <td style={styles.td}>
                                <span style={{ color: '#334155', fontWeight: '500' }}>
                                  {m.frecuencia || 'Según indicación'}
                                </span>
                              </td>

                              <td style={styles.td}>
                                <span style={{ color: '#334155', fontWeight: '500' }}>
                                  {m.duracion || 'Según evolución'}
                                </span>
                              </td>

                              <td style={{ ...styles.td, textAlign: 'center' }}>
                                <span style={styles.qtyBadge}>
                                  {m.cantidad} {getUnidadTexto(m)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.emptyTable}>
                    <p style={{ margin: 0, color: '#64748b', fontStyle: 'italic' }}>
                      Esta consulta no contiene medicamentos prescritos para farmacia.
                    </p>
                  </div>
                )}
              </div>

              {/* Apartado de Notificación: Medicamentos Sugeridos a Dar (Próximos a Vencer) */}
              <div style={styles.suggestionCard}>
                <div style={styles.suggestionHeader}>
                  <div style={styles.suggestionHeaderLeft}>
                    <div style={styles.suggestionIconWrapper}>
                      <Clock size={18} color="#0077b6" />
                    </div>
                    <div>
                      <h3 style={styles.suggestionTitle}>Medicamentos sugeridos a dar</h3>
                      <p style={styles.suggestionSubtitle}>
                        Lotes recomendados más próximos a vencer (FEFO). Al dar clic en <strong>Dar</strong>, el sistema descontará automáticamente de estos lotes.
                      </p>
                    </div>
                  </div>
                  <span style={styles.fefoBadge}>PEPS / FEFO</span>
                </div>

                {receta?.lotesSugeridos && receta.lotesSugeridos.length > 0 ? (
                  <div style={styles.suggestionTableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ ...styles.th, width: '22%' }}>Medicamento</th>
                          <th style={{ ...styles.th, width: '14%' }}>Número de Lote</th>
                          <th style={{ ...styles.th, width: '18%' }}>Fecha de Vencimiento</th>
                          <th style={{ ...styles.th, width: '11%', textAlign: 'center' }}>Stock</th>
                          <th style={{ ...styles.th, width: '11%', textAlign: 'center' }}>A Descontar</th>
                          <th style={{ ...styles.th, width: '12%', textAlign: 'right' }}>Precio Unit.</th>
                          <th style={{ ...styles.th, width: '12%', textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receta.lotesSugeridos.map((lote, idx) => {
                          const dias = lote.diasParaVencer;
                          const esCritico = dias !== null && dias !== undefined && dias <= 30;
                          const esAlerta = dias !== null && dias !== undefined && dias > 30 && dias <= 90;
                          const pUnit = Number(lote.precioUnitario || 0);
                          const cant = Number(lote.cantidadADescontar || 0);
                          const subtotal = pUnit * cant;

                          return (
                            <tr key={idx} style={styles.tr}>
                              <td style={styles.td}>
                                <strong style={{ color: '#03045e', fontSize: '13px' }}>
                                  {lote.medicamentoNombre}
                                </strong>
                              </td>
                              <td style={styles.td}>
                                <span style={styles.loteBadge}>
                                  {lote.numeroLote || 'S/L'}
                                </span>
                              </td>
                              <td style={styles.td}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ color: '#1e293b', fontWeight: '600', fontSize: '13px' }}>
                                    {formatFecha(lote.fechaVencimiento)}
                                  </span>
                                  {lote.tieneStock && dias !== null && (
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: esCritico ? '#dc2626' : esAlerta ? '#d97706' : '#059669',
                                      }}
                                    >
                                      {dias < 0
                                        ? `Vencido hace ${Math.abs(dias)} días`
                                        : dias === 0
                                        ? 'Vence hoy'
                                        : `Vence en ${dias} días`}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ ...styles.td, textAlign: 'center' }}>
                                <span
                                  style={{
                                    ...styles.stockLoteBadge,
                                    background: lote.stockDisponible > 0 ? '#ecfdf5' : '#fef2f2',
                                    color: lote.stockDisponible > 0 ? '#059669' : '#dc2626',
                                    borderColor: lote.stockDisponible > 0 ? '#a7f3d0' : '#fecaca',
                                  }}
                                >
                                  {lote.stockDisponible}{' '}
                                  {lote.stockDisponible === 1 ? 'unidad' : 'unidades'}
                                </span>
                              </td>
                              <td style={{ ...styles.td, textAlign: 'center' }}>
                                <span style={styles.descontarBadge}>
                                  - {cant} {cant === 1 ? 'unidad' : 'unidades'}
                                </span>
                              </td>
                              <td style={{ ...styles.td, textAlign: 'right' }}>
                                <span style={{ color: '#475569', fontWeight: '600', fontSize: '13px' }}>
                                  Q {pUnit.toFixed(2)}
                                </span>
                              </td>
                              <td style={{ ...styles.td, textAlign: 'right' }}>
                                <strong style={{ color: '#059669', fontSize: '13px' }}>
                                  Q {subtotal.toFixed(2)}
                                </strong>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.suggestionEmpty}>
                    <p style={{ margin: 0, color: '#64748b' }}>
                      No hay lotes sugeridos disponibles para esta consulta.
                    </p>
                  </div>
                )}

                <div style={styles.suggestionFooterNote}>
                  <Info size={15} color="#0077b6" />
                  <span>
                    El inventario se actualizará automáticamente descontando de los lotes sugeridos y se guardará el registro formal en salida de medicamentos al hacer clic en <strong>Dar</strong>.
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Modal Confirmar Entrega */}
        {confirmandoEntrega && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <div style={styles.modalIconCheck}>
                  <CheckCircle2 size={22} color="#059669" />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>Confirmar Entrega y Salida de Medicamentos</h3>
                  <p style={styles.modalSub}>
                    Esta acción descontará el stock de inventario, registrará la salida y finalizará el turno.
                  </p>
                </div>
              </div>

              <div style={styles.modalBody}>
                <p style={{ margin: '0 0 14px', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                  ¿Confirmas la entrega de medicamentos para{' '}
                  <strong>{receta?.nombreCompletoPaciente}</strong>?
                </p>

                {/* Desglose de cobro en modal */}
                <div style={styles.modalSummaryBox}>
                  <div style={styles.modalSummaryRow}>
                    <span>Tarifa Consulta Médica:</span>
                    <strong style={{ color: noPagaConsulta ? '#059669' : '#1e293b' }}>
                      {noPagaConsulta ? 'Q 0.00 (Exonerada)' : `Q ${precioConsultaOriginal.toFixed(2)}`}
                    </strong>
                  </div>
                  <div style={styles.modalSummaryRow}>
                    <span>Total Medicamentos Prescritos:</span>
                    <strong style={{ color: '#1e293b' }}>
                      Q {totalMedicamentos.toFixed(2)}
                    </strong>
                  </div>
                  <div style={{ ...styles.modalSummaryRow, borderTop: '1px solid #cbd5e1', paddingTop: '8px', marginTop: '6px' }}>
                    <span style={{ fontWeight: '700', color: '#03045e' }}>Total a Cobrar al Paciente:</span>
                    <span style={{ fontWeight: '800', color: '#0077b6', fontSize: '16px' }}>
                      Q {totalAPagar.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  onClick={() => setConfirmandoEntrega(false)}
                  style={styles.btnModalCancel}
                  disabled={entregando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDarMedicamentos}
                  style={styles.btnModalConfirmDeliver}
                  disabled={entregando}
                >
                  {entregando ? 'Registrando entrega...' : 'Confirmar y Finalizar'}
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
  odooHeaderCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatarThumbWrapper: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarThumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  verticalDivider: {
    fontSize: '22px',
    color: '#cbd5e1',
    fontWeight: '300',
  },
  headerEyebrow: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#0077b6',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  headerTitle: {
    margin: '2px 0 0',
    fontSize: '20px',
    fontWeight: '800',
    color: '#03045e',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  btnVolver: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  loadingBox: {
    padding: '48px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  bigAvatarCard: {
    background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
    padding: '28px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 119, 182, 0.05)',
  },
  avatarGlowContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #e0f2fe 0%, #ffffff 80%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #90e0ef',
    marginBottom: '16px',
  },
  bigAvatarWrapper: {
    width: '94px',
    height: '94px',
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
  patientAvatarName: {
    margin: '0 0 4px',
    color: '#03045e',
    fontSize: '18px',
    fontWeight: '800',
  },
  avatarSubtag: {
    fontSize: '12px',
    color: '#0077b6',
    fontWeight: '600',
  },
  billingCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  billingHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  billingEyebrow: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#0077b6',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  billingTotalAmount: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#03045e',
    lineHeight: '1.2',
  },
  billingDivider: {
    height: '1px',
    background: '#f1f5f9',
    margin: '2px 0',
  },
  billingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  billingLabel: {
    color: '#64748b',
    fontWeight: '500',
  },
  billingVal: {
    color: '#1e293b',
    fontWeight: '700',
  },
  checkboxContainer: {
    marginTop: '6px',
    paddingTop: '10px',
    borderTop: '1px dashed #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  checkboxLabelWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    cursor: 'pointer',
  },
  checkboxInput: {
    marginTop: '2px',
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    accentColor: '#0077b6',
  },
  checkboxText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    lineHeight: '1.3',
  },
  exoneradoBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#059669',
    background: '#ecfdf5',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid #a7f3d0',
    alignSelf: 'flex-start',
  },
  actionButtonsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
  btnDar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 119, 182, 0.25)',
    transition: 'background 0.2s',
  },
  btnCancelar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '11px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: 0,
  },
  infoCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  infoTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#03045e',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  summaryItem: {
    background: '#f8fafc',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#03045e',
  },
  indicationsCard: {
    background: '#f0f9ff',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
    padding: '18px 20px',
  },
  indicationsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  indicationsTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#0369a1',
  },
  indicationsText: {
    margin: 0,
    fontSize: '14px',
    color: '#0f172a',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  tableCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  tableHeaderBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  tableTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#03045e',
  },
  tableResponsive: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: '14px',
    textAlign: 'left',
  },
  th: {
    background: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '12px 16px',
    borderBottom: '2px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
    borderBottom: '1px solid #f1f5f9',
  },
  badgePres: {
    display: 'inline-block',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  badgeConc: {
    display: 'inline-block',
    background: '#e0f2fe',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  badgeDosis: {
    display: 'inline-block',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    padding: '4px 9px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  qtyBadge: {
    display: 'inline-block',
    background: '#e0f2fe',
    color: '#0077b6',
    border: '1px solid #90e0ef',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '800',
  },
  warningStock: {
    fontSize: '11px',
    color: '#dc2626',
    fontWeight: '600',
  },
  emptyTable: {
    padding: '24px',
    textAlign: 'center',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
  },
  suggestionCard: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  suggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    borderBottom: '1px solid #f0f9ff',
    paddingBottom: '12px',
  },
  suggestionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  suggestionIconWrapper: {
    background: '#e0f2fe',
    padding: '7px',
    borderRadius: '8px',
    display: 'flex',
  },
  suggestionTitle: {
    margin: '0 0 2px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#03045e',
  },
  suggestionSubtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
  },
  fefoBadge: {
    fontSize: '11px',
    fontWeight: '700',
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    padding: '3px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  suggestionTableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  loteBadge: {
    display: 'inline-block',
    background: '#f8fafc',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  stockLoteBadge: {
    display: 'inline-block',
    border: '1px solid',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  descontarBadge: {
    display: 'inline-block',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  suggestionEmpty: {
    padding: '16px',
    textAlign: 'center',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
  },
  suggestionFooterNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f0f9ff',
    border: '1px solid #e0f2fe',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#0369a1',
    fontWeight: '500',
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
  modalIconCheck: {
    background: '#d1fae5',
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
  modalBody: {
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
  },
  modalSummaryBox: {
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: '#334155',
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
  btnModalConfirmDeliver: {
    background: '#059669',
    color: 'white',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
