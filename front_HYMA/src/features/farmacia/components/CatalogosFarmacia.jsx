import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Pill, Tag, Building2, Check, AlertCircle } from 'lucide-react';

const initialMedicine = {
  nombre: '',
  presentacion: '',
  concentracion: '',
  idCategoriaMedicamento: '',
  idCasaFarmaceutica: '',
  estado: true,
};

function CatalogosFarmacia({
  categorias,
  casas,
  onSaveCategoria,
  onDeleteCategoria,
  onSaveCasa,
  onDeleteCasa,
  onSaveMedicamento,
}) {
  // Medicamento Form State
  const [medicine, setMedicine] = useState(initialMedicine);
  const [editingMedId, setEditingMedId] = useState(null);
  const [medicineError, setMedicineError] = useState('');
  const [medicineSuccess, setMedicineSuccess] = useState('');
  const [savingMed, setSavingMed] = useState(false);

  // Categoria State
  const [categoriaEditing, setCategoriaEditing] = useState(null);
  const [categoriaNombre, setCategoriaNombre] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Casa Farmaceutica State
  const [casaEditing, setCasaEditing] = useState(null);
  const [casaNombre, setCasaNombre] = useState('');
  const [savingCasa, setSavingCasa] = useState(false);

  // Aux Error State
  const [auxError, setAuxError] = useState('');

  const handleDeleteCat = async (id) => {
    setAuxError('');
    const result = await onDeleteCategoria(id);
    if (result && !result.success && result.error) {
      setAuxError(result.error);
    }
  };

  const handleDeleteCasa = async (id) => {
    setAuxError('');
    const result = await onDeleteCasa(id);
    if (result && !result.success && result.error) {
      setAuxError(result.error);
    }
  };

  // Manejo de guardado de medicamento
  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    setMedicineError('');
    setMedicineSuccess('');

    if (!medicine.nombre.trim()) {
      setMedicineError('El nombre del medicamento es obligatorio.');
      return;
    }

    setSavingMed(true);
    const payload = {
      nombre: medicine.nombre.trim(),
      presentacion: medicine.presentacion.trim() || null,
      concentracion: medicine.concentracion.trim() || null,
      idCategoriaMedicamento: medicine.idCategoriaMedicamento ? Number(medicine.idCategoriaMedicamento) : null,
      idCasaFarmaceutica: medicine.idCasaFarmaceutica ? Number(medicine.idCasaFarmaceutica) : null,
      estado: medicine.estado,
    };

    const result = await onSaveMedicamento(editingMedId, payload);
    setSavingMed(false);

    if (result.success) {
      setMedicine(initialMedicine);
      setEditingMedId(null);
      setMedicineSuccess(editingMedId ? 'Medicamento actualizado correctamente.' : 'Medicamento registrado con éxito.');
      setTimeout(() => setMedicineSuccess(''), 3500);
    } else {
      setMedicineError(result.error || 'Error al guardar el medicamento.');
    }
  };

  const handleCancelEditMed = () => {
    setMedicine(initialMedicine);
    setEditingMedId(null);
    setMedicineError('');
  };

  // Manejo de Categoría
  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!categoriaNombre.trim()) return;
    setSavingCat(true);
    const result = await onSaveCategoria(categoriaEditing?.id, { nombre: categoriaNombre.trim() });
    setSavingCat(false);
    if (result.success) {
      setCategoriaEditing(null);
      setCategoriaNombre('');
    }
  };

  // Manejo de Casa Farmacéutica
  const handleSaveCasa = async (e) => {
    e.preventDefault();
    if (!casaNombre.trim()) return;
    setSavingCasa(true);
    const result = await onSaveCasa(casaEditing?.id, { nombre: casaNombre.trim() });
    setSavingCasa(false);
    if (result.success) {
      setCasaEditing(null);
      setCasaNombre('');
    }
  };

  return (
    <div className="farmacia-catalogos-view">
      <div className="farmacia-catalogos-grid">
        {/* COLUMNA 1: Formulario Nuevo Medicamento */}
        <section className="farmacia-card farmacia-card-highlight">
          <div className="farmacia-card-header">
            <div className="farmacia-card-title-group">
              <div className="farmacia-icon-circle">
                <Pill size={20} />
              </div>
              <div>
                <h2>{editingMedId ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h2>
                <p>Ingresa la ficha técnica que utilizará farmacia para el inventario.</p>
              </div>
            </div>
            {editingMedId && (
              <button
                type="button"
                className="farmacia-btn-secondary btn-sm"
                onClick={handleCancelEditMed}
              >
                <X size={14} />
                Cancelar
              </button>
            )}
          </div>

          {medicineError && (
            <div className="farmacia-alert error">
              <AlertCircle size={16} />
              <span>{medicineError}</span>
            </div>
          )}

          {medicineSuccess && (
            <div className="farmacia-alert success">
              <Check size={16} />
              <span>{medicineSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveMedicine} className="farmacia-form">
            <div className="farmacia-form-grid">
              <div className="farmacia-field full">
                <label htmlFor="cat-med-nombre">
                  Nombre del Medicamento <span className="farmacia-required-star">*</span>
                </label>
                <input
                  id="cat-med-nombre"
                  className="farmacia-input"
                  placeholder="Ej. Acetaminofén, Amoxicilina, Loratadina..."
                  value={medicine.nombre}
                  onChange={(e) => setMedicine({ ...medicine, nombre: e.target.value })}
                  required
                  maxLength={150}
                />
              </div>

              <div className="farmacia-field">
                <label htmlFor="cat-med-pres">Presentación</label>
                <input
                  id="cat-med-pres"
                  className="farmacia-input"
                  placeholder="Ej. Tabletas, Jarabe, Suspensión..."
                  value={medicine.presentacion}
                  onChange={(e) => setMedicine({ ...medicine, presentacion: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className="farmacia-field">
                <label htmlFor="cat-med-conc">Concentración</label>
                <input
                  id="cat-med-conc"
                  className="farmacia-input"
                  placeholder="Ej. 500 mg, 100 mg/5 ml..."
                  value={medicine.concentracion}
                  onChange={(e) => setMedicine({ ...medicine, concentracion: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className="farmacia-field">
                <label htmlFor="cat-med-cat">Categoría</label>
                <select
                  id="cat-med-cat"
                  className="farmacia-select"
                  value={medicine.idCategoriaMedicamento}
                  onChange={(e) => setMedicine({ ...medicine, idCategoriaMedicamento: e.target.value })}
                >
                  <option value="">Sin categoría asignada</option>
                  {categorias.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="farmacia-field">
                <label htmlFor="cat-med-casa">Casa Farmacéutica</label>
                <select
                  id="cat-med-casa"
                  className="farmacia-select"
                  value={medicine.idCasaFarmaceutica}
                  onChange={(e) => setMedicine({ ...medicine, idCasaFarmaceutica: e.target.value })}
                >
                  <option value="">Sin casa farmacéutica</option>
                  {casas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="farmacia-field full">
                <label htmlFor="cat-med-estado">Estado</label>
                <select
                  id="cat-med-estado"
                  className="farmacia-select"
                  value={String(medicine.estado)}
                  onChange={(e) => setMedicine({ ...medicine, estado: e.target.value === 'true' })}
                >
                  <option value="true">Activo (Disponible para movimientos)</option>
                  <option value="false">Inactivo (Deshabilitado temporalmente)</option>
                </select>
              </div>
            </div>

            <div className="farmacia-form-actions">
              {editingMedId && (
                <button
                  type="button"
                  className="farmacia-btn-secondary"
                  onClick={handleCancelEditMed}
                  disabled={savingMed}
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="farmacia-btn-primary"
                disabled={savingMed}
              >
                {savingMed ? 'Guardando...' : editingMedId ? 'Guardar Cambios' : 'Registrar Medicamento'}
              </button>
            </div>
          </form>
        </section>

        {/* COLUMNA 2: Catálogos de Categorías y Casas Farmacéuticas */}
        <div className="farmacia-aux-column">
          {auxError && (
            <div className="farmacia-alert error" style={{ marginBottom: '8px' }}>
              <AlertCircle size={16} />
              <span>{auxError}</span>
            </div>
          )}

          {/* Card Categorías */}
          <CatalogoAuxiliarCard
            title="Categorías de Medicamentos"
            subtitle="Agrupación terapéutica o funcional"
            icon={<Tag size={18} />}
            items={categorias}
            value={categoriaNombre}
            editing={categoriaEditing}
            loading={savingCat}
            onChange={setCategoriaNombre}
            onSubmit={handleSaveCat}
            onEdit={(item) => {
              setCategoriaEditing(item);
              setCategoriaNombre(item.nombre);
            }}
            onDelete={handleDeleteCat}
            onCancel={() => {
              setCategoriaEditing(null);
              setCategoriaNombre('');
            }}
            placeholder="Nueva categoría (ej. Analgésicos)..."
          />

          {/* Card Casas Farmacéuticas */}
          <CatalogoAuxiliarCard
            title="Casas Farmacéuticas"
            subtitle="Laboratorios y proveedores de medicamentos"
            icon={<Building2 size={18} />}
            items={casas}
            value={casaNombre}
            editing={casaEditing}
            loading={savingCasa}
            onChange={setCasaNombre}
            onSubmit={handleSaveCasa}
            onEdit={(item) => {
              setCasaEditing(item);
              setCasaNombre(item.nombre);
            }}
            onDelete={handleDeleteCasa}
            onCancel={() => {
              setCasaEditing(null);
              setCasaNombre('');
            }}
            placeholder="Nueva casa farmacéutica (ej. Bayer, Pfizer)..."
          />
        </div>
      </div>
    </div>
  );
}

// Subcomponente elegante para tarjetas de auxiliares
function CatalogoAuxiliarCard({
  title,
  subtitle,
  icon,
  items,
  value,
  editing,
  loading,
  onChange,
  onSubmit,
  onEdit,
  onDelete,
  onCancel,
  placeholder,
}) {
  return (
    <section className="farmacia-card farmacia-aux-card">
      <div className="farmacia-card-header">
        <div className="farmacia-card-title-group">
          <div className="farmacia-icon-circle sm">
            {icon}
          </div>
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        <span className="farmacia-count-pill sm">
          <strong>{items.length}</strong>
        </span>
      </div>

      <form onSubmit={onSubmit} className="farmacia-aux-form">
        <div className="farmacia-aux-input-group">
          <input
            className="farmacia-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={150}
            required
          />
          <button
            className="farmacia-btn-primary btn-sm"
            type="submit"
            disabled={loading || !value.trim()}
          >
            {editing ? 'Guardar' : <><Plus size={14} /> Agregar</>}
          </button>
          {editing && (
            <button
              className="farmacia-btn-secondary btn-sm"
              type="button"
              onClick={onCancel}
              title="Cancelar edición"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      <div className="farmacia-aux-list-wrapper">
        <div className="farmacia-aux-list">
          {items.map((item) => (
            <div className={`farmacia-aux-row ${editing?.id === item.id ? 'is-editing' : ''}`} key={item.id}>
              <span className="farmacia-aux-name">{item.nombre}</span>
              <div className="farmacia-aux-actions">
                <button
                  type="button"
                  className="farmacia-aux-btn edit"
                  onClick={() => onEdit(item)}
                  title="Editar nombre"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  className="farmacia-aux-btn delete"
                  onClick={() => onDelete(item.id)}
                  title="Eliminar registro"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="farmacia-empty-subtle">
              No hay registros ingresados todavía.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CatalogosFarmacia;
