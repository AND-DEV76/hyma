import React, { useEffect, useState, useCallback } from 'react';
import {
  UserPlus,
  X,
  AlertCircle,
  FlaskConical,
  Calendar,
  FileText,
  User,
  Phone,
  MapPin,
  Loader2,
  Sparkles
} from 'lucide-react';
import { getAlergias } from '../../alergia/api/alergiaApi';
import AlergiasSelector from './AlergiasSelector';

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

  // Carga inicial de catálogo de alergias reutilizando alergiaApi
  const cargarCatalogoAlergias = useCallback(async () => {
    try {
      const data = await getAlergias();
      setAlergias(data);
    } catch {
      setError('No se pudieron cargar las alergias del catálogo.');
    }
  }, []);

  useEffect(() => {
    cargarCatalogoAlergias();
  }, [cargarCatalogoAlergias]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validación básica rápida en frontend
    if (!form.nombres.trim() || !form.apellidos.trim()) {
      setError('Por favor completa los nombres y apellidos del paciente.');
      return;
    }
    if (!form.fechaNacimiento) {
      setError('Por favor indica la fecha de nacimiento.');
      return;
    }
    if (!form.sexo) {
      setError('Por favor selecciona el sexo biológico.');
      return;
    }

    try {
      await onGuardar(form);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el paciente.');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !guardando) {
      onCerrar();
    }
  };

  return (
    <div
      className="recepcion-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-patient-title"
    >
      <div className="recepcion-modal-card">
        {/* Cabecera Fija del Modal */}
        <div className="recepcion-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="recepcion-modal-badge-icon">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 id="new-patient-title" className="recepcion-modal-title">
                Registrar Nuevo Paciente
              </h2>
              <p className="recepcion-modal-subtitle">
                Crea el expediente clínico y asigna al paciente a la cola de espera de preconsulta.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="recepcion-modal-close"
            title="Cerrar modal (Esc)"
            disabled={guardando}
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerta de Error si ocurre */}
        {error && (
          <div style={{ margin: '14px 24px 0' }} className="recepcion-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Cuerpo Desplazable del Formulario */}
          <div className="recepcion-modal-body">
            {/* SECCIÓN 1: Datos Personales y Demográficos */}
            <div className="recepcion-form-section-card">
              <div className="recepcion-form-section-header">
                <div className="recepcion-form-section-title">
                  <User size={16} className="recepcion-form-section-title-icon" />
                  <span>1. Datos Personales y Contacto</span>
                </div>
                <span className="recepcion-form-section-sub">Campos obligatorios marcados con *</span>
              </div>

              <div className="recepcion-form-grid-2">
                <div className="recepcion-form-group">
                  <label className="recepcion-form-label">
                    Nombres <span className="recepcion-required-star">*</span>
                  </label>
                  <input
                    name="nombres"
                    type="text"
                    value={form.nombres}
                    onChange={handleChange}
                    required
                    autoFocus
                    maxLength={100}
                    placeholder="Ej. Juan Alberto"
                    className="recepcion-form-input"
                  />
                </div>

                <div className="recepcion-form-group">
                  <label className="recepcion-form-label">
                    Apellidos <span className="recepcion-required-star">*</span>
                  </label>
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
                  <label className="recepcion-form-label">
                    Fecha de Nacimiento <span className="recepcion-required-star">*</span>
                  </label>
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
                  <label className="recepcion-form-label">
                    Sexo Biológico <span className="recepcion-required-star">*</span>
                  </label>
                  <select
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    required
                    className="recepcion-form-input"
                  >
                    <option value="">Seleccionar sexo...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div className="recepcion-form-group">
                  <label className="recepcion-form-label">
                    Teléfono de Contacto
                  </label>
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
                  <label className="recepcion-form-label">
                    Comunidad o Dirección
                  </label>
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
            </div>

            {/* SECCIÓN 2: Alergias Conocidas (Odoo Selector) */}
            <div className="recepcion-form-section-card">
              <div className="recepcion-form-section-header">
                <div className="recepcion-form-section-title">
                  <FlaskConical size={16} className="recepcion-form-section-title-icon" />
                  <span>2. Alergias Conocidas del Paciente</span>
                </div>
                <span className="recepcion-form-section-sub">
                  Busca o crea alérgenos en tiempo real
                </span>
              </div>

              <AlergiasSelector
                alergias={alergias}
                selectedIds={form.alergiaIds}
                onChange={(nuevosIds) => setForm((prev) => ({ ...prev, alergiaIds: nuevosIds }))}
                onNuevaAlergia={(nueva) => setAlergias((prev) => [...prev, nueva])}
              />
            </div>

            {/* SECCIÓN 3: Antecedentes Clínicos */}
            <div className="recepcion-form-section-card">
              <div className="recepcion-form-section-header">
                <div className="recepcion-form-section-title">
                  <FileText size={16} className="recepcion-form-section-title-icon" />
                  <span>3. Antecedentes Clínicos (Opcional)</span>
                </div>
                <span className="recepcion-form-section-sub">
                  Información de apoyo para el médico y enfermería
                </span>
              </div>

              <div className="recepcion-form-grid-2">
                <div className="recepcion-form-group">
                  <label className="recepcion-form-label">
                    Antecedentes Patológicos
                  </label>
                  <textarea
                    name="antecedentesPersonalesPatologicos"
                    value={form.antecedentesPersonalesPatologicos}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Enfermedades crónicas, intervenciones previas, cirugías..."
                    className="recepcion-form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="recepcion-form-group">
                  <label className="recepcion-form-label">
                    Antecedentes Familiares
                  </label>
                  <textarea
                    name="antecedentesPersonalesFamiliares"
                    value={form.antecedentesPersonalesFamiliares}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Diabetes, hipertensión o cardiopatías en familiares cercanos..."
                    className="recepcion-form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pie Fijo de Acciones */}
          <div className="recepcion-modal-footer">
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
                  <Loader2 size={16} className="spin-icon" />
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
