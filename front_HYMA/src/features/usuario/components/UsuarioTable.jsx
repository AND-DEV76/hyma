import React from 'react';

function UsuarioTable({ usuarios, onEdit, onDelete }) {
  if (!usuarios.length) {
    return <p style={{ textAlign: 'center', color: '#0077b6' }}>No hay usuarios registrados.</p>;
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Rol</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Fecha Creación</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.idUsuario} style={styles.row}>
              <td style={styles.td}>{u.idUsuario}</td>
              <td style={styles.td}><strong>{u.username}</strong></td>
              <td style={styles.td}>
                <span style={styles.badgeRol}>{u.nombreRol}</span>
              </td>
              <td style={styles.td}>
                <span style={u.estado ? styles.badgeActive : styles.badgeInactive}>
                  {u.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={styles.td}>
                {u.fechaCreacion ? new Date(u.fechaCreacion).toLocaleDateString() : '-'}
              </td>
              <td style={styles.td}>
                <button onClick={() => onEdit(u)} style={styles.btnEdit}>
                  Editar
                </button>
                <button onClick={() => onDelete(u.idUsuario)} style={styles.btnDelete}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  tableWrapper: {
    overflowX: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(3, 4, 94, 0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  headerRow: {
    backgroundColor: '#03045e',
    color: '#ffffff',
  },
  th: {
    padding: '12px 15px',
    fontSize: '0.9rem',
  },
  row: {
    borderBottom: '1px solid #caf0f8',
  },
  td: {
    padding: '12px 15px',
    color: '#03045e',
    fontSize: '0.9rem',
  },
  badgeRol: {
    backgroundColor: '#90e0ef',
    color: '#03045e',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  badgeActive: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  badgeInactive: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  btnEdit: {
    backgroundColor: '#0077b6',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '6px',
  },
  btnDelete: {
    backgroundColor: '#d8000c',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default UsuarioTable;