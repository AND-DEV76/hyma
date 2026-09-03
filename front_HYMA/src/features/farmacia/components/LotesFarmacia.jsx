import { useMemo, useState } from 'react';

function LotesFarmacia({ lotes, medicamentos }) {
  const [medicamentoId, setMedicamentoId] = useState('');
  const [buscar, setBuscar] = useState('');
  const [hasta, setHasta] = useState('');

  const filtered = useMemo(() => lotes.filter((lote) => {
    const matchesMedicine = !medicamentoId || String(lote.idMedicamento) === medicamentoId;
    const matchesText = (lote.medicamentoNombre + ' ' + (lote.numeroLote || '')).toLowerCase().includes(buscar.toLowerCase());
    const matchesDate = !hasta || lote.fechaExpiracion <= hasta;
    return matchesMedicine && matchesText && matchesDate;
  }), [lotes, medicamentoId, buscar, hasta]);

  return (
    <section className="farmacia-card">
      <div className="farmacia-card-header">
        <div><h2>Lotes activos</h2><p>{filtered.length} lotes encontrados. La existencia disponible se muestra por lote.</p></div>
      </div>
      <div className="farmacia-filter-bar">
        <input className="farmacia-input" placeholder="Buscar medicamento o lote..." value={buscar} onChange={(event) => setBuscar(event.target.value)} />
        <select className="farmacia-select" value={medicamentoId} onChange={(event) => setMedicamentoId(event.target.value)}>
          <option value="">Todos los medicamentos</option>
          {medicamentos.map((medicamento) => <option key={medicamento.idMedicamento} value={medicamento.idMedicamento}>{medicamento.nombre}</option>)}
        </select>
        <input className="farmacia-input" type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} title="Mostrar hasta esta fecha" />
        <button className="farmacia-button ghost" type="button" onClick={() => { setBuscar(''); setMedicamentoId(''); setHasta(''); }}>Limpiar</button>
      </div>
      <div className="farmacia-table-wrap">
        <table className="farmacia-table">
          <thead><tr><th>Medicamento</th><th>Lote</th><th>Vencimiento</th><th>Precio unitario</th><th>Stock disponible</th><th>Estado</th></tr></thead>
          <tbody>
            {filtered.map((lote) => (
              <tr key={lote.idLote}>
                <td><strong>{lote.medicamentoNombre}</strong><br /><span>{lote.presentacion || 'Sin presentación'}</span></td>
                <td>{lote.numeroLote || 'Sin número'}</td>
                <td>{new Date(lote.fechaExpiracion + 'T00:00:00').toLocaleDateString('es-GT')}</td>
                <td>{lote.precioUnitario == null ? '—' : 'Q ' + Number(lote.precioUnitario).toFixed(2)}</td>
                <td><strong>{lote.stockDisponible}</strong> unidades</td>
                <td><span className="farmacia-status active">Activo</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="farmacia-empty">
            {lotes.length === 0
              ? 'No hay lotes registrados. Registra una entrada para comenzar.'
              : 'No hay lotes para los filtros seleccionados.'}
          </div>
        )}
      </div>
    </section>
  );
}

export default LotesFarmacia;
