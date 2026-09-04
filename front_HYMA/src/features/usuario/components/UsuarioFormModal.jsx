import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [estado, setEstado] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usuarioToEdit) {
      setIdRol(usuarioToEdit.idRol || 1);
      setUsername(usuarioToEdit.username || '');
      setEstado(usuarioToEdit.estado ?? true);
      setPassword('');
      setShowPassword(false);
    } else {
      setIdRol(1);
      setUsername('');
      setPassword('');
      setEstado(true);
      setShowPassword(false);
    }
    setValidationError('');
  }, [usuarioToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (username.trim().length < 3) {
      setValidationError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (!usuarioToEdit && password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres.');
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
    <div className="usuarios-modal-overlay">
      <div className="usuarios-modal-card">
        {/* Cabecera del Modal */}
        <div className="usuarios-modal-header">
          <h3 className="usuarios-modal-title">
            {usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="usuarios-modal-close"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensaje de Error */}
        {validationError && (
          <div style={{ margin: '14px 22px 0' }} className="usuarios-modal-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="usuarios-modal-body">
            {/* Campo Rol */}
            <div className="usuarios-form-group">
              <label className="usuarios-form-label">Rol de Acceso</label>
              <select
                value={idRol}
                onChange={(e) => setIdRol(Number(e.target.value))}
                className="usuarios-form-select"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} — {r.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo Username */}
            <div className="usuarios-form-group">
              <label className="usuarios-form-label">Nombre de Usuario</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: dr_martinez"
                className="usuarios-form-input"
              />
            </div>

            {/* Campo Contraseña */}
            <div className="usuarios-form-group">
              <div className="usuarios-form-label">
                <span>Contraseña</span>
                {usuarioToEdit && (
                  <span className="usuarios-form-hint">Opcional si no se cambia</span>
                )}
              </div>
              <div className="usuarios-input-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!usuarioToEdit}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={usuarioToEdit ? '••••••••' : 'Mínimo 8 caracteres'}
                  className="usuarios-form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="usuarios-password-toggle"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Estado (Solo en Edición) */}
            {usuarioToEdit && (
              <div className="usuarios-form-group">
                <label className="usuarios-form-label">Estado de la Cuenta</label>
                <div className="usuarios-status-toggle">
                  <label
                    className={`usuarios-status-option ${estado ? 'selected-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="estado"
                      checked={estado === true}
                      onChange={() => setEstado(true)}
                    />
                    <span>Activo</span>
                  </label>

                  <label
                    className={`usuarios-status-option ${!estado ? 'selected-inactive' : ''}`}
                  >
                    <input
                      type="radio"
                      name="estado"
                      checked={estado === false}
                      onChange={() => setEstado(false)}
                    />
                    <span>Inactivo</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="usuarios-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="usuarios-btn-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="usuarios-btn-submit"
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