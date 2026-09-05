import { useState, useMemo } from 'react';
import { Search, X, Plus, History, ChevronLeft, ChevronRight, FileText, User } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

function HistorialEntradas({ entradas, onNavigateNuevo }) {
  const [buscar, setBuscar] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEntradas = useMemo(() => {
    return entradas.filter((entrada) => {
      const query = buscar.toLowerCase().trim();
      const matchTipo = !tipoFiltro || entrada.tipoEntrada === tipoFiltro;

      if (!query) return matchTipo;

      const userText = (entrada.usuarioNombre || '').toLowerCase();
      const obsText = (entrada.observaciones || '').toLowerCase();
      const medsText = (entrada.detalles || [])
        .map((d) => `${d.medicamentoNombre || ''} ${d.numeroLote || ''}`)
        .join(' ')
        .toLowerCase();

      const matchQuery = userText.includes(query) || obsText.includes(query) || medsText.includes(query);
      return matchTipo && matchQuery;
    });
  }, [entradas, buscar, tipoFiltro]);

  const totalPages = Math.max(1, Math.ceil(filteredEntradas.length / ITEMS_PER_PAGE));
  const displayedEntradas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntradas.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntradas, currentPage]);

  return (
    <div className="farmacia-historial-view">
      {/* Control Panel Odoo Style */}
      <div className="farmacia-control-panel">
        <div className="farmacia-panel-left">
          <h2 className="farmacia-main-title">Historial de Entradas</h2>
          <span className="farmacia-count-pill">
            <History size={14} />
            <strong>{filteredEntradas.length}</strong>
            {filteredEntradas.length === 1 ? 'movimiento' : 'movimientos'}
          </span>
        </div>

        <div className="farmacia-panel-right">
          {/* Integrated Search Box */}
          <div className="farmacia-search-box">
            <Search size={16} className="farmacia-search-icon" />
            <input
              type="text"
              className="farmacia-search-input"
              placeholder="Buscar por usuario, factura, lote o medicamento..."
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
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Botón Nueva Entrada */}
          {onNavigateNuevo && (
            <button
              type="button"
              className="farmacia-btn-primary"
              onClick={onNavigateNuevo}
            >
              <Plus size={16} />
              Registrar Entrada
            </button>
          )}
        </div>
      </div>

      {/* Filtro por tipo de entrada */}
      <div className="farmacia-filters-toolbar">
        <div className="farmacia-filter-group">
          <label htmlFor="filter-tipo" className="farmacia-filter-label">Tipo de movimiento:</label>
          <select
            id="filter-tipo"
            className="farmacia-filter-select"
            value={tipoFiltro}
            onChange={(e) => {
              setTipoFiltro(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todos los tipos</option>
            <option value="COMPRA">Compra</option>
            <option value="DONACION">Donación</option>
            <option value="PEDIDO">Pedido</option>
          </select>
        </div>

        {(buscar || tipoFiltro) && (
          <button
            type="button"
            className="farmacia-btn-clear-filters"
            onClick={() => {
              setBuscar('');
              setTipoFiltro('');
              setCurrentPage(1);
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla Card Odoo */}
      <div className="farmacia-table-card">
        <div className="farmacia-table-responsive">
          <table className="farmacia-table">
            <thead>
              <tr>
                <th style={{ width: '16%' }}>Fecha y Hora</th>
                <th style={{ width: '12%' }}>Tipo</th>
                <th style={{ width: '16%' }}>Registrado por</th>
                <th style={{ width: '36%' }}>Detalle de Medicamentos y Lotes</th>
                <th style={{ width: '20%' }}>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedEntradas.map((entrada) => (
                <tr key={entrada.idEntrada} className="farmacia-tr">
                  <td className="farmacia-td">
                    <span className="farmacia-text-bold">
                      {entrada.fechaEntrada
                        ? new Date(entrada.fechaEntrada).toLocaleDateString('es-GT', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </span>
                    <span className="farmacia-text-subtle" style={{ display: 'block', fontSize: '0.74rem' }}>
                      {entrada.fechaEntrada
                        ? new Date(entrada.fechaEntrada).toLocaleTimeString('es-GT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </td>

                  <td className="farmacia-td">
                    <span className={`farmacia-status-pill ${entrada.tipoEntrada === 'COMPRA' ? 'active' : 'category'}`}>
                      {entrada.tipoEntrada}
                    </span>
                  </td>

                  <td className="farmacia-td">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} style={{ color: '#0077b6' }} />
                      <span className="farmacia-text-subtle">
                        {entrada.usuarioNombre || 'Sistema'}
                      </span>
                    </div>
                  </td>

                  <td className="farmacia-td">
                    <div className="farmacia-entrada-meds-list">
                      {entrada.detalles?.map((detalle) => (
                        <div key={detalle.idDetalleEntrada} className="farmacia-entrada-med-chip">
                          <strong>{detalle.medicamentoNombre}</strong>
                          <span className="chip-cant">{detalle.cantidad} und.</span>
                          {detalle.numeroLote && (
                            <span className="chip-lote">Lote: {detalle.numeroLote}</span>
                          )}
                          {detalle.precioUnitario != null && (
                            <span className="chip-precio">Q {Number(detalle.precioUnitario).toFixed(2)} c/u</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="farmacia-td">
                    <span className="farmacia-text-subtle" title={entrada.observaciones || ''}>
                      {entrada.observaciones || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEntradas.length === 0 && (
            <div className="farmacia-empty-state">
              <History size={36} className="farmacia-empty-icon" />
              <h3 className="farmacia-empty-title">
                {entradas.length === 0
                  ? 'No hay movimientos de entrada registrados'
                  : 'No se encontraron entradas con los filtros aplicados'}
              </h3>
              <p className="farmacia-empty-desc">
                {entradas.length === 0
                  ? 'Registra tu primera entrada de inventario para comenzar el historial.'
                  : 'Intenta cambiar el término de búsqueda o el tipo de movimiento seleccionado.'}
              </p>
              {entradas.length === 0 && onNavigateNuevo && (
                <button
                  type="button"
                  className="farmacia-btn-primary"
                  onClick={onNavigateNuevo}
                  style={{ marginTop: '12px' }}
                >
                  <Plus size={16} />
                  Registrar Primera Entrada
                </button>
              )}
            </div>
          )}
        </div>

        {/* Paginación */}
        {filteredEntradas.length > 0 && (
          <div className="farmacia-pagination">
            <span className="farmacia-pagination-info">
              Mostrando {Math.min(filteredEntradas.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} -{' '}
              {Math.min(filteredEntradas.length, currentPage * ITEMS_PER_PAGE)} de{' '}
              {filteredEntradas.length} entradas
            </span>

            {totalPages > 1 && (
              <div className="farmacia-pagination-controls">
                <button
                  type="button"
                  className="farmacia-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={15} />
                  Anterior
                </button>
                <span className="farmacia-page-indicator">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  type="button"
                  className="farmacia-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistorialEntradas;
