import React from 'react';
import { UserX, Pencil, Trash2 } from 'lucide-react';

export default function UsuarioTable({ usuarios, onEdit, onDelete, onToggleEstado }) {
  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="usuarios-empty">
        <div className="usuarios-empty-icon">
          <UserX size={44} />
        </div>
        <h3 className="usuarios-empty-title">No se encontraron usuarios</h3>
        <p className="usuarios-empty-desc">
          No hay cuentas que coincidan con la búsqueda o el filtro seleccionado.
        </p>
      </div>
    );
  }

  const getRoleClass = (rol) => {
    switch (rol) {
      case 'ADMIN':
        return 'usuarios-role-admin';
      case 'MEDICO':
        return 'usuarios-role-medico';
      case 'ENFERMERA':
        return 'usuarios-role-enfermera';
      case 'FARMACIA':
        return 'usuarios-role-farmacia';
      case 'SOCIAL':
        return 'usuarios-role-social';
      default:
        return 'usuarios-role-default';
    }
  };

  return (
    <div className="usuarios-table-card">
      <div className="usuarios-table-responsive">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th className="usuarios-th">Usuario</th>
              <th className="usuarios-th">Rol</th>
              <th className="usuarios-th">Estado</th>
              <th className="usuarios-th" style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const initial = (u.username || 'U').charAt(0).toUpperCase();

              return (
                <tr key={u.idUsuario} className="usuarios-tr">
                  {/* Usuario y Correo */}
                  <td className="usuarios-td">
                    <div className="usuarios-user-cell">
                      <div className="usuarios-avatar">{initial}</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="usuarios-username">{u.username}</span>
                        {u.correo ? (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.correo}</span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>Sin correo</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Roles Asignados */}
                  <td className="usuarios-td">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {u.roles && u.roles.length > 0 ? (
                        u.roles.map((r) => (
                          <span key={r} className={`usuarios-role-badge ${getRoleClass(r)}`}>
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className={`usuarios-role-badge ${getRoleClass(u.nombreRol)}`}>
                          {u.nombreRol || 'SIN ROL'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estado con Botón Switch de Activación / Desactivación */}
                  <td className="usuarios-td">
                    <div className="usuarios-switch-wrapper">
                      <label className="usuarios-switch-label" title={u.estado ? 'Clic para desactivar' : 'Clic para activar'}>
                        <input
                          type="checkbox"
                          className="usuarios-switch-input"
                          checked={Boolean(u.estado)}
                          onChange={() => onToggleEstado && onToggleEstado(u.idUsuario, !u.estado)}
                        />
                        <span className="usuarios-switch-slider"></span>
                      </label>
                      <span className={`usuarios-status-text ${u.estado ? 'activo' : 'inactivo'}`}>
                        {u.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="usuarios-td" style={{ textAlign: 'right' }}>
                    <div className="usuarios-actions">
                      <button
                        type="button"
                        onClick={() => onEdit(u)}
                        className="usuarios-btn-action usuarios-btn-edit"
                        title="Editar usuario"
                      >
                        <Pencil size={14} />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(u.idUsuario)}
                        className="usuarios-btn-action usuarios-btn-delete"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={14} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}