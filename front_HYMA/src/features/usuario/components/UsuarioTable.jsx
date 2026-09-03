import React from 'react';

export default function UsuarioTable({ usuarios, onEdit, onDelete }) {
  if (!usuarios || usuarios.length === 0) {
    return (
      <div style={styles.emptyCard}>
        <div style={styles.emptyIcon}>👤</div>
        <h3 style={styles.emptyTitle}>No se encontraron usuarios</h3>
        <p style={styles.emptyText}>
          No hay usuarios que coincidan con los filtros aplicados o aún no se han registrado cuentas.
        </p>
      </div>
    );
  }

  const getRoleStyle = (rol) => {
    switch (rol) {
      case 'ADMIN':
        return { bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' };
      case 'MEDICO':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'ENFERMERA':
        return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
      case 'FARMACIA':
        return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Usuario</th>
            <th style={styles.th}>Rol de Acceso</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Fecha de Registro</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => {
            const roleTheme = getRoleStyle(u.nombreRol);
            const initial = (u.username || 'U').charAt(0).toUpperCase();

            return (
              <tr key={u.idUsuario} style={styles.row}>
                <td style={{ ...styles.td, color: '#64748b', fontWeight: 600 }}>
                  #{u.idUsuario}
                </td>

                <td style={styles.td}>
                  <div style={styles.userCell}>
                    <div style={styles.avatarCircle}>{initial}</div>
                    <div>
                      <div style={styles.usernameText}>{u.username}</div>
                      <div style={styles.userIdSub}>ID Cuenta: {u.idUsuario}</div>
                    </div>
                  </div>
                </td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badgeRol,
                      backgroundColor: roleTheme.bg,
                      color: roleTheme.color,
                      border: `1px solid ${roleTheme.border}`,
                    }}
                  >
                    {u.nombreRol || 'SIN ROL'}
                  </span>
                </td>

                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badgeStatus,
                      backgroundColor: u.estado ? '#ecfdf5' : '#fef2f2',
                      color: u.estado ? '#059669' : '#dc2626',
                      border: `1px solid ${u.estado ? '#a7f3d0' : '#fecaca'}`,
                    }}
                  >
                    <span
                      style={{
                        ...styles.statusDot,
                        backgroundColor: u.estado ? '#10b981' : '#ef4444',
                      }}
                    ></span>
                    {u.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td style={{ ...styles.td, color: '#64748b' }}>
                  {u.fechaCreacion
                    ? new Date(u.fechaCreacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>

                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => onEdit(u)}
                      style={styles.btnEdit}
                      title="Editar usuario"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => onDelete(u.idUsuario)}
                      style={styles.btnDelete}
                      title="Eliminar usuario"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
  },
  usernameText: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '0.95rem',
  },
  userIdSub: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  badgeRol: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'inline-block',
    letterSpacing: '0.3px',
  },
  badgeStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '700',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
  },
  actionButtons: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  btnEdit: {
    backgroundColor: '#f8fafc',
    color: '#0284c7',
    border: '1px solid #bae6fd',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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
    transition: 'all 0.15s ease',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '4rem 2rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.92rem',
    maxWidth: '450px',
    margin: '0 auto',
  },
};