import React, { useState, useEffect } from 'react';

const ROLES = [
  { id: 1, nombre: 'ADMIN', desc: 'Acceso total y configuración' },
  { id: 2, nombre: 'MEDICO', desc: 'Consultas médicas y diagnósticos' },
  { id: 3, nombre: 'ENFERMERA', desc: 'Recepción, cola y preconsulta' },
  { id: 4, nombre: 'FARMACIA', desc: 'Dispensación y medicamentos' },
];

export default function UsuarioFormModal({ isOpen, onClose, onSubmit, usuarioToEdit }) {
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
      setValidationError('El nombre de usuario debe contener al menos 3 caracteres.');
      return;
    }

    if (!usuarioToEdit && password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres para mayor seguridad.');
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
      setValidationError(err.response?.data?.message || err.message || 'Error al procesar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        {/* Cabecera del Modal */}
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>
              {usuarioToEdit ? 'Editar Cuenta de Usuario' : 'Registrar Nuevo Usuario'}
            </h3>
            <p style={styles.modalSub}>
              {usuarioToEdit
                ? `Modificando los datos del usuario ID #${usuarioToEdit.idUsuario}`
                : 'Completa la información para crear una cuenta en el sistema.'}
            </p>
          </div>
          <button onClick={onClose} style={styles.btnClose}>
            ✕
          </button>
        </div>

        {validationError && (
          <div style={styles.errorBanner}>
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Campo Rol */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Rol y Permisos</label>
            <select
              value={idRol}
              onChange={(e) => setIdRol(Number(e.target.value))}
              style={styles.select}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} — {r.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Username */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre de Usuario (Login)</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: dr_martinez o enf_lucia"
              style={styles.input}
            />
          </div>

          {/* Campo Contraseña */}
          <div style={styles.formGroup}>
            <div style={styles.labelWithHint}>
              <label style={styles.label}>Contraseña</label>
              {usuarioToEdit && (
                <span style={styles.fieldHint}>Opcional (Dejar en blanco para no cambiar)</span>
              )}
            </div>
            <input
              type="password"
              required={!usuarioToEdit}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={usuarioToEdit ? '•••••••• (Sin cambios)' : 'Mínimo 8 caracteres'}
              style={styles.input}
            />
          </div>

          {/* Campo Estado (Solo en Edición) */}
          {usuarioToEdit && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Estado de la Cuenta</label>
              <div style={styles.statusToggleGroup}>
                <label
                  style={{
                    ...styles.statusOption,
                    borderColor: estado ? '#10b981' : '#e2e8f0',
                    backgroundColor: estado ? '#f0fdf4' : '#ffffff',
                  }}
                >
                  <input
                    type="radio"
                    name="estado"
                    checked={estado === true}
                    onChange={() => setEstado(true)}
                    style={styles.radioInput}
                  />
                  <div>
                    <strong style={{ color: '#16a34a', display: 'block', fontSize: '0.88rem' }}>
                      Activo
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Puede iniciar sesión normalmente
                    </span>
                  </div>
                </label>

                <label
                  style={{
                    ...styles.statusOption,
                    borderColor: !estado ? '#ef4444' : '#e2e8f0',
                    backgroundColor: !estado ? '#fef2f2' : '#ffffff',
                  }}
                >
                  <input
                    type="radio"
                    name="estado"
                    checked={estado === false}
                    onChange={() => setEstado(false)}
                    style={styles.radioInput}
                  />
                  <div>
                    <strong style={{ color: '#dc2626', display: 'block', fontSize: '0.88rem' }}>
                      Inactivo
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Acceso temporalmente suspendido
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div style={styles.modalFooter}>
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
              style={styles.btnSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : usuarioToEdit ? 'Guardar Cambios' : 'Crear Usuario'}
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
    backgroundColor: 'rgba(3, 4, 94, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 40px rgba(3, 4, 94, 0.2)',
    border: '1px solid #e2e8f0',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  modalSub: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: 0,
  },
  btnClose: {
    background: '#f1f5f9',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  labelWithHint: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.84rem',
    fontWeight: '700',
    color: '#334155',
  },
  fieldHint: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    fontSize: '0.92rem',
    outline: 'none',
    color: '#0f172a',
    transition: 'border-color 0.2s ease',
  },
  select: {
    padding: '11px 14px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    fontSize: '0.92rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    cursor: 'pointer',
  },
  statusToggleGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  statusOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  radioInput: {
    cursor: 'pointer',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '0.5rem',
  },
  btnCancel: {
    padding: '11px 18px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '9px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  btnSubmit: {
    padding: '11px 22px',
    backgroundColor: '#0077b6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 119, 182, 0.25)',
  },
};