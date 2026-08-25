import React, { useState, useEffect } from 'react';

const ROLES = [
  { id: 1, nombre: 'ADMIN' },
  { id: 2, nombre: 'MEDICO' },
  { id: 3, nombre: 'ENFERMERA' },
  { id: 4, nombre: 'FARMACIA' },
];

function UsuarioFormModal({ isOpen, onClose, onSubmit, usuarioToEdit }) {
  const [idRol, setIdRol] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [estado, setEstado] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usuarioToEdit) {
      setIdRol(usuarioToEdit.idRol || 1);
      setUsername(usuarioToEdit.username || '');
      setEstado(usuarioToEdit.estado ?? true);
      setPassword(''); 
    } else {
      setIdRol(1);
      setUsername('');
      setPassword('');
      setEstado(true);
    }
    setValidationError('');
  }, [usuarioToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (username.trim().length < 3) {
      setValidationError('El username debe tener al menos 3 caracteres');
      return;
    }

    if (!usuarioToEdit && password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);
      if (usuarioToEdit) {
        await onSubmit(usuarioToEdit.idUsuario, {
          idRol: Number(idRol),
          username: username.trim(),
          estado,
          password: password.trim() ? password : null,
        });
      } else {
        await onSubmit({
          idRol: Number(idRol),
          username: username.trim(),
          password: password.trim(),
        });
      }
      onClose();
    } catch (err) {
      setValidationError(err.response?.data?.message || err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>
          {usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h3>

        {validationError && <div style={styles.errorAlert}>{validationError}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Rol de Usuario</label>
            <select
              value={idRol}
              onChange={(e) => setIdRol(Number(e.target.value))}
              style={styles.input}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nombre de Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: jdoe"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Contraseña {usuarioToEdit && '(Opcional)'}
            </label>
            <input
              type="password"
              required={!usuarioToEdit}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={usuarioToEdit ? 'Dejar en blanco para no cambiar' : '••••••••'}
              style={styles.input}
            />
          </div>

          {usuarioToEdit && (
            <div style={styles.fieldRow}>
              <label style={styles.label}>Estado:</label>
              <select
                value={estado ? 'true' : 'false'}
                onChange={(e) => setEstado(e.target.value === 'true')}
                style={styles.input}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          )}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.btnCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={styles.btnSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 4, 94, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '25px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    margin: '0 0 15px 0',
    color: '#03045e',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontSize: '0.85rem',
    color: '#0077b6',
    fontWeight: 'bold',
  },
  input: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #90e0ef',
    outline: 'none',
    fontSize: '0.95rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '15px',
  },
  btnCancel: {
    padding: '8px 15px',
    border: '1px solid #0077b6',
    backgroundColor: 'transparent',
    color: '#0077b6',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  btnSave: {
    padding: '8px 15px',
    border: 'none',
    backgroundColor: '#0077b6',
    color: '#ffffff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  errorAlert: {
    backgroundColor: '#ffdddd',
    color: '#d8000c',
    padding: '8px 12px',
    borderRadius: '6px',
    marginBottom: '10px',
    fontSize: '0.85rem',
  },
};

export default UsuarioFormModal;