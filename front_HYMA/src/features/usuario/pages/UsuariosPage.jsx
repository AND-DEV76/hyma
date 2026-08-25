import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarios } from '../hooks/useUsuarios';
import UsuarioTable from '../components/UsuarioTable';
import UsuarioFormModal from '../components/UsuarioFormModal';

function UsuariosPage() {
  const navigate = useNavigate();
  const { usuarios, loading, error, addUsuario, editUsuario, removeUsuario } = useUsuarios();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  // Obtener usuario guardado al iniciar sesión
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = currentUser.nombreRol === 'ADMIN';

  const handleOpenCreate = () => {
    setSelectedUsuario(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
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

  if (!isAdmin) {
    return (
      <div style={styles.accessDenied}>
        <h2>Acceso Denegado</h2>
        <p>Solo los usuarios con rol <strong>ADMIN</strong> pueden administrar usuarios.</p>
        <button onClick={() => navigate('/inicio')} style={styles.btnBack}>
          Volver a Inicio
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/inicio')} style={styles.btnBack}>
            ← Volver a Inicio
          </button>
          <h2 style={styles.title}>Gestión de Usuarios</h2>
        </div>
        <button onClick={handleOpenCreate} style={styles.btnCreate}>
          + Nuevo Usuario
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {loading ? (
        <p style={{ color: '#0077b6' }}>Cargando usuarios...</p>
      ) : (
        <UsuarioTable
          usuarios={usuarios}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

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
  container: {
    padding: '30px',
    backgroundColor: '#caf0f8',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    color: '#03045e',
    margin: '10px 0 0 0',
  },
  btnBack: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#0077b6',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: 0,
  },
  btnCreate: {
    backgroundColor: '#00b4d8',
    color: '#03045e',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  errorAlert: {
    backgroundColor: '#ffdddd',
    color: '#d8000c',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
  },
  accessDenied: {
    padding: '50px',
    textAlign: 'center',
    color: '#03045e',
    backgroundColor: '#caf0f8',
    minHeight: '100vh',
  },
};

export default UsuariosPage;