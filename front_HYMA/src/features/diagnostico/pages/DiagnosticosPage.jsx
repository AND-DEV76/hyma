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
  Loader2,
  Tag,
  Layers,
  FolderPlus,
  Filter
} from 'lucide-react';
import { useDiagnosticos } from '../hooks/useDiagnosticos';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import '../styles/diagnosticos.css';

export default function DiagnosticosPage() {
  const {
    data,
    loading,
    error,
    cargarDatos,
    crear,
    actualizar,
    eliminar,
    categorias,
    loadingCategorias,
    errorCategorias,
    cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
  } = useDiagnosticos();

  // Subtab activo: 'diagnosticos' o 'categorias'
  const [activeTab, setActiveTab] = useState('diagnosticos');

  // Filtros y paginación para diagnósticos
  const [buscar, setBuscar] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [page, setPage] = useState(0);

  // Modal de Diagnóstico
  const [showModalDiag, setShowModalDiag] = useState(false);
  const [isEditingDiag, setIsEditingDiag] = useState(false);
  const [submittingDiag, setSubmittingDiag] = useState(false);
  const [modalDiagError, setModalDiagError] = useState('');
  const [diagForm, setDiagForm] = useState({
    idCie10: null,
    codigo: '',
    descripcion: '',
    idCategoria: ''
  });

  // Modal de Categoría
  const [showModalCat, setShowModalCat] = useState(false);
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [submittingCat, setSubmittingCat] = useState(false);
  const [modalCatError, setModalCatError] = useState('');
  const [catForm, setCatForm] = useState({
    idCategoria: null,
    nombre: '',
    descripcion: ''
  });

  // Buscador local de categorías
  const [buscarCat, setBuscarCat] = useState('');

  // Carga inicial
  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  useEffect(() => {
    cargarDatos(buscar, filtroCategoria ? Number(filtroCategoria) : null, page);
  }, [cargarDatos, buscar, filtroCategoria, page]);

  // Manejadores del modal de diagnóstico
  const handleOpenDiagModal = (item = null) => {
    setModalDiagError('');
    if (item) {
      setIsEditingDiag(true);
      setDiagForm({
        idCie10: item.idCie10,
        codigo: item.codigo || '',
        descripcion: item.descripcion || '',
        idCategoria: item.idCategoria ? String(item.idCategoria) : ''
      });
    } else {
      setIsEditingDiag(false);
      setDiagForm({
        idCie10: null,
        codigo: '',
        descripcion: '',
        idCategoria: filtroCategoria ? String(filtroCategoria) : ''
      });
    }
    setShowModalDiag(true);
  };

  const handleCloseDiagModal = () => {
    if (!submittingDiag) {
      setShowModalDiag(false);
      setModalDiagError('');
    }
  };

  const handleSaveDiag = async (e) => {
    e.preventDefault();
    setModalDiagError('');

    const cleanCodigo = diagForm.codigo.trim().toUpperCase();
    const cleanDescripcion = diagForm.descripcion.trim();

    if (!cleanCodigo || !cleanDescripcion) {
      setModalDiagError('Por favor completa tanto el código como la descripción.');
      return;
    }

    try {
      setSubmittingDiag(true);
      const payload = {
        codigo: cleanCodigo,
        descripcion: cleanDescripcion,
        idCategoria: diagForm.idCategoria ? Number(diagForm.idCategoria) : null
      };

      let res;
      if (isEditingDiag) {
        res = await actualizar(diagForm.idCie10, payload);
      } else {
        res = await crear(payload);
      }

      if (res.success) {
        setShowModalDiag(false);
        cargarDatos(buscar, filtroCategoria ? Number(filtroCategoria) : null, page);
        cargarCategorias();
      } else {
        setModalDiagError(res.error || 'Ocurrió un error al guardar el diagnóstico.');
      }
    } catch (err) {
      setModalDiagError(err.response?.data?.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmittingDiag(false);
    }
  };

  const handleDeleteDiag = async (id) => {
    if (window.confirm('¿Deseas eliminar este diagnóstico del catálogo?')) {
      const res = await eliminar(id);
      if (res.success) {
        cargarDatos(buscar, filtroCategoria ? Number(filtroCategoria) : null, page);
        cargarCategorias();
      } else {
        alert(res.error || 'No se pudo eliminar el diagnóstico.');
      }
    }
  };

  // Manejadores del modal de categoría
  const handleOpenCatModal = (cat = null) => {
    setModalCatError('');
    if (cat) {
      setIsEditingCat(true);
      setCatForm({
        idCategoria: cat.idCategoria,
        nombre: cat.nombre || '',
        descripcion: cat.descripcion || ''
      });
    } else {
      setIsEditingCat(false);
      setCatForm({
        idCategoria: null,
        nombre: '',
        descripcion: ''
      });
    }
    setShowModalCat(true);
  };

  const handleCloseCatModal = () => {
    if (!submittingCat) {
      setShowModalCat(false);
      setModalCatError('');
    }
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    setModalCatError('');

    const cleanNombre = catForm.nombre.trim();
    if (!cleanNombre) {
      setModalCatError('El nombre de la categoría es obligatorio.');
      return;
    }

    try {
      setSubmittingCat(true);
      const payload = {
        nombre: cleanNombre,
        descripcion: catForm.descripcion ? catForm.descripcion.trim() : null
      };

      let res;
      if (isEditingCat) {
        res = await actualizarCategoria(catForm.idCategoria, payload);
      } else {
        res = await crearCategoria(payload);
      }

      if (res.success) {
        setShowModalCat(false);
        cargarCategorias();
        cargarDatos(buscar, filtroCategoria ? Number(filtroCategoria) : null, page);
      } else {
        setModalCatError(res.error || 'Ocurrió un error al guardar la categoría.');
      }
    } catch (err) {
      setModalCatError(err.response?.data?.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCat = async (id, totalDiags) => {
    if (totalDiags > 0) {
      alert(`No se puede eliminar la categoría porque ya tiene ${totalDiags} diagnóstico(s) asociado(s). Reasigna o elimina los diagnósticos primero.`);
      return;
    }

    if (window.confirm('¿Deseas eliminar esta categoría de diagnóstico?')) {
      const res = await eliminarCategoria(id);
      if (res.success) {
        if (String(filtroCategoria) === String(id)) {
          setFiltroCategoria('');
        }
        cargarCategorias();
        cargarDatos(buscar, null, page);
      } else {
        alert(res.error || 'No se pudo eliminar la categoría.');
      }
    }
  };

  const totalRegistros = data.totalElements ?? data.content?.length ?? 0;
  const totalPaginas = data.totalPages || 1;

  // Filtrado de categorías en cliente para la búsqueda local
  const categoriasFiltradas = categorias.filter((c) =>
    (c.nombre || '').toLowerCase().includes(buscarCat.toLowerCase().trim()) ||
    (c.descripcion || '').toLowerCase().includes(buscarCat.toLowerCase().trim())
  );

  return (
    <div className="diagnosticos-page">
      <AdminNavbar />

      <main className="diagnosticos-container">
        {/* Navegación por Píldoras Subtab Odoo Style */}
        <div className="diagnosticos-subtabs-nav">
          <button
            type="button"
            onClick={() => setActiveTab('diagnosticos')}
            className={`diagnosticos-subtab-btn ${activeTab === 'diagnosticos' ? 'active' : ''}`}
          >
            <Stethoscope size={16} />
            <span>Diagnósticos Registrados</span>
            <span className="diagnosticos-subtab-badge">{totalRegistros}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categorias')}
            className={`diagnosticos-subtab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Categorías de Diagnóstico</span>
            <span className="diagnosticos-subtab-badge">{categorias.length}</span>
          </button>
        </div>

        {/* ==========================================================
            SUBTAB 1: DIAGNÓSTICOS REGISTRADOS
        ========================================================== */}
        {activeTab === 'diagnosticos' && (
          <>
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
                {/* Filtro por Categoría */}
                <div className="diagnosticos-category-filter">
                  <Filter size={15} className="diagnosticos-filter-icon" />
                  <select
                    value={filtroCategoria}
                    onChange={(e) => {
                      setFiltroCategoria(e.target.value);
                      setPage(0);
                    }}
                    className="diagnosticos-filter-select"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map((cat) => (
                      <option key={cat.idCategoria} value={cat.idCategoria}>
                        {cat.nombre} ({cat.totalDiagnosticos || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buscador Integrado */}
                <div className="diagnosticos-search-box">
                  <Search size={16} className="diagnosticos-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por código, descripción o categoría..."
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
                  onClick={() => handleOpenDiagModal()}
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
                  {filtroCategoria || buscar
                    ? 'No hay diagnósticos que coincidan con los filtros aplicados.'
                    : 'Aún no hay diagnósticos registrados en el catálogo. Puedes registrar uno nuevo con el botón superior.'}
                </p>
                {(filtroCategoria || buscar) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroCategoria('');
                      setBuscar('');
                      setPage(0);
                    }}
                    className="diagnosticos-btn-clear-filters"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="diagnosticos-table-card">
                <div className="diagnosticos-table-responsive">
                  <table className="diagnosticos-table">
                    <thead>
                      <tr>
                        <th className="diagnosticos-th" style={{ width: '160px' }}>Código</th>
                        <th className="diagnosticos-th">Descripción del Diagnóstico</th>
                        <th className="diagnosticos-th" style={{ width: '220px' }}>Categoría</th>
                        <th className="diagnosticos-th" style={{ textAlign: 'right', width: '180px' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.content.map((d) => (
                        <tr key={d.idCie10} className="diagnosticos-tr">
                          <td className="diagnosticos-td">
                            <span className="diagnosticos-code-badge" title={d.codigo}>
                              {d.codigo}
                            </span>
                          </td>
                          <td className="diagnosticos-td">
                            <span className="diagnosticos-desc-text">{d.descripcion}</span>
                          </td>
                          <td className="diagnosticos-td">
                            {d.categoriaNombre ? (
                              <span className="diagnosticos-category-badge">
                                <Tag size={12} />
                                <span>{d.categoriaNombre}</span>
                              </span>
                            ) : (
                              <span className="diagnosticos-no-category">Sin categoría</span>
                            )}
                          </td>
                          <td className="diagnosticos-td" style={{ textAlign: 'right' }}>
                            <div className="diagnosticos-actions">
                              <button
                                type="button"
                                onClick={() => handleOpenDiagModal(d)}
                                className="diagnosticos-btn-action diagnosticos-btn-edit"
                                title="Editar diagnóstico"
                              >
                                <Pencil size={13} />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDiag(d.idCie10)}
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
          </>
        )}

        {/* ==========================================================
            SUBTAB 2: CATEGORÍAS DE DIAGNÓSTICO
        ========================================================== */}
        {activeTab === 'categorias' && (
          <>
            <header className="diagnosticos-control-panel">
              <div className="diagnosticos-panel-left">
                <h1 className="diagnosticos-main-title">Categorías de Diagnóstico</h1>
                <div className="diagnosticos-count-pill">
                  <Tag size={14} />
                  <span>
                    <strong>{categorias.length}</strong> {categorias.length === 1 ? 'categoría' : 'categorías'}
                  </span>
                </div>
              </div>

              <div className="diagnosticos-panel-right">
                <div className="diagnosticos-search-box">
                  <Search size={16} className="diagnosticos-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar categorías por nombre o descripción..."
                    value={buscarCat}
                    onChange={(e) => setBuscarCat(e.target.value)}
                    className="diagnosticos-search-input"
                  />
                  {buscarCat && (
                    <button
                      type="button"
                      onClick={() => setBuscarCat('')}
                      className="diagnosticos-search-clear"
                      title="Limpiar búsqueda"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCatModal()}
                  className="diagnosticos-btn-primary"
                >
                  <Plus size={16} />
                  <span>Nueva Categoría</span>
                </button>
              </div>
            </header>

            {errorCategorias && (
              <div className="diagnosticos-alert-error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorCategorias}</span>
              </div>
            )}

            {loadingCategorias ? (
              <div className="diagnosticos-loading">
                <div className="diagnosticos-spinner" />
                <p>Cargando categorías...</p>
              </div>
            ) : categoriasFiltradas.length === 0 ? (
              <div className="diagnosticos-empty">
                <div className="diagnosticos-empty-icon">
                  <Layers size={44} />
                </div>
                <h3 className="diagnosticos-empty-title">No hay categorías registradas</h3>
                <p className="diagnosticos-empty-desc">
                  {buscarCat
                    ? 'No se encontraron categorías que coincidan con la búsqueda.'
                    : 'Crea tu primera categoría para organizar los diagnósticos clínicos de manera profesional.'}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCatModal()}
                  className="diagnosticos-btn-primary"
                  style={{ marginTop: '14px' }}
                >
                  <FolderPlus size={16} />
                  <span>Crear Primera Categoría</span>
                </button>
              </div>
            ) : (
              <div className="diagnosticos-table-card">
                <div className="diagnosticos-table-responsive">
                  <table className="diagnosticos-table">
                    <thead>
                      <tr>
                        <th className="diagnosticos-th" style={{ width: '260px' }}>Nombre de Categoría</th>
                        <th className="diagnosticos-th">Descripción / Alcance</th>
                        <th className="diagnosticos-th" style={{ width: '180px', textAlign: 'center' }}>Diagnósticos</th>
                        <th className="diagnosticos-th" style={{ textAlign: 'right', width: '180px' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriasFiltradas.map((cat) => (
                        <tr key={cat.idCategoria} className="diagnosticos-tr">
                          <td className="diagnosticos-td">
                            <div className="diagnosticos-cat-title-cell">
                              <span className="diagnosticos-cat-icon-wrap">
                                <Tag size={14} />
                              </span>
                              <strong className="diagnosticos-cat-name">{cat.nombre}</strong>
                            </div>
                          </td>
                          <td className="diagnosticos-td">
                            <span className="diagnosticos-desc-text">
                              {cat.descripcion || <em style={{ color: '#94a3b8' }}>Sin descripción</em>}
                            </span>
                          </td>
                          <td className="diagnosticos-td" style={{ textAlign: 'center' }}>
                            <span
                              className={`diagnosticos-cat-count-pill ${
                                (cat.totalDiagnosticos || 0) > 0 ? 'has-diags' : 'zero-diags'
                              }`}
                            >
                              <strong>{cat.totalDiagnosticos || 0}</strong> {cat.totalDiagnosticos === 1 ? 'diagnóstico' : 'diagnósticos'}
                            </span>
                          </td>
                          <td className="diagnosticos-td" style={{ textAlign: 'right' }}>
                            <div className="diagnosticos-actions">
                              <button
                                type="button"
                                onClick={() => handleOpenCatModal(cat)}
                                className="diagnosticos-btn-action diagnosticos-btn-edit"
                                title="Editar categoría"
                              >
                                <Pencil size={13} />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCat(cat.idCategoria, cat.totalDiagnosticos || 0)}
                                className="diagnosticos-btn-action diagnosticos-btn-delete"
                                title="Eliminar categoría"
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
              </div>
            )}
          </>
        )}
      </main>

      {/* ==========================================================
          MODAL 1: FORMULARIO DIAGNÓSTICO (CREAR / EDITAR)
      ========================================================== */}
      {showModalDiag && (
        <div
          className="diagnosticos-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDiagModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="diagnosticos-modal-card">
            <div className="diagnosticos-modal-header">
              <div>
                <h3 className="diagnosticos-modal-title">
                  {isEditingDiag ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
                </h3>
                <p className="diagnosticos-modal-subtitle">
                  {isEditingDiag
                    ? `Modificando registro #${diagForm.codigo}`
                    : 'Ingresa los datos para registrar el diagnóstico en el catálogo clínico.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDiagModal}
                className="diagnosticos-modal-close"
                title="Cerrar ventana"
                disabled={submittingDiag}
              >
                <X size={18} />
              </button>
            </div>

            {modalDiagError && (
              <div style={{ margin: '14px 24px 0' }} className="diagnosticos-modal-error">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{modalDiagError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDiag}>
              <div className="diagnosticos-modal-body">
                {/* Código */}
                <div className="diagnosticos-form-group">
                  <label className="diagnosticos-form-label">
                    Código identificador <span className="diagnosticos-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={diagForm.codigo}
                    onChange={(e) =>
                      setDiagForm({ ...diagForm, codigo: e.target.value.toUpperCase() })
                    }
                    placeholder="Ej. J00, E11.9, RESPIRATORIA-01"
                    className="diagnosticos-form-input"
                    disabled={submittingDiag}
                    maxLength={70}
                  />
                  <span className="diagnosticos-form-hint">
                    Código único de búsqueda (hasta 70 caracteres).
                  </span>
                </div>

                {/* Categoría (Select con la tabla categoria_diagnostico) */}
                <div className="diagnosticos-form-group">
                  <div className="diagnosticos-label-row">
                    <label className="diagnosticos-form-label">
                      Categoría de Diagnóstico
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseDiagModal();
                        setActiveTab('categorias');
                        handleOpenCatModal();
                      }}
                      className="diagnosticos-btn-inline-link"
                    >
                      + Nueva categoría
                    </button>
                  </div>
                  <select
                    value={diagForm.idCategoria}
                    onChange={(e) =>
                      setDiagForm({ ...diagForm, idCategoria: e.target.value })
                    }
                    className="diagnosticos-form-select"
                    disabled={submittingDiag}
                  >
                    <option value="">-- Sin categoría asignada --</option>
                    {categorias.map((cat) => (
                      <option key={cat.idCategoria} value={cat.idCategoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <span className="diagnosticos-form-hint">
                    Asocia el diagnóstico a un grupo clínico para filtrado y reportes.
                  </span>
                </div>

                {/* Descripción */}
                <div className="diagnosticos-form-group">
                  <label className="diagnosticos-form-label">
                    Descripción / Nombre del Diagnóstico <span className="diagnosticos-required-star">*</span>
                  </label>
                  <textarea
                    required
                    value={diagForm.descripcion}
                    onChange={(e) =>
                      setDiagForm({ ...diagForm, descripcion: e.target.value })
                    }
                    rows={3}
                    placeholder="Ej. Rinofaringitis aguda [resfriado común], Diabetes mellitus tipo 2..."
                    className="diagnosticos-form-textarea"
                    disabled={submittingDiag}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="diagnosticos-modal-footer">
                <button
                  type="button"
                  onClick={handleCloseDiagModal}
                  className="diagnosticos-btn-cancel"
                  disabled={submittingDiag}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="diagnosticos-btn-submit"
                  disabled={submittingDiag}
                >
                  {submittingDiag ? (
                    <>
                      <Loader2 size={15} className="spin-icon" />
                      <span>Guardando...</span>
                    </>
                  ) : isEditingDiag ? (
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

      {/* ==========================================================
          MODAL 2: FORMULARIO CATEGORÍA (CREAR / EDITAR)
      ========================================================== */}
      {showModalCat && (
        <div
          className="diagnosticos-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseCatModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="diagnosticos-modal-card">
            <div className="diagnosticos-modal-header">
              <div>
                <h3 className="diagnosticos-modal-title">
                  {isEditingCat ? 'Editar Categoría de Diagnóstico' : 'Nueva Categoría de Diagnóstico'}
                </h3>
                <p className="diagnosticos-modal-subtitle">
                  {isEditingCat
                    ? `Modificando categoría "${catForm.nombre}"`
                    : 'Ingresa los datos para registrar la nueva categoría en el sistema.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCatModal}
                className="diagnosticos-modal-close"
                title="Cerrar ventana"
                disabled={submittingCat}
              >
                <X size={18} />
              </button>
            </div>

            {modalCatError && (
              <div style={{ margin: '14px 24px 0' }} className="diagnosticos-modal-error">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{modalCatError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCat}>
              <div className="diagnosticos-modal-body">
                {/* Nombre */}
                <div className="diagnosticos-form-group">
                  <label className="diagnosticos-form-label">
                    Nombre de la Categoría <span className="diagnosticos-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={catForm.nombre}
                    onChange={(e) =>
                      setCatForm({ ...catForm, nombre: e.target.value })
                    }
                    placeholder="Ej. Enfermedades Respiratorias, Endocrinología, Traumatología"
                    className="diagnosticos-form-input"
                    disabled={submittingCat}
                    maxLength={100}
                  />
                  <span className="diagnosticos-form-hint">
                    Nombre descriptivo y único para agrupar diagnósticos (máx. 100 caracteres).
                  </span>
                </div>

                {/* Descripción */}
                <div className="diagnosticos-form-group">
                  <label className="diagnosticos-form-label">
                    Descripción / Observaciones
                  </label>
                  <textarea
                    value={catForm.descripcion}
                    onChange={(e) =>
                      setCatForm({ ...catForm, descripcion: e.target.value })
                    }
                    rows={3}
                    placeholder="Detalles sobre los diagnósticos que pertenecen a este grupo o notas médicas..."
                    className="diagnosticos-form-textarea"
                    disabled={submittingCat}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="diagnosticos-modal-footer">
                <button
                  type="button"
                  onClick={handleCloseCatModal}
                  className="diagnosticos-btn-cancel"
                  disabled={submittingCat}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="diagnosticos-btn-submit"
                  disabled={submittingCat}
                >
                  {submittingCat ? (
                    <>
                      <Loader2 size={15} className="spin-icon" />
                      <span>Guardando...</span>
                    </>
                  ) : isEditingCat ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Categoría'
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
