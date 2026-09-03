import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePreconsulta } from '../hooks/usePreconsulta';
import { obtenerPaciente } from '../../recepcion/services/recepcionService';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

export default function PreconsultaPage() {
  const navigate = useNavigate();
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

  // Estados del Formulario
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
      // La carga asíncrona actualiza el estado mientras sincroniza la URL con el expediente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Cálculo de edad
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
      setMensajeExito(`¡Signos vitales registrados con éxito! El paciente ha sido enviado al médico (Estado: EN_CONSULTA).`);
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

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.container}>
        {/* Encabezado */}
        <div style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              <span onClick={() => navigate('/inicio')} style={styles.breadcrumbLink}>
                Inicio
              </span>{' '}
              / <span>Preconsulta</span>
            </div>
            <h1 style={styles.title}>Toma de Signos Vitales y Triaje</h1>
            <p style={styles.subtitle}>
              Registro de mediciones clínicas previas a la consulta médica del paciente.
            </p>
          </div>
        </div>

        {/* Mensaje de Éxito */}
        {mensajeExito && (
          <div style={styles.successAlert}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>
                <strong>Preconsulta Completada:</strong> {mensajeExito}
              </div>
            </div>
            <button
              onClick={() => {
                setMensajeExito('');
                setPacienteSeleccionado(null);
                setSearchParams({});
              }}
              style={styles.btnNextPatient}
            >
              Atender siguiente paciente
            </button>
          </div>
        )}

        {/* Error Global */}
        {error && <div style={styles.errorAlert}>{error}</div>}

        <div style={styles.mainGrid}>
          {/* Columna Izquierda: Ficha y Formulario */}
          <div style={styles.leftCol}>
            {cargandoPaciente ? (
              <div style={styles.cardEmptyState}>
                <p style={{ color: '#496174' }}>Cargando expediente del paciente...</p>
              </div>
            ) : pacienteSeleccionado ? (
              <>
                {/* Tarjeta de Ficha del Paciente */}
                <div style={styles.patientCard}>
                  <div style={styles.patientCardHeader}>
                    <div>
                      <h2 style={styles.patientName}>
                        {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                      </h2>
                      <div style={styles.patientMeta}>
                        <span>{edadPaciente !== null ? `${edadPaciente} años` : 'Edad no especificada'}</span>
                        <span>•</span>
                        <span>Sexo: {pacienteSeleccionado.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                        <span>•</span>
                        <span>{pacienteSeleccionado.comunidad || 'Sin comunidad'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alergias y Antecedentes */}
                  <div style={styles.patientAlertsRow}>
                    <div style={styles.alertBox}>
                      <span style={styles.alertLabel}>Alergias Registradas:</span>
                      <div style={styles.tagList}>
                        {pacienteSeleccionado.alergiaIds && pacienteSeleccionado.alergiaIds.length > 0 ? (
                          pacienteSeleccionado.alergiaIds.map((idAlergia) => (
                            <span key={idAlergia} style={styles.allergyTag}>
                              Alergia registrada {idAlergia}
                            </span>
                          ))
                        ) : (
                          <span style={styles.noAllergyTag}>Ninguna alergia conocida</span>
                        )}
                      </div>
                    </div>

                    {(pacienteSeleccionado.antecedentesPersonalesPatologicos ||
                      pacienteSeleccionado.antecedentesPersonalesFamiliares) && (
                      <div style={styles.historyBox}>
                        <span style={styles.alertLabel}>Antecedentes Médicos:</span>
                        <div style={styles.historyText}>
                          {pacienteSeleccionado.antecedentesPersonalesPatologicos && (
                            <div>
                              <strong>Patológicos:</strong> {pacienteSeleccionado.antecedentesPersonalesPatologicos}
                            </div>
                          )}
                          {pacienteSeleccionado.antecedentesPersonalesFamiliares && (
                            <div>
                              <strong>Familiares:</strong> {pacienteSeleccionado.antecedentesPersonalesFamiliares}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulario de Signos Vitales */}
                <form onSubmit={handleSubmit} style={styles.formCard}>
                  <div style={styles.formCardHeader}>
                    <h3 style={styles.formCardTitle}>Registro de signos vitales</h3>
                    <span style={styles.formCardSub}>
                      Los datos se asignarán a este paciente y pasarán su turno a <strong>EN_CONSULTA</strong>.
                    </span>
                  </div>

                  <div style={styles.formGrid}>
                    {/* Peso */}
                    <div style={styles.inputField}>
                      <label style={styles.fieldLabel}>
                        Peso (kg) <span style={styles.unitPill}>Kilogramos</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="peso"
                        placeholder="Ej: 68.5"
                        value={formData.peso}
                        onChange={handleChange}
                        style={styles.fieldInput}
                      />
                    </div>

                    {/* Talla */}
                    <div style={styles.inputField}>
                      <label style={styles.fieldLabel}>
                        Talla / Estatura <span style={styles.unitPill}>cm</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        name="talla"
                        placeholder="Ej: 170"
                        value={formData.talla}
                        onChange={handleChange}
                        style={styles.fieldInput}
                      />
                    </div>

                    {/* IMC en tiempo real */}
                    <div style={styles.imcBox}>
                      <div style={styles.imcHeader}>
                        <span style={styles.imcTitle}>Índice Masa Corporal (IMC)</span>
                        {imcInfo.imc && (
                          <span style={{ ...styles.imcBadge, backgroundColor: imcInfo.color }}>
                            {imcInfo.texto}
                          </span>
                        )}
                      </div>
                      <div style={styles.imcValue}>
                        {imcInfo.imc ? `${imcInfo.imc} kg/m²` : 'Calculando...'}
                      </div>
                    </div>

                    {/* Presión Arterial */}
                    <div style={styles.inputField}>
                      <label style={styles.fieldLabel}>
                        Presión Arterial <span style={styles.unitPill}>mmHg</span>
                      </label>
                      <input
                        type="text"
                        name="presionArterial"
                        placeholder="Ej: 120/80"
                        value={formData.presionArterial}
                        onChange={handleChange}
                        style={styles.fieldInput}
                      />
                    </div>

                    {/* Glucosa / Glicemia */}
                    <div style={styles.inputField}>
                      <label style={styles.fieldLabel}>
                        Glucosa en Sangre <span style={styles.unitPill}>mg/dL</span>
                      </label>
                      <input
                        type="number"
                        step="1"
                        name="glicemia"
                        placeholder="Ej: 95"
                        value={formData.glicemia}
                        onChange={handleChange}
                        style={styles.fieldInput}
                      />
                    </div>

                    {/* Frecuencia Cardíaca */}
                    <div style={styles.inputField}>
                      <label style={styles.fieldLabel}>
                        Frecuencia Cardíaca <span style={styles.unitPill}>lpm</span>
                      </label>
                      <input
                        type="number"
                        name="frecuenciaCardiaca"
                        placeholder="Ej: 72"
                        value={formData.frecuenciaCardiaca}
                        onChange={handleChange}
                        style={styles.fieldInput}
                      />
                    </div>

                    {/* Frecuencia Respiratoria */}
                    <div style={styles.inputField}>
                      <label style={styles.fieldLabel}>
                        Frecuencia Respiratoria <span style={styles.unitPill}>rpm</span>
                      </label>
                      <input
                        type="number"
                        name="frecuenciaRespiratoria"
                        placeholder="Ej: 18"
                        value={formData.frecuenciaRespiratoria}
                        onChange={handleChange}
                        style={styles.fieldInput}
                      />
                    </div>

                    {/* Saturación de Oxígeno */}
                    <div style={styles.inputField}>
                      <label style={styles.fieldLabel}>
                        Saturación de Oxígeno (SpO2) <span style={styles.unitPill}>%</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        name="saturacionOxigeno"
                        placeholder="Ej: 98.0"
                        value={formData.saturacionOxigeno}
                        onChange={handleChange}
                        style={styles.fieldInput}
                      />
                    </div>

                    {/* Temperatura */}
                    <div style={styles.inputField}>
                      <label style={styles.fieldLabel}>
                        Temperatura Corporal <span style={styles.unitPill}>°C</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="temperatura"
                        placeholder="Ej: 36.6"
                        value={formData.temperatura}
                        onChange={handleChange}
                        style={styles.fieldInput}
                      />
                    </div>
                  </div>

                  {/* Comparativa con Última Medición si existe */}
                  {ultimoSigno && (
                    <div style={styles.historyPreview}>
                      <span style={styles.historyPreviewTitle}>Última medición registrada anteriormente:</span>
                      <div style={styles.historyPreviewGrid}>
                        <span>Peso: {ultimoSigno.peso ? `${ultimoSigno.peso} kg` : '—'}</span>
                        <span>PA: {ultimoSigno.presionArterial || '—'}</span>
                        <span>Glucosa: {ultimoSigno.glicemia ? `${ultimoSigno.glicemia} mg/dL` : '—'}</span>
                        <span>Temp: {ultimoSigno.temperatura ? `${ultimoSigno.temperatura}°C` : '—'}</span>
                        <span>SpO2: {ultimoSigno.saturacionOxigeno ? `${ultimoSigno.saturacionOxigeno}%` : '—'}</span>
                      </div>
                    </div>
                  )}

                  {/* Botón de Enviar a Consulta */}
                  <div style={styles.formActions}>
                    <button
                      type="submit"
                      style={styles.btnSubmit}
                      disabled={guardando}
                    >
                      {guardando
                        ? 'Registrando y enviando...'
                        : 'Guardar signos y enviar a consulta médica'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={styles.cardEmptyState}>
                <h3 style={styles.emptyTitle}>Selecciona un paciente para iniciar preconsulta</h3>
                <p style={styles.emptyText}>
                  Haz click en cualquier paciente de la <strong>Cola de Espera</strong> o de <strong>Recepción</strong> para cargar su ficha y capturar sus signos vitales.
                </p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Cola en Espera */}
          <div style={styles.rightCol}>
            {/* Cola de Pacientes en Preconsulta */}
            <div style={styles.queueCard}>
              <div style={styles.queueCardHeader}>
                <h3 style={styles.queueTitle}>En Preconsulta Activa</h3>
                <span style={styles.queueCountPill}>{colaPreconsulta.length}</span>
              </div>

              {colaPreconsulta.length === 0 ? (
                <div style={styles.emptyQueue}>
                  <span>No hay pacientes en atención de preconsulta en este momento.</span>
                </div>
              ) : (
                <div style={styles.queueList}>
                  {colaPreconsulta.map((item) => (
                    <div
                      key={item.idCola}
                      style={{
                        ...styles.queueItem,
                        borderColor: turnoActual === item.idCola ? '#0077b6' : '#caf0f8',
                        backgroundColor: turnoActual === item.idCola ? '#caf0f8' : '#ffffff',
                      }}
                      onClick={() => handleSeleccionarDeCola(item)}
                    >
                      <div style={styles.queueItemInfo}>
                        <strong style={styles.queuePatientName}>
                          {item.nombresPaciente} {item.apellidosPaciente}
                        </strong>
                        <span style={styles.queueTime}>
                          Ingreso: {item.fechaIngreso ? new Date(item.fechaIngreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </span>
                      </div>
                      <button style={styles.btnContinue}>
                        Continuar →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cola de Pacientes Pendientes en Espera */}
            <div style={styles.queueCard}>
              <div style={styles.queueCardHeader}>
                <h3 style={styles.queueTitle}>Pacientes en Espera (Pendientes)</h3>
                <span style={{ ...styles.queueCountPill, backgroundColor: '#90e0ef', color: '#03045e' }}>
                  {colaPendiente.length}
                </span>
              </div>

              {colaPendiente.length === 0 ? (
                <div style={styles.emptyQueue}>
                  <span>No hay pacientes pendientes en cola de recepción.</span>
                </div>
              ) : (
                <div style={styles.queueList}>
                  {colaPendiente.map((item) => (
                    <div
                      key={item.idCola}
                      style={styles.queueItem}
                      onClick={() => handleSeleccionarDeCola(item)}
                    >
                      <div style={styles.queueItemInfo}>
                        <strong style={styles.queuePatientName}>
                          {item.nombresPaciente} {item.apellidosPaciente}
                        </strong>
                        <span style={styles.queueTime}>
                          Ingreso: {item.fechaIngreso ? new Date(item.fechaIngreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </span>
                      </div>
                      <button style={styles.btnCall}>
                        Atender
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f7fcfe',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    marginBottom: '1.5rem',
  },
  breadcrumb: {
    fontSize: '0.82rem',
    color: '#496174',
    fontWeight: 600,
    marginBottom: '6px',
  },
  breadcrumbLink: {
    color: '#0077b6',
    cursor: 'pointer',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#03045e',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '0.92rem',
    color: '#496174',
    margin: 0,
  },
  successAlert: {
    backgroundColor: '#caf0f8',
    border: '1px solid #90e0ef',
    color: '#03045e',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  btnNextPatient: {
    backgroundColor: '#0077b6',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  errorAlert: {
    backgroundColor: '#caf0f8',
    color: '#03045e',
    border: '1px solid #90e0ef',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 380px',
    gap: '1.75rem',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '1.5rem',
    border: '1px solid #caf0f8',
    boxShadow: '0 12px 30px rgba(3, 4, 94, 0.05)',
  },
  patientCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '1.25rem',
  },
  patientName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#03045e',
    margin: '0 0 4px 0',
  },
  patientMeta: {
    fontSize: '0.85rem',
    color: '#496174',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  patientAlertsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingTop: '1rem',
    borderTop: '1px solid #caf0f8',
  },
  alertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  alertLabel: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#03045e',
  },
  tagList: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  allergyTag: {
    backgroundColor: '#caf0f8',
    color: '#03045e',
    border: '1px solid #90e0ef',
    padding: '3px 9px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  noAllergyTag: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  historyBox: {
    fontSize: '0.82rem',
    color: '#496174',
  },
  historyText: {
    marginTop: '4px',
    lineHeight: '1.4',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '1.75rem',
    border: '1px solid #caf0f8',
    boxShadow: '0 12px 30px rgba(3, 4, 94, 0.05)',
  },
  formCardHeader: {
    marginBottom: '1.5rem',
  },
  formCardTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#03045e',
    margin: '0 0 4px 0',
  },
  formCardSub: {
    fontSize: '0.84rem',
    color: '#496174',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '1.5rem',
  },
  inputField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#03045e',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPill: {
    fontSize: '0.68rem',
    color: '#0077b6',
    backgroundColor: '#caf0f8',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  fieldInput: {
    padding: '11px 14px',
    borderRadius: '9px',
    border: '1px solid #90e0ef',
    fontSize: '0.95rem',
    outline: 'none',
    color: '#03045e',
    backgroundColor: '#faffff',
  },
  imcBox: {
    backgroundColor: '#caf0f8',
    border: '1px solid #90e0ef',
    borderRadius: '10px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  imcHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imcTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#03045e',
    textTransform: 'uppercase',
  },
  imcBadge: {
    color: '#ffffff',
    fontSize: '0.68rem',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  imcValue: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#03045e',
    marginTop: '4px',
  },
  historyPreview: {
    backgroundColor: '#f7fcfe',
    border: '1px dashed #90e0ef',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '1.5rem',
  },
  historyPreviewTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#496174',
    display: 'block',
    marginBottom: '6px',
  },
  historyPreviewGrid: {
    display: 'flex',
    gap: '14px',
    fontSize: '0.84rem',
    color: '#03045e',
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  btnSubmit: {
    background: '#03045e',
    color: '#ffffff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(3, 4, 94, 0.16)',
    transition: 'all 0.2s ease',
  },
  queueCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '1.25rem',
    border: '1px solid #caf0f8',
    boxShadow: '0 12px 30px rgba(3, 4, 94, 0.05)',
  },
  queueCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  queueTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#03045e',
    margin: 0,
  },
  queueCountPill: {
    backgroundColor: '#caf0f8',
    color: '#03045e',
    fontSize: '0.78rem',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  emptyQueue: {
    padding: '1.5rem',
    textAlign: 'center',
    color: '#6a7d8b',
    fontSize: '0.82rem',
  },
  queueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  queueItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #caf0f8',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  queueItemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  queuePatientName: {
    fontSize: '0.88rem',
    color: '#03045e',
  },
  queueTime: {
    fontSize: '0.72rem',
    color: '#6a7d8b',
  },
  btnContinue: {
    backgroundColor: '#0077b6',
    color: '#ffffff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnCall: {
    backgroundColor: '#00b4d8',
    color: '#03045e',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  cardEmptyState: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '4rem 2rem',
    textAlign: 'center',
    border: '1px solid #caf0f8',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#03045e',
    margin: '0 0 6px 0',
  },
  emptyText: {
    color: '#496174',
    fontSize: '0.9rem',
    maxWidth: '480px',
    margin: '0 auto',
  },
};
