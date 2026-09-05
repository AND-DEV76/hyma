import { useState } from 'react';
import { ArrowDownToLine, Plus, Trash2, CheckCircle2, AlertCircle, PackagePlus, FileText } from 'lucide-react';
import MedicamentoSearchInput from './MedicamentoSearchInput';

const newDetail = {
  idMedicamento: '',
  numeroLote: '',
  fechaExpiracion: '',
  cantidad: '',
  precioUnitario: '',
};

function EntradaMedicamentoForm({ medicamentos, onSave, onNavigateHistorial }) {
  const [tipoEntrada, setTipoEntrada] = useState('COMPRA');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState([{ ...newDetail }]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const updateDetail = (index, field, value) => {
    setDetalles((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const handleSelectMed = (index, med) => {
    updateDetail(index, 'idMedicamento', med.idMedicamento);
  };

  const handleClearMed = (index) => {
    updateDetail(index, 'idMedicamento', '');
  };

  const addDetail = () => {
    setDetalles((prev) => [...prev, { ...newDetail }]);
  };

  const removeDetail = (index) => {
    if (detalles.length === 1) return;
    setDetalles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Cálculos de totales en tiempo real
  const totalUnidades = detalles.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
  const costoTotal = detalles.reduce((acc, curr) => {
    const cant = Number(curr.cantidad) || 0;
    const precio = Number(curr.precioUnitario) || 0;
    return acc + cant * precio;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validar que todos los detalles tengan medicamento seleccionado
    const sinMed = detalles.some((d) => !d.idMedicamento);
    if (sinMed) {
      setError('Por favor selecciona un medicamento para cada fila del detalle.');
      return;
    }

    setSaving(true);
    const payload = {
      tipoEntrada,
      observaciones: observaciones.trim() || null,
      detalles: detalles.map((d) => ({
        idMedicamento: Number(d.idMedicamento),
        numeroLote: d.numeroLote.trim() || null,
        fechaExpiracion: d.fechaExpiracion,
        cantidad: Number(d.cantidad),
        precioUnitario: d.precioUnitario === '' ? null : Number(d.precioUnitario),
      })),
    };

    const result = await onSave(payload);
    setSaving(false);

    if (result.success) {
      setSuccessMsg('¡Entrada de inventario registrada con éxito!');
      setTipoEntrada('COMPRA');
      setObservaciones('');
      setDetalles([{ ...newDetail }]);
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setError(result.error || 'Ocurrió un error al registrar la entrada.');
    }
  };

  return (
    <div className="farmacia-entrada-form-view">
      {/* Alerta de Error */}
      {error && (
        <div className="farmacia-alert error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Alerta de Éxito */}
      {successMsg && (
        <div className="farmacia-alert success">
          <CheckCircle2 size={18} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span>{successMsg}</span>
            {onNavigateHistorial && (
              <button
                type="button"
                className="farmacia-btn-secondary btn-sm"
                onClick={onNavigateHistorial}
                style={{ marginLeft: '12px' }}
              >
                Ver en Historial
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="farmacia-entrada-form">
        {/* PARTE 1: Registrar Entrada de Inventario */}
        <section className="farmacia-card farmacia-card-highlight">
          <div className="farmacia-card-header">
            <div className="farmacia-card-title-group">
              <div className="farmacia-icon-circle">
                <ArrowDownToLine size={20} />
              </div>
              <div>
                <h2>Registrar Entrada de Inventario</h2>
                <p>Datos generales del comprobante o movimiento de ingreso al stock.</p>
              </div>
            </div>
          </div>

          <div className="farmacia-form-grid">
            <div className="farmacia-field">
              <label htmlFor="entrada-tipo" className="farmacia-form-label">
                Tipo de Entrada <span className="farmacia-required-star">*</span>
              </label>
              <select
                id="entrada-tipo"
                className="farmacia-select"
                value={tipoEntrada}
                onChange={(e) => setTipoEntrada(e.target.value)}
                required
              >
                <option value="COMPRA">Compra directa</option>
                <option value="DONACION">Donación</option>
                <option value="PEDIDO">Pedido o Reabastecimiento</option>
              </select>
            </div>

            <div className="farmacia-field full">
              <label htmlFor="entrada-observaciones" className="farmacia-form-label">
                <FileText size={15} />
                Observaciones y Referencias
              </label>
              <textarea
                id="entrada-observaciones"
                className="farmacia-textarea"
                placeholder="Número de factura, proveedor, acta de donación u otra referencia documental..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                maxLength={2000}
                rows={2}
              />
            </div>
          </div>
        </section>

        {/* PARTE 2: Detalle de Medicamentos */}
        <section className="farmacia-card" style={{ marginTop: '20px' }}>
          <div className="farmacia-card-header">
            <div className="farmacia-card-title-group">
              <div className="farmacia-icon-circle sm">
                <PackagePlus size={18} />
              </div>
              <div>
                <h3>Detalle de Medicamentos</h3>
                <p>Indica el lote, vencimiento, cantidad y costo unitario.</p>
              </div>
            </div>
            <span className="farmacia-count-pill sm">
              <strong>{detalles.length}</strong> {detalles.length === 1 ? 'medicamento' : 'medicamentos'}
            </span>
          </div>

          <div className="farmacia-detalles-table-wrap">
            <table className="farmacia-table farmacia-detalles-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>Medicamento *</th>
                  <th style={{ width: '16%' }}>Número de Lote</th>
                  <th style={{ width: '15%' }}>Vencimiento *</th>
                  <th style={{ width: '12%' }}>Cantidad *</th>
                  <th style={{ width: '13%' }}>Costo Unitario (Q)</th>
                  <th style={{ width: '6%', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detail, index) => (
                  <tr key={index} style={{ position: 'relative', zIndex: (detalles.length - index) * 10 }}>
                    {/* Buscador reactivo de medicamento */}
                    <td>
                      <MedicamentoSearchInput
                        medicamentos={medicamentos}
                        selectedId={detail.idMedicamento}
                        onSelect={(med) => handleSelectMed(index, med)}
                        onClear={() => handleClearMed(index)}
                        placeholder="Escribe nombre o concentración..."
                      />
                    </td>

                    {/* Número de Lote */}
                    <td>
                      <input
                        className="farmacia-input"
                        placeholder="Ej. LOT-2026-A"
                        value={detail.numeroLote}
                        onChange={(e) => updateDetail(index, 'numeroLote', e.target.value)}
                        maxLength={100}
                      />
                    </td>

                    {/* Vencimiento */}
                    <td>
                      <input
                        className="farmacia-input"
                        type="date"
                        value={detail.fechaExpiracion}
                        onChange={(e) => updateDetail(index, 'fechaExpiracion', e.target.value)}
                        required
                      />
                    </td>

                    {/* Cantidad */}
                    <td>
                      <input
                        className="farmacia-input"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={detail.cantidad}
                        onChange={(e) => updateDetail(index, 'cantidad', e.target.value)}
                        required
                      />
                    </td>

                    {/* Costo Unitario */}
                    <td>
                      <input
                        className="farmacia-input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={detail.precioUnitario}
                        onChange={(e) => updateDetail(index, 'precioUnitario', e.target.value)}
                      />
                    </td>

                    {/* Acción Quitar */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="farmacia-aux-btn delete"
                        onClick={() => removeDetail(index)}
                        disabled={detalles.length === 1}
                        title={detalles.length === 1 ? 'Se requiere al menos un medicamento' : 'Quitar fila'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Barra de acción para agregar medicamentos */}
          <div className="farmacia-add-detail-bar">
            <button
              type="button"
              className="farmacia-btn-secondary btn-sm"
              onClick={addDetail}
            >
              <Plus size={15} />
              Agregar otro medicamento
            </button>
          </div>

          {/* Resumen de totales y guardado */}
          <div className="farmacia-entrada-footer">
            <div className="farmacia-totales-box">
              <span className="farmacia-total-item">
                Total Unidades: <strong>{totalUnidades}</strong>
              </span>
              {costoTotal > 0 && (
                <span className="farmacia-total-item">
                  Costo Total Estimado: <strong>Q {costoTotal.toFixed(2)}</strong>
                </span>
              )}
            </div>

            <div className="farmacia-form-actions">
              <button
                type="submit"
                className="farmacia-btn-primary"
                disabled={saving || medicamentos.length === 0}
              >
                <ArrowDownToLine size={16} />
                {saving ? 'Guardando Entrada...' : 'Guardar Entrada'}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

export default EntradaMedicamentoForm;
