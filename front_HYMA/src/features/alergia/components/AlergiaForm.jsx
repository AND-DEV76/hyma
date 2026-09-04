import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

export const AlergiaForm = ({ isOpen, onClose, onSubmit, alergiaEditar }) => {
  const [nombre, setNombre] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (alergiaEditar) {
      setNombre(alergiaEditar.nombre || '');
    } else {
      setNombre('');
    }
    setErrorMessage('');
  }, [alergiaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanNombre = nombre.trim();
    if (!cleanNombre) {
      setErrorMessage('El nombre de la alergia es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const res = await onSubmit({ nombre: cleanNombre });
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Ocurrió un error al guardar.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.errors?.nombre ||
        err.response?.data?.message ||
        'Error al procesar la solicitud.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="alergias-modal-overlay">
      <div className="alergias-modal-card">
        {/* Cabecera del Modal */}
        <div className="alergias-modal-header">
          <h3 className="alergias-modal-title">
            {alergiaEditar ? 'Editar Alergia' : 'Nueva Alergia'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="alergias-modal-close"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div style={{ margin: '14px 22px 0' }} className="alergias-modal-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="alergias-modal-body">
            <div className="alergias-form-group">
              <label className="alergias-form-label">
                Nombre de la Alergia o Fármaco *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Penicilina, Mariscos, Polen..."
                className="alergias-form-input"
                disabled={isSubmitting}
              />
              <span className="alergias-form-hint">
                Se registrará en el catálogo para advertir al médico durante la consulta y prescripción.
              </span>
            </div>
          </div>

          <div className="alergias-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="alergias-btn-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="alergias-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="spin-icon" style={{ marginRight: '6px' }} />
                  <span>Guardando...</span>
                </>
              ) : alergiaEditar ? (
                'Guardar Cambios'
              ) : (
                'Crear Alergia'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AlergiaForm;