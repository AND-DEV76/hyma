import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HeartPulse,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
  User,
  Activity,
  Save,
  X,
} from 'lucide-react';
import { usePreconsulta } from '../hooks/usePreconsulta';
import { obtenerPaciente } from '../../recepcion/services/recepcionService';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import userImg from '../../../assets/images/user.png';

export default function SignosVitalesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryIdCola = searchParams.get('idCola');
  const queryIdPaciente = searchParams.get('idPaciente');

  const {
    guardando,
    error: hookError,
    guardarSignos,
    cargarUltimoSigno,
    calcularIMC,
  } = usePreconsulta();

  const [paciente, setPaciente] = useState(null);
  const [cargandoPaciente, setCargandoPaciente] = useState(true);

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

  useEffect(() => {
    const fetchDatos = async () => {
      if (!queryIdPaciente) {
        navigate('/preconsulta');
        return;
      }
      setCargandoPaciente(true);
      try {
        const data = await obtenerPaciente(Number(queryIdPaciente));
        setPaciente(data);
        await cargarUltimoSigno(Number(queryIdPaciente));
      } catch {
        setPaciente(null);
      } finally {
        setCargandoPaciente(false);
      }
    };
    fetchDatos();
  }, [queryIdPaciente, cargarUltimoSigno, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cálculo de IMC en tiempo real
  const imcInfo = useMemo(() => {
    return calcularIMC(formData.peso, formData.talla);
  }, [formData.peso, formData.talla, calcularIMC]);

  // Cálculo de edad
  const edadPaciente = useMemo(() => {
    if (!paciente?.fechaNacimiento) return null;
    const nacimiento = new Date(paciente.fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }, [paciente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paciente) return;

    const payload = {
      idPaciente: paciente.idPaciente,
      idCola: queryIdCola ? Number(queryIdCola) : null,
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
      alert('Signos vitales registrados correctamente. El paciente fue enviado a consulta médica.');
      navigate('/preconsulta');
    }
  };

  const handleCancelar = () => {
    navigate('/preconsulta');
  };

  const nombreCompleto = `${paciente?.nombres || ''} ${paciente?.apellidos || ''}`.trim();

  if (cargandoPaciente) {
    return (
      <div style={styles.page}>
        <AdminNavbar />
        <div style={styles.content}>
          <div style={styles.loadingBox}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#0077b6' }} />
            <p style={{ margin: '12px 0 0', color: '#0077b6', fontWeight: 600 }}>
              Cargando datos del paciente...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.content}>
        {/* Cabecera Odoo: USER.PNG | Paciente X */}
        <div style={styles.headerCard}>
          <div style={styles.headerLeft}>
            <div style={styles.avatarBox}>
              <img src={userImg} alt="Avatar Paciente" style={styles.avatarImg} />
            </div>

            <div style={styles.verticalDivider}>|</div>

            <div>
              <span style={styles.headerEyebrow}>REGISTRO DE SIGNOS VITALES</span>
              <h1 style={styles.headerTitle}>
                Paciente: {nombreCompleto || 'Desconocido'}
              </h1>
            </div>
          </div>

          <div style={styles.headerRight}>
            <button
              type="button"
              onClick={handleCancelar}
              style={styles.btnVolver}
              title="Volver a la lista de preconsulta"
            >
              <ArrowLeft size={16} />
              <span>Volver a la lista</span>
            </button>
          </div>
        </div>

        {hookError && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{hookError}</span>
          </div>
        )}

        {/* Ficha resumen del Paciente */}
        {paciente && (
          <section style={styles.patientSummaryCard}>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Documento / DNI</span>
                <span style={styles.summaryVal}>{paciente.numeroIdentificacion || 'Sin documento'}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Edad</span>
                <span style={styles.summaryVal}>
                  {edadPaciente !== null ? `${edadPaciente} años` : 'No especificada'}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Sexo</span>
                <span style={styles.summaryVal}>
                  {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Teléfono</span>
                <span style={styles.summaryVal}>{paciente.telefono || 'N/A'}</span>
              </div>
            </div>

            {paciente.alergiaIds && paciente.alergiaIds.length > 0 && (
              <div style={styles.alertAlergias}>
                <AlertTriangle size={16} color="#dc2626" />
                <span>
                  <strong>Atención:</strong> El paciente tiene registradas {paciente.alergiaIds.length} alergia(s).
                </span>
              </div>
            )}
          </section>
        )}

        {/* Formulario de Signos Vitales (Tabla signo_vital) */}
        <section style={styles.formCard}>
          <div style={styles.cardHeader}>
            <HeartPulse size={18} color="#0077b6" />
            <h2 style={styles.cardTitle}>Datos de Signos Vitales</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.vitalsGrid}>
              {/* Peso */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <span>Peso</span>
                  <span style={styles.unitTag}>kg</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="peso"
                  placeholder="Ej. 68.5"
                  value={formData.peso}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Talla */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <span>Talla</span>
                  <span style={styles.unitTag}>cm</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="talla"
                  placeholder="Ej. 170"
                  value={formData.talla}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* IMC Calculado */}
              <div style={styles.imcBox}>
                <div style={styles.imcHeader}>
                  <span style={styles.label}>IMC Estimado</span>
                  {imcInfo.imc && (
                    <span style={{ ...styles.imcBadge, backgroundColor: imcInfo.color }}>
                      {imcInfo.texto}
                    </span>
                  )}
                </div>
                <div style={styles.imcVal}>
                  {imcInfo.imc ? `${imcInfo.imc}` : '—'}
                </div>
              </div>

              {/* Presión Arterial */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <span>Presión Arterial</span>
                  <span style={styles.unitTag}>mmHg</span>
                </label>
                <input
                  type="text"
                  name="presionArterial"
                  placeholder="Ej. 120/80"
                  value={formData.presionArterial}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Frecuencia Cardíaca */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <span>Frecuencia Cardíaca</span>
                  <span style={styles.unitTag}>lpm</span>
                </label>
                <input
                  type="number"
                  name="frecuenciaCardiaca"
                  placeholder="Ej. 75"
                  value={formData.frecuenciaCardiaca}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Frecuencia Respiratoria */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <span>Frecuencia Respiratoria</span>
                  <span style={styles.unitTag}>rpm</span>
                </label>
                <input
                  type="number"
                  name="frecuenciaRespiratoria"
                  placeholder="Ej. 18"
                  value={formData.frecuenciaRespiratoria}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Temperatura */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <span>Temperatura</span>
                  <span style={styles.unitTag}>°C</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="temperatura"
                  placeholder="Ej. 36.5"
                  value={formData.temperatura}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Saturación SpO2 */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <span>Saturación SpO2</span>
                  <span style={styles.unitTag}>%</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="saturacionOxigeno"
                  placeholder="Ej. 98"
                  value={formData.saturacionOxigeno}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Glucosa */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <span>Glucosa / Glicemia</span>
                  <span style={styles.unitTag}>mg/dL</span>
                </label>
                <input
                  type="number"
                  step="1"
                  name="glicemia"
                  placeholder="Ej. 90"
                  value={formData.glicemia}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Acciones del Formulario */}
            <div style={styles.footerActions}>
              <button
                type="button"
                onClick={handleCancelar}
                style={styles.btnCancelar}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardando}
                style={styles.btnGuardar}
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
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  loadingBox: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '60px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  headerCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px 24px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  avatarBox: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#caf0f8',
    border: '2px solid #90e0ef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  verticalDivider: {
    color: '#cbd5e1',
    fontSize: '28px',
    fontWeight: '300',
    lineHeight: 1,
  },
  headerEyebrow: {
    color: '#0077b6',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '3px',
  },
  headerTitle: {
    color: '#03045e',
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  btnVolver: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fee2e2',
    color: '#991b1b',
    padding: '14px 18px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #fecaca',
  },
  patientSummaryCard: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '18px 24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#03045e',
  },
  alertAlergias: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    color: '#be123c',
    padding: '8px 14px',
    borderRadius: '6px',
    marginTop: '14px',
    fontSize: '13px',
  },
  formCard: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px',
    marginBottom: '22px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#03045e',
  },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  unitTag: {
    fontSize: '11px',
    color: '#0077b6',
    background: '#e0f2fe',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '7px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#03045e',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  imcBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imcHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imcBadge: {
    color: 'white',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  imcVal: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#03045e',
    marginTop: '6px',
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  btnCancelar: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '11px 22px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnGuardar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '11px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0, 119, 182, 0.25)',
    transition: 'all 0.2s',
  },
};
