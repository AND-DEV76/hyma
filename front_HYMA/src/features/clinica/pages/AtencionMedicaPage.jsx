import { useEffect, useState, useMemo, useRef } from 'react';
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
  ChevronDown,
  ChevronUp,
  History,
  Calendar,
  AlertCircle,
  Loader2,
  Award,
  Check,
} from 'lucide-react';
import { useClinica } from '../hooks/useClinica';
import * as clinicaService from '../services/clinicaService';
import { calcularIMC } from '../../preconsulta/hooks/usePreconsulta';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import userImg from '../../../assets/images/user.png';
import '../styles/clinica.css';

const PASOS = [
  { id: 1, label: 'Paciente & Signos', icon: User },
  { id: 2, label: 'Consulta & Evolución', icon: FileText },
  { id: 3, label: 'Examen Físico', icon: Activity },
  { id: 4, label: 'Diagnósticos', icon: Stethoscope },
  { id: 5, label: 'Receta & Tratamiento', icon: Pill },
];

const calcularCantidadReceta = ({
  frecuencia = '',
  duracion = '',
  presentacion = '',
  concentracion = '',
  tomaDosis = '',
  nombreMedicamento = '',
  nombre = '',
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

  // Duración por defecto si no se ingresó
  if (dias <= 0) {
    dias = 5;
  }

  const presNorm = (presentacion || '').toLowerCase();
  const concNorm = (concentracion || '').toLowerCase();
  const nomNorm = (nombreMedicamento || nombre || '').toLowerCase();

  // Extraer frecuencia (horas de intervalo o tomas al día)
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

  if (tomasAlDia <= 0) tomasAlDia = 3;
  const totalTomas = dias * tomasAlDia;

  // 2. Detectar si es Gotas (gotas oftálmicas, óticas, pediátricas o frascos gotero)
  const esGotas =
    /gotas|gotero/i.test(presNorm) ||
    /gotas|gotero/i.test(concNorm) ||
    /gotas|gotero/i.test(nomNorm);

  if (esGotas) {
    // Convención posológica estándar: 20 gotas = 1 ml (1 gota ≈ 0.05 ml)
    let gotasPorToma = 20;
    let mlPorToma = 1.0;

    const tomaStr = (tomaDosis || '').toString().toLowerCase();
    if (tomaStr.includes('gotas')) {
      const m = tomaStr.match(/(\d+(?:\.\d+)?)\s*gotas/);
      if (m) {
        gotasPorToma = parseFloat(m[1]);
        mlPorToma = Number((gotasPorToma / 20).toFixed(2));
      }
    } else if (tomaStr.includes('ml')) {
      const m = tomaStr.match(/(\d+(?:\.\d+)?)\s*ml/);
      if (m) {
        mlPorToma = parseFloat(m[1]);
        gotasPorToma = Math.round(mlPorToma * 20);
      }
    }

    // Tamaño del frasco gotero (buscar ej. "15 ml", "20 ml", "30 ml", "10 ml")
    let tamanoFrascoGotero = 15;
    const matchTam = (concNorm + ' ' + presNorm + ' ' + nomNorm).match(/(\d{1,3})\s*ml\b/);
    if (matchTam) {
      const vol = parseFloat(matchTam[1]);
      if (vol >= 5 && vol <= 60 && !matchTam[0].includes('1ml')) {
        tamanoFrascoGotero = vol;
      }
    }

    const totalMl = totalTomas * mlPorToma;
    const frascos = Math.max(1, Math.ceil(totalMl / tamanoFrascoGotero));
    const tomasTxt = totalTomas % 1 === 0 ? totalTomas : totalTomas.toFixed(1);

    const explicacion = `Sugerido: ${tomasTxt} tomas de ${gotasPorToma} gotas (${mlPorToma}ml) = ${Math.round(totalTomas * gotasPorToma)} gotas (~${totalMl.toFixed(1)}ml = ${frascos} ${frascos > 1 ? 'frascos gotero' : 'frasco gotero'} de ${tamanoFrascoGotero}ml)`;

    return {
      cantidad: frascos,
      explicacion,
      esGotas: true,
      esLiquido: false,
      gotasPorToma,
      mlPorToma,
      tamanoFrasco: tamanoFrascoGotero,
    };
  }

  // 3. Detectar si es crema / ungüento / pomada / gel tópico / vaginal
  const esTopico =
    /crema|ung[uü]ento|pomada|gel\b|t[oó]pic|d[eé]rmic|loci[oó]n|pasta\b|vaginal/i.test(presNorm) ||
    /crema|ung[uü]ento|pomada|gel\b|t[oó]pic|d[eé]rmic/i.test(concNorm);

  if (esTopico) {
    const tubos = Math.max(1, Math.ceil(dias / 15));
    return {
      cantidad: tubos,
      explicacion: `Sugerido: ${tubos} ${tubos > 1 ? 'tubos' : 'tubo'} (${dias} días de aplicación tópica)`,
      esTopico: true,
      esLiquido: false,
    };
  }

  // 3. Detectar si es inhalador / spray / aerosol
  const esInhalador =
    /inhalad|spray|aerosol|nebuliz|puff/i.test(presNorm) ||
    /inhalad|spray|aerosol/i.test(concNorm);

  if (esInhalador) {
    const frascos = Math.max(1, Math.ceil(dias / 30));
    return {
      cantidad: frascos,
      explicacion: `Sugerido: ${frascos} ${frascos > 1 ? 'inhaladores/frascos' : 'inhalador/frasco'} (${dias} días)`,
      esInhalador: true,
      esLiquido: false,
    };
  }

  // 5. Detectar si es líquido (Jarabe / Suspensión / Solución)
  const esLiquido =
    /jarabe|suspensi[oó]n|soluci[oó]n|elixir|frasco|l[ií]quid/i.test(presNorm) ||
    /jarabe|suspensi[oó]n|soluci[oó]n/i.test(concNorm);

  if (esLiquido) {

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
  const [mostrarUltimaConsulta, setMostrarUltimaConsulta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const stepBodyRef = useRef(null);

  // Control y advertencia de salida
  const [modalSalirVisible, setModalSalirVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [destinoNavegacion, setDestinoNavegacion] = useState(null);
  const consultaFinalizadaRef = useRef(false);

  const solicitarConfirmacionSalir = (targetPath = '/clinica') => {
    if (consultaFinalizadaRef.current) return true;
    setDestinoNavegacion(targetPath);
    setModalSalirVisible(true);
    return false;
  };

  const handleCancelar = () => {
    solicitarConfirmacionSalir('/clinica');
  };

  const confirmarSalir = async () => {
    setModalSalirVisible(false);
    consultaFinalizadaRef.current = true;
    if (idCola) {
      try {
        await clinicaService.reanudarEsperaConsulta(idCola);
      } catch (err) {
        console.error('Error al retornar paciente a espera de consulta', err);
      }
    }
    navigate(destinoNavegacion || '/clinica');
  };

  // Interceptar cierre de ventana, recarga o botón atrás del navegador
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (consultaFinalizadaRef.current) return;
      e.preventDefault();
      e.returnValue = '¿Deseas salir de la consulta actual? Los datos ingresados no se guardarán';
      return e.returnValue;
    };

    const handlePopState = () => {
      if (consultaFinalizadaRef.current) return;
      window.history.pushState(null, '', window.location.href);
      solicitarConfirmacionSalir('/clinica');
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Al cambiar de paso, restaurar el scroll del cuerpo del wizard arriba
  useEffect(() => {
    if (stepBodyRef.current) {
      stepBodyRef.current.scrollTop = 0;
    }
  }, [pasoActual]);

  // Cálculo en tiempo real de IMC para el médico
  const imcInfoSignos = useMemo(() => {
    if (!pacienteData?.ultimoSignoVital) return null;
    const { peso, talla } = pacienteData.ultimoSignoVital;
    return calcularIMC(peso, talla);
  }, [pacienteData?.ultimoSignoVital]);

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
      const nomNorm = (med.nombre || '').toLowerCase();

      const esGotas =
        /gotas|gotero/i.test(presNorm) ||
        /gotas|gotero/i.test(concNorm) ||
        /gotas|gotero/i.test(nomNorm);
      const esLiquido =
        !esGotas && (
          /jarabe|suspensi[oó]n|soluci[oó]n|elixir|frasco|l[ií]quid/i.test(presNorm) ||
          /jarabe|suspensi[oó]n|soluci[oó]n/i.test(concNorm)
        );
      const esTopico =
        /crema|ung[uü]ento|pomada|gel\b|t[oó]pic|d[eé]rmic|loci[oó]n|pasta\b|vaginal/i.test(presNorm) ||
        /crema|ung[uü]ento|pomada|gel\b|t[oó]pic/i.test(concNorm);
      const esInhalador =
        /inhalad|spray|aerosol|nebuliz|puff/i.test(presNorm) ||
        /inhalad|spray|aerosol/i.test(concNorm);

      let defaultDosis = '1';
      if (esGotas) defaultDosis = '20 gotas (1 ml)';
      else if (esLiquido) defaultDosis = '5ml';
      else if (esTopico) defaultDosis = '1 aplicación';
      else if (esInhalador) defaultDosis = '1 disparo';

      const nuevoDetalle = {
        idMedicamento: med.idMedicamento,
        nombreMedicamento: med.nombre,
        presentacion: med.presentacion || '',
        concentracion: med.concentracion || '',
        unidades: med.unidades ?? null,
        frecuencia: 'Cada 8 hrs',
        duracion: '5 días',
        esGotas,
        esLiquido,
        esTopico,
        esInhalador,
        tomaDosis: defaultDosis,
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
    if (guardando || enviando) return;

    if (!diagnosticos || diagnosticos.length === 0) {
      alert('Debe agregar al menos un diagnóstico antes de finalizar la consulta médica.');
      setPasoActual(4);
      return;
    }

    setEnviando(true);
    try {
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
            let tomaTexto = '';
            if (dt.esGotas) {
              tomaTexto = dt.tomaDosis || '20 gotas (1 ml)';
            } else if (dt.esLiquido) {
              if (dt.tomaDosis === '5ml') tomaTexto = '1 cucharadita (5 ml)';
              else if (dt.tomaDosis === '10ml') tomaTexto = '1 cucharada (10 ml)';
              else if (dt.tomaDosis === '15ml') tomaTexto = '1 cucharada sopera (15 ml)';
              else if (dt.tomaDosis) tomaTexto = `${dt.tomaDosis}`;
            } else if (dt.tomaDosis) {
              tomaTexto = `${dt.tomaDosis} ${Number(dt.tomaDosis) === 1 ? 'unidad/tableta' : 'unidades/tabletas'}`;
            }

            return {
              idMedicamento: dt.idMedicamento,
              dosis: tomaTexto || [dt.presentacion, dt.concentracion].filter(Boolean).join(' - ') || '1 toma',
              frecuencia: dt.frecuencia || 'Según indicación',
              duracion: dt.duracion || 'Según evolución',
              cantidad: Number(dt.cantidad) > 0 ? Number(dt.cantidad) : 1,
            };
          }),
        },
      };

      const res = await finalizarAtencion(payload);
      if (res.success) {
        consultaFinalizadaRef.current = true;
        setShowSuccessModal(true);
      }
    } finally {
      setEnviando(false);
    }
  };

  const handleAceptarExito = () => {
    setShowSuccessModal(false);
    navigate('/clinica');
  };

  if (loadingDatos) {
    return (
      <div style={styles.page}>
        <AdminNavbar onBeforeNavigate={solicitarConfirmacionSalir} />
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
      <AdminNavbar onBeforeNavigate={solicitarConfirmacionSalir} />
      <main className="clinica-content" style={styles.content}>
        {/* Header Odoo: USER.PNG | Paciente X */}
        <div className="clinica-odoo-header" style={styles.odooHeaderCard}>
          <div className="clinica-odoo-header-left" style={styles.headerLeft}>
            <div style={styles.avatarContainer}>
              <img src={userImg} alt="Avatar Paciente" style={styles.avatarImg} />
            </div>

            <div className="clinica-odoo-divider" style={styles.verticalDivider}>|</div>

            <div>
              <span style={styles.headerEyebrow}>ATENCIÓN MÉDICA EN CONSULTA</span>
              <h1 style={styles.headerTitle}>
                Paciente: {nombreCompleto || 'Desconocido'}
              </h1>
            </div>
          </div>

          <div className="clinica-odoo-header-right" style={styles.headerRight}>
            <span style={styles.stepCounterBadge}>
              Paso {pasoActual} de {PASOS.length}
            </span>
            <button
              type="button"
              onClick={handleCancelar}
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
        <nav className="clinica-stepper-nav" style={styles.stepperNav}>
          {PASOS.map((paso) => {
            const Icon = paso.icon;
            const isActivo = pasoActual === paso.id;
            const isCompletado = pasoActual > paso.id;

            return (
              <button
                key={paso.id}
                type="button"
                className="clinica-step-tab"
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
                <span className="clinica-step-tab-label" style={styles.stepTabLabel}>{paso.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Wizard Step Content Container */}
        <div className="clinica-wizard-card" style={styles.wizardCard}>
          <div
            ref={stepBodyRef}
            className="wizard-step-scroll-body clinica-wizard-step-body"
            style={{
              ...styles.wizardStepBody,
              overflowY: pasoActual === 1 && mostrarUltimaConsulta ? 'auto' : 'visible',
            }}
          >
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

                <div className="clinica-patient-grid" style={styles.patientGrid}>
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
                      <div className="clinica-vitals-grid" style={styles.vitalsGrid}>
                      <div style={styles.vitalItem}>
                        <span style={styles.vitalLabel}>Presión Art.</span>
                        <span style={styles.vitalVal}>
                          {pacienteData.ultimoSignoVital.presionArterial || '--'}
                        </span>
                      </div>
                      <div style={styles.vitalItem}>
                        <span style={styles.vitalLabel}>Frec. Cardíaca</span>
                        <span style={styles.vitalVal}>
                          {pacienteData.ultimoSignoVital.frecuenciaCardiaca ? `${pacienteData.ultimoSignoVital.frecuenciaCardiaca} lpm` : '--'}
                        </span>
                      </div>
                      <div style={styles.vitalItem}>
                        <span style={styles.vitalLabel}>Temperatura</span>
                        <span style={styles.vitalVal}>
                          {pacienteData.ultimoSignoVital.temperatura ? `${pacienteData.ultimoSignoVital.temperatura} °C` : '--'}
                        </span>
                      </div>
                      <div style={styles.vitalItem}>
                        <span style={styles.vitalLabel}>Peso</span>
                        <span style={styles.vitalVal}>
                          {pacienteData.ultimoSignoVital.peso ? `${pacienteData.ultimoSignoVital.peso} lbs` : '--'}
                        </span>
                      </div>
                      <div style={styles.vitalItem}>
                        <span style={styles.vitalLabel}>Talla</span>
                        <span style={styles.vitalVal}>
                          {pacienteData.ultimoSignoVital.talla ? `${pacienteData.ultimoSignoVital.talla} cm` : '--'}
                        </span>
                      </div>
                      <div style={styles.vitalItem}>
                        <span style={styles.vitalLabel}>Sat. O2</span>
                        <span style={styles.vitalVal}>
                          {pacienteData.ultimoSignoVital.saturacionOxigeno ? `${pacienteData.ultimoSignoVital.saturacionOxigeno} %` : '--'}
                        </span>
                      </div>
                      <div style={styles.vitalItem}>
                        <span style={styles.vitalLabel}>IMC Estimado</span>
                        <span style={{ ...styles.vitalVal, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {imcInfoSignos?.imc ? (
                            <>
                              <span>{imcInfoSignos.imc}</span>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: 'white',
                                backgroundColor: imcInfoSignos.color,
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}>
                                {imcInfoSignos.texto}
                              </span>
                            </>
                          ) : (
                            pacienteData.ultimoSignoVital.imc || '--'
                          )}
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

              {/* Opción Desplegable: Última Consulta */}
              <div style={styles.ultimaConsultaCard}>
                <button
                  type="button"
                  onClick={() => setMostrarUltimaConsulta((prev) => !prev)}
                  style={{
                    ...styles.ultimaConsultaHeaderBtn,
                    backgroundColor: mostrarUltimaConsulta ? '#f0f9ff' : '#ffffff',
                    borderColor: mostrarUltimaConsulta ? '#0077b6' : '#e2e8f0',
                  }}
                >
                  <div style={styles.ultimaConsultaHeaderLeft}>
                    <div
                      style={{
                        ...styles.ultimaConsultaIconWrap,
                        backgroundColor: mostrarUltimaConsulta ? '#0077b6' : '#e0f2fe',
                        color: mostrarUltimaConsulta ? '#ffffff' : '#0077b6',
                      }}
                    >
                      <History size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={styles.ultimaConsultaTitle}>Última Consulta</span>
                        {pacienteData?.ultimaConsulta ? (
                          <span style={styles.badgeUltimaFecha}>
                            <Calendar size={13} style={{ marginRight: '4px' }} />
                            {new Date(pacienteData.ultimaConsulta.fechaConsulta).toLocaleDateString('es-GT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span style={styles.badgeSinHistorial}>
                            Sin consultas previas
                          </span>
                        )}
                      </div>
                      <p style={styles.ultimaConsultaSubtitle}>
                        {pacienteData?.ultimaConsulta
                          ? `Atendido por: Dr(a). ${pacienteData.ultimaConsulta.medico || 'Médico tratante'}${
                              pacienteData.ultimaConsulta.especialidadMedico ? ` (${pacienteData.ultimaConsulta.especialidadMedico})` : ''
                            }`
                          : 'Haga clic para verificar el historial médico previo registrado en el sistema.'}
                      </p>
                    </div>
                  </div>
                  <div style={styles.ultimaConsultaHeaderRight}>
                    <span style={styles.ultimaConsultaActionLabel}>
                      {mostrarUltimaConsulta ? 'Ocultar datos' : 'Ver datos'}
                    </span>
                    <div
                      style={{
                        ...styles.ultimaConsultaChevronWrap,
                        transform: mostrarUltimaConsulta ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <ChevronDown size={20} color="#0077b6" />
                    </div>
                  </div>
                </button>

                {mostrarUltimaConsulta && (
                  <div style={styles.ultimaConsultaBody}>
                    {!pacienteData?.ultimaConsulta ? (
                      <div style={styles.ultimaConsultaEmptyState}>
                        <AlertCircle size={28} color="#94a3b8" />
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                            El paciente no cuenta con consultas médicas previas registradas
                          </p>
                          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                            Esta es la primera consulta registrada en la clínica para este paciente.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.ultimaConsultaContentGrid}>
                        {/* Fila 1: Resumen de Consulta (Médico y Fecha) */}
                        <div style={styles.ucInfoBanner}>
                          <div style={styles.ucBannerItem}>
                            <span style={styles.ucBannerLabel}>Fecha y Hora:</span>
                            <span style={styles.ucBannerVal}>
                              {new Date(pacienteData.ultimaConsulta.fechaConsulta).toLocaleString('es-GT', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                          <div style={styles.ucBannerItem}>
                            <span style={styles.ucBannerLabel}>Médico Evaluador:</span>
                            <span style={styles.ucBannerVal}>
                              Dr(a). {pacienteData.ultimaConsulta.medico || 'No especificado'}
                            </span>
                          </div>
                          {pacienteData.ultimaConsulta.especialidadMedico && (
                            <div style={styles.ucBannerItem}>
                              <span style={styles.ucBannerLabel}>Especialidad:</span>
                              <span style={styles.ucBannerVal}>
                                {pacienteData.ultimaConsulta.especialidadMedico}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Fila 2: Motivo y Evolución */}
                        <div style={styles.ucTwoColGrid}>
                          <div style={styles.ucCardBlock}>
                            <span style={styles.ucBlockTitle}>Motivo de Consulta</span>
                            <p style={styles.ucBlockText}>
                              {pacienteData.ultimaConsulta.motivoConsulta || 'Sin motivo registrado'}
                            </p>
                          </div>
                          <div style={styles.ucCardBlock}>
                            <span style={styles.ucBlockTitle}>Historia de la Enfermedad Actual</span>
                            <p style={styles.ucBlockText}>
                              {pacienteData.ultimaConsulta.historiaEnfermedadActual || 'Sin historia registrada'}
                            </p>
                          </div>
                        </div>

                        {/* Impresión Clínica y Plan si existen */}
                        {(pacienteData.ultimaConsulta.impresionClinica || pacienteData.ultimaConsulta.planMedico) && (
                          <div style={styles.ucTwoColGrid}>
                            {pacienteData.ultimaConsulta.impresionClinica && (
                              <div style={styles.ucCardBlock}>
                                <span style={styles.ucBlockTitle}>Impresión Clínica</span>
                                <p style={styles.ucBlockText}>
                                  {pacienteData.ultimaConsulta.impresionClinica}
                                </p>
                              </div>
                            )}
                            {pacienteData.ultimaConsulta.planMedico && (
                              <div style={styles.ucCardBlock}>
                                <span style={styles.ucBlockTitle}>Plan Médico</span>
                                <p style={styles.ucBlockText}>
                                  {pacienteData.ultimaConsulta.planMedico}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Fila 3: Diagnósticos */}
                        <div style={styles.ucCardBlock}>
                          <span style={styles.ucBlockTitle}>Diagnósticos Asignados</span>
                          {pacienteData.ultimaConsulta.diagnosticos?.length > 0 ? (
                            <div style={styles.ucDiagList}>
                              {pacienteData.ultimaConsulta.diagnosticos.map((d, idx) => (
                                <div key={idx} style={styles.ucDiagTag}>
                                  <span style={styles.ucDiagDesc}>{d.descripcion}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                              No se registraron diagnósticos formales CIE-10.
                            </span>
                          )}
                        </div>

                        {/* Fila 4: Medicamentos Recetados y Tratamiento */}
                        <div style={styles.ucCardBlock}>
                          <span style={styles.ucBlockTitle}>Tratamiento y Receta Anterior</span>
                          {pacienteData.ultimaConsulta.medicamentos?.length > 0 ? (
                            <div style={styles.ucMedTableContainer}>
                              <table style={styles.ucMedTable}>
                                <thead>
                                  <tr>
                                    <th style={styles.ucMedTh}>Medicamento</th>
                                    <th style={styles.ucMedTh}>Dosis & Indicaciones</th>
                                    <th style={{ ...styles.ucMedTh, textAlign: 'center', width: '80px' }}>Cant.</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pacienteData.ultimaConsulta.medicamentos.map((m, idx) => (
                                    <tr key={idx} style={styles.ucMedTr}>
                                      <td style={styles.ucMedTdName}>
                                        <div style={{ fontWeight: '600', color: '#03045e' }}>{m.medicamento}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                                          {[m.presentacion, m.concentracion].filter(Boolean).join(' • ')}
                                        </div>
                                      </td>
                                      <td style={styles.ucMedTd}>
                                        <span>{m.dosis || '--'}</span>
                                        {m.frecuencia && <span style={{ color: '#0077b6', marginLeft: '6px' }}>• {m.frecuencia}</span>}
                                        {m.duracion && <span style={{ color: '#64748b', marginLeft: '6px' }}>• por {m.duracion}</span>}
                                      </td>
                                      <td style={{ ...styles.ucMedTd, textAlign: 'center', fontWeight: '600' }}>
                                        {m.cantidad || '--'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                              No se recetaron medicamentos en la consulta anterior.
                            </span>
                          )}

                          {pacienteData.ultimaConsulta.indicacionesTratamiento && (
                            <div style={styles.ucIndicacionesBox}>
                              <span style={styles.ucIndicacionesLabel}>Indicaciones Generales / Observaciones:</span>
                              <p style={styles.ucIndicacionesText}>
                                {pacienteData.ultimaConsulta.indicacionesTratamiento}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Fila 5: Examen Físico (si hay datos) */}
                        {pacienteData.ultimaConsulta.examenFisico &&
                          Object.values(pacienteData.ultimaConsulta.examenFisico).some((val) => Boolean(val && val.trim())) && (
                            <div style={styles.ucCardBlock}>
                              <span style={styles.ucBlockTitle}>Examen Físico Registrado</span>
                              <div style={styles.ucExamenGrid}>
                                {pacienteData.ultimaConsulta.examenFisico.piel && (
                                  <div style={styles.ucExamenItem}>
                                    <span style={styles.ucExamenLabel}>Piel:</span>
                                    <span style={styles.ucExamenVal}>{pacienteData.ultimaConsulta.examenFisico.piel}</span>
                                  </div>
                                )}
                                {pacienteData.ultimaConsulta.examenFisico.conciencia && (
                                  <div style={styles.ucExamenItem}>
                                    <span style={styles.ucExamenLabel}>Conciencia:</span>
                                    <span style={styles.ucExamenVal}>{pacienteData.ultimaConsulta.examenFisico.conciencia}</span>
                                  </div>
                                )}
                                {pacienteData.ultimaConsulta.examenFisico.cardiopulmonar && (
                                  <div style={styles.ucExamenItem}>
                                    <span style={styles.ucExamenLabel}>Cardiopulmonar:</span>
                                    <span style={styles.ucExamenVal}>{pacienteData.ultimaConsulta.examenFisico.cardiopulmonar}</span>
                                  </div>
                                )}
                                {pacienteData.ultimaConsulta.examenFisico.abdomen && (
                                  <div style={styles.ucExamenItem}>
                                    <span style={styles.ucExamenLabel}>Abdomen:</span>
                                    <span style={styles.ucExamenVal}>{pacienteData.ultimaConsulta.examenFisico.abdomen}</span>
                                  </div>
                                )}
                                {pacienteData.ultimaConsulta.examenFisico.soma && (
                                  <div style={styles.ucExamenItem}>
                                    <span style={styles.ucExamenLabel}>SOMA:</span>
                                    <span style={styles.ucExamenVal}>{pacienteData.ultimaConsulta.examenFisico.soma}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
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

              <div className="clinica-two-col-grid" style={styles.twoColGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Motivo de Consulta</label>
                  <textarea
                    placeholder="Describa el motivo principal de la consulta médica..."
                    value={motivoConsulta}
                    onChange={(e) => setMotivoConsulta(e.target.value)}
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Historia de la Enfermedad Actual</label>
                  <textarea
                    placeholder="Cronología, evolución de síntomas, tratamientos previos..."
                    value={historiaEnfermedad}
                    onChange={(e) => setHistoriaEnfermedad(e.target.value)}
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Impresión Clínica</label>
                  <textarea
                    placeholder="Conclusiones diagnósticas preliminares..."
                    value={impresionClinica}
                    onChange={(e) => setImpresionClinica(e.target.value)}
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Plan Médico</label>
                  <textarea
                    placeholder="Plan de acción, estudios complementarios, cuidados..."
                    value={planMedico}
                    onChange={(e) => setPlanMedico(e.target.value)}
                    style={styles.textarea}
                    rows={3}
                  />
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

              <div className="clinica-two-col-grid" style={styles.twoColGrid}>
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

          {/* PASO 4: Diagnósticos */}
          {pasoActual === 4 && (
            <div style={styles.stepContentFade}>
              <div style={styles.stepTitleBar}>
                <div style={styles.stepIconWrap}>
                  <Stethoscope size={20} color="#0077b6" />
                </div>
                <div>
                  <h2 style={styles.stepHeading}>Diagnósticos Clínicos</h2>
                  <p style={styles.stepSubheading}>
                    Búsqueda y selección de diagnósticos clínicos.
                  </p>
                </div>
              </div>

              <div style={styles.searchContainer}>
                <div style={styles.searchInputWrapper}>
                  <Search size={16} color="#64748b" style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar diagnóstico por descripción o patología..."
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
                        <span style={{ color: '#03045e', fontWeight: '600', fontSize: '14px' }}>
                          {d.descripcion}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {diagnosticos.length > 0 ? (
                <div className="clinica-table-responsive" style={{ overflowX: 'auto', marginTop: '16px' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ ...styles.th, width: '60px', textAlign: 'center' }}>#</th>
                        <th style={styles.th}>Descripción del Diagnóstico</th>
                        <th style={{ ...styles.th, width: '70px', textAlign: 'center' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosticos.map((d, index) => (
                        <tr key={d.codigoCie10} style={styles.tr}>
                          <td style={{ ...styles.td, textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                            {index + 1}
                          </td>
                          <td style={{ ...styles.td, color: '#03045e', fontWeight: '500' }}>
                            {d.descripcion}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeDiagnostico(d.codigoCie10)}
                              style={{
                                background: '#fff1f2',
                                border: '1px solid #fecdd3',
                                color: '#e11d48',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                              }}
                              title="Eliminar diagnóstico"
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
                <div style={styles.emptyDiagBox}>
                  <Stethoscope size={32} color="#94a3b8" />
                  <p style={styles.emptyHint}>
                    Aún no ha seleccionado ningún diagnóstico para esta consulta.
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
                  rows={3}
                />
              </div>

              <div style={{ ...styles.searchContainer, marginTop: '16px' }}>
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
                <div className="clinica-table-responsive" style={styles.tableContainer}>
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
                                    {dt.esGotas
                                      ? Number(dt.cantidad) === 1
                                        ? 'frasco gotero'
                                        : 'frascos gotero'
                                      : dt.esTopico
                                      ? Number(dt.cantidad) === 1
                                        ? 'tubo'
                                        : 'tubos'
                                      : dt.esLiquido
                                      ? Number(dt.cantidad) === 1
                                        ? 'frasco'
                                        : 'frascos'
                                      : dt.esInhalador
                                      ? Number(dt.cantidad) === 1
                                        ? 'inhalador'
                                        : 'inhaladores'
                                      : Number(dt.cantidad) === 1
                                      ? 'unidad'
                                      : 'unidades'}
                                  </span>

                                  {dt.esGotas ? (
                                    <select
                                      value={dt.tomaDosis || '20 gotas (1 ml)'}
                                      onChange={(e) =>
                                        updateDetalle(dt.idMedicamento, 'tomaDosis', e.target.value)
                                      }
                                      style={styles.doseSelect}
                                      title="Gotas por toma"
                                    >
                                      <option value="10 gotas (0.5 ml)">10 gotas (0.5 ml)</option>
                                      <option value="15 gotas (0.75 ml)">15 gotas (0.75 ml)</option>
                                      <option value="20 gotas (1 ml)">20 gotas (1 ml)</option>
                                      <option value="25 gotas (1.25 ml)">25 gotas (1.25 ml)</option>
                                      <option value="30 gotas (1.5 ml)">30 gotas (1.5 ml)</option>
                                      <option value="2 gotas">2 gotas (oftálmico / ótico)</option>
                                    </select>
                                  ) : dt.esLiquido ? (
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
                                  ) : null}
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
          </div>

          {/* Wizard Navigation / Footer Bar */}
          <div className="clinica-wizard-footer" style={styles.wizardFooter}>
            <div className="clinica-wizard-footer-left" style={styles.wizardFooterLeft}>
              <button
                type="button"
                onClick={handleCancelar}
                style={styles.btnCancelFooter}
              >
                Cancelar
              </button>
            </div>

            <div className="clinica-wizard-footer-right" style={styles.wizardFooterRight}>
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
                  disabled={guardando || enviando}
                  style={styles.btnFinalizar}
                >
                  {guardando || enviando ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Finalizando consulta...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Finalizar Consulta</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Advertencia al Salir */}
      {modalSalirVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconBoxWarning}>
                <AlertTriangle size={24} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={styles.modalTitle}>¿Deseas salir de la consulta actual?</h3>
                <p style={styles.modalSubtitle}>
                  Los datos ingresados no se guardarán
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalSalirVisible(false);
                  setDestinoNavegacion(null);
                }}
                style={styles.btnModalClose}
              >
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                Tiene una atención médica en proceso. Si decide salir ahora, la información ingresada en los 5 pasos se perderá y no podrá recuperarse.
              </p>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setModalSalirVisible(false);
                  setDestinoNavegacion(null);
                }}
                style={styles.btnModalCancel}
              >
                Continuar en Consulta
              </button>
              <button
                type="button"
                onClick={confirmarSalir}
                style={styles.btnModalConfirmExit}
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito Tipo Logro al Finalizar Consulta */}
      {showSuccessModal && (
        <div className="clinica-modal-overlay" role="dialog" aria-modal="true">
          <div className="logro-card">
            {/* Efecto de barrido de luz */}
            <div className="logro-shimmer" />

            {/* Emblema central con anillos tipo sonar */}
            <div className="logro-emblem-container">
              <div className="logro-pulse-ring ring-1" />
              <div className="logro-pulse-ring ring-2" />
              <div className="logro-emblem-circle">
                <Award size={42} color="#ffffff" strokeWidth={2.2} />
              </div>
            </div>

            <h3 className="logro-title">¡Consulta Finalizada!</h3>

            {nombreCompleto && (
              <div className="logro-patient-chip">
                <User size={13} />
                <span>Paciente: <strong>{nombreCompleto}</strong></span>
              </div>
            )}

            <p className="logro-desc">
              La atención médica ha finalizado con éxito. El paciente ha sido enviado a Farmacia.
            </p>

            <button
              type="button"
              autoFocus
              onClick={handleAceptarExito}
              className="logro-btn-confirm"
            >
              <Check size={18} strokeWidth={2.5} />
              <span>Aceptar</span>
            </button>
          </div>
        </div>
      )}
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
    maxWidth: '1150px',
    margin: '0 auto',
    padding: '12px 20px 14px',
  },
  odooHeaderCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '10px 18px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '14px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
  },
  avatarContainer: {
    width: '42px',
    height: '42px',
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
    fontSize: '22px',
    fontWeight: '300',
    lineHeight: 1,
  },
  headerEyebrow: {
    color: '#0077b6',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '1px',
  },
  headerTitle: {
    color: '#03045e',
    margin: 0,
    fontSize: '17px',
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
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1px solid #bae6fd',
  },
  btnVolver: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '12px',
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
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '13px',
    border: '1px solid #fecaca',
  },
  loadingBox: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '30px',
    textAlign: 'center',
  },
  // Wizard Stepper Tabs
  stepperNav: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px',
    marginBottom: '10px',
  },
  stepTab: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '8px',
    border: '1px solid transparent',
    fontSize: '12px',
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
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
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
    padding: '24px 28px 20px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
  },
  wizardStepBody: {
    flex: 1,
    paddingRight: '4px',
    paddingBottom: '4px',
  },
  stepContentFade: {
    animation: 'fadeIn 0.2s ease-in-out',
  },
  stepTitleBar: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '14px',
    marginBottom: '18px',
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
    fontSize: '13.5px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
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
  // Collapsible Última Consulta styles
  ultimaConsultaCard: {
    marginTop: '20px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 0.2s ease',
  },
  ultimaConsultaHeaderBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
  ultimaConsultaHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  ultimaConsultaIconWrap: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  ultimaConsultaTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#03045e',
  },
  badgeUltimaFecha: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#0077b6',
    backgroundColor: '#e0f2fe',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
  },
  badgeSinHistorial: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  ultimaConsultaSubtitle: {
    margin: '3px 0 0',
    fontSize: '12px',
    color: '#64748b',
  },
  ultimaConsultaHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  ultimaConsultaActionLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0077b6',
  },
  ultimaConsultaChevronWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ultimaConsultaBody: {
    padding: '14px 18px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    maxHeight: '360px',
    overflowY: 'auto',
  },
  ultimaConsultaEmptyState: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
  },
  ultimaConsultaContentGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  ucInfoBanner: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  ucBannerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  ucBannerLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  ucBannerVal: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#03045e',
  },
  ucTwoColGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '14px',
  },
  ucCardBlock: {
    backgroundColor: '#ffffff',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  ucBlockTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#0077b6',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  ucBlockText: {
    margin: 0,
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  ucDiagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  ucDiagTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '5px 10px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    fontSize: '12px',
  },
  ucDiagCode: {
    fontWeight: '700',
    color: '#0077b6',
    backgroundColor: '#e0f2fe',
    padding: '1px 5px',
    borderRadius: '4px',
  },
  ucDiagDesc: {
    color: '#0f172a',
    fontWeight: '500',
  },
  ucMedTableContainer: {
    overflowX: 'auto',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  ucMedTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  ucMedTh: {
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
  },
  ucMedTr: {
    borderBottom: '1px solid #f1f5f9',
  },
  ucMedTdName: {
    padding: '8px 12px',
  },
  ucMedTd: {
    padding: '8px 12px',
    color: '#334155',
  },
  ucIndicacionesBox: {
    marginTop: '10px',
    padding: '10px 12px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
  },
  ucIndicacionesLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#b45309',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '3px',
  },
  ucIndicacionesText: {
    margin: 0,
    fontSize: '13px',
    color: '#78350f',
    lineHeight: '1.4',
  },
  ucExamenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
  },
  ucExamenItem: {
    padding: '8px 10px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  ucExamenLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  ucExamenVal: {
    fontSize: '12px',
    color: '#0f172a',
    fontWeight: '500',
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
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#1e293b',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    color: '#03045e',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    color: '#03045e',
    height: '110px',
    minHeight: '95px',
    maxHeight: '160px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  // Step 4: Search & Diagnósticos
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
    left: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '13px 18px 13px 46px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
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
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '14px 18px',
    borderBottom: '2px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '16px 18px',
    verticalAlign: 'middle',
    borderBottom: '1px solid #f1f5f9',
  },
  tableInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    background: '#ffffff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  quantityInput: {
    width: '74px',
    padding: '9px 8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    fontWeight: '700',
    color: '#0077b6',
    textAlign: 'center',
    outline: 'none',
    background: '#ffffff',
    boxSizing: 'border-box',
  },
  unitLabel: {
    fontSize: '14px',
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
    gap: '16px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  wizardFooterLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  wizardFooterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  btnCancelFooter: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '11px 22px',
    borderRadius: '8px',
    fontSize: '14.5px',
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
    padding: '11px 22px',
    borderRadius: '8px',
    fontSize: '14.5px',
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
    padding: '11px 26px',
    borderRadius: '8px',
    fontSize: '14.5px',
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
    padding: '12px 28px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0, 119, 182, 0.35)',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3, 4, 94, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1050,
    padding: '16px',
  },
  modalCard: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '460px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },
  modalIconBoxWarning: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#03045e',
  },
  modalSubtitle: {
    margin: '3px 0 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#d97706',
  },
  btnModalClose: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    background: '#f8fafc',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '20px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnModalCancel: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnModalConfirmExit: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
