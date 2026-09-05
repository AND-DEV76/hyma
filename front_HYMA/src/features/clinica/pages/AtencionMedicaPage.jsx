import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Trash2,
  X,
  Plus,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Activity,
  FileText,
  Stethoscope,
  Pill,
  Search,
  User,
  HeartPulse,
} from 'lucide-react';
import { useClinica } from '../hooks/useClinica';
import * as clinicaService from '../services/clinicaService';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import userImg from '../../../assets/images/user.png';

export default function AtencionMedicaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idPaciente = searchParams.get('idPaciente');
  const idCola = searchParams.get('idCola');

  const { finalizarAtencion, guardando, error: hookError } = useClinica();

  const [pacienteData, setPacienteData] = useState(null);
  const [loadingDatos, setLoadingDatos] = useState(true);

  // Section B
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [historiaEnfermedad, setHistoriaEnfermedad] = useState('');
  const [impresionClinica, setImpresionClinica] = useState('');
  const [planMedico, setPlanMedico] = useState('');

  // Section C
  const [examenFisico, setExamenFisico] = useState({
    piel: '',
    conciencia: '',
    cardiopulmonar: '',
    abdomen: '',
    soma: '',
  });

  // Section D
  const [diagnosticos, setDiagnosticos] = useState([]); // { codigoCie10, descripcion }
  const [searchDiag, setSearchDiag] = useState('');
  const [diagResults, setDiagResults] = useState([]);

  // Section E
  const [observacionesTratamiento, setObservacionesTratamiento] = useState('');
  const [detallesTratamiento, setDetallesTratamiento] = useState([]);
  // { idMedicamento, nombreMedicamento, dosis, frecuencia, duracion, cantidad }

  const [searchMed, setSearchMed] = useState('');
  const [medResults, setMedResults] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const data = await clinicaService.obtenerPacienteConsulta(idPaciente, idCola);
        setPacienteData(data);
      } catch (err) {
        console.error('Error fetching paciente data', err);
      } finally {
        setLoadingDatos(false);
      }
    };
    if (idPaciente) fetchDatos();
  }, [idPaciente, idCola]);

  const handleSearchDiag = async (e) => {
    const val = e.target.value;
    setSearchDiag(val);
    if (val.length > 2) {
      const res = await clinicaService.buscarDiagnosticosCie10(val);
      setDiagResults(res);
    } else {
      setDiagResults([]);
    }
  };

  const addDiagnostico = (d) => {
    if (!diagnosticos.find((x) => x.codigoCie10 === d.codigo)) {
      setDiagnosticos([
        ...diagnosticos,
        { codigoCie10: d.codigo, descripcion: d.descripcion },
      ]);
    }
    setSearchDiag('');
    setDiagResults([]);
  };

  const removeDiagnostico = (codigo) => {
    setDiagnosticos(diagnosticos.filter((d) => d.codigoCie10 !== codigo));
  };

  const handleSearchMed = async (e) => {
    const val = e.target.value;
    setSearchMed(val);
    if (val.length > 2) {
      const res = await clinicaService.buscarMedicamentos(val);
      setMedResults(res);
    } else {
      setMedResults([]);
    }
  };

  const addDetalleTratamiento = (med) => {
    if (!detallesTratamiento.find((x) => x.idMedicamento === med.idMedicamento)) {
      setDetallesTratamiento([
        ...detallesTratamiento,
        {
          idMedicamento: med.idMedicamento,
          nombreMedicamento: med.nombre,
          dosis: '',
          frecuencia: '',
          duracion: '',
          cantidad: 1,
        },
      ]);
    }
    setSearchMed('');
    setMedResults([]);
  };

  const updateDetalle = (idMed, field, val) => {
    setDetallesTratamiento(
      detallesTratamiento.map((dt) =>
        dt.idMedicamento === idMed ? { ...dt, [field]: val } : dt
      )
    );
  };

  const removeDetalle = (idMed) => {
    setDetallesTratamiento(
      detallesTratamiento.filter((dt) => dt.idMedicamento !== idMed)
    );
  };

  const handleSubmit = async () => {
    const payload = {
      idPaciente: Number(idPaciente),
      idCola: Number(idCola),
      idSignoVital: pacienteData?.ultimoSignoVital?.idSignoVital,
      motivoConsulta,
      historiaEnfermedadActual: historiaEnfermedad,
      impresionClinica,
      planMedico,
      examenFisico: { ...examenFisico },
      diagnosticos,
      tratamiento: {
        observaciones: observacionesTratamiento,
        detalles: detallesTratamiento.map((dt) => ({
          idMedicamento: dt.idMedicamento,
          dosis: dt.dosis,
          frecuencia: dt.frecuencia,
          duracion: dt.duracion,
          cantidad: Number(dt.cantidad),
        })),
      },
    };

    const res = await finalizarAtencion(payload);
    if (res.success) {
      alert('Consulta finalizada correctamente');
      navigate('/clinica');
    }
  };

  if (loadingDatos) {
    return (
      <div style={styles.page}>
        <AdminNavbar />
        <div style={styles.content}>
          <div style={styles.loadingBox}>
            <p style={{ margin: 0, color: '#0077b6', fontWeight: 600 }}>
              Cargando información del paciente...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const nombreCompleto = `${pacienteData?.paciente?.nombres || ''} ${
    pacienteData?.paciente?.apellidos || ''
  }`.trim();

  return (
    <div style={styles.page}>
      <AdminNavbar />
      <main style={styles.content}>
        {/* Odoo Header Card: USER.PNG | Paciente X */}
        <div style={styles.odooHeaderCard}>
          <div style={styles.headerLeft}>
            <div style={styles.avatarContainer}>
              <img src={userImg} alt="Avatar Paciente" style={styles.avatarImg} />
            </div>

            <div style={styles.verticalDivider}>|</div>

            <div>
              <span style={styles.headerEyebrow}>ATENCIÓN MÉDICA EN CONSULTA</span>
              <h1 style={styles.headerTitle}>
                Paciente: {nombreCompleto || 'Desconocido'}
              </h1>
            </div>
          </div>

          <div style={styles.headerRight}>
            <button
              type="button"
              onClick={() => navigate('/clinica')}
              style={styles.btnVolver}
              title="Volver a la cola"
            >
              <ArrowLeft size={16} />
              <span>Volver a la cola</span>
            </button>
          </div>
        </div>

        {hookError && (
          <div style={styles.errorAlert}>
            <AlertTriangle size={18} />
            <span>{hookError}</span>
          </div>
        )}

        {/* Section A: Datos del Paciente y Signos Vitales */}
        <section style={styles.cardSection}>
          <div style={styles.cardHeader}>
            <User size={18} color="#0077b6" />
            <h2 style={styles.cardTitle}>Datos del Paciente</h2>
          </div>

          <div style={styles.patientGrid}>
            <div style={styles.patientDetailBox}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Nombre Completo:</span>
                <span style={styles.infoValue}>{nombreCompleto}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Antecedentes Patológicos:</span>
                <span style={styles.infoValue}>
                  {pacienteData?.paciente?.antecedentesPersonalesPatologicos || 'Sin registrar / Ninguno'}
                </span>
              </div>
            </div>

            {pacienteData?.ultimoSignoVital ? (
              <div style={styles.vitalsBox}>
                <div style={styles.vitalsHeader}>
                  <HeartPulse size={16} color="#0077b6" />
                  <span style={styles.vitalsTitle}>Últimos Signos Vitales</span>
                </div>
                <div style={styles.vitalsGrid}>
                  <div style={styles.vitalItem}>
                    <span style={styles.vitalLabel}>Presión Art.</span>
                    <span style={styles.vitalVal}>
                      {pacienteData.ultimoSignoVital.presionArterial || '--'}
                    </span>
                  </div>
                  <div style={styles.vitalItem}>
                    <span style={styles.vitalLabel}>Frec. Cardíaca</span>
                    <span style={styles.vitalVal}>
                      {pacienteData.ultimoSignoVital.frecuenciaCardiaca || '--'} lpm
                    </span>
                  </div>
                  <div style={styles.vitalItem}>
                    <span style={styles.vitalLabel}>Temperatura</span>
                    <span style={styles.vitalVal}>
                      {pacienteData.ultimoSignoVital.temperatura || '--'} °C
                    </span>
                  </div>
                  <div style={styles.vitalItem}>
                    <span style={styles.vitalLabel}>Peso</span>
                    <span style={styles.vitalVal}>
                      {pacienteData.ultimoSignoVital.peso || '--'} kg
                    </span>
                  </div>
                  <div style={styles.vitalItem}>
                    <span style={styles.vitalLabel}>Sat. O2</span>
                    <span style={styles.vitalVal}>
                      {pacienteData.ultimoSignoVital.saturacionOxigeno || '--'} %
                    </span>
                  </div>
                  <div style={styles.vitalItem}>
                    <span style={styles.vitalLabel}>IMC</span>
                    <span style={styles.vitalVal}>
                      {pacienteData.ultimoSignoVital.imc || '--'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.noVitalsBox}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>
                  Sin signos vitales registrados en preconsulta.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Section B: Consulta */}
        <section style={styles.cardSection}>
          <div style={styles.cardHeader}>
            <FileText size={18} color="#0077b6" />
            <h2 style={styles.cardTitle}>Evolución y Motivo de Consulta</h2>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Motivo de Consulta</label>
              <textarea
                placeholder="Describa el motivo de la consulta..."
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Historia de la Enfermedad Actual</label>
              <textarea
                placeholder="Describa cronología, síntomas y evolución..."
                value={historiaEnfermedad}
                onChange={(e) => setHistoriaEnfermedad(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Impresión Clínica</label>
              <textarea
                placeholder="Conclusiones diagnósticas preliminares..."
                value={impresionClinica}
                onChange={(e) => setImpresionClinica(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Plan Médico</label>
              <textarea
                placeholder="Plan terapéutico, estudios solicitados, recomendaciones..."
                value={planMedico}
                onChange={(e) => setPlanMedico(e.target.value)}
                style={styles.textarea}
              />
            </div>
          </div>
        </section>

        {/* Section C: Examen Físico */}
        <section style={styles.cardSection}>
          <div style={styles.cardHeader}>
            <Activity size={18} color="#0077b6" />
            <h2 style={styles.cardTitle}>Examen Físico</h2>
          </div>

          <div style={styles.twoColGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Piel y Faneras</label>
              <input
                placeholder="Ej: Normocoloreada, hidratada..."
                value={examenFisico.piel}
                onChange={(e) =>
                  setExamenFisico({ ...examenFisico, piel: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Estado de Conciencia</label>
              <input
                placeholder="Ej: Consciente, lúcido, orientado..."
                value={examenFisico.conciencia}
                onChange={(e) =>
                  setExamenFisico({ ...examenFisico, conciencia: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Cardiopulmonar</label>
              <input
                placeholder="Ej: Ruidos rítmicos, murmullo vesicular conservado..."
                value={examenFisico.cardiopulmonar}
                onChange={(e) =>
                  setExamenFisico({
                    ...examenFisico,
                    cardiopulmonar: e.target.value,
                  })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Abdomen</label>
              <input
                placeholder="Ej: Blando, depresible, no doloroso..."
                value={examenFisico.abdomen}
                onChange={(e) =>
                  setExamenFisico({ ...examenFisico, abdomen: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>SOMA (Sistema Osteomioarticular)</label>
              <input
                placeholder="Ej: Movilidad articular conservada, sin deformidades..."
                value={examenFisico.soma}
                onChange={(e) =>
                  setExamenFisico({ ...examenFisico, soma: e.target.value })
                }
                style={styles.input}
              />
            </div>
          </div>
        </section>

        {/* Section D: Diagnósticos CIE-10 */}
        <section style={styles.cardSection}>
          <div style={styles.cardHeader}>
            <Stethoscope size={18} color="#0077b6" />
            <h2 style={styles.cardTitle}>Diagnósticos (CIE-10)</h2>
          </div>

          <div style={styles.searchContainer}>
            <div style={styles.searchInputWrapper}>
              <Search size={16} color="#64748b" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Escriba código CIE-10 o nombre del diagnóstico..."
                value={searchDiag}
                onChange={handleSearchDiag}
                style={styles.searchInput}
              />
            </div>

            {diagResults.length > 0 && (
              <ul style={styles.autocompleteList}>
                {diagResults.map((d) => (
                  <li
                    key={d.idCie10 || d.codigo}
                    onClick={() => addDiagnostico(d)}
                    style={styles.autocompleteItem}
                  >
                    <span style={styles.codePill}>{d.codigo}</span>
                    <span style={{ color: '#03045e' }}>{d.descripcion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {diagnosticos.length > 0 ? (
            <div style={styles.tagGrid}>
              {diagnosticos.map((d) => (
                <div key={d.codigoCie10} style={styles.diagBadge}>
                  <span style={styles.diagCode}>{d.codigoCie10}</span>
                  <span style={styles.diagDesc}>{d.descripcion}</span>
                  <button
                    type="button"
                    onClick={() => removeDiagnostico(d.codigoCie10)}
                    style={styles.btnRemoveTag}
                    title="Eliminar diagnóstico"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyHint}>
              No ha agregado ningún diagnóstico para esta consulta.
            </p>
          )}
        </section>

        {/* Section E: Tratamiento y Receta */}
        <section style={styles.cardSection}>
          <div style={styles.cardHeader}>
            <Pill size={18} color="#0077b6" />
            <h2 style={styles.cardTitle}>Tratamiento y Receta Médica</h2>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Observaciones Generales de Tratamiento</label>
            <textarea
              placeholder="Indicaciones generales, dieta, reposo, advertencias..."
              value={observacionesTratamiento}
              onChange={(e) => setObservacionesTratamiento(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={{ ...styles.searchContainer, marginTop: '16px' }}>
            <label style={styles.label}>Agregar Medicamento</label>
            <div style={styles.searchInputWrapper}>
              <Search size={16} color="#64748b" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar medicamento en inventario de farmacia..."
                value={searchMed}
                onChange={handleSearchMed}
                style={styles.searchInput}
              />
            </div>

            {medResults.length > 0 && (
              <ul style={styles.autocompleteList}>
                {medResults.map((m) => (
                  <li
                    key={m.idMedicamento}
                    onClick={() => addDetalleTratamiento(m)}
                    style={styles.autocompleteItem}
                  >
                    <span style={{ fontWeight: '600', color: '#03045e' }}>
                      {m.nombre}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>
                      ({m.presentacion || ''} {m.concentracion || ''})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {detallesTratamiento.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Medicamento</th>
                    <th style={styles.th}>Dosis</th>
                    <th style={styles.th}>Frecuencia</th>
                    <th style={styles.th}>Duración</th>
                    <th style={{ ...styles.th, width: '100px' }}>Cantidad</th>
                    <th style={{ ...styles.th, width: '90px', textAlign: 'center' }}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detallesTratamiento.map((dt) => (
                    <tr key={dt.idMedicamento} style={styles.tr}>
                      <td style={styles.td}>
                        <strong style={{ color: '#03045e' }}>
                          {dt.nombreMedicamento}
                        </strong>
                      </td>
                      <td style={styles.td}>
                        <input
                          placeholder="Ej: 500mg"
                          value={dt.dosis}
                          onChange={(e) =>
                            updateDetalle(dt.idMedicamento, 'dosis', e.target.value)
                          }
                          style={styles.tableInput}
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          placeholder="Ej: Cada 8 hrs"
                          value={dt.frecuencia}
                          onChange={(e) =>
                            updateDetalle(
                              dt.idMedicamento,
                              'frecuencia',
                              e.target.value
                            )
                          }
                          style={styles.tableInput}
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          placeholder="Ej: 5 días"
                          value={dt.duracion}
                          onChange={(e) =>
                            updateDetalle(dt.idMedicamento, 'duracion', e.target.value)
                          }
                          style={styles.tableInput}
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          min="1"
                          value={dt.cantidad}
                          onChange={(e) =>
                            updateDetalle(dt.idMedicamento, 'cantidad', e.target.value)
                          }
                          style={{ ...styles.tableInput, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeDetalle(dt.idMedicamento)}
                          style={styles.btnTableDelete}
                          title="Eliminar medicamento"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={styles.emptyHint}>
              No se han agregado medicamentos a la receta médica.
            </p>
          )}
        </section>

        {/* Actions Footer */}
        <div style={styles.footerBar}>
          <button
            type="button"
            onClick={() => navigate('/clinica')}
            style={styles.btnCancelFooter}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={guardando}
            style={styles.btnPrimaryFooter}
          >
            <CheckCircle2 size={18} />
            <span>{guardando ? 'Guardando consulta...' : 'Finalizar Consulta'}</span>
          </button>
        </div>
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
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  odooHeaderCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px 24px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  avatarContainer: {
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
  loadingBox: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '40px',
    textAlign: 'center',
  },
  cardSection: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px',
    marginBottom: '18px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#03045e',
  },
  patientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  patientDetailBox: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#03045e',
  },
  vitalsBox: {
    background: '#f0f9ff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #bae6fd',
  },
  noVitalsBox: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  vitalsTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0077b6',
    textTransform: 'uppercase',
  },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  vitalItem: {
    background: 'white',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #e0f2fe',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  vitalLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  vitalVal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#03045e',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  twoColGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
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
  textarea: {
    padding: '10px 14px',
    borderRadius: '7px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#03045e',
    minHeight: '75px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '16px',
  },
  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 38px',
    borderRadius: '7px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#03045e',
    outline: 'none',
  },
  autocompleteList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 20,
    maxHeight: '200px',
    overflowY: 'auto',
    margin: '4px 0 0',
    padding: '6px 0',
    listStyle: 'none',
  },
  autocompleteItem: {
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  codePill: {
    background: '#caf0f8',
    color: '#0077b6',
    fontWeight: '700',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  diagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
  },
  diagCode: {
    background: '#0077b6',
    color: 'white',
    fontWeight: '700',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  diagDesc: {
    color: '#03045e',
    fontWeight: '500',
  },
  btnRemoveTag: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginTop: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    textAlign: 'left',
  },
  th: {
    background: '#f8fafc',
    color: '#475569',
    fontWeight: '600',
    padding: '12px 14px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '13px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '10px 14px',
    verticalAlign: 'middle',
  },
  tableInput: {
    width: '100%',
    padding: '7px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#03045e',
    outline: 'none',
  },
  btnTableDelete: {
    background: '#fff5f5',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: {
    color: '#94a3b8',
    fontSize: '13px',
    fontStyle: 'italic',
    margin: '8px 0 0',
  },
  footerBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 0 30px',
  },
  btnCancelFooter: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '11px 22px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnPrimaryFooter: {
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
  },
};
