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

const CODIGOS_PAIS = [
  { codigo: '+502', pais: 'Guatemala', bandera: '🇬🇹', digitos: 8, placeholder: '5555-1234' },
  { codigo: '+503', pais: 'El Salvador', bandera: '🇸🇻', digitos: 8, placeholder: '7890-1234' },
  { codigo: '+504', pais: 'Honduras', bandera: '🇭🇳', digitos: 8, placeholder: '9876-5432' },
  { codigo: '+52', pais: 'México', bandera: '🇲🇽', digitos: 10, placeholder: '5512345678' },
  { codigo: '+1', pais: 'EE.UU. / Canadá', bandera: '🇺🇸', digitos: 10, placeholder: '2025550199' },
  { codigo: '+505', pais: 'Nicaragua', bandera: '🇳🇮', digitos: 8, placeholder: '8765-4321' },
  { codigo: '+506', pais: 'Costa Rica', bandera: '🇨🇷', digitos: 8, placeholder: '8765-4321' },
  { codigo: '+507', pais: 'Panamá', bandera: '🇵🇦', digitos: 8, placeholder: '6789-0123' },
  { codigo: '+57', pais: 'Colombia', bandera: '🇨🇴', digitos: 10, placeholder: '3001234567' },
  { codigo: '+34', pais: 'España', bandera: '🇪🇸', digitos: 9, placeholder: '612345678' },
  { codigo: '+', pais: 'Otro país', bandera: '🌐', digitos: null, placeholder: 'Número local' },
];

// Obtener fecha actual en formato local YYYY-MM-DD para limitar fechas futuras
const fechaHoy = (() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
})();

function FormularioPaciente({ onGuardar, onCerrar, guardando }) {

  const [alergias, setAlergias] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [codigoPais, setCodigoPais] = useState('+502');
  const [telefonoLocal, setTelefonoLocal] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Formateo y restricción de dígitos locales
  const formatearNumeroLocal = (soloDigitos, codigo) => {
    if (codigo === '+502') {
      const d = soloDigitos.slice(0, 8);
      return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
    }
    return soloDigitos.slice(0, 15);
  };

  // Bloqueo estricto en tiempo real de letras y símbolos en teclado
  const handleKeyDownTelefono = (e) => {
    const permitidas = [
      'Backspace',
      'Tab',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Enter',
    ];
    if (permitidas.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Cambio de número local con sanitización instantánea de texto
  const handleTelefonoChange = (e) => {
    const rawVal = e.target.value;
    const soloDigitos = rawVal.replace(/\D/g, '');
    const formateado = formatearNumeroLocal(soloDigitos, codigoPais);
    setTelefonoLocal(formateado);

    const digitosReales = soloDigitos.slice(0, codigoPais === '+502' ? 8 : 15);
    setForm((previous) => ({
      ...previous,
      telefono: digitosReales ? `${codigoPais} ${formateado}` : '',
    }));
  };

  // Cambio de prefijo de país
  const handleCodigoPaisChange = (e) => {
    const nuevoCodigo = e.target.value;
    setCodigoPais(nuevoCodigo);
    const soloDigitos = telefonoLocal.replace(/\D/g, '');
    const formateado = formatearNumeroLocal(soloDigitos, nuevoCodigo);
    setTelefonoLocal(formateado);

    const digitosReales = soloDigitos.slice(0, nuevoCodigo === '+502' ? 8 : 15);
    setForm((previous) => ({
      ...previous,
      telefono: digitosReales ? `${nuevoCodigo} ${formateado}` : '',
    }));
  };

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
    if (name === 'fechaNacimiento' && value > fechaHoy) {
      setError('La fecha de nacimiento no puede ser una fecha futura.');
      setForm((previous) => ({ ...previous, [name]: fechaHoy }));
      return;
    }
    // No permitir que nombres y apellidos inicien con espacios en blanco
    if ((name === 'nombres' || name === 'apellidos') && value.startsWith(' ')) {
      return;
    }
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (guardando || enviando) return;
    setError('');

    // Validación estricta de nombres y apellidos (no solo espacios en blanco)
    if (!form.nombres || !form.nombres.trim()) {
      setError('Los nombres son obligatorios y no pueden contener únicamente espacios en blanco.');
      return;
    }
    if (!form.apellidos || !form.apellidos.trim()) {
      setError('Los apellidos son obligatorios y no pueden contener únicamente espacios en blanco.');
      return;
    }
    if (!form.fechaNacimiento) {
      setError('Por favor indica la fecha de nacimiento.');
      return;
    }
    if (form.fechaNacimiento > fechaHoy) {
      setError('La fecha de nacimiento no puede ser una fecha futura.');
      return;
    }
    if (!form.sexo) {
      setError('Por favor selecciona el sexo biológico.');
      return;
    }

    // Validación de Teléfono de Contacto (opcional, pero si se escribe debe ser válido)
    const digitosTel = telefonoLocal.replace(/\D/g, '');
    if (digitosTel.length > 0) {
      if (codigoPais === '+502') {
        if (digitosTel.length !== 8) {
          setError('El teléfono para Guatemala debe contener exactamente 8 dígitos (ej. 5555-1234).');
          return;
        }
      } else {
        if (digitosTel.length < 7 || digitosTel.length > 15) {
          setError('El teléfono internacional debe contener entre 7 y 15 dígitos.');
          return;
        }
      }
    }

    const payload = {
      ...form,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      comunidad: form.comunidad ? form.comunidad.trim() : '',
      telefono: digitosTel.length > 0 ? `${codigoPais} ${telefonoLocal}` : '',
    };

    setEnviando(true);
    try {
      await onGuardar(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el paciente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !guardando && !enviando) {
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
            disabled={guardando || enviando}
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
                    pattern=".*\S+.*"
                    title="Los nombres son obligatorios y deben contener al menos un carácter válido (no solo espacios en blanco)."
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
                    pattern=".*\S+.*"
                    title="Los apellidos son obligatorios y deben contener al menos un carácter válido (no solo espacios en blanco)."
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
                    max={fechaHoy}
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
                  <div className="recepcion-telefono-header-row">
                    <label className="recepcion-form-label" htmlFor="telefono-local">
                      Teléfono de Contacto
                    </label>
                    {codigoPais === '+502' && (
                      <span
                        className={`recepcion-telefono-counter ${
                          telefonoLocal.replace(/\D/g, '').length === 8
                            ? 'is-complete'
                            : ''
                        }`}
                      >
                        {telefonoLocal.replace(/\D/g, '').length}/8 dígitos
                      </span>
                    )}
                  </div>
                  <div className="recepcion-telefono-input-wrapper">
                    <select
                      id="codigo-pais-select"
                      aria-label="Código de país"
                      value={codigoPais}
                      onChange={handleCodigoPaisChange}
                      className="recepcion-telefono-prefix-select"
                    >
                      {CODIGOS_PAIS.map((cp) => (
                        <option key={cp.codigo + cp.pais} value={cp.codigo}>
                          {cp.bandera} {cp.codigo} ({cp.pais})
                        </option>
                      ))}
                    </select>
                    <div className="recepcion-telefono-input-inner">
                      <input
                        id="telefono-local"
                        name="telefonoLocal"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={telefonoLocal}
                        onChange={handleTelefonoChange}
                        onKeyDown={handleKeyDownTelefono}
                        placeholder={
                          codigoPais === '+502'
                            ? 'Ej. 5555-1234'
                            : 'Ej. 12345678'
                        }
                        maxLength={codigoPais === '+502' ? 9 : 18}
                        className="recepcion-form-input recepcion-telefono-input-field"
                        autoComplete="tel-national"
                      />
                    </div>
                  </div>
                  <span className="recepcion-telefono-hint">
                    {codigoPais === '+502'
                      ? 'Guatemala: exactamente 8 dígitos (ej. 5555-1234)'
                      : 'Ingrese únicamente dígitos locales'}
                  </span>
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
              disabled={guardando || enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || enviando}
              className="recepcion-btn-save"
            >
              {guardando || enviando ? (
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
