import React from 'react';
import { useNavigate } from 'react-router-dom';

function InicioPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Usuario' };
  const isAdmin = user.nombreRol === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>HYMA</div>
        <button onClick={handleLogout} style={styles.btnLogout}>
          Cerrar Sesión
        </button>
      </header>

      <main style={styles.content}>
        <div style={styles.welcomeCard}>
          <h1 style={styles.title}>Bienvenido {user.username}</h1>
          <p style={styles.subtitle}>
            Rol asignado: <strong>{user.nombreRol}</strong>
          </p>

{isAdmin && (
  <div style={styles.menuGrid}>

    <button
      onClick={() => navigate('/usuarios')}
      style={styles.menuCard}
    >
      <h3>👥 Usuarios</h3>
      <p>Administración y permisos</p>
    </button>

    <button
      onClick={() => navigate('/alergias')}
      style={styles.menuCard}
    >
      <h3>🧪 Alergias</h3>
      <p>Catálogo y gestión de alergias</p>
    </button>

    <button
      onClick={() => navigate('/recepcion')}
      style={styles.menuCard}
    >
      <h3>🏥 Recepción</h3>
      <p>Admisión de pacientes y cola de atención</p>
    </button>

  </div>
)}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#caf0f8',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: '#03045e',
    color: '#ffffff',
    padding: '15px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#90e0ef',
  },
  btnLogout: {
    backgroundColor: '#00b4d8',
    color: '#03045e',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  content: {
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(3, 4, 94, 0.08)',
    width: '100%',
    maxWidth: '700px',
    textAlign: 'center',
  },
  title: {
    color: '#03045e',
    margin: 0,
  },
  subtitle: {
    color: '#0077b6',
    marginBottom: '30px',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  },
  menuCard: {
    backgroundColor: '#caf0f8',
    border: '1px solid #90e0ef',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    color: '#03045e',
    textAlign: 'left',
  },
};

export default InicioPage;