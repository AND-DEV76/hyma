import React, { useState, useEffect } from 'react';
import { X, Layers, Calendar, Hash, DollarSign, Package, AlertCircle } from 'lucide-react';
import '../styles/farmacia.css';

export default function EditarLoteModal({ isOpen, onClose, onSave, medicamento, lotes = [] }) {
  const [selectedLoteId, setSelectedLoteId] = useState(null);
  const [formData, setFormData] = useState({
    numeroLote: '',
    fechaExpiracion: '',
    cantidad: 0,
    precioUnitario: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (lotes && lotes.length > 0) {
      const loteInicial = lotes.find((l) => (l.stockDisponible ?? l.cantidadInicial) > 0) || lotes[0];
      cargarLoteEnForm(loteInicial);
    } else {
      setSelectedLoteId(null);
      setFormData({
        numeroLote: '',
        fechaExpiracion: '',
        cantidad: 0,
        precioUnitario: 0,
      });
    }
    setErrorMessage('');
  }, [lotes, isOpen]);

  const cargarLoteEnForm = (lote) => {
    if (!lote) return;
    setSelectedLoteId(lote.idLote);
    setFormData({
      numeroLote: lote.numeroLote || '',
      fechaExpiracion: lote.fechaExpiracion || '',
      cantidad: lote.stockDisponible != null ? lote.stockDisponible : (lote.cantidadInicial ?? 0),
      precioUnitario: lote.precioUnitario != null ? lote.precioUnitario : 0,
    });
  };

  if (!isOpen) return null;

  const handleLoteSelect = (id) => {
    const lote = lotes.find((l) => l.idLote === Number(id));
    if (lote) {
      cargarLoteEnForm(lote);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!selectedLoteId) {
      setErrorMessage('Debe existir o seleccionarse un lote de inventario.');
      return;
    }
    if (!formData.fechaExpiracion) {
      setErrorMessage('La fecha de vencimiento es obligatoria.');
      return;
    }
    if (formData.cantidad === '' || Number(formData.cantidad) < 0) {
      setErrorMessage('Las unidades deben ser un número mayor o igual a 0.');
      return;
    }
    if (formData.precioUnitario === '' || Number(formData.precioUnitario) < 0) {
      setErrorMessage('El costo unitario debe ser mayor o igual a Q 0.00.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await onSave(selectedLoteId, {
        numeroLote: formData.numeroLote ? formData.numeroLote.trim() : '',
        fechaExpiracion: formData.fechaExpiracion,
        cantidad: Number(formData.cantidad),
        precioUnitario: Number(formData.precioUnitario),
      });
      onClose();
    } catch (err) {
      console.error('Error al actualizar lote de inventario:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Error al guardar cambios del lote en inventario.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="farmacia-modal-overlay" onClick={onClose}>
      <div className="farmacia-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Modal */}
        <div className="farmacia-modal-header">
          <div className="farmacia-modal-title-box">
            <Package size={22} className="farmacia-modal-icon" />
            <div>
              <h2 className="farmacia-modal-title">Modificar Entrada / Lote</h2>
              <p className="farmacia-modal-subtitle">
                {medicamento?.nombre} {medicamento?.concentracion ? `• ${medicamento.concentracion}` : ''}
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

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="farmacia-modal-alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="farmacia-modal-body">
            {/* Selector de Lote si hay más de 1 lote */}
            {lotes && lotes.length > 1 && (
              <div className="farmacia-form-group full" style={{ marginBottom: '4px' }}>
                <label htmlFor="select-lote-edit" className="farmacia-form-label">
                  Lote a modificar ({lotes.length} registrados):
                </label>
                <select
                  id="select-lote-edit"
                  className="farmacia-form-select"
                  value={selectedLoteId || ''}
                  onChange={(e) => handleLoteSelect(e.target.value)}
                >
                  {lotes.map((l) => (
                    <option key={l.idLote} value={l.idLote}>
                      Lote: {l.numeroLote || 'S/L'} | Vence: {l.fechaExpiracion} | Stock: {l.stockDisponible ?? l.cantidadInicial} u.
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Número de Lote */}
            <div className="farmacia-form-group">
              <label htmlFor="input-numero-lote" className="farmacia-form-label">
                <Hash size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Número de Lote
              </label>
              <input
                id="input-numero-lote"
                type="text"
                className="farmacia-form-input"
                placeholder="Ej. LOT-2026-01"
                value={formData.numeroLote}
                onChange={(e) => setFormData({ ...formData, numeroLote: e.target.value })}
              />
            </div>

            {/* Vencimiento */}
            <div className="farmacia-form-group">
              <label htmlFor="input-vencimiento" className="farmacia-form-label">
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Vencimiento <span className="farmacia-required">*</span>
              </label>
              <input
                id="input-vencimiento"
                type="date"
                required
                className="farmacia-form-input"
                value={formData.fechaExpiracion}
                onChange={(e) => setFormData({ ...formData, fechaExpiracion: e.target.value })}
              />
            </div>

            {/* Unidad / Cantidad */}
            <div className="farmacia-form-group">
              <label htmlFor="input-cantidad" className="farmacia-form-label">
                <Layers size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Unidad (Stock) <span className="farmacia-required">*</span>
              </label>
              <input
                id="input-cantidad"
                type="number"
                min="0"
                required
                className="farmacia-form-input"
                placeholder="Cantidad de unidades"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              />
            </div>

            {/* Costo Unitario (Q) */}
            <div className="farmacia-form-group">
              <label htmlFor="input-costo" className="farmacia-form-label">
                <DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Costo Unitario (Q) <span className="farmacia-required">*</span>
              </label>
              <input
                id="input-costo"
                type="number"
                min="0"
                step="0.01"
                required
                className="farmacia-form-input"
                placeholder="0.00"
                value={formData.precioUnitario}
                onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
              />
            </div>

            {/* Nota informativa */}
            <div
              className="farmacia-form-group full"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#64748b',
                lineHeight: '1.4',
              }}
            >
              <strong>Nota:</strong> Los cambios afectarán directamente las existencias y los costos del lote en inventario. El precio final de venta se recalculará automáticamente con el porcentaje institucional.
            </div>
          </div>

          {/* Botones de acción */}
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
              {submitting ? 'Guardando...' : 'Guardar Cambios en Lote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
