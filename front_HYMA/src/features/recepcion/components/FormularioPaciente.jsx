import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  X,
  AlertCircle,
  FlaskConical,
  Check,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Loader2
} from 'lucide-react';
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
    <div className="recepcion-modal-overlay">
      <div className="recepcion-modal-card" role="dialog" aria-modal="true" aria-labelledby="new-patient-title">
        
        {/* Cabecera Modal */}
        <div className="recepcion-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="recepcion-modal-badge-icon">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 id="new-patient-title" style={{ color: '#03045e', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Registrar Nuevo Paciente
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '3px 0 0' }}>
                Ingresa los datos generales para crear el expediente y asignarlo a la cola.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="recepcion-modal-close"
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="recepcion-alert-error" role="alert">
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sección 1: Datos Personales */}
          <div className="recepcion-form-section-title">
            <Calendar size={15} />
            <span>1. Datos Personales y Demográficos</span>
          </div>

          <div className="recepcion-form-grid">
            <div className="recepcion-form-group">
              <label className="recepcion-form-label">Nombres *</label>
              <input
                name="nombres"
                type="text"
                value={form.nombres}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Ej. Juan Alberto"
                className="recepcion-form-input"
              />
            </div>

            <div className="recepcion-form-group">
              <label className="recepcion-form-label">Apellidos *</label>
              <input
                name="apellidos"
                type="text"
                value={form.apellidos}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Ej. Gómez Pérez"
                className="recepcion-form-input"
              />
            </div>

            <div className="recepcion-form-group">
              <label className="recepcion-form-label">Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={form.fechaNacimiento}
                onChange={handleChange}
                required
                className="recepcion-form-input"
              />
            </div>

            <div className="recepcion-form-group">
              <label className="recepcion-form-label">Sexo *</label>
              <select
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                required
                className="recepcion-form-input"
              >
                <option value="">Seleccionar sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div className="recepcion-form-group">
              <label className="recepcion-form-label">Teléfono</label>
              <input
                name="telefono"
                type="tel"
                value={form.telefono}
                onChange={handleChange}
                maxLength={20}
                placeholder="Ej. 8888-9999"
                className="recepcion-form-input"
              />
            </div>

            <div className="recepcion-form-group">
              <label className="recepcion-form-label">Comunidad / Dirección</label>
              <input
                name="comunidad"
                type="text"
                value={form.comunidad}
                onChange={handleChange}
                maxLength={150}
                placeholder="Ej. Sector 3, San Marcos"
                className="recepcion-form-input"
              />
            </div>
          </div>

          {/* Sección 2: Alergias Conocidas */}
          <div className="recepcion-form-section-title" style={{ marginTop: '22px' }}>
            <FlaskConical size={15} />
            <span>2. Alergias Conocidas del Paciente</span>
          </div>

          {alergias.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '4px 0 10px' }}>
              No hay alergias registradas en el catálogo.
            </p>
          ) : (
            <div className="recepcion-allergies-box">
              {alergias.map((alergia) => {
                const isSelected = form.alergiaIds.includes(alergia.idAlergia);

                return (
                  <button
                    key={alergia.idAlergia}
                    type="button"
                    onClick={() => toggleAlergia(alergia.idAlergia)}
                    className={`recepcion-allergy-chip ${isSelected ? 'selected' : ''}`}
                  >
                    {isSelected && <Check size={14} />}
                    <span>{alergia.nombre}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sección 3: Antecedentes Clínicos */}
          <div className="recepcion-form-section-title" style={{ marginTop: '22px' }}>
            <FileText size={15} />
            <span>3. Antecedentes Clínicos Previos</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div className="recepcion-form-group">
              <label className="recepcion-form-label">Antecedentes Personales Patológicos</label>
              <textarea
                name="antecedentesPersonalesPatologicos"
                value={form.antecedentesPersonalesPatologicos}
                onChange={handleChange}
                rows={2}
                placeholder="Enfermedades crónicas, cirugías previas, tratamientos continuos..."
                className="recepcion-form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="recepcion-form-group">
              <label className="recepcion-form-label">Antecedentes Personales Familiares</label>
              <textarea
                name="antecedentesPersonalesFamiliares"
                value={form.antecedentesPersonalesFamiliares}
                onChange={handleChange}
                rows={2}
                placeholder="Hipertensión, diabetes, afecciones hereditarias familiares..."
                className="recepcion-form-input"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="recepcion-modal-actions">
            <button
              type="button"
              onClick={onCerrar}
              className="recepcion-btn-cancel"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="recepcion-btn-save"
            >
              {guardando ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Registrar y Poner en Cola</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default FormularioPaciente;
