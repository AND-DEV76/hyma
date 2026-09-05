import { useState, useEffect } from 'react';
import { X, Pill } from 'lucide-react';

const initialMedicineState = {
  nombre: '',
  presentacion: '',
  concentracion: '',
  idCategoriaMedicamento: '',
  idCasaFarmaceutica: '',
  estado: true,
};

function MedicamentoModal({ isOpen, onClose, onSave, medicineToEdit, categorias, casas }) {
  const [formData, setFormData] = useState(initialMedicineState);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (medicineToEdit) {
      setFormData({
        idMedicamento: medicineToEdit.idMedicamento,
        nombre: medicineToEdit.nombre || '',
        presentacion: medicineToEdit.presentacion || '',
        concentracion: medicineToEdit.concentracion || '',
        idCategoriaMedicamento: medicineToEdit.idCategoriaMedicamento ? String(medicineToEdit.idCategoriaMedicamento) : '',
        idCasaFarmaceutica: medicineToEdit.idCasaFarmaceutica ? String(medicineToEdit.idCasaFarmaceutica) : '',
        estado: medicineToEdit.estado !== false,
      });
    } else {
      setFormData(initialMedicineState);
    }
    setErrorMessage('');
  }, [medicineToEdit, isOpen]);

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
    setErrorMessage('');

    if (!formData.nombre.trim()) {
      setErrorMessage('El nombre del medicamento es obligatorio');
      return;
    }

    setSubmitting(true);
    const payload = {
      nombre: formData.nombre.trim(),
      presentacion: formData.presentacion.trim() || null,
      concentracion: formData.concentracion.trim() || null,
      idCategoriaMedicamento: formData.idCategoriaMedicamento ? Number(formData.idCategoriaMedicamento) : null,
      idCasaFarmaceutica: formData.idCasaFarmaceutica ? Number(formData.idCasaFarmaceutica) : null,
      estado: formData.estado,
    };

    const id = formData.idMedicamento || null;
    const result = await onSave(id, payload);

    setSubmitting(false);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Ocurrió un error al guardar el medicamento.');
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
              {submitting
                ? 'Guardando...'
                : formData.idMedicamento
                ? 'Guardar Cambios'
                : 'Registrar Medicamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicamentoModal;

