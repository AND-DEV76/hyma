import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinica } from '../hooks/useClinica';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

export default function ClinicaPage() {
  const navigate = useNavigate();
  const { cola, loading, error, cargarCola } = useClinica();
  
  useEffect(() => {
    cargarCola();
  }, [cargarCola]);

  const handleAtender = (idPaciente, idCola) => {
    navigate('/clinica/atencion?idPaciente=' + idPaciente + '&idCola=' + idCola);
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />
      <main style={styles.content}>
        <section style={styles.header}>
          <p style={styles.eyebrow}>MÓDULO MÉDICO</p>
          <h1 style={styles.title}>Pacientes en Espera de Consulta</h1>
        </section>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {loading ? (
          <p>Cargando pacientes...</p>
        ) : cola.length === 0 ? (
          <div style={styles.emptyState}>No hay pacientes esperando consulta.</div>
        ) : (
          <div style={styles.grid}>
            {cola.map(item => (
              <div key={item.idCola} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.patientName}>{item.nombresPaciente} {item.apellidosPaciente}</h3>
                  <span style={styles.priorityBadge}>Prioridad: {item.prioridad}</span>
                </div>
                <div style={styles.cardBody}>
                  <p><strong>Ingreso:</strong> {new Date(item.fechaIngreso).toLocaleTimeString()}</p>
                </div>
                <div style={styles.cardFooter}>
                  <button onClick={() => handleAtender(item.idPaciente, item.idCola)} style={styles.btnPrimary}>
                    Atender / Iniciar Consulta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f7fcfe', fontFamily: "'Segoe UI', Verdana, sans-serif" },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  header: { marginBottom: '30px' },
  eyebrow: { color: '#0077b6', fontWeight: 'bold', margin: 0, fontSize: '14px' },
  title: { color: '#03045e', margin: '5px 0 0 0', fontSize: '28px' },
  errorAlert: { background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '20px' },
  emptyState: { padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: { background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  patientName: { margin: 0, color: '#03045e', fontSize: '18px', flex: 1 },
  priorityBadge: { background: '#00b4d8', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', marginLeft: '10px' },
  cardBody: { color: '#475569', fontSize: '14px', marginBottom: '20px', flex: 1 },
  cardFooter: { borderTop: '1px solid #f1f5f9', paddingTop: '15px' },
  btnPrimary: { width: '100%', background: '#0077b6', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }
};
