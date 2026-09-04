import React, { useState, useMemo } from 'react';
import { Plus, Search, X, AlertCircle, FlaskConical } from 'lucide-react';
import { useAlergias } from '../hooks/useAlergias';
import { AlergiaForm } from '../components/AlergiaForm';
import { AlergiaList } from '../components/AlergiaList';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import '../styles/alergias.css';

export const AlergiaPage = () => {
  const { alergias, loading, error, agregarAlergia, editarAlergia, borrarAlergia } = useAlergias();
  const [alergiaEditar, setAlergiaEditar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado reactivo de alergias por término de búsqueda
  const filteredAlergias = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    return alergias.filter((a) =>
      cleanSearch === '' || a.nombre.toLowerCase().includes(cleanSearch)
    );
  }, [alergias, searchTerm]);

  const handleOpenCreate = () => {
    setAlergiaEditar(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alergia) => {
    setAlergiaEditar(alergia);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAlergiaEditar(null);
  };

  const handleFormSubmit = async (data) => {
    if (alergiaEditar) {
      return await editarAlergia(alergiaEditar.idAlergia, data);
    } else {
      return await agregarAlergia(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Deseas eliminar esta alergia del catálogo clínico?')) {
      borrarAlergia(id);
      if (alergiaEditar && alergiaEditar.idAlergia === id) {
        handleCloseModal();
      }
    }
  };

  return (
    <div className="alergias-page">
      <AdminNavbar />

      <main className="alergias-container">
        {/* Barra Superior de Control estilo Odoo */}
        <header className="alergias-control-panel">
          <div className="alergias-panel-left">
            <h1 className="alergias-main-title">Catálogo de Alergias</h1>
            <div className="alergias-count-pill">
              <FlaskConical size={14} />
              <span>
                <strong>{filteredAlergias.length}</strong> {filteredAlergias.length === 1 ? 'alergia' : 'alergias'}
              </span>
            </div>
          </div>

          <div className="alergias-panel-right">
            {/* Buscador */}
            <div className="alergias-search-box">
              <Search size={16} className="alergias-search-icon" />
              <input
                type="text"
                placeholder="Buscar alergia (ej: Penicilina, Polen)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="alergias-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="alergias-search-clear"
                  title="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Botón Nueva Alergia */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="alergias-btn-primary"
            >
              <Plus size={16} />
              <span>Nueva Alergia</span>
            </button>
          </div>
        </header>

        {/* Alerta de Error si ocurre */}
        {error && (
          <div className="alergias-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Listado / Tabla */}
        {loading ? (
          <div className="alergias-loading">
            <div className="alergias-spinner" />
            <p>Cargando catálogo de alergias...</p>
          </div>
        ) : (
          <AlergiaList
            alergias={filteredAlergias}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Modal de Creación / Edición */}
      <AlergiaForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        alergiaEditar={alergiaEditar}
      />
    </div>
  );
};

export default AlergiaPage;