import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecepcion } from '../hooks/useRecepcion';
import BuscadorPaciente from '../components/BuscadorPaciente';
import ColaAtencion from '../components/ColaAtencion';
import FormularioPaciente from '../components/FormularioPaciente';


function RecepcionPage() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem('user')) || {
      username: 'Usuario',
      nombreRol: '',
    };

  const {
    pacientes,
    cola,
    busqueda,
    setBusqueda,
    buscar,
    agregarPaciente,
    crearNuevoPaciente,
    quitarDeCola,
    cargandoPacientes,
    cargandoCola,
    guardando,
    error,
  } = useRecepcion();

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const handleNuevoPaciente = async (datos) => {
    await crearNuevoPaciente(datos);

    setMostrarFormulario(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>HYMA</div>
          <span style={styles.module}>
            Recepción
          </span>
        </div>

        <div style={styles.userArea}>
          <span>
            {user.username}
          </span>

          <button
            onClick={handleLogout}
            style={styles.logout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main style={styles.content}>
        <div style={styles.welcome}>
          <div>
            <p style={styles.eyebrow}>
              RECEPCIÓN
            </p>

            <h1 style={styles.title}>
              Bienvenido, {user.username}
            </h1>

            <p style={styles.description}>
              Busca un paciente existente o registra
              uno nuevo para iniciar su atención.
            </p>
          </div>

          <button
            onClick={() =>
              setMostrarFormulario(true)
            }
            style={styles.newButton}
          >
            + Nuevo paciente
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.layout}>
          <div>
            <BuscadorPaciente
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              pacientes={pacientes}
              buscar={buscar}
              agregarPaciente={agregarPaciente}
              cargando={cargandoPacientes}
              guardando={guardando}
            />
          </div>

          <div>
            <ColaAtencion
              cola={cola}
              quitarDeCola={quitarDeCola}
              cargando={cargandoCola}
              guardando={guardando}
            />
          </div>
        </div>
      </main>

      {mostrarFormulario && (
        <FormularioPaciente
          onGuardar={handleNuevoPaciente}
          onCerrar={() =>
            setMostrarFormulario(false)
          }
          guardando={guardando}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5fbfd',
  },

  header: {
    height: '72px',
    background: '#03045e',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 5%',
  },

  brand: {
    fontSize: '25px',
    fontWeight: '800',
    letterSpacing: '1px',
  },

  module: {
    fontSize: '12px',
    opacity: 0.75,
  },

  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },

  logout: {
    border: '1px solid rgba(255,255,255,.4)',
    background: 'transparent',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '8px 13px',
    cursor: 'pointer',
  },

  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '35px 5%',
  },

  welcome: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },

  eyebrow: {
    color: '#0077b6',
    fontWeight: '700',
    fontSize: '12px',
    letterSpacing: '1.5px',
    margin: 0,
  },

  title: {
    color: '#03045e',
    fontSize: '32px',
    margin: '6px 0',
  },

  description: {
    color: '#64748b',
    margin: 0,
  },

  newButton: {
    border: 'none',
    background: '#0077b6',
    color: '#ffffff',
    padding: '13px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },

  layout: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '24px',
  },

  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 15px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
};

export default RecepcionPage;