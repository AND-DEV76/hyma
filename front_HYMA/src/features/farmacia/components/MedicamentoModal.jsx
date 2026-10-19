import { useState, useEffect } from 'react';
import { X, Pill, Loader2 } from 'lucide-react';

const initialMedicineState = {
  nombre: '',
  presentacion: '',
  concentracion: '',
  idCategoriaMedicamento: '',
  idCasaFarmaceutica: '',
  estado: true,
  esUsoClinica: false,
};

function MedicamentoModal({ isOpen, onClose, onSave, medicineToEdit, medicine, categorias, casas }) {
  const itemToEdit = medicineToEdit || medicine;
  const [formData, setFormData] = useState(initialMedicineState);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        idMedicamento: itemToEdit.idMedicamento,
        nombre: itemToEdit.nombre || '',
        presentacion: itemToEdit.presentacion || '',
        concentracion: itemToEdit.concentracion || '',
        idCategoriaMedicamento: itemToEdit.idCategoriaMedicamento ? String(itemToEdit.idCategoriaMedicamento) : '',
        idCasaFarmaceutica: itemToEdit.idCasaFarmaceutica ? String(itemToEdit.idCasaFarmaceutica) : '',
        estado: itemToEdit.estado !== false,
        esUsoClinica: Boolean(itemToEdit.esUsoClinica),
      });
    } else {
      setFormData(initialMedicineState);
    }
    setErrorMessage('');
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e) => {
    setFormData((prev) => ({ ...prev, estado: e.target.value === 'true' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMessage('');

    if (!formData.nombre.trim()) {
      setErrorMessage('El nombre del medicamento es obligatorio');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        presentacion: formData.presentacion.trim() || null,
        concentracion: formData.concentracion.trim() || null,
        idCategoriaMedicamento: formData.idCategoriaMedicamento ? Number(formData.idCategoriaMedicamento) : null,
        idCasaFarmaceutica: formData.idCasaFarmaceutica ? Number(formData.idCasaFarmaceutica) : null,
        estado: formData.estado,
        esUsoClinica: Boolean(formData.esUsoClinica),
      };

      const id = formData.idMedicamento || null;
      const result = await onSave(id, payload);

      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || 'Ocurrió un error al guardar el medicamento.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="farmacia-modal-overlay" onClick={onClose}>
      <div className="farmacia-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="farmacia-modal-header">
          <div className="farmacia-modal-title-box">
            <Pill size={20} className="farmacia-modal-icon" />
            <div>
              <h2 className="farmacia-modal-title">
                {formData.idMedicamento ? 'Editar Medicamento' : 'Nuevo Medicamento'}
              </h2>
              <p className="farmacia-modal-subtitle">
                {formData.idMedicamento
                  ? 'Modifica los datos del medicamento registrado'
                  : 'Ingresa los datos para registrar en el inventario'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="farmacia-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="farmacia-modal-alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="farmacia-modal-form">
          <div className="farmacia-modal-body">
            <div className="farmacia-form-group full">
              <label htmlFor="modal-med-nombre" className="farmacia-form-label">
                Nombre del Medicamento <span className="farmacia-required-star">*</span>
              </label>
              <input
                id="modal-med-nombre"
                name="nombre"
                className="farmacia-form-input"
                placeholder="Ej. Paracetamol, Amoxicilina..."
                value={formData.nombre}
                onChange={handleChange}
                required
                maxLength={150}
                autoFocus
              />
            </div>

            <div className="farmacia-form-group">
              <label htmlFor="modal-med-presentacion" className="farmacia-form-label">
                Presentación
              </label>
              <input
                id="modal-med-presentacion"
                name="presentacion"
                className="farmacia-form-input"
                placeholder="Ej. Tabletas, Jarabe, Ampollas..."
                value={formData.presentacion}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="farmacia-form-group">
              <label htmlFor="modal-med-concentracion" className="farmacia-form-label">
                Concentración
              </label>
              <input
                id="modal-med-concentracion"
                name="concentracion"
                className="farmacia-form-input"
                placeholder="Ej. 500 mg, 10 mg/5 ml..."
                value={formData.concentracion}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="farmacia-form-group">
              <label htmlFor="modal-med-categoria" className="farmacia-form-label">
                Categoría
              </label>
              <select
                id="modal-med-categoria"
                name="idCategoriaMedicamento"
                className="farmacia-form-select"
                value={formData.idCategoriaMedicamento}
                onChange={handleChange}
              >
                <option value="">Seleccionar categoría...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="farmacia-form-group">
              <label htmlFor="modal-med-casa" className="farmacia-form-label">
                Casa Farmacéutica
              </label>
              <select
                id="modal-med-casa"
                name="idCasaFarmaceutica"
                className="farmacia-form-select"
                value={formData.idCasaFarmaceutica}
                onChange={handleChange}
              >
                <option value="">Seleccionar casa farmacéutica...</option>
                {casas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="farmacia-form-group full">
              <label htmlFor="modal-med-estado" className="farmacia-form-label">
                Estado
              </label>
              <select
                id="modal-med-estado"
                className="farmacia-form-select"
                value={String(formData.estado)}
                onChange={handleEstadoChange}
              >
                <option value="true">Activo (Disponible para movimientos)</option>
                <option value="false">Inactivo (Deshabilitado)</option>
              </select>
            </div>

            <div className="farmacia-form-group full" style={{ marginTop: '4px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: formData.esUsoClinica ? '#f0fdf4' : '#f8fafc',
                  border: formData.esUsoClinica ? '1.5px solid #86efac' : '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  name="esUsoClinica"
                  checked={formData.esUsoClinica}
                  onChange={(e) => setFormData((prev) => ({ ...prev, esUsoClinica: e.target.checked }))}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#059669', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: formData.esUsoClinica ? '#15803d' : '#334155' }}>
                    Insumo de Uso en Clínica Médica
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', lineHeight: '1.3' }}>
                    Marcar si este insumo es para consumo interno en clínica (ej. alcohol al 70%, gasas, algodón, desinfectante) y no para venta individual a pacientes.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="farmacia-modal-footer">
            <button
              type="button"
              className="farmacia-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="farmacia-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : formData.idMedicamento ? (
                'Guardar Cambios'
              ) : (
                'Registrar Medicamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicamentoModal;

