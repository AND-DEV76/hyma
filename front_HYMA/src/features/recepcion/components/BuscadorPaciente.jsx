import { useEffect } from 'react';

function BuscadorPaciente({
  busqueda,
  setBusqueda,
  pacientes,
  buscar,
  agregarPaciente,
  cargando,
  guardando,
}) {
  useEffect(() => {
    const timer = setTimeout(() => buscar(busqueda), 350);
    return () => clearTimeout(timer);
  }, [busqueda, buscar]);

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <p style={styles.sectionKicker}>NUEVO INGRESO</p>
          <h2 style={styles.title}>Buscar paciente</h2>
          <p style={styles.subtitle}>Consulta el expediente por nombre, apellido o teléfono.</p>
        </div>
      </div>

      <label htmlFor="patient-search" style={styles.label}>Buscar en expedientes</label>
      <input
        id="patient-search"
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Escribe un nombre o apellido"
        style={styles.input}
      />

      {cargando && <p style={styles.feedback}>Buscando pacientes...</p>}

      {!cargando && pacientes.length > 0 && (
        <div style={styles.results}>
          <p style={styles.resultHeading}>Resultados encontrados</p>
          {pacientes.map((paciente) => (
            <div key={paciente.idPaciente} style={styles.patient}>
              <div style={styles.patientInfo}>
                <strong style={styles.patientName}>{paciente.nombres} {paciente.apellidos}</strong>
                <span style={styles.patientMeta}>{paciente.telefono || 'Sin teléfono'} · {paciente.comunidad || 'Sin comunidad'}</span>
              </div>
              <button
                onClick={() => agregarPaciente(paciente.idPaciente)}
                disabled={guardando}
                style={styles.addButton}
              >
                Agregar a cola
              </button>
            </div>
          ))}
        </div>
      )}

      {!cargando && busqueda.trim() && pacientes.length === 0 && (
        <div style={styles.empty}>No se encontraron pacientes con esos datos.</div>
      )}
    </section>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    border: '1px solid #caf0f8',
    borderRadius: '12px',
    padding: '26px',
    boxShadow: '0 12px 30px rgba(3, 4, 94, 0.05)',
  },
  cardHeader: { marginBottom: '24px' },
  sectionKicker: {
    color: '#00b4d8',
    fontSize: '0.68rem',
    fontWeight: '800',
    letterSpacing: '1.4px',
    margin: '0 0 8px',
  },
  title: {
    color: '#03045e',
    fontSize: '1.2rem',
    margin: 0,
    fontWeight: '750',
  },
  subtitle: {
    color: '#496174',
    fontSize: '0.84rem',
    lineHeight: 1.5,
    margin: '7px 0 0',
  },
  label: {
    color: '#03045e',
    display: 'block',
    fontSize: '0.76rem',
    fontWeight: '700',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    border: '1px solid #90e0ef',
    borderRadius: '7px',
    color: '#03045e',
    fontSize: '0.9rem',
    outline: 'none',
    padding: '12px 13px',
    background: '#faffff',
  },
  feedback: { color: '#0077b6', fontSize: '0.82rem', margin: '14px 0 0' },
  results: { marginTop: '24px' },
  resultHeading: {
    color: '#496174',
    fontSize: '0.72rem',
    fontWeight: '800',
    letterSpacing: '0.5px',
    margin: '0 0 10px',
    textTransform: 'uppercase',
  },
  patient: {
    alignItems: 'center',
    borderBottom: '1px solid #caf0f8',
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
    padding: '14px 0',
  },
  patientInfo: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 },
  patientName: { color: '#03045e', fontSize: '0.88rem' },
  patientMeta: { color: '#6a7d8b', fontSize: '0.76rem' },
  addButton: {
    background: '#caf0f8',
    border: '1px solid #90e0ef',
    borderRadius: '6px',
    color: '#03045e',
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: '0.76rem',
    fontWeight: '700',
    padding: '9px 12px',
  },
  empty: {
    background: '#f7fcfe',
    color: '#6a7d8b',
    fontSize: '0.82rem',
    marginTop: '20px',
    padding: '16px',
    textAlign: 'center',
  },
};

export default BuscadorPaciente;
