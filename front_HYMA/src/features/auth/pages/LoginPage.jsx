import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginService } from '../services/authService';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
        const data = await loginService(username, password);

        // Guardar token JWT y datos de usuario para persistir la sesión
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        localStorage.setItem('user', JSON.stringify(data.usuario));

        if (data.usuario.nombreRol === 'ENFERMERA') {
            navigate('/recepcion');
        } else {
            navigate('/inicio');
        }

    } catch (err) {
        setErrorMessage(
            err.response?.data?.message || 'Credenciales incorrectas'
        );
    } finally {
        setLoading(false);
    }
};

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setErrorMessage('');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Panel Izquierdo - LOGO */}
        <div style={styles.leftPanel}>
          <div style={styles.logoCircle}>
            <span style={styles.logoText}>HYMA</span>
          </div>
          <h2 style={{ margin: '15px 0 0 0', fontSize: '1.5rem' }}>Bienvenido</h2>
        </div>

        {/* Panel Derecho - FORMULARIO */}
        <div style={styles.rightPanel}>
          <h2 style={styles.title}>Iniciar Sesión</h2>

          {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nombre de Usuario</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <div style={styles.buttonContainer}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.btnCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={styles.btnSubmit}
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Iniciar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#caf0f8',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    display: 'flex',
    width: '800px',
    maxWidth: '90%',
    minHeight: '450px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(3, 4, 94, 0.15)',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: '1',
    backgroundColor: '#03045e',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  logoCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#00b4d8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  logoText: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#03045e',
  },
  rightPanel: {
    flex: '1.2',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    color: '#03045e',
    marginTop: 0,
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '0.9rem',
    color: '#0077b6',
    fontWeight: '600',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #90e0ef',
    outline: 'none',
    fontSize: '1rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  btnCancel: {
    flex: 1,
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #0077b6',
    backgroundColor: 'transparent',
    color: '#0077b6',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnSubmit: {
    flex: 1,
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0077b6',
    color: '#ffffff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  errorAlert: {
    backgroundColor: '#ffdddd',
    color: '#d8000c',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '0.85rem',
  },
};

export default LoginPage;