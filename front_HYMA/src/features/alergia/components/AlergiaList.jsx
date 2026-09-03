import React from 'react';

export const AlergiaList = ({ alergias, onEdit, onDelete }) => {
  if (!alergias || alergias.length === 0) {
    return (
      <div style={styles.emptyCard}>
        <div style={styles.emptyIcon}>🧪</div>
        <h3 style={styles.emptyTitle}>No hay alergias encontradas</h3>
        <p style={styles.emptyText}>
          No se encontraron elementos con el término buscado. Puedes agregar una nueva usando el formulario.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Nombre de la Alergia</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alergias.map((a) => (
            <tr key={a.idAlergia} style={styles.row}>
              <td style={{ ...styles.td, color: '#64748b', fontWeight: 600, width: '80px' }}>
                #{a.idAlergia}
              </td>

              <td style={styles.td}>
                <div style={styles.nameRow}>
                  <span style={styles.allergyPill}>🧪</span>
                  <strong style={styles.nameText}>{a.nombre}</strong>
                </div>
              </td>

              <td style={{ ...styles.td, textAlign: 'right', width: '180px' }}>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => onEdit(a)}
                    style={styles.btnEdit}
                    title="Editar alergia"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => onDelete(a.idAlergia)}
                    style={styles.btnDelete}
                    title="Eliminar alergia"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    padding: '14px 20px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  row: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '16px 20px',
    verticalAlign: 'middle',
    color: '#0f172a',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  allergyPill: {
    fontSize: '1rem',
    backgroundColor: '#fef3c7',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  nameText: {
    fontSize: '0.95rem',
    color: '#0f172a',
  },
  actionButtons: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  btnEdit: {
    backgroundColor: '#f8fafc',
    color: '#d97706',
    border: '1px solid #fde68a',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDelete: {
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '3.5rem 2rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.88rem',
  },
};