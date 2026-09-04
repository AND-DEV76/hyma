import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HeartPulse,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Stethoscope,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { usePreconsulta } from '../hooks/usePreconsulta';
import { obtenerPaciente } from '../../recepcion/services/recepcionService';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import '../styles/preconsulta.css';

export default function PreconsultaPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryIdCola = searchParams.get('idCola');
  const queryIdPaciente = searchParams.get('idPaciente');

  const {
    colaPreconsulta,
    colaPendiente,
    ultimoSigno,
    guardando,
    error,
    cargarColas,
    atenderTurno,
    guardarSignos,
    cargarUltimoSigno,
    calcularIMC,
  } = usePreconsulta();

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [cargandoPaciente, setCargandoPaciente] = useState(false);
  const [turnoActual, setTurnoActual] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados del Formulario de Signos Vitales
  const [formData, setFormData] = useState({
    peso: '',
    talla: '',
    presionArterial: '',
    glicemia: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    saturacionOxigeno: '',
    temperatura: '',
  });

  const cargarDatosPaciente = useCallback(async (idPaciente, idCola = null) => {
    setCargandoPaciente(true);
    try {
      const data = await obtenerPaciente(idPaciente);
      setPacienteSeleccionado(data);
      setTurnoActual(idCola);
      await cargarUltimoSigno(idPaciente);
      setMensajeExito('');
    } catch {
      setPacienteSeleccionado(null);
    } finally {
      setCargandoPaciente(false);
    }
  }, [cargarUltimoSigno]);

  // Cargar colas al inicio
  useEffect(() => {
    cargarColas();
  }, [cargarColas]);

  // Si vienen parámetros en la URL, cargar el paciente y turno seleccionado
  useEffect(() => {
    if (queryIdPaciente) {
      cargarDatosPaciente(Number(queryIdPaciente), queryIdCola ? Number(queryIdCola) : null);
    }
  }, [cargarDatosPaciente, queryIdPaciente, queryIdCola]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cálculo en tiempo real de IMC
  const imcInfo = useMemo(() => {
    return calcularIMC(formData.peso, formData.talla);
  }, [formData.peso, formData.talla, calcularIMC]);

  // Cálculo de edad (años)
  const edadPaciente = useMemo(() => {
    if (!pacienteSeleccionado?.fechaNacimiento) return null;
    const nacimiento = new Date(pacienteSeleccionado.fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }, [pacienteSeleccionado]);

  const handleSeleccionarDeCola = async (item) => {
    setSearchParams({ idCola: item.idCola, idPaciente: item.idPaciente });
    if (item.estado === 'PENDIENTE') {
      const resultado = await atenderTurno(item.idCola);
      if (!resultado.success) return;
    }
    cargarDatosPaciente(item.idPaciente, item.idCola);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pacienteSeleccionado) return;

    const payload = {
      idPaciente: pacienteSeleccionado.idPaciente,
      idCola: turnoActual ? Number(turnoActual) : (queryIdCola ? Number(queryIdCola) : null),
      peso: formData.peso ? parseFloat(formData.peso) : null,
      talla: formData.talla ? parseFloat(formData.talla) : null,
      presionArterial: formData.presionArterial.trim() || null,
      glicemia: formData.glicemia ? parseFloat(formData.glicemia) : null,
      frecuenciaCardiaca: formData.frecuenciaCardiaca ? parseInt(formData.frecuenciaCardiaca) : null,
      frecuenciaRespiratoria: formData.frecuenciaRespiratoria ? parseInt(formData.frecuenciaRespiratoria) : null,
      saturacionOxigeno: formData.saturacionOxigeno ? parseFloat(formData.saturacionOxigeno) : null,
      temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
    };

    const res = await guardarSignos(payload);
    if (res.success) {
      setMensajeExito(`Signos vitales registrados. El paciente fue enviado a consulta médica.`);
      setFormData({
        peso: '',
        talla: '',
        presionArterial: '',
        glicemia: '',
        frecuenciaCardiaca: '',
        frecuenciaRespiratoria: '',
        saturacionOxigeno: '',
        temperatura: '',
      });
      await cargarColas();
    }
  };

  const handleSiguientePaciente = () => {
    setMensajeExito('');
    setPacienteSeleccionado(null);
    setSearchParams({});
  };

  // Lista unificada de pacientes en cola
  const todosLosPacientes = useMemo(() => {
    return [...colaPreconsulta, ...colaPendiente];
  }, [colaPreconsulta, colaPendiente]);

  return (
    <div className="preconsulta-page">
      <AdminNavbar />

      <main className="preconsulta-container">
        {/* Panel Superior estilo Odoo */}
        <header className="preconsulta-control-panel">
          <div className="preconsulta-panel-left">
            <h1 className="preconsulta-main-title">Preconsulta</h1>
            <div className="preconsulta-queue-pill">
              <Users size={14} />
              <span><strong>{todosLosPacientes.length}</strong> en espera</span>
            </div>
          </div>
        </header>

        {/* Alerta de Éxito */}
        {mensajeExito && (
          <div className="preconsulta-alert-success" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{mensajeExito}</span>
            </div>
            <button
              type="button"
              onClick={handleSiguientePaciente}
              className="preconsulta-btn-next"
            >
              Atender siguiente paciente
            </button>
          </div>
        )}

        {/* Alerta de Error Global */}
        {error && (
          <div className="preconsulta-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Espacio de Trabajo en 2 Columnas */}
        <div className="preconsulta-workspace-grid">
          
          {/* Columna Izquierda: Cola de Pacientes */}
          <section className="preconsulta-box">
            <div className="preconsulta-box-header">
              <h2 className="preconsulta-box-title">
                <HeartPulse size={17} style={{ color: '#0077b6' }} />
                <span>Cola de Pacientes</span>
              </h2>
              <span className="preconsulta-count-badge">
                {todosLosPacientes.length} pacientes
              </span>
            </div>

            {todosLosPacientes.length === 0 ? (
              <div className="preconsulta-empty-state">
                <Users size={32} color="#94a3b8" />
                <span>No hay pacientes en cola de preconsulta</span>
              </div>
            ) : (
              <div className="preconsulta-queue-list">
                {todosLosPacientes.map((item, index) => {
                  const isEnAtencion = item.estado === 'EN_PRECONSULTA';
                  const isSelected = turnoActual === item.idCola;
                  const hora = item.fechaIngreso
                    ? new Date(item.fechaIngreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--';

                  return (
                    <div
                      key={item.idCola}
                      className={`preconsulta-queue-item ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSeleccionarDeCola(item)}
                    >
                      <div className="preconsulta-queue-info">
                        <span className="preconsulta-queue-name">
                          #{index + 1} {item.nombresPaciente} {item.apellidosPaciente}
                        </span>
                        <div className="preconsulta-queue-meta">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} />
                            {hora}
                          </span>
                        </div>
                      </div>

                      <div className="preconsulta-queue-actions">
                        <span
                          className={`preconsulta-status-chip ${
                            isEnAtencion ? 'en_preconsulta' : 'pendiente'
                          }`}
                        >
                          {isEnAtencion ? 'En atención' : 'Pendiente'}
                        </span>
                        <button
                          type="button"
                          className="preconsulta-btn-select"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeleccionarDeCola(item);
                          }}
                        >
                          <span>{isEnAtencion ? 'Continuar' : 'Atender'}</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Columna Derecha: Ficha y Formulario de Signos Vitales */}
          <section className="preconsulta-box">
            {cargandoPaciente ? (
              <div className="preconsulta-empty-state">
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#0077b6' }} />
                <span>Cargando datos del paciente...</span>
              </div>
            ) : pacienteSeleccionado ? (
              <>
                {/* Cabecera esencial del Paciente (Nombre, Años, Sexo) */}
                <div className="preconsulta-patient-banner">
                  <div className="preconsulta-patient-left">
                    <div className="preconsulta-patient-avatar">
                      {(pacienteSeleccionado.nombres || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="preconsulta-patient-fullname">
                        {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                      </h3>
                      <div className="preconsulta-patient-tags">
                        {edadPaciente !== null && (
                          <span className="preconsulta-tag age">
                            {edadPaciente} años
                          </span>
                        )}
                        <span className="preconsulta-tag">
                          {pacienteSeleccionado.sexo === 'M' ? 'Masculino' : 'Femenino'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {pacienteSeleccionado.alergiaIds && pacienteSeleccionado.alergiaIds.length > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                      <AlertTriangle size={13} />
                      <span>{pacienteSeleccionado.alergiaIds.length} alergia(s)</span>
                    </div>
                  )}
                </div>

                {/* Formulario de Signos Vitales */}
                <form onSubmit={handleSubmit}>
                  <div className="preconsulta-vitals-grid">
                    {/* Peso */}
                    <div className="preconsulta-field">
                      <label className="preconsulta-label">
                        <span>Peso</span>
                        <span className="preconsulta-unit">kg</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="peso"
                        placeholder="Ej. 68.5"
                        value={formData.peso}
                        onChange={handleChange}
                        className="preconsulta-input"
                      />
                    </div>

                    {/* Talla */}
                    <div className="preconsulta-field">
                      <label className="preconsulta-label">
                        <span>Talla</span>
                        <span className="preconsulta-unit">cm</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        name="talla"
                        placeholder="Ej. 170"
                        value={formData.talla}
                        onChange={handleChange}
                        className="preconsulta-input"
                      />
                    </div>

                    {/* IMC Calculado automáticamente */}
                    <div className="preconsulta-imc-box">
                      <div className="preconsulta-imc-header">
                        <span>IMC</span>
                        {imcInfo.imc && (
                          <span className="preconsulta-imc-badge" style={{ backgroundColor: imcInfo.color }}>
                            {imcInfo.texto}
                          </span>
                        )}
                      </div>
                      <div className="preconsulta-imc-val">
                        {imcInfo.imc ? `${imcInfo.imc}` : '—'}
                      </div>
                    </div>

                    {/* Presión Arterial */}
                    <div className="preconsulta-field">
                      <label className="preconsulta-label">
                        <span>Presión Arterial</span>
                        <span className="preconsulta-unit">mmHg</span>
                      </label>
                      <input
                        type="text"
                        name="presionArterial"
                        placeholder="Ej. 120/80"
                        value={formData.presionArterial}
                        onChange={handleChange}
                        className="preconsulta-input"
                      />
                    </div>

                    {/* Frecuencia Cardíaca */}
                    <div className="preconsulta-field">
                      <label className="preconsulta-label">
                        <span>Frec. Cardíaca</span>
                        <span className="preconsulta-unit">lpm</span>
                      </label>
                      <input
                        type="number"
                        name="frecuenciaCardiaca"
                        placeholder="Ej. 75"
                        value={formData.frecuenciaCardiaca}
                        onChange={handleChange}
                        className="preconsulta-input"
                      />
                    </div>

                    {/* Frecuencia Respiratoria */}
                    <div className="preconsulta-field">
                      <label className="preconsulta-label">
                        <span>Frec. Respiratoria</span>
                        <span className="preconsulta-unit">rpm</span>
                      </label>
                      <input
                        type="number"
                        name="frecuenciaRespiratoria"
                        placeholder="Ej. 18"
                        value={formData.frecuenciaRespiratoria}
                        onChange={handleChange}
                        className="preconsulta-input"
                      />
                    </div>

                    {/* Temperatura */}
                    <div className="preconsulta-field">
                      <label className="preconsulta-label">
                        <span>Temperatura</span>
                        <span className="preconsulta-unit">°C</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="temperatura"
                        placeholder="Ej. 36.5"
                        value={formData.temperatura}
                        onChange={handleChange}
                        className="preconsulta-input"
                      />
                    </div>

                    {/* Saturación SpO2 */}
                    <div className="preconsulta-field">
                      <label className="preconsulta-label">
                        <span>Saturación SpO2</span>
                        <span className="preconsulta-unit">%</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        name="saturacionOxigeno"
                        placeholder="Ej. 98"
                        value={formData.saturacionOxigeno}
                        onChange={handleChange}
                        className="preconsulta-input"
                      />
                    </div>

                    {/* Glucosa */}
                    <div className="preconsulta-field">
                      <label className="preconsulta-label">
                        <span>Glucosa</span>
                        <span className="preconsulta-unit">mg/dL</span>
                      </label>
                      <input
                        type="number"
                        step="1"
                        name="glicemia"
                        placeholder="Ej. 90"
                        value={formData.glicemia}
                        onChange={handleChange}
                        className="preconsulta-input"
                      />
                    </div>
                  </div>

                  {/* Botón de Envío */}
                  <div className="preconsulta-form-actions">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="preconsulta-btn-submit"
                    >
                      {guardando ? (
                        <>
                          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Guardar y Enviar a Consulta</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="preconsulta-empty-state">
                <Stethoscope size={38} color="#0077b6" />
                <h3 style={{ color: '#03045e', fontSize: '1.05rem', margin: 0, fontWeight: 750 }}>
                  Selecciona un paciente
                </h3>
                <span style={{ fontSize: '0.84rem', maxWidth: '300px' }}>
                  Elige un paciente de la cola para registrar sus signos vitales y enviarlo a consulta médica.
                </span>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
