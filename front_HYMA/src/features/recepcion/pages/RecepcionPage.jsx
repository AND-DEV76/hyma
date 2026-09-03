import { useState } from 'react';
import { useRecepcion } from '../hooks/useRecepcion';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import BuscadorPaciente from '../components/BuscadorPaciente';
import ColaAtencion from '../components/ColaAtencion';
import FormularioPaciente from '../components/FormularioPaciente';

function RecepcionPage() {
  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Usuario',
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

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleNuevoPaciente = async (datos) => {
    await crearNuevoPaciente(datos);
    setMostrarFormulario(false);
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.content}>
        <section style={styles.pageIntro}>
          <div>
            <p style={styles.eyebrow}>RECEPCIÓN</p>
            <h1 style={styles.title}>Buenos días, {user.username}</h1>
            <p style={styles.description}>
              Gestiona el ingreso de pacientes y organiza la atención del día.
            </p>
          </div>

          <button onClick={() => setMostrarFormulario(true)} style={styles.primaryButton}>
            Nuevo paciente
          </button>
        </section>

        <div style={styles.summaryRow}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Pacientes en espera</span>
            <strong style={styles.summaryValue}>{cola.length}</strong>
          </div>
          <div style={styles.summaryDivider} />
          <p style={styles.summaryText}>Turnos pendientes de preconsulta</p>
        </div>

        {error && <div role="alert" style={styles.error}>{error}</div>}

        <div style={styles.layout}>
          <BuscadorPaciente
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            pacientes={pacientes}
            buscar={buscar}
            agregarPaciente={agregarPaciente}
            cargando={cargandoPacientes}
            guardando={guardando}
          />

          <ColaAtencion
            cola={cola}
            quitarDeCola={quitarDeCola}
            cargando={cargandoCola}
            guardando={guardando}
          />
        </div>
      </main>

      {mostrarFormulario && (
        <FormularioPaciente
          onGuardar={handleNuevoPaciente}
          onCerrar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f7fcfe',
  },
  content: {
    maxWidth: '1380px',
    margin: '0 auto',
    padding: '46px 5% 64px',
  },
  pageIntro: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '24px',
    marginBottom: '30px',
  },
  eyebrow: {
    color: '#0077b6',
    fontSize: '0.72rem',
    fontWeight: '800',
    letterSpacing: '1.8px',
    margin: '0 0 10px',
  },
  title: {
    color: '#03045e',
    fontSize: 'clamp(1.8rem, 3vw, 2.55rem)',
    fontWeight: '750',
    letterSpacing: '-0.04em',
    margin: 0,
  },
  description: {
    color: '#496174',
    fontSize: '0.95rem',
    margin: '10px 0 0',
  },
  primaryButton: {
    border: '0',
    borderRadius: '7px',
    background: '#0077b6',
    color: '#ffffff',
    padding: '12px 18px',
    fontSize: '0.86rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 18px rgba(0, 119, 182, 0.16)',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    borderTop: '1px solid #90e0ef',
    borderBottom: '1px solid #caf0f8',
    padding: '16px 0',
    marginBottom: '26px',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
  },
  summaryLabel: {
    color: '#496174',
    fontSize: '0.83rem',
    fontWeight: '600',
  },
  summaryValue: {
    color: '#03045e',
    fontSize: '1.3rem',
  },
  summaryDivider: {
    width: '1px',
    height: '18px',
    background: '#90e0ef',
  },
  summaryText: {
    color: '#0077b6',
    fontSize: '0.8rem',
    margin: 0,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 0.82fr) minmax(0, 1.18fr)',
    gap: '24px',
    alignItems: 'start',
  },
  error: {
    background: '#caf0f8',
    border: '1px solid #90e0ef',
    borderRadius: '8px',
    color: '#03045e',
    padding: '12px 15px',
    marginBottom: '20px',
    fontSize: '0.86rem',
  },
};

export default RecepcionPage;
