import React, { useEffect, useState } from 'react';
import api from '../../../api/axios.js';

function FormularioPaciente({
  onGuardar,
  onCerrar,
  guardando,
}) {
  const [alergias, setAlergias] = useState([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: '',
    telefono: '',
    comunidad: '',
    antecedentesPersonalesPatologicos: '',
    antecedentesPersonalesFamiliares: '',
    alergiaIds: [],
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleAlergia = (id) => {
    setForm((prev) => ({
      ...prev,
      alergiaIds: prev.alergiaIds.includes(id)
        ? prev.alergiaIds.filter(
            (alergiaId) => alergiaId !== id
          )
        : [...prev.alergiaIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    try {
      await onGuardar(form);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo registrar el paciente.'
      );
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              Nuevo paciente
            </h2>

            <p style={styles.subtitle}>
              Registra los datos del paciente.
            </p>
          </div>

          <button
            onClick={onCerrar}
            style={styles.close}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label>Nombres *</label>
              <input
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>

            <div style={styles.field}>
              <label>Apellidos *</label>
              <input
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>

            <div style={styles.field}>
              <label>Fecha de nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={form.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label>Sexo *</label>
              <select
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                required
              >
                <option value="">
                  Seleccionar
                </option>
                <option value="M">
                  Masculino
                </option>
                <option value="F">
                  Femenino
                </option>
              </select>
            </div>

            <div style={styles.field}>
              <label>Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                maxLength={20}
              />
            </div>

            <div style={styles.field}>
              <label>Comunidad</label>
              <input
                name="comunidad"
                value={form.comunidad}
                onChange={handleChange}
                maxLength={150}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label>Alergias</label>

            {alergias.length === 0 ? (
              <p style={styles.noData}>
                No hay alergias registradas.
              </p>
            ) : (
              <div style={styles.allergies}>
                {alergias.map((alergia) => (
                  <label
                    key={alergia.idAlergia}
                    style={styles.checkbox}
                  >
                    <input
                      type="checkbox"
                      checked={form.alergiaIds.includes(
                        alergia.idAlergia
                      )}
                      onChange={() =>
                        toggleAlergia(
                          alergia.idAlergia
                        )
                      }
                    />

                    {alergia.nombre}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label>
              Antecedentes personales patológicos
            </label>

            <textarea
              name="antecedentesPersonalesPatologicos"
              value={
                form.antecedentesPersonalesPatologicos
              }
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div style={styles.field}>
            <label>
              Antecedentes personales familiares
            </label>

            <textarea
              name="antecedentesPersonalesFamiliares"
              value={
                form.antecedentesPersonalesFamiliares
              }
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onCerrar}
              style={styles.cancel}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              style={styles.save}
            >
              {guardando
                ? 'Guardando...'
                : 'Registrar y poner en cola'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3, 4, 94, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },

  modal: {
    background: '#ffffff',
    width: '100%',
    maxWidth: '760px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '20px',
    padding: '28px',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },

  title: {
    margin: 0,
    color: '#03045e',
  },

  subtitle: {
    color: '#64748b',
    margin: '5px 0 0',
  },

  close: {
    border: 'none',
    background: 'transparent',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#64748b',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    marginBottom: '15px',
  },

  input: {},

  allergies: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },

  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '8px 11px',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  noData: {
    color: '#64748b',
    fontSize: '14px',
  },

  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },

  cancel: {
    padding: '11px 18px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    cursor: 'pointer',
  },

  save: {
    padding: '11px 18px',
    borderRadius: '9px',
    border: 'none',
    background: '#0077b6',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default FormularioPaciente;