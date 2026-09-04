import React, { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useDiagnosticos } from '../hooks/useDiagnosticos';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import '../styles/diagnosticos.css';

export default function DiagnosticosPage() {
  const { data, loading, error, cargarDatos, crear, actualizar, eliminar } = useDiagnosticos();
  const [buscar, setBuscar] = useState('');
  const [page, setPage] = useState(0);

  // Estado del modal de creación / edición
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({ idCie10: null, codigo: '', descripcion: '' });

  useEffect(() => {
    cargarDatos(buscar, page);
  }, [cargarDatos, buscar, page]);

  const handleOpenModal = (item = null) => {
    setModalError('');
    if (item) {
      setIsEditing(true);
      setFormData({
        idCie10: item.idCie10,
        codigo: item.codigo || '',
        descripcion: item.descripcion || '',
      });
    } else {
      setIsEditing(false);
      setFormData({ idCie10: null, codigo: '', descripcion: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setModalError('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');

    const cleanCodigo = formData.codigo.trim().toUpperCase();
    const cleanDescripcion = formData.descripcion.trim();

    if (!cleanCodigo || !cleanDescripcion) {
      setModalError('Por favor completa tanto el código como la descripción.');
      return;
    }

    try {
      setIsSubmitting(true);
      let res;
      if (isEditing) {
        res = await actualizar(formData.idCie10, {
          codigo: cleanCodigo,
          descripcion: cleanDescripcion,
        });
      } else {
        res = await crear({
          codigo: cleanCodigo,
          descripcion: cleanDescripcion,
        });
      }

      if (res.success) {
        setShowModal(false);
        cargarDatos(buscar, page);
      } else {
        setModalError(res.error || 'Ocurrió un error al guardar el diagnóstico.');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al procesar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar este diagnóstico del catálogo?')) {
      const res = await eliminar(id);
      if (res.success) {
        cargarDatos(buscar, page);
      } else {
        alert(res.error || 'No se pudo eliminar el diagnóstico.');
      }
    }
  };

  const totalRegistros = data.totalElements ?? data.content?.length ?? 0;
  const totalPaginas = data.totalPages || 1;

  return (
    <div className="diagnosticos-page">
      <AdminNavbar />

      <main className="diagnosticos-container">
        {/* Barra Superior de Control estilo Odoo */}
        <header className="diagnosticos-control-panel">
          <div className="diagnosticos-panel-left">
            <h1 className="diagnosticos-main-title">Catálogo de Diagnósticos</h1>
            <div className="diagnosticos-count-pill">
              <Stethoscope size={14} />
              <span>
                <strong>{totalRegistros}</strong> {totalRegistros === 1 ? 'diagnóstico' : 'diagnósticos'}
              </span>
            </div>
          </div>

          <div className="diagnosticos-panel-right">
            {/* Buscador Integrado */}
            <div className="diagnosticos-search-box">
              <Search size={16} className="diagnosticos-search-icon" />
              <input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={buscar}
                onChange={(e) => {
                  setBuscar(e.target.value);
                  setPage(0);
                }}
                className="diagnosticos-search-input"
              />
              {buscar && (
                <button
                  type="button"
                  onClick={() => {
                    setBuscar('');
                    setPage(0);
                  }}
                  className="diagnosticos-search-clear"
                  title="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Botón Nuevo Diagnóstico */}
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="diagnosticos-btn-primary"
            >
              <Plus size={16} />
              <span>Nuevo Diagnóstico</span>
            </button>
          </div>
        </header>

        {/* Alerta de Error si ocurre en carga */}
        {error && (
          <div className="diagnosticos-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Contenido: Tabla de Diagnósticos */}
        {loading ? (
          <div className="diagnosticos-loading">
            <div className="diagnosticos-spinner" />
            <p>Cargando diagnósticos...</p>
          </div>
        ) : !data.content || data.content.length === 0 ? (
          <div className="diagnosticos-empty">
            <div className="diagnosticos-empty-icon">
              <Stethoscope size={44} />
            </div>
            <h3 className="diagnosticos-empty-title">No se encontraron diagnósticos</h3>
            <p className="diagnosticos-empty-desc">
              No hay diagnósticos registrados que coincidan con la búsqueda. Puedes registrar uno nuevo con el botón superior.
            </p>
          </div>
        ) : (
          <div className="diagnosticos-table-card">
            <div className="diagnosticos-table-responsive">
              <table className="diagnosticos-table">
                <thead>
                  <tr>
                    <th className="diagnosticos-th" style={{ width: '140px' }}>Código</th>
                    <th className="diagnosticos-th">Descripción del Diagnóstico</th>
                    <th className="diagnosticos-th" style={{ textAlign: 'right', width: '180px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((d) => (
                    <tr key={d.idCie10} className="diagnosticos-tr">
                      <td className="diagnosticos-td">
                        <span className="diagnosticos-code-badge">{d.codigo}</span>
                      </td>
                      <td className="diagnosticos-td">
                        <span className="diagnosticos-desc-text">{d.descripcion}</span>
                      </td>
                      <td className="diagnosticos-td" style={{ textAlign: 'right' }}>
                        <div className="diagnosticos-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(d)}
                            className="diagnosticos-btn-action diagnosticos-btn-edit"
                            title="Editar diagnóstico"
                          >
                            <Pencil size={13} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(d.idCie10)}
                            className="diagnosticos-btn-action diagnosticos-btn-delete"
                            title="Eliminar diagnóstico"
                          >
                            <Trash2 size={13} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación Odoo Style */}
            <footer className="diagnosticos-pagination">
              <span>
                Página <strong>{page + 1}</strong> de <strong>{totalPaginas}</strong>
              </span>

              <div className="diagnosticos-pagination-controls">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="diagnosticos-page-btn"
                  title="Página anterior"
                >
                  <ChevronLeft size={15} />
                  <span>Anterior</span>
                </button>
                <button
                  type="button"
                  disabled={page >= totalPaginas - 1}
                  onClick={() => setPage(page + 1)}
                  className="diagnosticos-page-btn"
                  title="Página siguiente"
                >
                  <span>Siguiente</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </footer>
          </div>
        )}
      </main>

      {/* Modal Dialog Formulario */}
      {showModal && (
        <div
          className="diagnosticos-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="diagnosticos-modal-card">
            {/* Cabecera del Modal */}
            <div className="diagnosticos-modal-header">
              <div>
                <h3 className="diagnosticos-modal-title">
                  {isEditing ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
                </h3>
                <p className="diagnosticos-modal-subtitle">
                  {isEditing
                    ? `Modificando registro #${formData.codigo}`
                    : 'Ingresa los datos para registrar el diagnóstico en el catálogo.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="diagnosticos-modal-close"
                title="Cerrar ventana"
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            {/* Alerta de Error en Modal */}
            {modalError && (
              <div style={{ margin: '14px 24px 0' }} className="diagnosticos-modal-error">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="diagnosticos-modal-body">
                {/* Campo Código */}
                <div className="diagnosticos-form-group">
                  <label className="diagnosticos-form-label">
                    Código <span className="diagnosticos-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
                    }
                    placeholder="Ej. J00, E11.9, I10"
                    className="diagnosticos-form-input"
                    disabled={isSubmitting}
                    maxLength={10}
                  />
                  <span className="diagnosticos-form-hint">
                    Código identificador único para búsquedas rápidas en consulta médica.
                  </span>
                </div>

                {/* Campo Descripción */}
                <div className="diagnosticos-form-group">
                  <label className="diagnosticos-form-label">
                    Descripción / Nombre del Diagnóstico <span className="diagnosticos-required-star">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    rows={3}
                    placeholder="Ej. Rinofaringitis aguda [resfriado común], Diabetes mellitus..."
                    className="diagnosticos-form-textarea"
                    disabled={isSubmitting}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Pie de Acciones */}
              <div className="diagnosticos-modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="diagnosticos-btn-cancel"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="diagnosticos-btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="spin-icon" />
                      <span>Guardando...</span>
                    </>
                  ) : isEditing ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Diagnóstico'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
