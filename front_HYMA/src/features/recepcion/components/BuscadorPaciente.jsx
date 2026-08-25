import React, { useEffect } from 'react';

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
    const timer = setTimeout(() => {
      buscar(busqueda);
    }, 350);

    return () => clearTimeout(timer);
  }, [busqueda, buscar]);

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.title}>Buscar paciente</h2>
          <p style={styles.subtitle}>
            Busca un paciente por nombre, apellido o teléfono.
          </p>
        </div>
      </div>

      <div style={styles.searchContainer}>
        <span style={styles.searchIcon}>⌕</span>

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar paciente..."
          style={styles.input}
        />
      </div>

      {cargando && (
        <p style={styles.loading}>Buscando pacientes...</p>
      )}

      {!cargando && pacientes.length > 0 && (
        <div style={styles.results}>
          {pacientes.map((paciente) => (
            <div
              key={paciente.idPaciente}
              style={styles.patient}
            >
              <div style={styles.avatar}>
                {paciente.nombres?.charAt(0)}
              </div>

              <div style={styles.patientInfo}>
                <strong>
                  {paciente.nombres} {paciente.apellidos}
                </strong>

                <span>
                  {paciente.telefono || 'Sin teléfono'}
                </span>

                <span>
                  {paciente.comunidad || 'Sin comunidad'}
                </span>
              </div>

              <button
                onClick={() =>
                  agregarPaciente(paciente.idPaciente)
                }
                disabled={guardando}
                style={styles.addButton}
              >
                + Agregar a cola
              </button>
            </div>
          ))}
        </div>
      )}

      {!cargando &&
        busqueda.trim() &&
        pacientes.length === 0 && (
          <div style={styles.empty}>
            No se encontraron pacientes.
          </div>
        )}
    </section>
  );
}

const styles = {
  section: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(3, 4, 94, 0.07)',
  },

  sectionHeader: {
    marginBottom: '18px',
  },

  title: {
    margin: 0,
    color: '#03045e',
    fontSize: '21px',
  },

  subtitle: {
    margin: '6px 0 0',
    color: '#64748b',
    fontSize: '14px',
  },

  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    background: '#f8fafc',
    border: '1px solid #dbeafe',
    borderRadius: '12px',
    padding: '0 15px',
  },

  searchIcon: {
    fontSize: '25px',
    color: '#0077b6',
  },

  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    padding: '15px 10px',
    fontSize: '15px',
  },

  loading: {
    color: '#0077b6',
    fontSize: '14px',
  },

  results: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  patient: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
  },

  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#caf0f8',
    color: '#03045e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },

  patientInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },

  addButton: {
    border: 'none',
    borderRadius: '9px',
    padding: '10px 14px',
    background: '#0077b6',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '600',
  },

  empty: {
    marginTop: '18px',
    padding: '20px',
    textAlign: 'center',
    color: '#64748b',
    background: '#f8fafc',
    borderRadius: '10px',
  },
};

export default BuscadorPaciente;