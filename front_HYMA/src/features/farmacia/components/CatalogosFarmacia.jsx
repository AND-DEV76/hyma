import { useState } from 'react';

const emptyMedicine = {
  idCategoriaMedicamento: '',
  idCasaFarmaceutica: '',
  nombre: '',
  presentacion: '',
  concentracion: '',
  estado: true,
};

const medicinePayload = (item, estado = item.estado) => ({
  idCategoriaMedicamento: item.idCategoriaMedicamento || null,
  idCasaFarmaceutica: item.idCasaFarmaceutica || null,
  nombre: item.nombre,
  presentacion: item.presentacion || null,
  concentracion: item.concentracion || null,
  estado,
});

function CatalogosFarmacia({
  categorias,
  casas,
  medicamentos,
  onSaveCategoria,
  onDeleteCategoria,
  onSaveCasa,
  onDeleteCasa,
  onSaveMedicamento,
}) {
  const [categoria, setCategoria] = useState(null);
  const [casa, setCasa] = useState(null);
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const [casaNombre, setCasaNombre] = useState('');
  const [medicine, setMedicine] = useState(emptyMedicine);
  const [medicineError, setMedicineError] = useState('');
  const [filters, setFilters] = useState({ buscar: '', categoriaId: '', casaId: '', estado: '' });

  const filteredMedicamentos = medicamentos.filter((item) => {
    const text = (item.nombre + ' ' + (item.presentacion || '') + ' ' + (item.concentracion || '')).toLowerCase();
    return text.includes(filters.buscar.toLowerCase())
      && (!filters.categoriaId || String(item.idCategoriaMedicamento) === filters.categoriaId)
      && (!filters.casaId || String(item.idCasaFarmaceutica) === filters.casaId)
      && (filters.estado === '' || String(item.estado) === filters.estado);
  });

  const submitCatalogo = async (type) => {
    const name = type === 'categoria' ? categoriaNombre : casaNombre;
    if (!name.trim()) return;
    const result = type === 'categoria'
      ? await onSaveCategoria(categoria?.id, { nombre: name })
      : await onSaveCasa(casa?.id, { nombre: name });
    if (result.success) {
      if (type === 'categoria') {
        setCategoria(null);
        setCategoriaNombre('');
      } else {
        setCasa(null);
        setCasaNombre('');
      }
    }
  };

  const editMedicine = (item) => {
    setMedicine({
      idMedicamento: item.idMedicamento,
      idCategoriaMedicamento: item.idCategoriaMedicamento || '',
      idCasaFarmaceutica: item.idCasaFarmaceutica || '',
      nombre: item.nombre || '',
      presentacion: item.presentacion || '',
      concentracion: item.concentracion || '',
      estado: item.estado,
    });
    setMedicineError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitMedicine = async (event) => {
    event.preventDefault();
    setMedicineError('');
    const result = await onSaveMedicamento(medicine.idMedicamento, {
      ...medicine,
      idCategoriaMedicamento: medicine.idCategoriaMedicamento ? Number(medicine.idCategoriaMedicamento) : null,
      idCasaFarmaceutica: medicine.idCasaFarmaceutica ? Number(medicine.idCasaFarmaceutica) : null,
    });
    if (result.success) setMedicine(emptyMedicine);
    else setMedicineError(result.error);
  };

  return (
    <>
      <div className="farmacia-layout-2">
        <div>
          <CatalogoCard title="Categorías" items={categorias} value={categoriaNombre} editing={categoria} onChange={setCategoriaNombre} onSubmit={() => submitCatalogo('categoria')} onEdit={(item) => { setCategoria(item); setCategoriaNombre(item.nombre); }} onDelete={onDeleteCategoria} onCancel={() => { setCategoria(null); setCategoriaNombre(''); }} />
          <CatalogoCard title="Casas farmacéuticas" items={casas} value={casaNombre} editing={casa} onChange={setCasaNombre} onSubmit={() => submitCatalogo('casa')} onEdit={(item) => { setCasa(item); setCasaNombre(item.nombre); }} onDelete={onDeleteCasa} onCancel={() => { setCasa(null); setCasaNombre(''); }} />
        </div>

        <section className="farmacia-card">
          <div className="farmacia-card-header">
            <div>
              <h2>{medicine.idMedicamento ? 'Editar medicamento' : 'Nuevo medicamento'}</h2>
              <p>Define la información que utilizará farmacia para el inventario.</p>
            </div>
          </div>
          {medicineError && <div className="farmacia-alert">{medicineError}</div>}
          <form onSubmit={submitMedicine}>
            <div className="farmacia-form-grid">
              <Field label="Nombre *"><input className="farmacia-input" value={medicine.nombre} onChange={(e) => setMedicine({ ...medicine, nombre: e.target.value })} required maxLength={150} /></Field>
              <Field label="Presentación"><input className="farmacia-input" placeholder="Tabletas, jarabe, ampolla..." value={medicine.presentacion} onChange={(e) => setMedicine({ ...medicine, presentacion: e.target.value })} maxLength={100} /></Field>
              <Field label="Concentración"><input className="farmacia-input" placeholder="500 mg, 10 mg/5 ml..." value={medicine.concentracion} onChange={(e) => setMedicine({ ...medicine, concentracion: e.target.value })} maxLength={100} /></Field>
              <Field label="Categoría"><select className="farmacia-select" value={medicine.idCategoriaMedicamento} onChange={(e) => setMedicine({ ...medicine, idCategoriaMedicamento: e.target.value })}><option value="">Sin categoría</option>{categorias.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></Field>
              <Field label="Casa farmacéutica"><select className="farmacia-select" value={medicine.idCasaFarmaceutica} onChange={(e) => setMedicine({ ...medicine, idCasaFarmaceutica: e.target.value })}><option value="">Sin casa farmacéutica</option>{casas.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></Field>
              <Field label="Estado"><select className="farmacia-select" value={String(medicine.estado)} onChange={(e) => setMedicine({ ...medicine, estado: e.target.value === 'true' })}><option value="true">Activo</option><option value="false">Inactivo</option></select></Field>
            </div>
            <div className="farmacia-form-actions">
              {medicine.idMedicamento && <button type="button" className="farmacia-button ghost" onClick={() => setMedicine(emptyMedicine)}>Cancelar edición</button>}
              <button type="submit" className="farmacia-button primary">{medicine.idMedicamento ? 'Guardar cambios' : 'Registrar medicamento'}</button>
            </div>
          </form>
        </section>
      </div>

      <section className="farmacia-card">
        <div className="farmacia-card-header"><div><h2>Medicamentos registrados</h2><p>{filteredMedicamentos.length} resultados con los filtros actuales.</p></div></div>
        <div className="farmacia-filter-bar">
          <input className="farmacia-input" placeholder="Buscar medicamento..." value={filters.buscar} onChange={(e) => setFilters({ ...filters, buscar: e.target.value })} />
          <select className="farmacia-select" value={filters.categoriaId} onChange={(e) => setFilters({ ...filters, categoriaId: e.target.value })}><option value="">Todas las categorías</option>{categorias.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>
          <select className="farmacia-select" value={filters.casaId} onChange={(e) => setFilters({ ...filters, casaId: e.target.value })}><option value="">Todas las casas</option>{casas.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>
          <select className="farmacia-select" value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}><option value="">Todos los estados</option><option value="true">Activos</option><option value="false">Inactivos</option></select>
        </div>
        <div className="farmacia-table-wrap">
          <table className="farmacia-table">
            <thead><tr><th>Medicamento</th><th>Presentación</th><th>Categoría</th><th>Casa</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredMedicamentos.map((item) => (
                <tr key={item.idMedicamento}>
                  <td><strong>{item.nombre}</strong><br /><span>{item.concentracion || 'Sin concentración'}</span></td>
                  <td>{item.presentacion || '—'}</td><td>{item.categoriaNombre || '—'}</td><td>{item.casaFarmaceuticaNombre || '—'}</td>
                  <td><span className={'farmacia-status ' + (item.estado ? 'active' : 'inactive')}>{item.estado ? 'Activo' : 'Inactivo'}</span></td>
                  <td><div className="farmacia-inline-actions"><button type="button" onClick={() => editMedicine(item)}>Editar</button><button type="button" onClick={() => onSaveMedicamento(item.idMedicamento, medicinePayload(item, !item.estado))}>{item.estado ? 'Desactivar' : 'Activar'}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMedicamentos.length === 0 && (
            <div className="farmacia-empty">
              {medicamentos.length === 0
                ? 'No hay medicamentos registrados. Empecemos a cargar el catalogo.'
                : 'No hay medicamentos que coincidan con los filtros.'}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function CatalogoCard({ title, items, value, editing, onChange, onSubmit, onEdit, onDelete, onCancel }) {
  return (
    <section className="farmacia-card">
      <div className="farmacia-card-header"><div><h3>{title}</h3><p>{items.length} registros</p></div></div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
        <input className="farmacia-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Nuevo registro" maxLength={150} />
        <button className="farmacia-button primary" type="button" onClick={onSubmit}>{editing ? 'Guardar' : 'Agregar'}</button>
      </div>
      {editing && <button className="farmacia-button ghost" type="button" onClick={onCancel} style={{ marginBottom: '10px' }}>Cancelar edición</button>}
      <div className="farmacia-detail-list">
        {items.map((item) => <div className="farmacia-detail-row" key={item.id}><strong>{item.nombre}</strong><div className="farmacia-inline-actions"><button type="button" onClick={() => onEdit(item)}>Editar</button><button type="button" onClick={() => onDelete(item.id)}>Eliminar</button></div></div>)}
        {items.length === 0 && <div className="farmacia-empty">No hay registros. Empecemos a cargar el catalogo.</div>}
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return <div className="farmacia-field"><label>{label}</label>{children}</div>;
}

export default CatalogosFarmacia;
