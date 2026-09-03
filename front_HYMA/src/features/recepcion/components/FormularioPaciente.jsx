import { useEffect, useState } from 'react';
import api from '../../../api/axios.js';

const initialForm = {
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  sexo: '',
  telefono: '',
  comunidad: '',
  antecedentesPersonalesPatologicos: '',
  antecedentesPersonalesFamiliares: '',
  alergiaIds: [],
};

function FormularioPaciente({ onGuardar, onCerrar, guardando }) {
  const [alergias, setAlergias] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const cargarAlergias = async () => {
      try {
        const response = await api.get('/alergias');
        setAlergias(response.data);
      } catch {
        setError('No se pudieron cargar las alergias.');
      }
    };
    cargarAlergias();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const toggleAlergia = (id) => {
    setForm((previous) => ({
      ...previous,
      alergiaIds: previous.alergiaIds.includes(id)
        ? previous.alergiaIds.filter((alergiaId) => alergiaId !== id)
        : [...previous.alergiaIds, id],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onGuardar(form);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el paciente.');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} role="dialog" aria-modal="true" aria-labelledby="new-patient-title">
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>REGISTRO DE PACIENTE</p>
            <h2 id="new-patient-title" style={styles.title}>Nuevo paciente</h2>
            <p style={styles.subtitle}>Completa la información para agregarlo a la cola.</p>
          </div>
          <button type="button" onClick={onCerrar} style={styles.close}>Cerrar</button>
        </div>

        {error && <div role="alert" style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <Field label="Nombres *">
              <input name="nombres" value={form.nombres} onChange={handleChange} required maxLength={100} style={styles.input} />
            </Field>
            <Field label="Apellidos *">
              <input name="apellidos" value={form.apellidos} onChange={handleChange} required maxLength={100} style={styles.input} />
            </Field>
            <Field label="Fecha de nacimiento *">
              <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required style={styles.input} />
            </Field>
            <Field label="Sexo *">
              <select name="sexo" value={form.sexo} onChange={handleChange} required style={styles.input}>
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </Field>
            <Field label="Teléfono">
              <input name="telefono" value={form.telefono} onChange={handleChange} maxLength={20} style={styles.input} />
            </Field>
            <Field label="Comunidad">
              <input name="comunidad" value={form.comunidad} onChange={handleChange} maxLength={150} style={styles.input} />
            </Field>
          </div>

          <Field label="Alergias">
            {alergias.length === 0 ? (
              <p style={styles.noData}>No hay alergias registradas.</p>
            ) : (
              <div style={styles.allergies}>
                {alergias.map((alergia) => (
                  <label key={alergia.idAlergia} style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={form.alergiaIds.includes(alergia.idAlergia)}
                      onChange={() => toggleAlergia(alergia.idAlergia)}
                    />
                    {alergia.nombre}
                  </label>
                ))}
              </div>
            )}
          </Field>

          <Field label="Antecedentes personales patológicos">
            <textarea name="antecedentesPersonalesPatologicos" value={form.antecedentesPersonalesPatologicos} onChange={handleChange} rows="3" style={styles.input} />
          </Field>
          <Field label="Antecedentes personales familiares">
            <textarea name="antecedentesPersonalesFamiliares" value={form.antecedentesPersonalesFamiliares} onChange={handleChange} rows="3" style={styles.input} />
          </Field>

          <div style={styles.actions}>
            <button type="button" onClick={onCerrar} style={styles.cancel}>Cancelar</button>
            <button type="submit" disabled={guardando} style={styles.save}>
              {guardando ? 'Guardando...' : 'Registrar y poner en cola'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  overlay: { alignItems: 'center', background: 'rgba(3, 4, 94, 0.62)', display: 'flex', inset: 0, justifyContent: 'center', padding: '20px', position: 'fixed', zIndex: 1000 },
  modal: { background: '#ffffff', borderRadius: '12px', boxShadow: '0 24px 70px rgba(3, 4, 94, 0.22)', maxHeight: '90vh', maxWidth: '780px', overflowY: 'auto', padding: '32px', width: '100%' },
  header: { alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between', marginBottom: '26px' },
  kicker: { color: '#00b4d8', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '1.4px', margin: '0 0 8px' },
  title: { color: '#03045e', fontSize: '1.35rem', margin: 0 },
  subtitle: { color: '#496174', fontSize: '0.84rem', margin: '7px 0 0' },
  close: { background: '#ffffff', border: '1px solid #90e0ef', borderRadius: '6px', color: '#0077b6', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', padding: '7px 10px' },
  grid: { display: 'grid', gap: '0 16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '17px' },
  label: { color: '#03045e', fontSize: '0.76rem', fontWeight: '700' },
  input: { background: '#faffff', border: '1px solid #90e0ef', borderRadius: '6px', color: '#03045e', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', padding: '11px 12px', width: '100%' },
  allergies: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  checkbox: { alignItems: 'center', background: '#f7fcfe', border: '1px solid #caf0f8', borderRadius: '6px', color: '#496174', cursor: 'pointer', display: 'flex', fontSize: '0.8rem', gap: '7px', padding: '8px 10px' },
  noData: { color: '#6a7d8b', fontSize: '0.82rem', margin: 0 },
  error: { background: '#caf0f8', border: '1px solid #90e0ef', borderRadius: '7px', color: '#03045e', fontSize: '0.82rem', marginBottom: '16px', padding: '10px 12px' },
  actions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' },
  cancel: { background: '#ffffff', border: '1px solid #90e0ef', borderRadius: '6px', color: '#03045e', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', padding: '11px 16px' },
  save: { background: '#03045e', border: '1px solid #03045e', borderRadius: '6px', color: '#ffffff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', padding: '11px 16px' },
};

export default FormularioPaciente;
