import React, { useState, useMemo } from 'react';
import { UserPlus, Users, Search, X, AlertCircle } from 'lucide-react';
import { useUsuarios } from '../hooks/useUsuarios';
import UsuarioTable from '../components/UsuarioTable';
import UsuarioFormModal from '../components/UsuarioFormModal';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import '../styles/usuarios.css';

export default function UsuariosPage() {
  const { usuarios, loading, error, addUsuario, editUsuario, removeUsuario } = useUsuarios();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Filtrado reactivo en frontend
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.nombreRol && u.nombreRol.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchRole = roleFilter === 'ALL' || u.nombreRol === roleFilter;
      return matchSearch && matchRole;
    });
  }, [usuarios, searchTerm, roleFilter]);

  const handleOpenCreate = () => {
    setSelectedUsuario(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar este usuario del sistema?')) {
      await removeUsuario(id);
    }
  };

  const handleSave = async (idOrData, dataIfEdit) => {
    if (selectedUsuario) {
      await editUsuario(idOrData, dataIfEdit);
    } else {
      await addUsuario(idOrData);
    }
  };

  return (
    <div className="usuarios-page">
      <AdminNavbar />

      <main className="usuarios-container">
        {/* Barra Superior de Control estilo Odoo */}
        <header className="usuarios-control-panel">
          <div className="usuarios-panel-left">
            <h1 className="usuarios-main-title">Administración de Usuarios</h1>
            <div className="usuarios-count-pill">
              <Users size={14} />
              <span>
                <strong>{filteredUsuarios.length}</strong> {filteredUsuarios.length === 1 ? 'cuenta' : 'cuentas'}
              </span>
            </div>
          </div>

          <div className="usuarios-panel-right">
            {/* Buscador */}
            <div className="usuarios-search-box">
              <Search size={16} className="usuarios-search-icon" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="usuarios-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="usuarios-search-clear"
                  title="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtro por Rol */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="usuarios-role-select"
            >
              <option value="ALL">Todos los roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MEDICO">MÉDICO</option>
              <option value="ENFERMERA">ENFERMERA</option>
              <option value="FARMACIA">FARMACIA</option>
            </select>

            {/* Botón Nuevo Usuario */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="usuarios-btn-primary"
            >
              <UserPlus size={16} />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </header>

        {/* Alerta de Error */}
        {error && (
          <div className="usuarios-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Contenido / Tabla */}
        {loading ? (
          <div className="usuarios-loading">
            <div className="usuarios-spinner" />
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <UsuarioTable
            usuarios={filteredUsuarios}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Modal Formulario */}
      <UsuarioFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        usuarioToEdit={selectedUsuario}
      />
    </div>
  );
}