import { useState } from 'react';

const newDetail = {
  idMedicamento: '',
  numeroLote: '',
  fechaExpiracion: '',
  cantidad: '',
  precioUnitario: '',
};

function EntradaMedicamentoForm({ medicamentos, onSave }) {
  const [tipoEntrada, setTipoEntrada] = useState('COMPRA');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState([{ ...newDetail }]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateDetail = (index, field, value) => {
    setDetalles((previous) => previous.map((detail, detailIndex) => (
      detailIndex === index ? { ...detail, [field]: value } : detail
    )));
  };

  const addDetail = () => setDetalles((previous) => [...previous, { ...newDetail }]);

  const removeDetail = (index) => {
    if (detalles.length === 1) return;
    setDetalles((previous) => previous.filter((_, detailIndex) => detailIndex !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      tipoEntrada,
      observaciones: observaciones.trim() || null,
      detalles: detalles.map((detail) => ({
        idMedicamento: Number(detail.idMedicamento),
        numeroLote: detail.numeroLote.trim() || null,
        fechaExpiracion: detail.fechaExpiracion,
        cantidad: Number(detail.cantidad),
        precioUnitario: detail.precioUnitario === '' ? null : Number(detail.precioUnitario),
      })),
    };

    const result = await onSave(payload);
    if (result.success) {
      setTipoEntrada('COMPRA');
      setObservaciones('');
      setDetalles([{ ...newDetail }]);
    } else {
      setError(result.error);
    }
    setSaving(false);
  };

  return (
    <section className="farmacia-card">
      <div className="farmacia-card-header">
        <div>
          <h2>Registrar entrada de inventario</h2>
          <p>Una entrada puede incluir varios medicamentos y lotes.</p>
        </div>
      </div>
      {medicamentos.length === 0 && (
        <div className="farmacia-empty farmacia-empty-panel">
          No hay medicamentos registrados para crear una entrada. Empecemos a cargar el catalogo.
        </div>
      )}
      {error && <div className="farmacia-alert">{error}</div>}
      <form onSubmit={submit}>
        <div className="farmacia-form-grid">
          <div className="farmacia-field">
            <label htmlFor="tipo-entrada">Tipo de entrada *</label>
            <select id="tipo-entrada" className="farmacia-select" value={tipoEntrada} onChange={(event) => setTipoEntrada(event.target.value)}>
              <option value="COMPRA">Compra</option>
              <option value="DONACION">Donación</option>
              <option value="PEDIDO">Pedido</option>
            </select>
          </div>
          <div className="farmacia-field full">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea id="observaciones" className="farmacia-textarea" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} placeholder="Factura, proveedor, acta de donación u otra referencia..." maxLength={2000} />
          </div>
        </div>

        <div className="farmacia-card-header" style={{ marginTop: '25px', marginBottom: '10px' }}>
          <div><h3>Detalle de medicamentos</h3><p>Indica el lote, vencimiento, cantidad y costo unitario.</p></div>
        </div>
        <div className="farmacia-table-wrap">
          <table className="farmacia-table">
            <thead><tr><th>Medicamento</th><th>Número de lote</th><th>Vencimiento</th><th>Cantidad</th><th>Precio unitario</th><th /></tr></thead>
            <tbody>
              {detalles.map((detail, index) => (
                <tr key={index}>
                  <td><select className="farmacia-select" value={detail.idMedicamento} onChange={(event) => updateDetail(index, 'idMedicamento', event.target.value)} required><option value="">Seleccionar</option>{medicamentos.filter((item) => item.estado).map((item) => <option key={item.idMedicamento} value={item.idMedicamento}>{item.nombre}{item.concentracion ? ' · ' + item.concentracion : ''}</option>)}</select></td>
                  <td><input className="farmacia-input" value={detail.numeroLote} onChange={(event) => updateDetail(index, 'numeroLote', event.target.value)} maxLength={100} /></td>
                  <td><input className="farmacia-input" type="date" value={detail.fechaExpiracion} onChange={(event) => updateDetail(index, 'fechaExpiracion', event.target.value)} required /></td>
                  <td><input className="farmacia-input" type="number" min="1" value={detail.cantidad} onChange={(event) => updateDetail(index, 'cantidad', event.target.value)} required /></td>
                  <td><input className="farmacia-input" type="number" min="0" step="0.01" value={detail.precioUnitario} onChange={(event) => updateDetail(index, 'precioUnitario', event.target.value)} /></td>
                  <td><button className="farmacia-button ghost" type="button" onClick={() => removeDetail(index)} disabled={detalles.length === 1}>Quitar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="farmacia-form-actions">
          <button className="farmacia-button secondary" type="button" onClick={addDetail}>Agregar medicamento</button>
          <button className="farmacia-button primary" type="submit" disabled={saving || medicamentos.length === 0}>{saving ? 'Guardando...' : 'Guardar entrada'}</button>
        </div>
      </form>
    </section>
  );
}

export default EntradaMedicamentoForm;
