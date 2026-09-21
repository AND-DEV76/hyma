import { useState, useMemo } from 'react';
import { Search, X, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function CatalogoTablaView({
  title,
  singularLabel,
  icon,
  items = [],
  medicamentos = [],
  medFkField,
  placeholder = 'Ingrese el nombre...',
  onSave,
  onDelete,
}) {
  const [buscar, setBuscar] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [nombre, setNombre] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  // Filtrado
  const filteredItems = useMemo(() => {
    const query = buscar.toLowerCase().trim();
    if (!query) return items;
    return items.filter((item) => (item.nombre || '').toLowerCase().includes(query));
  }, [items, buscar]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Conteo de medicamentos asociados
  const getMedCount = (itemId) => {
    if (!medFkField || !medicamentos) return 0;
    return medicamentos.filter(
      (m) => Number(m[medFkField]) === Number(itemId)
    ).length;
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setNombre('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setNombre(item.nombre || '');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setNombre('');
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!nombre.trim()) {
      setModalError(`El nombre de la ${singularLabel} es obligatorio.`);
      return;
    }

    setSaving(true);
    const id = editingItem?.id;
    const result = await onSave(id, { nombre: nombre.trim() });
    setSaving(false);

    if (result && result.success) {
      handleCloseModal();
    } else {
      setModalError(result?.error || `Error al guardar la ${singularLabel}.`);
    }
  };

  const handleDelete = async (item) => {
    const count = getMedCount(item.id);
    let msg = `¿Deseas eliminar la ${singularLabel} "${item.nombre}"?`;
    if (count > 0) {
      msg += `\n\nAtención: Tiene ${count} medicamento(s) asociado(s).`;
    }

    if (window.confirm(msg)) {
      const result = await onDelete(item.id);
      if (result && !result.success && result.error) {
        alert(result.error);
      }
    }
  };

  return (
    <div className="farmacia-catalogo-tabla-view">
      {/* Control Panel Odoo Style */}
      <div className="farmacia-control-panel">
        <div className="farmacia-panel-left">
          <h2 className="farmacia-main-title">{title}</h2>
          <span className="farmacia-count-pill">
            {icon}
            <strong>{filteredItems.length}</strong>
            {filteredItems.length === 1 ? singularLabel : `${singularLabel}s`}
          </span>
        </div>

        <div className="farmacia-panel-right">
          {/* Integrated Search Box */}
          <div className="farmacia-search-box">
            <Search size={16} className="farmacia-search-icon" />
            <input
              type="text"
              className="farmacia-search-input"
              placeholder={`Buscar ${singularLabel} por nombre...`}
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
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            Nueva {singularLabel}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="farmacia-table-card">
        <div className="farmacia-table-responsive">
          <table className="farmacia-table">
            <thead>
              <tr>
                <th className="farmacia-th" style={{ width: '80px', textAlign: 'center' }}>
                  #
                </th>
                <th className="farmacia-th">
                  Nombre de la {singularLabel.charAt(0).toUpperCase() + singularLabel.slice(1)}
                </th>
                <th className="farmacia-th" style={{ textAlign: 'center', width: '240px' }}>
                  Medicamentos Registrados
                </th>
                <th className="farmacia-th" style={{ textAlign: 'right', width: '200px' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item, idx) => {
                const count = getMedCount(item.id);
                const itemIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;

                return (
                  <tr key={item.id} className="farmacia-tr">
                    <td className="farmacia-td" style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                      {itemIndex}
                    </td>

                    <td className="farmacia-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0077b6',
                            flexShrink: 0,
                          }}
                        >
                          {icon}
                        </div>
                        <span style={{ fontWeight: 700, color: '#03045e', fontSize: '0.92rem' }}>
                          {item.nombre}
                        </span>
                      </div>
                    </td>

                    <td className="farmacia-td" style={{ textAlign: 'center' }}>
                      <span
                        className="farmacia-badge-pill"
                        style={{
                          background: count > 0 ? '#f0fdf4' : '#f8fafc',
                          color: count > 0 ? '#166534' : '#64748b',
                          border: count > 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          padding: '4px 12px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {count} {count === 1 ? 'medicamento' : 'medicamentos'}
                      </span>
                    </td>

                    <td className="farmacia-td" style={{ textAlign: 'right' }}>
                      <div className="farmacia-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="farmacia-action-btn edit"
                          onClick={() => handleOpenEdit(item)}
                          title={`Editar ${singularLabel}`}
                        >
                          <Edit2 size={13} />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          className="farmacia-action-btn delete"
                          onClick={() => handleDelete(item)}
                          title={`Eliminar ${singularLabel}`}
                          style={{
                            borderColor: '#fee2e2',
                            color: '#dc2626',
                            background: 'white',
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="farmacia-empty-state">
              <div style={{ color: '#0077b6', marginBottom: '8px' }}>
                {icon}
              </div>
              <h3 className="farmacia-empty-title">
                {items.length === 0
                  ? `No hay ${singularLabel}s registradas`
                  : `No se encontraron ${singularLabel}s`}
              </h3>
              <p className="farmacia-empty-desc">
                {items.length === 0
                  ? `Utilice el botón "Nueva ${singularLabel}" para comenzar a registrar.`
                  : 'Intente con otro término de búsqueda.'}
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="farmacia-pagination-bar">
            <span className="farmacia-pagination-info">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (
              {filteredItems.length} registros)
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

      {/* Modal para Crear / Editar */}
      {isModalOpen && (
        <div className="farmacia-modal-overlay" onClick={handleCloseModal}>
          <div
            className="farmacia-modal-card"
            style={{ maxWidth: '520px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="farmacia-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0077b6',
                  }}
                >
                  {icon}
                </div>
                <div>
                  <h3 className="farmacia-modal-title">
                    {editingItem ? `Editar ${singularLabel}` : `Nueva ${singularLabel}`}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {editingItem
                      ? `Modifique el nombre de la ${singularLabel} seleccionada.`
                      : `Complete los datos para agregar una nueva ${singularLabel}.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="farmacia-modal-close"
                onClick={handleCloseModal}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="farmacia-modal-body" style={{ padding: '24px' }}>
                {modalError && (
                  <div className="farmacia-alert error" style={{ marginBottom: '16px' }}>
                    {modalError}
                  </div>
                )}

                <div className="farmacia-field full">
                  <label htmlFor="modal-nombre" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.88rem' }}>
                    Nombre de la {singularLabel.charAt(0).toUpperCase() + singularLabel.slice(1)} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="modal-nombre"
                    type="text"
                    className="farmacia-input"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder={placeholder}
                    maxLength={150}
                    autoFocus
                    required
                    style={{ width: '100%', fontSize: '0.95rem', padding: '10px 14px' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '5px', display: 'block' }}>
                    El nombre debe ser único y descriptivo para el catálogo farmacéutico.
                  </span>
                </div>
              </div>

              <div className="farmacia-modal-footer">
                <button
                  type="button"
                  className="farmacia-btn-secondary"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="farmacia-btn-primary"
                  disabled={saving || !nombre.trim()}
                >
                  {saving ? 'Guardando...' : editingItem ? 'Guardar Cambios' : `Registrar ${singularLabel}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}