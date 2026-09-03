import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarPreconsulta } from '../../preconsulta/services/preconsultaService';

function ColaAtencion({ cola, quitarDeCola, cargando, guardando }) {
  const navigate = useNavigate();
  const [atendiendoId, setAtendiendoId] = useState(null);
  const [errorPreconsulta, setErrorPreconsulta] = useState('');

  const handleAtenderPreconsulta = async (item) => {
    setErrorPreconsulta('');
    setAtendiendoId(item.idCola);

    try {
      if (item.estado === 'PENDIENTE') {
        await iniciarPreconsulta(item.idCola);
      }
      navigate(`/preconsulta?idCola=${item.idCola}&idPaciente=${item.idPaciente}`);
    } catch (err) {
      setErrorPreconsulta(err.response?.data?.message || 'No se pudo iniciar la preconsulta. Intenta nuevamente.');
    } finally {
      setAtendiendoId(null);
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <div>
          <p style={styles.sectionKicker}>SEGUIMIENTO</p>
          <h2 style={styles.title}>Cola de atención</h2>
          <p style={styles.subtitle}>Pacientes pendientes de preconsulta.</p>
        </div>
        <span style={styles.counter}>{cola.length}</span>
      </div>

      {errorPreconsulta && <div role="alert" style={styles.error}>{errorPreconsulta}</div>}

      {cargando ? (
        <p style={styles.feedback}>Cargando cola...</p>
      ) : cola.length === 0 ? (
        <div style={styles.empty}>
          <strong>No hay pacientes pendientes</strong>
          <span>Los nuevos ingresos aparecerán aquí.</span>
        </div>
      ) : (
        <div style={styles.list}>
          {cola.map((item, index) => (
            <div key={item.idCola} style={styles.item}>
              <span style={styles.order}>{String(index + 1).padStart(2, '0')}</span>
              <div style={styles.info}>
                <strong style={styles.patientName}>{item.nombresPaciente} {item.apellidosPaciente}</strong>
                <span style={styles.time}>
                  Ingreso {item.fechaIngreso ? new Date(item.fechaIngreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </span>
              </div>
              <span style={{ ...styles.status, ...getStatusStyle(item.estado) }}>{formatStatus(item.estado)}</span>

              {item.estado === 'PENDIENTE' && (
                <button
                  onClick={() => handleAtenderPreconsulta(item)}
                  style={styles.primaryAction}
                  disabled={atendiendoId !== null || guardando}
                >
                  {atendiendoId === item.idCola ? 'Abriendo...' : 'Preconsulta'}
                </button>
              )}

              {item.estado === 'EN_PRECONSULTA' && (
                <button
                  onClick={() => handleAtenderPreconsulta(item)}
                  style={styles.secondaryAction}
                  disabled={atendiendoId !== null || guardando}
                >
                  {atendiendoId === item.idCola ? 'Abriendo...' : 'Continuar'}
                </button>
              )}

              <button
                onClick={() => quitarDeCola(item.idCola)}
                disabled={guardando || item.estado === 'FINALIZADO' || item.estado === 'CANCELADO'}
                style={styles.removeButton}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const formatStatus = (estado) => ({
  PENDIENTE: 'Pendiente',
  EN_PRECONSULTA: 'En preconsulta',
  EN_CONSULTA: 'En consulta',
  EN_FARMACIA: 'En farmacia',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
}[estado] || estado);

const getStatusStyle = (estado) => {
  if (estado === 'PENDIENTE') return { background: '#caf0f8', color: '#03045e' };
  if (estado === 'EN_PRECONSULTA') return { background: '#90e0ef', color: '#03045e' };
  return { background: '#f1f7f9', color: '#496174' };
};

const styles = {
  card: {
    background: '#ffffff',
    border: '1px solid #caf0f8',
    borderRadius: '12px',
    boxShadow: '0 12px 30px rgba(3, 4, 94, 0.05)',
    padding: '26px',
  },
  header: { alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' },
  sectionKicker: { color: '#00b4d8', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '1.4px', margin: '0 0 8px' },
  title: { color: '#03045e', fontSize: '1.2rem', fontWeight: '750', margin: 0 },
  subtitle: { color: '#496174', fontSize: '0.84rem', margin: '7px 0 0' },
  counter: { alignItems: 'center', background: '#03045e', borderRadius: '50%', color: '#ffffff', display: 'flex', fontSize: '0.82rem', fontWeight: '800', height: '36px', justifyContent: 'center', width: '36px' },
  error: { background: '#caf0f8', border: '1px solid #90e0ef', borderRadius: '7px', color: '#03045e', fontSize: '0.82rem', marginBottom: '14px', padding: '10px 12px' },
  feedback: { color: '#0077b6', fontSize: '0.84rem' },
  empty: { alignItems: 'center', background: '#f7fcfe', color: '#496174', display: 'flex', flexDirection: 'column', gap: '6px', padding: '30px 16px', textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column' },
  item: { alignItems: 'center', borderBottom: '1px solid #caf0f8', display: 'flex', gap: '13px', padding: '15px 0' },
  order: { color: '#00b4d8', fontSize: '0.76rem', fontWeight: '800', width: '25px' },
  info: { display: 'flex', flex: 1, flexDirection: 'column', gap: '5px', minWidth: '130px' },
  patientName: { color: '#03045e', fontSize: '0.87rem' },
  time: { color: '#6a7d8b', fontSize: '0.75rem' },
  status: { borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800', padding: '5px 7px', whiteSpace: 'nowrap' },
  primaryAction: { background: '#0077b6', border: 0, borderRadius: '6px', color: '#ffffff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', padding: '9px 11px', whiteSpace: 'nowrap' },
  secondaryAction: { background: '#90e0ef', border: 0, borderRadius: '6px', color: '#03045e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', padding: '9px 11px', whiteSpace: 'nowrap' },
  removeButton: { background: 'transparent', border: '1px solid #90e0ef', borderRadius: '6px', color: '#496174', cursor: 'pointer', fontSize: '0.75rem', padding: '8px 10px', whiteSpace: 'nowrap' },
};

export default ColaAtencion;
