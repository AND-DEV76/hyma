import { useState, useEffect, useMemo } from 'react';
import { Search, X, Package, ChevronLeft, ChevronRight, Eye, Calendar, User, FileText, Pill } from 'lucide-react';
import { listarSalidas } from '../services/salidaService';

const ITEMS_PER_PAGE = 10;

export default function SalidasList() {
  const [salidas, setSalidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSalida, setSelectedSalida] = useState(null);

  useEffect(() => {
    cargarSalidas();
  }, []);

  const cargarSalidas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarSalidas();
      setSalidas(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las salidas de inventario.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSalidas = useMemo(() => {
    return salidas.filter((s) => {
      const query = buscar.toLowerCase().trim();
      if (!query) return true;

      const paciente = (s.pacienteNombre || '').toLowerCase();
      const medico = (s.medicoNombre || '').toLowerCase();
      const usuario = (s.usuarioNombre || '').toLowerCase();
      const obs = (s.observaciones || '').toLowerCase();
      const tipo = (s.tipoSalida || '').toLowerCase();
      const meds = (s.detalles || [])
        .map((d) => `${d.medicamentoNombre || ''} ${d.numeroLote || ''} ${d.presentacion || ''}`)
        .join(' ')
        .toLowerCase();

      return (
        paciente.includes(query) ||
        medico.includes(query) ||
        usuario.includes(query) ||
        obs.includes(query) ||
        tipo.includes(query) ||
        meds.includes(query)
      );
    });
  }, [salidas, buscar]);

  const totalPages = Math.max(1, Math.ceil(filteredSalidas.length / ITEMS_PER_PAGE));
  const displayedSalidas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSalidas.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSalidas, currentPage]);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="farmacia-salidas-view">
      {/* Panel Superior */}
      <div className="farmacia-control-panel">
        <div className="farmacia-panel-left">
          <h2 className="farmacia-main-title">Salidas de Medicamentos</h2>
          <span className="farmacia-count-pill">
            <Package size={14} />
            <strong>{filteredSalidas.length}</strong>
            {filteredSalidas.length === 1 ? 'salida' : 'salidas'}
          </span>
        </div>

        <div className="farmacia-panel-right">
          <div className="farmacia-search-box">
            <Search size={16} className="farmacia-search-icon" />
            <input
              type="text"
              className="farmacia-search-input"
              placeholder="Buscar por paciente, médico, medicamento o lote..."
              value={buscar}
              onChange={(e) => {
                setBuscar(e.target.value);
                setCurrentPage(1);
              }}
            />
            {buscar && (
              <button
                type="button"
                className="farmacia-search-clear"
                onClick={() => {
                  setBuscar('');
                  setCurrentPage(1);
                }}
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="farmacia-alert error" role="alert" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="farmacia-loading-container" style={{ padding: '40px' }}>
          <div className="farmacia-spinner" />
          <p>Cargando registro de salidas...</p>
        </div>
      ) : (
        <div className="farmacia-table-card">
          <div className="farmacia-table-responsive">
            <table className="farmacia-table">
              <thead>
                <tr>
                  <th className="farmacia-th">Fecha y Hora</th>
                  <th className="farmacia-th">Paciente</th>
                  <th className="farmacia-th">Médico / Emisor</th>
                  <th className="farmacia-th">Medicamentos Entregados</th>
                  <th className="farmacia-th" style={{ textAlign: 'center' }}>Total Unid.</th>
                  <th className="farmacia-th" style={{ textAlign: 'right' }}>Total Medicamentos</th>
                  <th className="farmacia-th" style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedSalidas.map((s) => {
                  const totalUnidades = (s.detalles || []).reduce(
                    (acc, curr) => acc + (Number(curr.cantidad) || 0),
                    0
                  );

                  return (
                    <tr key={s.idSalida} className="farmacia-tr">
                      <td className="farmacia-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                          <Calendar size={14} color="#0077b6" />
                          <span>{formatDate(s.fechaSalida)}</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Tipo: {s.tipoSalida || 'DISPENSACION'}
                        </span>
                      </td>

                      <td className="farmacia-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} color="#0077b6" />
                          <strong style={{ color: '#03045e' }}>{s.pacienteNombre || 'Paciente general'}</strong>
                        </div>
                      </td>

                      <td className="farmacia-td">
                        <div style={{ color: '#334155', fontSize: '0.85rem' }}>
                          {s.medicoNombre ? `Dr(a). ${s.medicoNombre}` : '—'}
                        </div>
                        {s.usuarioNombre && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Por: {s.usuarioNombre}
                          </div>
                        )}
                      </td>

                      <td className="farmacia-td">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '340px' }}>
                          {(s.detalles || []).map((d) => (
                            <span
                              key={d.idDetalleSalida}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '0.75rem',
                                color: '#1e293b',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Pill size={11} color="#0077b6" />
                              <strong>{d.medicamentoNombre}</strong> ({d.cantidad})
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="farmacia-td" style={{ textAlign: 'center' }}>
                        <span
                          className="farmacia-badge-pill"
                          style={{
                            background: '#e0f2fe',
                            color: '#03045e',
                            fontWeight: 700,
                            padding: '3px 10px',
                            border: '1px solid #bae6fd',
                          }}
                        >
                          {totalUnidades} {totalUnidades === 1 ? 'ud' : 'uds'}
                        </span>
                      </td>

                      <td className="farmacia-td" style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#03045e', fontSize: '0.88rem' }}>
                          Q {Number(s.totalMedicamentos || 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="farmacia-td" style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="farmacia-action-btn edit"
                          style={{ borderColor: '#0077b6', color: '#0077b6' }}
                          onClick={() => setSelectedSalida(s)}
                          title="Ver detalle de salida"
                        >
                          <Eye size={13} />
                          <span>Ver Detalle</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredSalidas.length === 0 && (
              <div className="farmacia-empty-state">
                <Package size={36} className="farmacia-empty-icon" />
                <h3 className="farmacia-empty-title">
                  {salidas.length === 0
                    ? 'No hay salidas registradas'
                    : 'No se encontraron registros de salidas'}
                </h3>
                <p className="farmacia-empty-desc">
                  {salidas.length === 0
                    ? 'Las dispensaciones y entregas de medicamentos realizadas a pacientes se mostrarán aquí.'
                    : 'Intenta con otro término de búsqueda.'}
                </p>
              </div>
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="farmacia-pagination-bar">
              <span className="farmacia-pagination-info">
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (
                {filteredSalidas.length} salidas)
              </span>
              <div className="farmacia-pagination-controls">
                <button
                  type="button"
                  className="farmacia-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <button
                  type="button"
                  className="farmacia-page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detalle de Salida */}
      {selectedSalida && (
        <div className="farmacia-modal-overlay" onClick={() => setSelectedSalida(null)}>
          <div
            className="farmacia-modal-card"
            style={{ maxWidth: '780px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="farmacia-modal-header">
              <div>
                <h3 className="farmacia-modal-title">Detalle de Salida de Medicamentos</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Folio: #{selectedSalida.idSalida} &bull; Fecha: {formatDate(selectedSalida.fechaSalida)}
                </p>
              </div>
              <button
                type="button"
                className="farmacia-modal-close"
                onClick={() => setSelectedSalida(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="farmacia-modal-body" style={{ padding: '20px 24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '18px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                    PACIENTE:
                  </span>
                  <strong style={{ color: '#03045e', fontSize: '0.92rem' }}>
                    {selectedSalida.pacienteNombre || 'Paciente general'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                    MÉDICO:
                  </span>
                  <span style={{ color: '#1e293b', fontSize: '0.9rem' }}>
                    {selectedSalida.medicoNombre ? `Dr(a). ${selectedSalida.medicoNombre}` : '—'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                    RESPONSABLE DE ENTREGA:
                  </span>
                  <span style={{ color: '#1e293b', fontSize: '0.9rem' }}>
                    {selectedSalida.usuarioNombre || 'Sistema'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                    OBSERVACIONES:
                  </span>
                  <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                    {selectedSalida.observaciones || 'Sin observaciones'}
                  </span>
                </div>
              </div>

              <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#03045e', fontWeight: 700 }}>
                Medicamentos Dispensados ({selectedSalida.detalles?.length || 0})
              </h4>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569' }}>Medicamento</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569' }}>Presentación</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569' }}>Lote</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569' }}>Cantidad</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>Precio Unit.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSalida.detalles || []).map((d) => (
                      <tr key={d.idDetalleSalida} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#03045e' }}>
                          {d.medicamentoNombre}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>
                          {d.presentacion || '—'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1px 6px', borderRadius: '4px', fontSize: '0.74rem' }}>
                            {d.numeroLote || 'S/L'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#0077b6' }}>
                          {d.cantidad}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#334155' }}>
                          Q {Number(d.precioUnitario || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#03045e' }}>
                          Q {Number(d.subtotal || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                    <tr>
                      <td colSpan={5} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                        Total Medicamentos:
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0077b6', fontSize: '0.95rem' }}>
                        Q {Number(selectedSalida.totalMedicamentos || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="farmacia-modal-footer">
              <button
                type="button"
                className="farmacia-btn-secondary"
                onClick={() => setSelectedSalida(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}