import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Eye, EyeOff, Mail, Check, ShieldCheck } from 'lucide-react';

const ROLES = [
  { id: 1, nombre: 'ADMIN', color: '#6d28d9', bg: '#ede9fe', border: '#ddd6fe', desc: 'Acceso total y configuración del sistema' },
  { id: 2, nombre: 'MEDICO', color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd', desc: 'Consultas médicas, clínica y diagnósticos' },
  { id: 3, nombre: 'ENFERMERA', color: '#15803d', bg: '#dcfce7', border: '#bbf7d0', desc: 'Recepción, control de cola y preconsulta' },
  { id: 4, nombre: 'FARMACIA', color: '#b45309', bg: '#fef3c7', border: '#fde68a', desc: 'Dispensación, inventario y dashboard' },
];

export default function UsuarioFormModal({ isOpen, onClose, onSubmit, usuarioToEdit }) {
  const [selectedRoleIds, setSelectedRoleIds] = useState([3]);
  const [username, setUsername] = useState('');
  const [hasCorreo, setHasCorreo] = useState(false);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [estado, setEstado] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usuarioToEdit) {
      if (usuarioToEdit.idRoles && usuarioToEdit.idRoles.length > 0) {
        setSelectedRoleIds(usuarioToEdit.idRoles);
      } else if (usuarioToEdit.idRol) {
        setSelectedRoleIds([usuarioToEdit.idRol]);
      } else {
        setSelectedRoleIds([1]);
      }

      setUsername(usuarioToEdit.username || '');
      setHasCorreo(Boolean(usuarioToEdit.correo));
      setCorreo(usuarioToEdit.correo || '');
      setEstado(usuarioToEdit.estado ?? true);
      setPassword('');
      setShowPassword(false);
    } else {
      setSelectedRoleIds([3]);
      setUsername('');
      setHasCorreo(false);
      setCorreo('');
      setPassword('');
      setEstado(true);
      setShowPassword(false);
    }
    setValidationError('');
  }, [usuarioToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleRole = (roleId) => {
    setSelectedRoleIds((prev) => {
      if (prev.includes(roleId)) {
        if (prev.length === 1) {
          return prev; // Mínimo un rol
        }
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (selectedRoleIds.length === 0) {
      setValidationError('Debe seleccionar al menos un rol de acceso para el usuario.');
      return;
    }

    if (username.trim().length < 3) {
      setValidationError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (hasCorreo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo.trim())) {
        setValidationError('Por favor ingrese un formato de correo electrónico válido.');
        return;
      }
    }

    if (!usuarioToEdit && password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        idRoles: selectedRoleIds,
        idRol: selectedRoleIds[0], // Por compatibilidad
        username: username.trim(),
        correo: hasCorreo && correo.trim() ? correo.trim().toLowerCase() : null,
      };

      if (usuarioToEdit) {
        await onSubmit(usuarioToEdit.idUsuario, {
          ...payload,
          estado,
          password: password.trim() ? password : null,
        });
      } else {
        await onSubmit({
          ...payload,
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
      <div className="usuarios-modal-card" style={{ maxWidth: '540px' }}>
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
            {/* Campo Roles Múltiples */}
            <div className="usuarios-form-group">
              <div className="usuarios-form-label">
                <span>Roles de Acceso Asignados</span>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                  {selectedRoleIds.length} {selectedRoleIds.length === 1 ? 'rol asignado' : 'roles asignados'}
                </span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: '#64748b' }}>
                Haga clic sobre los roles que desempeñará este usuario (puede asignar uno o varios):
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '8px'
              }}>
                {ROLES.map((r) => {
                  const isChecked = selectedRoleIds.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => toggleRole(r.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: `1.5px solid ${isChecked ? r.color : '#e2e8f0'}`,
                        background: isChecked ? r.bg : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: `1.5px solid ${isChecked ? r.color : '#cbd5e1'}`,
                          background: isChecked ? r.color : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '2px',
                          flexShrink: 0,
                          color: '#ffffff',
                        }}
                      >
                        {isChecked && <Check size={13} strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: isChecked ? r.color : '#1e293b'
                          }}>
                            {r.nombre}
                          </span>
                        </div>
                        <p style={{
                          margin: '2px 0 0 0',
                          fontSize: '0.72rem',
                          color: isChecked ? '#334155' : '#64748b',
                          lineHeight: 1.25
                        }}>
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
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

            {/* Campo Correo Electrónico con Switch / Checkbox de Activación */}
            <div className="usuarios-form-group">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <label className="usuarios-form-label" style={{ margin: 0 }}>
                  <Mail size={15} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
                  Correo Electrónico
                </label>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: hasCorreo ? '#0284c7' : '#64748b'
                }}>
                  <input
                    type="checkbox"
                    checked={hasCorreo}
                    onChange={(e) => {
                      setHasCorreo(e.target.checked);
                      if (!e.target.checked) {
                        setCorreo('');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  {hasCorreo ? 'Correo Habilitado' : 'Sin Correo'}
                </label>
              </div>

              {hasCorreo ? (
                <input
                  type="email"
                  value={correo}
                  required={hasCorreo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@sanmartin.org"
                  className="usuarios-form-input"
                  autoFocus
                />
              ) : (
                <div style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  color: '#94a3b8'
                }}>
                  No se registrará correo para este usuario (opcional).
                </div>
              )}
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