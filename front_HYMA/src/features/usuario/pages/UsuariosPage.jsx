import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarios } from '../hooks/useUsuarios';
import UsuarioTable from '../components/UsuarioTable';
import UsuarioFormModal from '../components/UsuarioFormModal';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

export default function UsuariosPage() {
  const navigate = useNavigate();
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

  // Contadores de resumen
  const totalActivos = useMemo(() => usuarios.filter((u) => u.estado).length, [usuarios]);
  const totalInactivos = useMemo(() => usuarios.filter((u) => !u.estado).length, [usuarios]);

  const handleOpenCreate = () => {
    setSelectedUsuario(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario del sistema?')) {
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
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.container}>
        {/* Encabezado Principal */}
        <div style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              <span onClick={() => navigate('/inicio')} style={styles.breadcrumbLink}>
                Inicio
              </span>{' '}
              / <span>Usuarios</span>
            </div>
            <h1 style={styles.title}>Administración de Usuarios</h1>
            <p style={styles.subtitle}>
              Gestiona el acceso, roles y estado de las cuentas de usuario de la clínica.
            </p>
          </div>

          <button onClick={handleOpenCreate} style={styles.btnCreate}>
            <span style={styles.btnIcon}>+</span> Nuevo Usuario
          </button>
        </div>

        {/* Resumen de Métricas */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Registrados</div>
            <div style={styles.metricValue}>{usuarios.length}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Cuentas Activas</div>
            <div style={{ ...styles.metricValue, color: '#16a34a' }}>{totalActivos}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Cuentas Inactivas</div>
            <div style={{ ...styles.metricValue, color: '#dc2626' }}>{totalInactivos}</div>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div style={styles.filterCard}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre de usuario o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.btnClearSearch}>
                ✕
              </button>
            )}
          </div>

          <div style={styles.roleFilterGroup}>
            <label style={styles.filterLabel}>Filtrar Rol:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="ALL">Todos los roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MEDICO">MEDICO</option>
              <option value="ENFERMERA">ENFERMERA</option>
              <option value="FARMACIA">FARMACIA</option>
            </select>
          </div>
        </div>

        {/* Alerta de Error */}
        {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

        {/* Contenido de la Tabla */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Cargando catálogo de usuarios...</p>
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

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  breadcrumb: {
    fontSize: '0.82rem',
    color: '#64748b',
    fontWeight: 600,
    marginBottom: '6px',
  },
  breadcrumbLink: {
    color: '#0077b6',
    cursor: 'pointer',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '0.92rem',
    color: '#64748b',
    margin: 0,
  },
  btnCreate: {
    background: 'linear-gradient(135deg, #0077b6 0%, #0096c7 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(0, 119, 182, 0.3)',
    transition: 'all 0.2s ease',
  },
  btnIcon: {
    fontSize: '1.2rem',
    lineHeight: '1',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    padding: '1.2rem 1.5rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '4px',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '0 12px',
    flex: '1',
    minWidth: '260px',
  },
  searchIcon: {
    fontSize: '0.9rem',
    marginRight: '8px',
    color: '#64748b',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    padding: '10px 0',
    fontSize: '0.92rem',
    outline: 'none',
    width: '100%',
    color: '#0f172a',
  },
  btnClearSearch: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '4px',
  },
  roleFilterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
  },
  filterSelect: {
    padding: '9px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.88rem',
    color: '#0f172a',
    outline: 'none',
    cursor: 'pointer',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '3.5rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
};