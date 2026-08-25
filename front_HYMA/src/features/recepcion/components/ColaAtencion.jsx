import React from 'react';

function ColaAtencion({
  cola,
  quitarDeCola,
  cargando,
  guardando,
}) {
  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Cola de atención</h2>
          <p style={styles.subtitle}>
            Pacientes esperando atención.
          </p>
        </div>

        <span style={styles.counter}>
          {cola.length}
        </span>
      </div>

      {cargando ? (
        <p style={styles.loading}>Cargando cola...</p>
      ) : cola.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>✓</div>
          <strong>La cola está vacía</strong>
          <span>
            Los pacientes agregados aparecerán aquí.
          </span>
        </div>
      ) : (
        <div style={styles.list}>
          {cola.map((item) => (
            <div
              key={item.idCola}
              style={styles.item}
            >
              <div style={styles.position}>
                {item.prioridad > 0
                  ? '!'
                  : '#'}
              </div>

              <div style={styles.info}>
                <strong>
                  {item.nombresPaciente}{' '}
                  {item.apellidosPaciente}
                </strong>

                <span>
                  Ingreso:{' '}
                  {item.fechaIngreso
                    ? new Date(
                        item.fechaIngreso
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )
                    : '--'}
                </span>
              </div>

              <span
                style={{
                  ...styles.status,
                  ...getStatusStyle(item.estado),
                }}
              >
                {formatStatus(item.estado)}
              </span>

              <button
                onClick={() =>
                  quitarDeCola(item.idCola)
                }
                disabled={
                  guardando ||
                  item.estado === 'FINALIZADO' ||
                  item.estado === 'CANCELADO'
                }
                style={styles.removeButton}
                title="Quitar de la cola"
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

const formatStatus = (estado) => {
  const estados = {
    PENDIENTE: 'Pendiente',
    EN_PRECONSULTA: 'Preconsulta',
    EN_CONSULTA: 'Consulta',
    EN_FARMACIA: 'Farmacia',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
  };

  return estados[estado] || estado;
};

const getStatusStyle = (estado) => {
  if (estado === 'PENDIENTE') {
    return {
      background: '#caf0f8',
      color: '#03045e',
    };
  }

  if (estado === 'EN_PRECONSULTA') {
    return {
      background: '#90e0ef',
      color: '#03045e',
    };
  }

  if (estado === 'FINALIZADO') {
    return {
      background: '#dcfce7',
      color: '#166534',
    };
  }

  if (estado === 'CANCELADO') {
    return {
      background: '#fee2e2',
      color: '#991b1b',
    };
  }

  return {
    background: '#e2e8f0',
    color: '#334155',
  };
};

const styles = {
  section: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(3, 4, 94, 0.07)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
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

  counter: {
    minWidth: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#0077b6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '13px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
  },

  position: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: '#caf0f8',
    color: '#03045e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },

  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  status: {
    padding: '6px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },

  removeButton: {
    border: '1px solid #fecaca',
    background: '#ffffff',
    color: '#dc2626',
    borderRadius: '8px',
    padding: '8px 11px',
    cursor: 'pointer',
  },

  loading: {
    color: '#0077b6',
  },

  empty: {
    padding: '35px',
    background: '#f8fafc',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '7px',
    color: '#64748b',
  },

  emptyIcon: {
    fontSize: '30px',
    color: '#0077b6',
  },
};

export default ColaAtencion;