import { useState, useMemo } from 'react';
import { Search, X, Plus, Edit2, CheckCircle2, XCircle, Pill, ChevronLeft, ChevronRight } from 'lucide-react';
import MedicamentoModal from './MedicamentoModal';

const ITEMS_PER_PAGE = 12;

function MedicamentosList({
  medicamentos,
  categorias,
  casas,
  onSaveMedicamento,
}) {
  const [buscar, setBuscar] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [casaId, setCasaId] = useState('');
  const [estado, setEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Filtering
  const filteredMedicamentos = useMemo(() => {
    return medicamentos.filter((item) => {
      const text = `${item.nombre || ''} ${item.presentacion || ''} ${item.concentracion || ''}`.toLowerCase();
      const matchesSearch = text.includes(buscar.toLowerCase().trim());
      const matchesCat = !categoriaId || String(item.idCategoriaMedicamento) === categoriaId;
      const matchesCasa = !casaId || String(item.idCasaFarmaceutica) === casaId;
      const matchesEstado = estado === '' || String(item.estado) === estado;
      return matchesSearch && matchesCat && matchesCasa && matchesEstado;
    });
  }, [medicamentos, buscar, categoriaId, casaId, estado]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMedicamentos.length / ITEMS_PER_PAGE));
  const displayedMedicamentos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedicamentos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMedicamentos, currentPage]);

  const handleOpenCreateModal = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingMedicine(item);
    setIsModalOpen(true);
  };

  const handleToggleEstado = async (item) => {
    const nuevoEstado = !item.estado;
    const actionLabel = nuevoEstado ? 'activar' : 'desactivar';
    if (window.confirm(`¿Deseas ${actionLabel} el medicamento "${item.nombre}"?`)) {
      await onSaveMedicamento(item.idMedicamento, {
        nombre: item.nombre,
        presentacion: item.presentacion || null,
        concentracion: item.concentracion || null,
        idCategoriaMedicamento: item.idCategoriaMedicamento ? Number(item.idCategoriaMedicamento) : null,
        idCasaFarmaceutica: item.idCasaFarmaceutica ? Number(item.idCasaFarmaceutica) : null,
        estado: nuevoEstado,
      });
    }
  };

  return (
    <div className="farmacia-medicamentos-view">
      {/* Control Panel Odoo Style */}
      <div className="farmacia-control-panel">
        <div className="farmacia-panel-left">
          <h2 className="farmacia-main-title">Medicamentos Registrados</h2>
          <span className="farmacia-count-pill">
            <Pill size={14} />
            <strong>{filteredMedicamentos.length}</strong>
            {filteredMedicamentos.length === 1 ? 'medicamento' : 'medicamentos'}
          </span>
        </div>

        <div className="farmacia-panel-right">
          {/* Integrated Search Box */}
          <div className="farmacia-search-box">
            <Search size={16} className="farmacia-search-icon" />
            <input
              type="text"
              className="farmacia-search-input"
              placeholder="Buscar por nombre o concentración..."
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

          {/* Botón Principal Nuevo */}
          <button
            type="button"
            className="farmacia-btn-primary"
            onClick={handleOpenCreateModal}
          >
            <Plus size={16} />
            Nuevo Medicamento
          </button>
        </div>
      </div>

      {/* Filter Bar Row */}
      <div className="farmacia-filters-toolbar">
        <div className="farmacia-filter-group">
          <label htmlFor="filter-cat" className="farmacia-filter-label">Categoría:</label>
          <select
            id="filter-cat"
            className="farmacia-filter-select"
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="farmacia-filter-group">
          <label htmlFor="filter-casa" className="farmacia-filter-label">Casa Farmacéutica:</label>
          <select
            id="filter-casa"
            className="farmacia-filter-select"
            value={casaId}
            onChange={(e) => {
              setCasaId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todas las casas</option>
            {casas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="farmacia-filter-group">
          <label htmlFor="filter-estado" className="farmacia-filter-label">Estado:</label>
          <select
            id="filter-estado"
            className="farmacia-filter-select"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        {(buscar || categoriaId || casaId || estado) && (
          <button
            type="button"
            className="farmacia-btn-clear-filters"
            onClick={() => {
              setBuscar('');
              setCategoriaId('');
              setCasaId('');
              setEstado('');
              setCurrentPage(1);
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="farmacia-table-card">
        <div className="farmacia-table-responsive">
          <table className="farmacia-table">
            <thead>
              <tr>
                <th className="farmacia-th">Medicamento</th>
                <th className="farmacia-th">Presentación</th>
                <th className="farmacia-th">Categoría</th>
                <th className="farmacia-th">Casa Farmacéutica</th>
                <th className="farmacia-th">Estado</th>
                <th className="farmacia-th" style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedMedicamentos.map((item) => (
                <tr key={item.idMedicamento} className="farmacia-tr">
                  <td className="farmacia-td">
                    <div className="farmacia-med-info">
                      <span className="farmacia-med-name">{item.nombre}</span>
                      <span className="farmacia-med-conc">
                        {item.concentracion || 'Sin concentración especificada'}
                      </span>
                    </div>
                  </td>
                  <td className="farmacia-td">
                    <span className="farmacia-text-subtle">
                      {item.presentacion || '—'}
                    </span>
                  </td>
                  <td className="farmacia-td">
                    {item.categoriaNombre ? (
                      <span className="farmacia-badge-pill category">
                        {item.categoriaNombre}
                      </span>
                    ) : (
                      <span className="farmacia-text-subtle">Sin categoría</span>
                    )}
                  </td>
                  <td className="farmacia-td">
                    <span className="farmacia-text-subtle">
                      {item.casaFarmaceuticaNombre || '—'}
                    </span>
                  </td>
                  <td className="farmacia-td">
                    <span className={`farmacia-status-pill ${item.estado ? 'active' : 'inactive'}`}>
                      {item.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="farmacia-td" style={{ textAlign: 'right' }}>
                    <div className="farmacia-actions-cell">
                      <button
                        type="button"
                        className="farmacia-action-btn edit"
                        onClick={() => handleOpenEditModal(item)}
                        title="Editar medicamento"
                      >
                        <Edit2 size={13} />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        className={`farmacia-action-btn ${item.estado ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleEstado(item)}
                        title={item.estado ? 'Desactivar medicamento' : 'Activar medicamento'}
                      >
                        {item.estado ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        <span>{item.estado ? 'Desactivar' : 'Activar'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMedicamentos.length === 0 && (
            <div className="farmacia-empty-state">
              <Pill size={36} className="farmacia-empty-icon" />
              <h3 className="farmacia-empty-title">
                {medicamentos.length === 0
                  ? 'No hay medicamentos en el catálogo'
                  : 'No se encontraron medicamentos'}
              </h3>
              <p className="farmacia-empty-desc">
                {medicamentos.length === 0
                  ? 'Comienza registrando tu primer medicamento para el inventario.'
                  : 'Intenta ajustar los criterios de búsqueda o filtros aplicados.'}
              </p>
              {medicamentos.length === 0 && (
                <button
                  type="button"
                  className="farmacia-btn-primary"
                  onClick={handleOpenCreateModal}
                  style={{ marginTop: '12px' }}
                >
                  <Plus size={16} />
                  Registrar Primer Medicamento
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredMedicamentos.length > 0 && (
          <div className="farmacia-pagination">
            <span className="farmacia-pagination-info">
              Mostrando {Math.min(filteredMedicamentos.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} -{' '}
              {Math.min(filteredMedicamentos.length, currentPage * ITEMS_PER_PAGE)} de{' '}
              {filteredMedicamentos.length} registros
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

      {/* Modal Dialog */}
      <MedicamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveMedicamento}
        medicineToEdit={editingMedicine}
        categorias={categorias}
        casas={casas}
      />
    </div>
  );
}

export default MedicamentosList;

