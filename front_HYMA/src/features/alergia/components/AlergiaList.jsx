import React from 'react';
import { FlaskConical, Pencil, Trash2 } from 'lucide-react';

export const AlergiaList = ({ alergias, onEdit, onDelete }) => {
  if (!alergias || alergias.length === 0) {
    return (
      <div className="alergias-empty">
        <div className="alergias-empty-icon">
          <FlaskConical size={44} />
        </div>
        <h3 className="alergias-empty-title">No se encontraron alergias</h3>
        <p className="alergias-empty-desc">
          No hay elementos registrados que coincidan con la búsqueda. Puedes agregar una nueva usando el botón superior.
        </p>
      </div>
    );
  }

  return (
    <div className="alergias-table-card">
      <div className="alergias-table-responsive">
        <table className="alergias-table">
          <thead>
            <tr>
              <th className="alergias-th">Alergia o Fármaco</th>
              <th className="alergias-th" style={{ textAlign: 'right', width: '180px' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {alergias.map((a) => (
              <tr key={a.idAlergia} className="alergias-tr">
                <td className="alergias-td">
                  <div className="alergias-name-cell">
                    <div className="alergias-icon-badge">
                      <FlaskConical size={16} />
                    </div>
                    <span className="alergias-name-text">{a.nombre}</span>
                  </div>
                </td>

                <td className="alergias-td" style={{ textAlign: 'right' }}>
                  <div className="alergias-actions">
                    <button
                      type="button"
                      onClick={() => onEdit(a)}
                      className="alergias-btn-action alergias-btn-edit"
                      title="Editar alergia"
                    >
                      <Pencil size={13} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(a.idAlergia)}
                      className="alergias-btn-action alergias-btn-delete"
                      title="Eliminar alergia"
                    >
                      <Trash2 size={13} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};