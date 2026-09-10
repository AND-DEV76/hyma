import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Trash2,
  X,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Activity,
  FileText,
  Stethoscope,
  Pill,
  Search,
  User,
  HeartPulse,
  Save,
} from 'lucide-react';
import { useClinica } from '../hooks/useClinica';
import * as clinicaService from '../services/clinicaService';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import userImg from '../../../assets/images/user.png';

const PASOS = [
  { id: 1, label: 'Paciente & Signos', icon: User },
  { id: 2, label: 'Consulta & Evolución', icon: FileText },
  { id: 3, label: 'Examen Físico', icon: Activity },
  { id: 4, label: 'Diagnósticos CIE-10', icon: Stethoscope },
  { id: 5, label: 'Receta & Tratamiento', icon: Pill },
];

const calcularCantidadReceta = ({
  frecuencia = '',
  duracion = '',
  presentacion = '',
  concentracion = '',
  tomaDosis = '',
}) => {
  // 1. Extraer duración en días
  const durStr = (duracion || '').toString().toLowerCase().trim();
  let dias = 0;

  if (durStr.includes('semana')) {
    const m = durStr.match(/(\d+(?:\.\d+)?)/);
    dias = m ? Math.round(parseFloat(m[1]) * 7) : 7;
  } else if (durStr.includes('mes')) {
    const m = durStr.match(/(\d+(?:\.\d+)?)/);
    dias = m ? Math.round(parseFloat(m[1]) * 30) : 30;
  } else {
    const m = durStr.match(/(\d+(?:\.\d+)?)/);
    dias = m ? Math.round(parseFloat(m[1])) : 0;
  }

  // 2. Extraer frecuencia (horas de intervalo o tomas al día)
  const frecStr = (frecuencia || '').toString().toLowerCase().trim();
  let tomasAlDia = 0;

  if (
    frecStr.includes('1 vez') ||
    frecStr.includes('una vez') ||
    frecStr === '24' ||
    frecStr.includes('24h') ||
    frecStr.includes('24 h') ||
    frecStr.includes('cada 24')
  ) {
    tomasAlDia = 1;
  } else if (
    frecStr.includes('2 veces') ||
    frecStr === '12' ||
    frecStr.includes('12h') ||
    frecStr.includes('12 h') ||
    frecStr.includes('cada 12')
  ) {
    tomasAlDia = 2;
  } else if (
    frecStr.includes('3 veces') ||
    frecStr === '8' ||
    frecStr.includes('8h') ||
    frecStr.includes('8 h') ||
    frecStr.includes('cada 8')
  ) {
    tomasAlDia = 3;
  } else if (
    frecStr.includes('4 veces') ||
    frecStr === '6' ||
    frecStr.includes('6h') ||
    frecStr.includes('6 h') ||
    frecStr.includes('cada 6')
  ) {
    tomasAlDia = 4;
  } else {
    const m =
      frecStr.match(/(?:cada\s*|c\/)?(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hora|horas)/) ||
      frecStr.match(/(\d+(?:\.\d+)?)/);
    if (m) {
      const horas = parseFloat(m[1]);
      if (horas > 0) {
        tomasAlDia = 24 / horas;
      }
    }
  }

  if (dias <= 0 || tomasAlDia <= 0) {
    return { cantidad: 1, explicacion: '' };
  }

  const totalTomas = dias * tomasAlDia;

  // 3. Detectar si es líquido (Jarabe / Suspensión / Solución / Gotas)
  const presNorm = (presentacion || '').toLowerCase();
  const concNorm = (concentracion || '').toLowerCase();
  const esLiquido =
    /jarabe|suspensi[oó]n|soluci[oó]n|elixir|gotas|frasco|l[ií]quid/i.test(presNorm) ||
    /jarabe|suspensi[oó]n|soluci[oó]n/i.test(concNorm);

  if (esLiquido) {
    if (/gotas/i.test(presNorm) || /gotas/i.test(concNorm)) {
      const frascos = Math.max(1, Math.ceil(totalTomas / 60));
      return {
        cantidad: frascos,
        explicacion: `Sugerido: ${Math.round(totalTomas)} aplicaciones (${frascos} ${frascos > 1 ? 'frascos' : 'frasco'})`,
        esLiquido: true,
      };
    }

    // Volumen por toma (ej. 5ml cucharadita, 10ml cucharada, 15ml)
    let mlPorToma = 5;
    if (tomaDosis) {
      const tMatch = tomaDosis.toString().match(/(\d+(?:\.\d+)?)/);
      if (tMatch) mlPorToma = parseFloat(tMatch[1]);
    } else if (frecStr.includes('cucharada') || frecStr.includes('10ml')) {
      mlPorToma = 10;
    } else if (frecStr.includes('cucharadita') || frecStr.includes('5ml')) {
      mlPorToma = 5;
    }

    // Tamaño del frasco (buscar en concentración o presentación: ej "120 ml", "100ml", "60 ml")
    let tamanoFrasco = 120;
    const matchTamano = (concNorm + ' ' + presNorm).match(/(\d{2,4})\s*ml\b/);
    if (matchTamano) {
      const vol = parseFloat(matchTamano[1]);
      if (vol >= 30) {
        tamanoFrasco = vol;
      }
    }

    const totalMl = totalTomas * mlPorToma;
    const frascos = Math.max(1, Math.ceil(totalMl / tamanoFrasco));
    const tomasTxt = totalTomas % 1 === 0 ? totalTomas : totalTomas.toFixed(1);
    const nombreCuchara =
      mlPorToma === 5
        ? '1 cucharadita (5ml)'
        : mlPorToma === 10
        ? '1 cucharada (10ml)'
        : mlPorToma === 15
        ? '1 cda sopera (15ml)'
        : `${mlPorToma}ml`;
    const explicacion = `Sugerido: ${tomasTxt} tomas de ${nombreCuchara} (${Math.round(totalMl)}ml = ${frascos} ${frascos > 1 ? 'frascos' : 'frasco'} de ${tamanoFrasco}ml)`;

    return {
      cantidad: frascos,
      explicacion,
      esLiquido: true,
      mlPorToma,
      tamanoFrasco,
    };
  }

  // Medicamento sólido (Tabletas, Cápsulas, etc.)
  let unidadesPorToma = 1;
  if (tomaDosis) {
    const uMatch = tomaDosis.toString().match(/(\d+(?:\.\d+)?)/);
    if (uMatch) unidadesPorToma = parseFloat(uMatch[1]);
  }
  const cantidadSolido = Math.max(1, Math.ceil(totalTomas * unidadesPorToma));
  const tomasTxt = tomasAlDia % 1 === 0 ? tomasAlDia : tomasAlDia.toFixed(1);
  const explicacion = `Sugerido: ${dias} días × ${tomasTxt} al día = ${cantidadSolido} unidades`;

  return {
    cantidad: cantidadSolido,
    explicacion,
    esLiquido: false,
  };
};

export default function AtencionMedicaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idPaciente = searchParams.get('idPaciente');
  const idCola = searchParams.get('idCola');

  const { finalizarAtencion, guardando, error: hookError } = useClinica();

  const [pacienteData, setPacienteData] = useState(null);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [pasoActual, setPasoActual] = useState(1);

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
      const presNorm = (med.presentacion || '').toLowerCase();
      const concNorm = (med.concentracion || '').toLowerCase();
      const esLiquido =
        /jarabe|suspensi[oó]n|soluci[oó]n|elixir|gotas|frasco|l[ií]quid/i.test(presNorm) ||
        /jarabe|suspensi[oó]n|soluci[oó]n/i.test(concNorm);

      const nuevoDetalle = {
        idMedicamento: med.idMedicamento,
        nombreMedicamento: med.nombre,
        presentacion: med.presentacion || '',
        concentracion: med.concentracion || '',
        unidades: med.unidades ?? null,
        frecuencia: 'Cada 8 hrs',
        duracion: '5 días',
        esLiquido,
        tomaDosis: esLiquido ? '5ml' : '1',
        cantidad: 1,
        explicacion: '',
      };

      const calc = calcularCantidadReceta(nuevoDetalle);
      nuevoDetalle.cantidad = calc.cantidad;
      nuevoDetalle.explicacion = calc.explicacion;

      setDetallesTratamiento([...detallesTratamiento, nuevoDetalle]);
    }
    setSearchMed('');
    setMedResults([]);
  };

  const updateDetalle = (idMed, field, val) => {
    setDetallesTratamiento(
      detallesTratamiento.map((dt) => {
        if (dt.idMedicamento !== idMed) return dt;
        const updated = { ...dt, [field]: val };
        if (field === 'frecuencia' || field === 'duracion' || field === 'tomaDosis') {
          const calc = calcularCantidadReceta(updated);
          updated.cantidad = calc.cantidad;
          updated.explicacion = calc.explicacion;
        }
        return updated;
      })
    );
  };

  const removeDetalle = (idMed) => {
    setDetallesTratamiento(
      detallesTratamiento.filter((dt) => dt.idMedicamento !== idMed)
    );
  };

  const handleSubmit = async () => {
    if (!diagnosticos || diagnosticos.length === 0) {
      alert('Debe agregar al menos un diagnóstico (CIE-10) antes de finalizar la consulta médica.');
      setPasoActual(4);
      return;
    }

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
        detalles: detallesTratamiento.map((dt) => {
          const dosisDesc =
            [dt.presentacion, dt.concentracion].filter(Boolean).join(' - ') || 'Según indicación';
          return {
            idMedicamento: dt.idMedicamento,
            dosis: dosisDesc,
            frecuencia: dt.frecuencia || 'Según indicación',
            duracion: dt.duracion || 'Según evolución',
            cantidad: Number(dt.cantidad) > 0 ? Number(dt.cantidad) : 1,
          };
        }),
      },
    };

    const res = await finalizarAtencion(payload);
    if (res.success) {
      alert('Consulta finalizada correctamente. El paciente ha sido enviado a Farmacia.');
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
        {/* Header Odoo: USER.PNG | Paciente X */}
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
            <span style={styles.stepCounterBadge}>
              Paso {pasoActual} de {PASOS.length}
            </span>
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

        {/* Wizard / Stepper Navigation Bar */}
        <nav style={styles.stepperNav}>
          {PASOS.map((paso) => {
            const Icon = paso.icon;
            const isActivo = pasoActual === paso.id;
            const isCompletado = pasoActual > paso.id;

            return (
              <button
                key={paso.id}
                type="button"
                onClick={() => setPasoActual(paso.id)}
                style={{
                  ...styles.stepTab,
                  ...(isActivo
                    ? styles.stepTabActive
                    : isCompletado
                    ? styles.stepTabCompleted
                    : styles.stepTabInactive),
                }}
              >
                <div
                  style={{
                    ...styles.stepNumberBadge,
                    ...(isActivo
                      ? styles.stepNumberActive
                      : isCompletado
                      ? styles.stepNumberCompleted
                      : styles.stepNumberInactive),
                  }}
                >
                  {isCompletado ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <span>{paso.id}</span>
                  )}
                </div>
                <Icon size={16} />
                <span style={styles.stepTabLabel}>{paso.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Wizard Step Content Container */}
        <div style={styles.wizardCard}>
          {/* PASO 1: Datos del Paciente y Signos Vitales */}
          {pasoActual === 1 && (
            <div style={styles.stepContentFade}>
              <div style={styles.stepTitleBar}>
                <div style={styles.stepIconWrap}>
                  <User size={20} color="#0077b6" />
                </div>
                <div>
                  <h2 style={styles.stepHeading}>Datos del Paciente y Signos Vitales</h2>
                  <p style={styles.stepSubheading}>
                    Información de identificación y constantes vitales registradas en preconsulta.
                  </p>
                </div>
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
                      <span style={styles.vitalsTitle}>Signos Vitales de Preconsulta</span>
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
            </div>
          )}

          {/* PASO 2: Evolución y Consulta */}
          {pasoActual === 2 && (
            <div style={styles.stepContentFade}>
              <div style={styles.stepTitleBar}>
                <div style={styles.stepIconWrap}>
                  <FileText size={20} color="#0077b6" />
                </div>
                <div>
                  <h2 style={styles.stepHeading}>Evolución y Motivo de Consulta</h2>
                  <p style={styles.stepSubheading}>
                    Registre los antecedentes de la consulta actual, sintomatología y plan terapéutico.
                  </p>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Motivo de Consulta</label>
                  <textarea
                    placeholder="Describa el motivo principal de la consulta médica..."
                    value={motivoConsulta}
                    onChange={(e) => setMotivoConsulta(e.target.value)}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Historia de la Enfermedad Actual</label>
                  <textarea
                    placeholder="Cronología, evolución de síntomas, tratamientos previos..."
                    value={historiaEnfermedad}
                    onChange={(e) => setHistoriaEnfermedad(e.target.value)}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.twoColGrid}>
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
                      placeholder="Plan de acción, estudios complementarios, cuidados..."
                      value={planMedico}
                      onChange={(e) => setPlanMedico(e.target.value)}
                      style={styles.textarea}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Examen Físico */}
          {pasoActual === 3 && (
            <div style={styles.stepContentFade}>
              <div style={styles.stepTitleBar}>
                <div style={styles.stepIconWrap}>
                  <Activity size={20} color="#0077b6" />
                </div>
                <div>
                  <h2 style={styles.stepHeading}>Examen Físico Segmentario</h2>
                  <p style={styles.stepSubheading}>
                    Evaluación clínica por sistemas del paciente.
                  </p>
                </div>
              </div>

              <div style={styles.twoColGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Piel y Faneras</label>
                  <input
                    placeholder="Ej: Normocoloreada, hidratada, elástica..."
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
                    placeholder="Ej: Consciente, orientado en tiempo, espacio y persona..."
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
                    placeholder="Ej: Ruidos cardíacos rítmicos, murmullo vesicular normal..."
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
                    placeholder="Ej: Blando, depresible, no doloroso a la palpación..."
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
                    placeholder="Ej: Movilidad articular conservada, tono y fuerza muscular simétricos..."
                    value={examenFisico.soma}
                    onChange={(e) =>
                      setExamenFisico({ ...examenFisico, soma: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: Diagnósticos CIE-10 */}
          {pasoActual === 4 && (
            <div style={styles.stepContentFade}>
              <div style={styles.stepTitleBar}>
                <div style={styles.stepIconWrap}>
                  <Stethoscope size={20} color="#0077b6" />
                </div>
                <div>
                  <h2 style={styles.stepHeading}>Diagnósticos Clínicos (CIE-10)</h2>
                  <p style={styles.stepSubheading}>
                    Búsqueda y codificación internacional de diagnósticos.
                  </p>
                </div>
              </div>

              <div style={styles.searchContainer}>
                <div style={styles.searchInputWrapper}>
                  <Search size={16} color="#64748b" style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Escriba código CIE-10 o nombre de la patología..."
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
                        <span style={{ color: '#03045e', fontWeight: '500' }}>
                          {d.descripcion}
                        </span>
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
                <div style={styles.emptyDiagBox}>
                  <Stethoscope size={32} color="#94a3b8" />
                  <p style={styles.emptyHint}>
                    Aún no ha seleccionado ningún diagnóstico CIE-10 para esta consulta.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASO 5: Tratamiento y Receta */}
          {pasoActual === 5 && (
            <div style={styles.stepContentFade}>
              <div style={styles.stepTitleBar}>
                <div style={styles.stepIconWrap}>
                  <Pill size={20} color="#0077b6" />
                </div>
                <div>
                  <h2 style={styles.stepHeading}>Tratamiento y Receta para Farmacia</h2>
                  <p style={styles.stepSubheading}>
                    Prescripción médica que será derivada automáticamente a la Farmacia.
                  </p>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Indicaciones Generales de Tratamiento</label>
                <textarea
                  placeholder="Instrucciones generales de cuidado, régimen de alimentación, reposo, advertencias..."
                  value={observacionesTratamiento}
                  onChange={(e) => setObservacionesTratamiento(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <div style={{ ...styles.searchContainer, marginTop: '20px' }}>
                <label style={styles.label}>Agregar Medicamento a la Receta</label>
                <div style={styles.searchInputWrapper}>
                  <Search size={16} color="#64748b" style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar medicamento en el catálogo de farmacia..."
                    value={searchMed}
                    onChange={handleSearchMed}
                    style={styles.searchInput}
                  />
                </div>

                {medResults.length > 0 && (
                  <ul style={styles.autocompleteList}>
                    {medResults.map((m) => {
                      const sinStock = m.unidades !== null && m.unidades !== undefined && m.unidades <= 0;
                      return (
                        <li
                          key={m.idMedicamento}
                          onClick={() => addDetalleTratamiento(m)}
                          style={styles.autocompleteItem}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '600', color: '#03045e' }}>
                                {m.nombre}
                              </span>
                              <span style={{ color: '#64748b', fontSize: '13px' }}>
                                ({m.presentacion || 'General'} {m.concentracion || ''})
                              </span>
                            </div>
                            {sinStock && (
                              <span style={styles.noStockPill}>
                                Agotado en farmacia - No hacer receta
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {detallesTratamiento.length > 0 ? (
                <div style={styles.tableContainer}>
                  <datalist id="frecuencia-options">
                    <option value="Cada 4 hrs" label="Cada 4 horas (6 al día)" />
                    <option value="Cada 5 hrs" label="Cada 5 horas (4.8 al día)" />
                    <option value="Cada 6 hrs" label="Cada 6 horas (4 al día)" />
                    <option value="Cada 8 hrs" label="Cada 8 horas (3 al día)" />
                    <option value="Cada 12 hrs" label="Cada 12 horas (2 al día)" />
                    <option value="Cada 24 hrs" label="Cada 24 horas (1 al día)" />
                  </datalist>

                  <datalist id="duracion-options">
                    <option value="3 días" />
                    <option value="5 días" />
                    <option value="7 días" />
                    <option value="8 días" />
                    <option value="10 días" />
                    <option value="14 días" />
                    <option value="30 días" />
                  </datalist>

                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.th, width: '28%' }}>Medicamento</th>
                        <th style={{ ...styles.th, width: '20%' }}>Presentación / Conc.</th>
                        <th style={{ ...styles.th, width: '18%' }}>Frecuencia</th>
                        <th style={{ ...styles.th, width: '14%' }}>Duración</th>
                        <th style={{ ...styles.th, width: '16%' }}>Cantidad Recetada</th>
                        <th style={{ ...styles.th, width: '4%', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {detallesTratamiento.map((dt) => {
                        const sinStock = dt.unidades !== null && dt.unidades !== undefined && dt.unidades <= 0;
                        return (
                          <tr key={dt.idMedicamento} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <strong style={{ color: '#03045e', fontSize: '14px', fontWeight: '600' }}>
                                  {dt.nombreMedicamento}
                                </strong>
                                {sinStock && (
                                  <span style={styles.noStockPill}>
                                    Agotado en farmacia - No hacer receta
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                                {dt.presentacion && (
                                  <span style={styles.badgePres}>
                                    {dt.presentacion}
                                  </span>
                                )}
                                {dt.concentracion && (
                                  <span style={styles.badgeConc}>
                                    {dt.concentracion}
                                  </span>
                                )}
                                {!dt.presentacion && !dt.concentracion && (
                                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>—</span>
                                )}
                              </div>
                            </td>
                            <td style={styles.td}>
                              <input
                                list="frecuencia-options"
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
                                list="duracion-options"
                                placeholder="Ej: 5 días"
                                value={dt.duracion}
                                onChange={(e) =>
                                  updateDetalle(
                                    dt.idMedicamento,
                                    'duracion',
                                    e.target.value
                                  )
                                }
                                style={styles.tableInput}
                              />
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input
                                    type="number"
                                    min="1"
                                    value={dt.cantidad}
                                    onChange={(e) =>
                                      updateDetalle(
                                        dt.idMedicamento,
                                        'cantidad',
                                        e.target.value
                                      )
                                    }
                                    style={styles.quantityInput}
                                  />
                                  <span style={styles.unitLabel}>
                                    {dt.esLiquido
                                      ? Number(dt.cantidad) === 1
                                        ? 'frasco'
                                        : 'frascos'
                                      : Number(dt.cantidad) === 1
                                      ? 'unidad'
                                      : 'unidades'}
                                  </span>

                                  {dt.esLiquido && (
                                    <select
                                      value={dt.tomaDosis || '5ml'}
                                      onChange={(e) =>
                                        updateDetalle(dt.idMedicamento, 'tomaDosis', e.target.value)
                                      }
                                      style={styles.doseSelect}
                                      title="Dosis por toma"
                                    >
                                      <option value="5ml">1 cucharadita (5 ml)</option>
                                      <option value="10ml">1 cucharada (10 ml)</option>
                                      <option value="15ml">1 cucharada sopera (15 ml)</option>
                                    </select>
                                  )}
                                </div>

                                {dt.explicacion && (
                                  <span style={styles.calcSubtext}>
                                    {dt.explicacion}
                                  </span>
                                )}
                              </div>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={styles.emptyHint}>
                  No se han agregado medicamentos a la receta médica (opcional si no requiere fármacos).
                </p>
              )}
            </div>
          )}

          {/* Wizard Navigation / Footer Bar */}
          <div style={styles.wizardFooter}>
            <div style={styles.wizardFooterLeft}>
              <button
                type="button"
                onClick={() => navigate('/clinica')}
                style={styles.btnCancelFooter}
              >
                Cancelar
              </button>
            </div>

            <div style={styles.wizardFooterRight}>
              {pasoActual > 1 && (
                <button
                  type="button"
                  onClick={() => setPasoActual((prev) => Math.max(1, prev - 1))}
                  style={styles.btnNavSecondary}
                >
                  <ArrowLeft size={16} />
                  <span>Anterior</span>
                </button>
              )}

              {pasoActual < PASOS.length ? (
                <button
                  type="button"
                  onClick={() =>
                    setPasoActual((prev) => Math.min(PASOS.length, prev + 1))
                  }
                  style={styles.btnNavPrimary}
                >
                  <span>Siguiente</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={guardando}
                  style={styles.btnFinalizar}
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {guardando
                      ? 'Finalizando consulta...'
                      : 'Finalizar Consulta y Enviar a Farmacia'}
                  </span>
                </button>
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
    padding: '18px 24px',
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
  avatarContainer: {
    width: '54px',
    height: '54px',
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
    fontSize: '21px',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepCounterBadge: {
    background: '#e0f2fe',
    color: '#0077b6',
    fontSize: '12px',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #bae6fd',
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
  // Wizard Stepper Tabs
  stepperNav: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
    marginBottom: '20px',
  },
  stepTab: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid transparent',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  stepTabActive: {
    background: '#0077b6',
    color: 'white',
    boxShadow: '0 4px 10px rgba(0, 119, 182, 0.25)',
    border: '1px solid #0077b6',
  },
  stepTabCompleted: {
    background: '#caf0f8',
    color: '#03045e',
    border: '1px solid #90e0ef',
  },
  stepTabInactive: {
    background: 'white',
    color: '#64748b',
    border: '1px solid #e2e8f0',
  },
  stepNumberBadge: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
    flexShrink: 0,
  },
  stepNumberActive: {
    background: 'white',
    color: '#0077b6',
  },
  stepNumberCompleted: {
    background: '#0077b6',
    color: 'white',
  },
  stepNumberInactive: {
    background: '#e2e8f0',
    color: '#64748b',
  },
  stepTabLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Wizard Card Content
  wizardCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    minHeight: '440px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  stepContentFade: {
    animation: 'fadeIn 0.2s ease-in-out',
  },
  stepTitleBar: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  stepIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepHeading: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#03045e',
  },
  stepSubheading: {
    margin: '3px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  // Step 1: Patient Grid
  patientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  patientDetailBox: {
    background: '#f8fafc',
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: '700',
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
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #bae6fd',
  },
  noVitalsBox: {
    background: '#f8fafc',
    padding: '24px',
    borderRadius: '10px',
    border: '1px dashed #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  vitalsTitle: {
    fontSize: '12px',
    fontWeight: '800',
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
    padding: '8px 12px',
    borderRadius: '8px',
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
  // Step 2 & 3: Forms
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
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#03045e',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#03045e',
    minHeight: '85px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  // Step 4: Search & CIE-10
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
    left: '14px',
  },
  searchInput: {
    width: '100%',
    padding: '11px 14px 11px 40px',
    borderRadius: '8px',
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
    marginTop: '12px',
  },
  diagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '6px 14px',
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
  emptyDiagBox: {
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px dashed #cbd5e1',
    padding: '32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  // Step 5: Table
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    marginTop: '16px',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: '14px',
    textAlign: 'left',
  },
  th: {
    background: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '12px 16px',
    borderBottom: '2px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
    borderBottom: '1px solid #f1f5f9',
  },
  tableInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    background: '#ffffff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  quantityInput: {
    width: '64px',
    padding: '7px 8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0077b6',
    textAlign: 'center',
    outline: 'none',
    background: '#ffffff',
    boxSizing: 'border-box',
  },
  unitLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  calcSubtext: {
    fontSize: '11px',
    color: '#64748b',
    lineHeight: '1.3',
  },
  noStockPill: {
    display: 'inline-block',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    width: 'fit-content',
  },
  badgePres: {
    display: 'inline-block',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  badgeConc: {
    display: 'inline-block',
    background: '#e0f2fe',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  doseSelect: {
    padding: '5px 8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    color: '#334155',
    background: '#f8fafc',
    outline: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  },
  btnTableDelete: {
    background: '#fff5f5',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '7px 10px',
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
  // Wizard Footer
  wizardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    marginTop: '36px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
  },
  wizardFooterLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  wizardFooterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  btnCancelFooter: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnNavSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'white',
    color: '#0077b6',
    border: '1px solid #0077b6',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnNavPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '10px 22px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0, 119, 182, 0.25)',
    transition: 'all 0.2s',
  },
  btnFinalizar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '11px 26px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0, 119, 182, 0.35)',
    transition: 'all 0.2s',
  },
};
