import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Pill,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  User,
  Clock,
  FileText,
  Printer,
  Loader2,
  Activity,
  Plus,
  Trash2,
  Search,
  X,
} from 'lucide-react';
import { useDispensacion } from '../hooks/useDispensacion';
import { listarMedicamentos } from '../services/medicamentoService';
import { listarLotes } from '../services/loteService';
import { listarActivos } from '../../procedimiento/services/procedimientoService';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import RecetaMedicaPrint, { getDosisTexto, getUnidadTexto } from '../components/RecetaMedicaPrint';

export default function DispensarMedicamentosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idCola = searchParams.get('idCola');
  const idPaciente = searchParams.get('idPaciente');

  const {
    receta,
    loading,
    entregando,
    error,
    cargarReceta,
    entregarMedicamentos,
  } = useDispensacion();

  // Estados editables de los medicamentos, lotes sugeridos y procedimientos
  const [medicamentos, setMedicamentos] = useState([]);
  const [lotesSugeridos, setLotesSugeridos] = useState([]);
  const [procedimientos, setProcedimientos] = useState([]);

  // Estados de cobro y finalización
  const [confirmandoEntrega, setConfirmandoEntrega] = useState(false);
  const [entregaFinalizada, setEntregaFinalizada] = useState(false);
  const [tipoCobro, setTipoCobro] = useState('NORMAL'); // 'NORMAL' | 'NO_PAGA_CONSULTA' | 'SR' | 'BECADO'
  const [duplicarEnHoja, setDuplicarEnHoja] = useState(false);
  const [procesandoEntrega, setProcesandoEntrega] = useState(false);

  // Modales
  const [modalMedOpen, setModalMedOpen] = useState(false);
  const [modalProcOpen, setModalProcOpen] = useState(false);

  // Catálogo y estado de agregar medicamento
  const [catalogoMedicamentos, setCatalogoMedicamentos] = useState([]);
  const [cargandoMedsCatalogo, setCargandoMedsCatalogo] = useState(false);
  const [busquedaMed, setBusquedaMed] = useState('');
  const [medSeleccionado, setMedSeleccionado] = useState(null);
  const [dosisNuevoMed, setDosisNuevoMed] = useState('1 tableta');
  const [frecuenciaNuevoMed, setFrecuenciaNuevoMed] = useState('Cada 8 hrs');
  const [duracionNuevoMed, setDuracionNuevoMed] = useState('5 días');
  const [cantidadNuevoMed, setCantidadNuevoMed] = useState(1);
  const [cargandoLotesMed, setCargandoLotesMed] = useState(false);
  const [lotesMedSeleccionado, setLotesMedSeleccionado] = useState([]);

  // Catálogo y estado de agregar procedimiento
  const [catalogoProcedimientos, setCatalogoProcedimientos] = useState([]);
  const [cargandoProcsCatalogo, setCargandoProcsCatalogo] = useState(false);
  const [procSeleccionado, setProcSeleccionado] = useState(null);
  const [cantidadNuevoProc, setCantidadNuevoProc] = useState(1);
  const [instruccionesNuevoProc, setInstruccionesNuevoProc] = useState('');

  const esSR = tipoCobro === 'SR' || tipoCobro === 'CASO_ESPECIAL';
  const esBecado = tipoCobro === 'BECADO';
  const esExoneracionTotal = esSR || esBecado;
  const noPagaConsulta = tipoCobro === 'NO_PAGA_CONSULTA' || esExoneracionTotal;

  // Inicializar estado editable al cargar la receta del backend
  useEffect(() => {
    if (receta) {
      setMedicamentos(receta.medicamentos ? JSON.parse(JSON.stringify(receta.medicamentos)) : []);
      setLotesSugeridos(receta.lotesSugeridos ? JSON.parse(JSON.stringify(receta.lotesSugeridos)) : []);
      setProcedimientos(receta.procedimientos ? JSON.parse(JSON.stringify(receta.procedimientos)) : []);
    }
  }, [receta]);

  const tieneMedicamentos = medicamentos.length > 0;

  const precioConsultaOriginal = Number(receta?.precioConsulta || 0);
  const costoConsultaCobrar = noPagaConsulta ? 0 : precioConsultaOriginal;

  // Total medicamentos según lotes sugeridos a descontar
  const totalMedicamentosOriginal = lotesSugeridos.reduce((acc, l) => {
    const cant = Number(l.cantidadADescontar || 0);
    const precio = Number(l.precioUnitario || 0);
    return acc + (cant * precio);
  }, 0);

  const totalMedicamentosCobrar = esExoneracionTotal ? 0 : totalMedicamentosOriginal;
  const totalMedicamentos = totalMedicamentosCobrar;

  // Total procedimientos clínicos
  const totalProcedimientosOriginal = procedimientos.reduce((acc, p) => {
    return acc + (Number(p.subtotal) || 0);
  }, 0);
  const totalProcedimientosCobrar = esExoneracionTotal ? 0 : totalProcedimientosOriginal;

  // Total a Pagar general
  const totalAPagar = costoConsultaCobrar + totalMedicamentosCobrar + totalProcedimientosCobrar;

  useEffect(() => {
    if (idCola || idPaciente) {
      cargarReceta(idCola ? Number(idCola) : null, idPaciente ? Number(idPaciente) : null);
    } else {
      navigate('/farmacia/dispensacion');
    }
  }, [idCola, idPaciente, cargarReceta, navigate]);

  // ==========================================
  // MANEJO DE MEDICAMENTOS RECETADOS
  // ==========================================

  const handleCambiarCantidadMed = (idMedicamento, nuevaCantidad) => {
    const cant = Math.max(1, parseInt(nuevaCantidad, 10) || 1);
    setMedicamentos((prev) =>
      prev.map((m) => {
        if (m.idMedicamento === idMedicamento) {
          const pUnit = Number(m.precioUnitario || 0);
          return { ...m, cantidad: cant, subtotal: pUnit * cant };
        }
        return m;
      })
    );

    setLotesSugeridos((prev) =>
      prev.map((lote) => {
        if (lote.idMedicamento === idMedicamento) {
          const pUnit = Number(lote.precioUnitario || 0);
          const stock = Number(lote.stockDisponible || 0);
          const aDescontar = Math.min(cant, stock);
          return { ...lote, cantidadADescontar: aDescontar, subtotal: pUnit * aDescontar };
        }
        return lote;
      })
    );
  };

  const handleEditarCampoMed = (idMedicamento, campo, valor) => {
    setMedicamentos((prev) =>
      prev.map((m) => {
        if (m.idMedicamento === idMedicamento) {
          return { ...m, [campo]: valor };
        }
        return m;
      })
    );
  };

  const handleEliminarMedicamento = (idMedicamento) => {
    setMedicamentos((prev) => prev.filter((m) => m.idMedicamento !== idMedicamento));
    setLotesSugeridos((prev) => prev.filter((l) => l.idMedicamento !== idMedicamento));
  };

  const abrirModalMed = async () => {
    setModalMedOpen(true);
    setBusquedaMed('');
    setMedSeleccionado(null);
    setDosisNuevoMed('1 tableta');
    setFrecuenciaNuevoMed('Cada 8 hrs');
    setDuracionNuevoMed('5 días');
    setCantidadNuevoMed(1);
    setLotesMedSeleccionado([]);
    setCargandoMedsCatalogo(true);
    try {
      const data = await listarMedicamentos({ estado: true });
      setCatalogoMedicamentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar catálogo de medicamentos:', err);
    } finally {
      setCargandoMedsCatalogo(false);
    }
  };

  const handleSeleccionarMed = async (med) => {
    setMedSeleccionado(med);
    setCargandoLotesMed(true);

    const pres = (med.presentacion || '').toLowerCase();
    if (pres.includes('jarabe') || pres.includes('suspensi') || pres.includes('soluci')) {
      setDosisNuevoMed('1 cucharadita (5 ml)');
    } else if (pres.includes('crema') || pres.includes('ung') || pres.includes('pomada') || pres.includes('gel')) {
      setDosisNuevoMed('1 aplicación en zona afectada');
    } else if (pres.includes('inhalad') || pres.includes('spray')) {
      setDosisNuevoMed('1-2 disparos');
    } else {
      setDosisNuevoMed('1 tableta');
    }

    try {
      const lotes = await listarLotes({ estado: 'ACTIVO', medicamentoId: med.idMedicamento });
      const lotesValidos = (Array.isArray(lotes) ? lotes : [])
        .filter((l) => (l.cantidadInicial ?? l.stockDisponible ?? 0) > 0)
        .sort((a, b) => new Date(a.fechaExpiracion) - new Date(b.fechaExpiracion));
      setLotesMedSeleccionado(lotesValidos);
    } catch (err) {
      console.error('Error al consultar lotes del medicamento:', err);
      setLotesMedSeleccionado([]);
    } finally {
      setCargandoLotesMed(false);
    }
  };

  const handleAgregarMedicamento = () => {
    if (!medSeleccionado) return;
    const cant = Math.max(1, parseInt(cantidadNuevoMed, 10) || 1);

    const primerLote = lotesMedSeleccionado.length > 0 ? lotesMedSeleccionado[0] : null;
    const stockTotal = lotesMedSeleccionado.length > 0
      ? lotesMedSeleccionado.reduce(
          (acc, l) => acc + (l.cantidadInicial ?? l.stockDisponible ?? 0),
          0
        )
      : Number(medSeleccionado.unidades || 0);
    const precioUnitario = primerLote
      ? Number(primerLote.precioVenta || primerLote.precioUnitario || 0)
      : Number(medSeleccionado.precio ?? medSeleccionado.precioVenta ?? 0);

    const nuevoItemMed = {
      idMedicamento: medSeleccionado.idMedicamento,
      nombre: medSeleccionado.nombre,
      presentacion: medSeleccionado.presentacion,
      concentracion: medSeleccionado.concentracion,
      dosis: dosisNuevoMed.trim() || '1 unidad',
      frecuencia: frecuenciaNuevoMed.trim() || 'Cada 8 hrs',
      duracion: duracionNuevoMed.trim() || '5 días',
      cantidad: cant,
      stockDisponible: stockTotal,
      precioUnitario: precioUnitario,
      subtotal: precioUnitario * cant,
    };

    setMedicamentos((prev) => {
      const existe = prev.some((m) => m.idMedicamento === medSeleccionado.idMedicamento);
      if (existe) {
        return prev.map((m) => (m.idMedicamento === medSeleccionado.idMedicamento ? nuevoItemMed : m));
      }
      return [...prev, nuevoItemMed];
    });

    if (primerLote) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const exp = primerLote.fechaExpiracion ? new Date(primerLote.fechaExpiracion) : null;
      let dias = null;
      if (exp) {
        dias = Math.ceil((exp - hoy) / (1000 * 60 * 60 * 24));
      }
      const aDescontar = Math.min(cant, primerLote.cantidadInicial ?? primerLote.stockDisponible ?? 0);
      const subtotalLote = precioUnitario * aDescontar;

      const nuevoLoteSugerido = {
        idMedicamento: medSeleccionado.idMedicamento,
        medicamentoNombre: medSeleccionado.nombre,
        idLote: primerLote.idLote,
        numeroLote: primerLote.numeroLote || 'S/L',
        fechaVencimiento: primerLote.fechaExpiracion,
        stockDisponible: primerLote.cantidadInicial ?? primerLote.stockDisponible ?? 0,
        cantidadADescontar: aDescontar,
        diasParaVencer: dias,
        tieneStock: true,
        precioUnitario: precioUnitario,
        subtotal: subtotalLote,
      };

      setLotesSugeridos((prev) => {
        const filtered = prev.filter((l) => l.idMedicamento !== medSeleccionado.idMedicamento);
        return [...filtered, nuevoLoteSugerido];
      });
    } else {
      const nuevoLoteSugerido = {
        idMedicamento: medSeleccionado.idMedicamento,
        medicamentoNombre: medSeleccionado.nombre,
        idLote: null,
        numeroLote: 'SIN STOCK',
        fechaVencimiento: null,
        stockDisponible: 0,
        cantidadADescontar: 0,
        diasParaVencer: null,
        tieneStock: false,
        precioUnitario: 0,
        subtotal: 0,
      };
      setLotesSugeridos((prev) => {
        const filtered = prev.filter((l) => l.idMedicamento !== medSeleccionado.idMedicamento);
        return [...filtered, nuevoLoteSugerido];
      });
    }

    setModalMedOpen(false);
  };

  const medicamentosFiltrados = useMemo(() => {
    if (!busquedaMed.trim()) return catalogoMedicamentos.slice(0, 30);
    const q = busquedaMed.toLowerCase();
    return catalogoMedicamentos
      .filter((m) =>
        (m.nombre && m.nombre.toLowerCase().includes(q)) ||
        (m.presentacion && m.presentacion.toLowerCase().includes(q)) ||
        (m.concentracion && m.concentracion.toLowerCase().includes(q))
      )
      .slice(0, 30);
  }, [catalogoMedicamentos, busquedaMed]);

  // ==========================================
  // MANEJO DE PROCEDIMIENTOS CLÍNICOS
  // ==========================================

  const handleCambiarCantidadProc = (keyIdentificador, nuevaCantidad) => {
    const cant = Math.max(1, parseInt(nuevaCantidad, 10) || 1);
    setProcedimientos((prev) =>
      prev.map((p, idx) => {
        const currentKey = p.idConsultaProcedimiento || `p-${p.idProcedimiento}-${idx}`;
        if (currentKey === keyIdentificador || p.idConsultaProcedimiento === keyIdentificador) {
          const pUnit = Number(p.precioUnitario || 0);
          return { ...p, cantidad: cant, subtotal: pUnit * cant };
        }
        return p;
      })
    );
  };

  const handleEliminarProcedimiento = (keyIdentificador) => {
    setProcedimientos((prev) =>
      prev.filter((p, idx) => {
        const currentKey = p.idConsultaProcedimiento || `p-${p.idProcedimiento}-${idx}`;
        return currentKey !== keyIdentificador && p.idConsultaProcedimiento !== keyIdentificador;
      })
    );
  };

  const abrirModalProc = async () => {
    setModalProcOpen(true);
    setProcSeleccionado(null);
    setCantidadNuevoProc(1);
    setInstruccionesNuevoProc('');
    setCargandoProcsCatalogo(true);
    try {
      const data = await listarActivos();
      setCatalogoProcedimientos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar procedimientos activos:', err);
    } finally {
      setCargandoProcsCatalogo(false);
    }
  };

  const handleAgregarProcedimiento = () => {
    if (!procSeleccionado) return;
    const cant = Math.max(1, parseInt(cantidadNuevoProc, 10) || 1);
    const pUnit = Number(procSeleccionado.precio || 0);

    const nuevoProc = {
      idConsultaProcedimiento: null,
      idProcedimiento: procSeleccionado.idProcedimiento,
      nombreProcedimiento: procSeleccionado.nombre,
      precioUnitario: pUnit,
      cantidad: cant,
      subtotal: pUnit * cant,
      instrucciones: instruccionesNuevoProc.trim(),
      estado: 'ESPERA',
    };

    setProcedimientos((prev) => [...prev, nuevoProc]);
    setModalProcOpen(false);
  };

  // ==========================================
  // DISPENSAR Y COBRAR
  // ==========================================

  const handleDarMedicamentos = async () => {
    if (entregando || procesandoEntrega) return;
    if (!idCola) {
      alert('No se cuenta con un identificador de cola para finalizar el turno.');
      return;
    }

    let observaciones = null;
    if (esBecado) {
      observaciones = 'Becado: Exoneración total de consulta y medicamentos';
    } else if (esSR) {
      observaciones = 'S/R: Exoneración total de consulta y medicamentos';
    } else if (noPagaConsulta) {
      observaciones = 'Exonerado de consulta médica';
    }

    setProcesandoEntrega(true);
    try {
      const payload = {
        noPagaConsulta,
        esCasoEspecial: esExoneracionTotal,
        modalidadCobro: tipoCobro,
        observaciones,
        medicamentos: medicamentos.map((m) => ({
          idMedicamento: m.idMedicamento,
          dosis: m.dosis,
          frecuencia: m.frecuencia,
          duracion: m.duracion,
          cantidad: Number(m.cantidad || 1),
        })),
        procedimientos: procedimientos.map((p) => ({
          idConsultaProcedimiento: p.idConsultaProcedimiento || null,
          idProcedimiento: p.idProcedimiento,
          cantidad: Number(p.cantidad || 1),
          precioUnitario: Number(p.precioUnitario || 0),
          instrucciones: p.instrucciones || '',
        })),
      };

      const res = await entregarMedicamentos(Number(idCola), payload);
      if (res.success) {
        setConfirmandoEntrega(false);
        setEntregaFinalizada(true);
        if (tieneMedicamentos) {
          setTimeout(() => {
            window.print();
          }, 350);
        }
      }
    } finally {
      setProcesandoEntrega(false);
    }
  };

  const formatFecha = (f) => {
    if (!f) return '--';
    try {
      if (typeof f === 'string' && f.includes('T')) {
        const d = new Date(f);
        return d.toLocaleString([], {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      const [y, m, d] = String(f).split('-').map(Number);
      if (y && m && d) {
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
      const dt = new Date(f);
      return dt.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(f);
    }
  };

  return (
    <div style={styles.page}>
      <div className="no-print-area" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
        <AdminNavbar />

        <main style={styles.content}>
          {/* Breadcrumb de navegación */}
          <Breadcrumb
            items={[
              { label: 'Farmacia', to: '/farmacia' },
              { label: 'Dispensación', to: '/farmacia/dispensacion' },
              { label: 'Dispensación De Consulta', to: '/farmacia/dispensacion/consulta' },
              { label: 'Dispensar Medicamentos' },
            ]}
          />

          {/* Header Odoo */}
          <div style={styles.odooHeaderCard}>
            <div style={styles.headerLeft}>
              <div style={styles.avatarThumbWrapper}>
                <Pill size={22} color="#0077b6" />
              </div>

              <div style={styles.verticalDivider}>|</div>

              <div>
                <span style={styles.headerEyebrow}>MÓDULO DE FARMACIA</span>
                <h1 style={styles.headerTitle}>Dispensación de Medicamentos</h1>
              </div>
            </div>

            <div style={styles.headerRight}>
              <button
                type="button"
                onClick={() => navigate('/farmacia/dispensacion/consulta')}
                style={styles.btnVolver}
                title="Volver a la cola"
              >
                <ArrowLeft size={16} />
                <span>Volver a la cola</span>
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading && !receta ? (
            <div style={styles.loadingBox}>
              <p style={{ margin: 0, color: '#0077b6', fontWeight: 600 }}>
                Cargando receta e indicaciones del paciente...
              </p>
            </div>
          ) : (
            <div className="dispensar-workspace-grid" style={styles.layoutGrid}>
              {/* Columna Izquierda: Resumen de Cobro y Acciones */}
              <aside style={styles.leftCol}>
                <div style={styles.billingCard}>
                  <div style={styles.billingHeader}>
                    <span style={styles.billingEyebrow}>RESUMEN DE PAGO</span>
                    <div style={styles.billingTotalAmount}>Q {totalAPagar.toFixed(2)}</div>
                  </div>

                  <div style={styles.billingDivider} />

                  <div style={styles.billingRow}>
                    <span style={styles.billingLabel}>
                      {receta?.nombreTarifaConsulta ? `${receta.nombreTarifaConsulta}:` : 'Tarifa de Consulta Médica:'}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      {noPagaConsulta ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>
                            Q {precioConsultaOriginal.toFixed(2)}
                          </span>
                          <span style={{ color: '#059669', fontWeight: '800', fontSize: '13px' }}>Q 0.00</span>
                        </div>
                      ) : (
                        <span style={styles.billingVal}>Q {precioConsultaOriginal.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.billingRow}>
                    <span style={styles.billingLabel}>Medicamentos:</span>
                    <div style={{ textAlign: 'right' }}>
                      {esExoneracionTotal ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>
                            Q {totalMedicamentosOriginal.toFixed(2)}
                          </span>
                          <span style={{ color: '#059669', fontWeight: '800', fontSize: '13px' }}>Q 0.00</span>
                        </div>
                      ) : (
                        <span style={styles.billingVal}>Q {totalMedicamentosOriginal.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.billingRow}>
                    <span style={styles.billingLabel}>Procedimientos:</span>
                    <div style={{ textAlign: 'right' }}>
                      {esExoneracionTotal ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>
                            Q {totalProcedimientosOriginal.toFixed(2)}
                          </span>
                          <span style={{ color: '#059669', fontWeight: '800', fontSize: '13px' }}>Q 0.00</span>
                        </div>
                      ) : (
                        <span style={styles.billingVal}>Q {totalProcedimientosOriginal.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  {/* Modalidades de Cobro */}
                  <div style={styles.modalidadCobroBox}>
                    <span style={styles.modalidadTitle}>Modalidad de Cobro:</span>

                    <label style={styles.radioLabelWrapper}>
                      <input
                        type="radio"
                        name="tipoCobro"
                        value="NORMAL"
                        checked={tipoCobro === 'NORMAL'}
                        onChange={(e) => setTipoCobro(e.target.value)}
                        style={styles.radioInput}
                      />
                      <span style={styles.radioText}>Cobro Normal (Consulta + Medicinas + Procs)</span>
                    </label>

                    <label style={styles.radioLabelWrapper}>
                      <input
                        type="radio"
                        name="tipoCobro"
                        value="NO_PAGA_CONSULTA"
                        checked={tipoCobro === 'NO_PAGA_CONSULTA'}
                        onChange={(e) => setTipoCobro(e.target.value)}
                        style={styles.radioInput}
                      />
                      <span style={styles.radioText}>Exonerar solo Consulta</span>
                    </label>

                    <label style={styles.radioLabelWrapper}>
                      <input
                        type="radio"
                        name="tipoCobro"
                        value="SR"
                        checked={tipoCobro === 'SR'}
                        onChange={(e) => setTipoCobro(e.target.value)}
                        style={styles.radioInput}
                      />
                      <span style={styles.radioText}>★ S/R</span>
                    </label>

                    <label style={styles.radioLabelWrapper}>
                      <input
                        type="radio"
                        name="tipoCobro"
                        value="BECADO"
                        checked={tipoCobro === 'BECADO'}
                        onChange={(e) => setTipoCobro(e.target.value)}
                        style={styles.radioInput}
                      />
                      <span style={styles.radioText}>★ Becado</span>
                    </label>

                    {esExoneracionTotal && (
                      <div
                        style={{
                          ...styles.casoEspecialBadge,
                          backgroundColor: esBecado ? '#f0f9ff' : '#fef3c7',
                          borderColor: esBecado ? '#bae6fd' : '#fde68a',
                          color: esBecado ? '#0369a1' : '#b45309',
                        }}
                      >
                        ✓ {esBecado ? 'Becado' : 'S/R'}: 100% Exonerado (Valor absorbido: Q{' '}
                        {(totalMedicamentosOriginal + totalProcedimientosOriginal).toFixed(2)})
                      </div>
                    )}

                    {tipoCobro === 'NO_PAGA_CONSULTA' && (
                      <div style={styles.exoneradoBadge}>✓ Consulta médica exonerada (Q 0.00)</div>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div style={styles.actionButtonsStack}>
                  <button
                    type="button"
                    onClick={() => setConfirmandoEntrega(true)}
                    disabled={entregando || procesandoEntrega}
                    style={styles.btnDar}
                    title="Dispensar medicamentos, registrar cobro e imprimir comprobante"
                  >
                    {entregando || procesandoEntrega ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        <span>
                          {tieneMedicamentos || totalProcedimientosOriginal > 0
                            ? 'Dispensar y Cobrar'
                            : 'Cobrar Consulta'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/farmacia/dispensacion/consulta')}
                    disabled={entregando}
                    style={styles.btnCancelar}
                    title="Volver a la cola"
                  >
                    <span>Cancelar</span>
                  </button>
                </div>
              </aside>

              {/* Columna Derecha: Información, Indicaciones y Tablas */}
              <section style={styles.rightCol}>
                {/* 1. Datos de la Consulta Médica */}
                <div style={styles.infoCard}>
                  <div style={styles.infoHeader}>
                    <User size={18} color="#0077b6" />
                    <h3 style={styles.infoTitle}>Datos de la Consulta Médica</h3>
                  </div>

                  <div className="dispensar-summary-grid" style={styles.summaryGrid}>
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>Paciente</span>
                      <span style={styles.summaryVal}>
                        {receta?.nombreCompletoPaciente || 'No especificado'}
                      </span>
                    </div>

                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>Médico Tratante</span>
                      <span style={styles.summaryVal}>
                        {receta?.nombreMedico || 'No asignado'}
                      </span>
                    </div>

                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>Edad</span>
                      <span style={styles.summaryVal}>
                        {receta?.edad !== null && receta?.edad !== undefined ? (
                          <>
                            {receta.edad} años
                            {receta.edad < 13 && (
                              <span
                                style={{
                                  marginLeft: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: '#047857',
                                  backgroundColor: '#ecfdf5',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #a7f3d0',
                                }}
                              >
                                Niño (&lt; 13)
                              </span>
                            )}
                          </>
                        ) : (
                          'No especificada'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicaciones Generales si las hubiere */}
                {receta?.observacionesTratamiento && (
                  <div style={styles.indicationsCard}>
                    <div style={styles.indicationsHeader}>
                      <FileText size={18} color="#0284c7" />
                      <h3 style={styles.indicationsTitle}>Indicaciones Generales del Médico</h3>
                    </div>
                    <p style={styles.indicationsText}>{receta.observacionesTratamiento}</p>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 1. SECCIÓN: MEDICAMENTOS RECETADOS PARA ENTREGA         */}
                {/* ======================================================== */}
                <div style={styles.tableCard}>
                  <div style={styles.tableHeaderBar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Pill size={18} color="#0077b6" />
                      <h3 style={styles.tableTitle}>Medicamentos Recetados para Entrega</h3>
                      <span style={styles.badgeContador}>
                        {medicamentos.length} {medicamentos.length === 1 ? 'medicamento' : 'medicamentos'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={abrirModalMed}
                      style={styles.btnAddItem}
                      title="Agregar medicamento adicional o sustituto a la receta"
                    >
                      <Plus size={15} />
                      <span>Agregar Medicamento</span>
                    </button>
                  </div>

                  {medicamentos.length > 0 ? (
                    <div className="dispensar-table-responsive" style={styles.tableResponsive}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={{ ...styles.th, width: '23%' }}>Medicamento</th>
                            <th style={{ ...styles.th, width: '15%' }}>Presentación / Conc.</th>
                            <th style={{ ...styles.th, width: '18%' }}>Dosis / Toma</th>
                            <th style={{ ...styles.th, width: '15%' }}>Frecuencia</th>
                            <th style={{ ...styles.th, width: '11%' }}>Duración</th>
                            <th style={{ ...styles.th, width: '12%', textAlign: 'center' }}>
                              Cantidad a Entregar
                            </th>
                            <th style={{ ...styles.th, width: '6%', textAlign: 'center' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicamentos.map((m) => {
                            const stockBajo =
                              m.stockDisponible !== null &&
                              m.stockDisponible !== undefined &&
                              m.stockDisponible < m.cantidad;

                            return (
                              <tr key={m.idMedicamento} style={styles.tr}>
                                <td style={styles.td}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <strong style={{ color: '#03045e', fontSize: '13.5px' }}>
                                      {m.nombre}
                                    </strong>
                                    {stockBajo && (
                                      <span style={styles.warningStock}>
                                        Stock bajo en farmacia: {m.stockDisponible} disponibles
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td style={styles.td}>
                                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {m.presentacion && (
                                      <span style={styles.badgePres}>{m.presentacion}</span>
                                    )}
                                    {m.concentracion && (
                                      <span style={styles.badgeConc}>{m.concentracion}</span>
                                    )}
                                    {!m.presentacion && !m.concentracion && (
                                      <span style={{ color: '#94a3b8' }}>—</span>
                                    )}
                                  </div>
                                </td>

                                <td style={styles.td}>
                                  <input
                                    type="text"
                                    value={m.dosis || ''}
                                    onChange={(e) => handleEditarCampoMed(m.idMedicamento, 'dosis', e.target.value)}
                                    style={styles.editableInput}
                                    placeholder="Dosis..."
                                    title="Modificar dosis de toma"
                                  />
                                </td>

                                <td style={styles.td}>
                                  <input
                                    type="text"
                                    value={m.frecuencia || ''}
                                    onChange={(e) => handleEditarCampoMed(m.idMedicamento, 'frecuencia', e.target.value)}
                                    style={styles.editableInput}
                                    placeholder="Frecuencia..."
                                    title="Modificar frecuencia"
                                  />
                                </td>

                                <td style={styles.td}>
                                  <input
                                    type="text"
                                    value={m.duracion || ''}
                                    onChange={(e) => handleEditarCampoMed(m.idMedicamento, 'duracion', e.target.value)}
                                    style={styles.editableInput}
                                    placeholder="Duración..."
                                    title="Modificar duración"
                                  />
                                </td>

                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                  <div style={styles.stepperContainer}>
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarCantidadMed(m.idMedicamento, Number(m.cantidad || 1) - 1)}
                                      disabled={Number(m.cantidad || 1) <= 1}
                                      style={styles.stepperBtn}
                                      title="Disminuir cantidad"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={m.cantidad ?? 1}
                                      onChange={(e) => handleCambiarCantidadMed(m.idMedicamento, e.target.value)}
                                      style={styles.stepperInput}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarCantidadMed(m.idMedicamento, Number(m.cantidad || 1) + 1)}
                                      style={styles.stepperBtn}
                                      title="Aumentar cantidad"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                                    {getUnidadTexto(m)}
                                  </span>
                                </td>

                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarMedicamento(m.idMedicamento)}
                                    style={styles.btnEliminar}
                                    title="Eliminar medicamento de la receta"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={styles.emptyTable}>
                      <Pill size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
                      <p style={{ margin: 0, color: '#475569', fontWeight: '600', fontSize: '14px' }}>
                        Sin Medicamentos Recetados
                      </p>
                      <p style={{ margin: '4px 0 12px', color: '#94a3b8', fontSize: '13px' }}>
                        Esta consulta médica actualmente no contiene medicamentos para entrega.
                      </p>
                      <button
                        type="button"
                        onClick={abrirModalMed}
                        style={styles.btnAddItemSmall}
                      >
                        <Plus size={14} />
                        <span>Agregar Medicamento a la Receta</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* 2. SECCIÓN: PROCEDIMIENTOS CLÍNICOS PRESCRITOS         */}
                {/* ======================================================== */}
                <div style={styles.tableCard}>
                  <div style={styles.tableHeaderBar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} color="#0077b6" />
                      <h3 style={styles.tableTitle}>Procedimientos Clínicos Prescritos</h3>
                      <span style={styles.badgeContador}>
                        {procedimientos.length} {procedimientos.length === 1 ? 'procedimiento' : 'procedimientos'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={abrirModalProc}
                      style={styles.btnAddItem}
                      title="Agregar procedimiento clínico a la cuenta"
                    >
                      <Plus size={15} />
                      <span>Agregar Procedimiento</span>
                    </button>
                  </div>

                  {procedimientos.length > 0 ? (
                    <div className="dispensar-table-responsive" style={styles.tableResponsive}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={{ ...styles.th, width: '30%' }}>Procedimiento</th>
                            <th style={{ ...styles.th, width: '26%' }}>Instrucciones del Médico</th>
                            <th style={{ ...styles.th, width: '16%', textAlign: 'center' }}>Cantidad</th>
                            <th style={{ ...styles.th, width: '11%', textAlign: 'right' }}>Precio Unit.</th>
                            <th style={{ ...styles.th, width: '11%', textAlign: 'right' }}>Subtotal</th>
                            <th style={{ ...styles.th, width: '6%', textAlign: 'center' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {procedimientos.map((proc, pIdx) => {
                            const pKey = proc.idConsultaProcedimiento || `p-${proc.idProcedimiento}-${pIdx}`;
                            const pUnit = Number(proc.precioUnitario || 0);
                            const cant = Number(proc.cantidad || 1);
                            const subtotal = Number(proc.subtotal ?? pUnit * cant);

                            return (
                              <tr key={pKey} style={styles.tr}>
                                <td style={styles.td}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <strong style={{ color: '#03045e', fontSize: '13.5px' }}>
                                      {proc.nombreProcedimiento}
                                    </strong>
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        width: 'fit-content',
                                        background: proc.estado === 'ATENDIDO' ? '#ecfdf5' : '#eff6ff',
                                        color: proc.estado === 'ATENDIDO' ? '#047857' : '#0284c7',
                                        border: `1px solid ${
                                          proc.estado === 'ATENDIDO' ? '#a7f3d0' : '#bfdbfe'
                                        }`,
                                      }}
                                    >
                                      {proc.estado || 'ESPERA'}
                                    </span>
                                  </div>
                                </td>

                                <td style={styles.td}>
                                  <span
                                    style={{
                                      color: proc.instrucciones ? '#334155' : '#94a3b8',
                                      fontSize: '13px',
                                      fontStyle: proc.instrucciones ? 'normal' : 'italic',
                                    }}
                                  >
                                    {proc.instrucciones || 'Sin instrucciones adicionales'}
                                  </span>
                                </td>

                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                  <div style={styles.stepperContainer}>
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarCantidadProc(pKey, cant - 1)}
                                      disabled={cant <= 1}
                                      style={styles.stepperBtn}
                                      title="Disminuir cantidad"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={cant}
                                      onChange={(e) => handleCambiarCantidadProc(pKey, e.target.value)}
                                      style={styles.stepperInput}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleCambiarCantidadProc(pKey, cant + 1)}
                                      style={styles.stepperBtn}
                                      title="Aumentar cantidad"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                                    {cant === 1 ? 'servicio' : 'servicios'}
                                  </span>
                                </td>

                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <span style={{ color: '#475569', fontWeight: '600', fontSize: '13px' }}>
                                    Q {pUnit.toFixed(2)}
                                  </span>
                                </td>

                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <strong style={{ color: '#059669', fontSize: '13.5px' }}>
                                    Q {subtotal.toFixed(2)}
                                  </strong>
                                </td>

                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarProcedimiento(pKey)}
                                    style={styles.btnEliminar}
                                    title="Eliminar procedimiento de la cuenta"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="4" style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#475569' }}>
                              Subtotal Procedimientos:
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#03045e', fontSize: '14px' }}>
                              Q {totalProcedimientosOriginal.toFixed(2)}
                            </td>
                            <td style={styles.td}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div style={styles.emptyTable}>
                      <Activity size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
                      <p style={{ margin: 0, color: '#475569', fontWeight: '600', fontSize: '14px' }}>
                        Sin Procedimientos Clínicos Prescritos
                      </p>
                      <p style={{ margin: '4px 0 12px', color: '#94a3b8', fontSize: '13px' }}>
                        Esta consulta médica no incluye procedimientos registrados. Puedes agregar uno si se realizó en la clínica.
                      </p>
                      <button
                        type="button"
                        onClick={abrirModalProc}
                        style={styles.btnAddItemSmall}
                      >
                        <Plus size={14} />
                        <span>Agregar Procedimiento</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* 3. SECCIÓN: MEDICAMENTOS SUGERIDOS A DAR (LOTES)        */}
                {/* ======================================================== */}
                <div style={styles.suggestionCard}>
                  <div style={styles.suggestionHeader}>
                    <div style={styles.suggestionHeaderLeft}>
                      <div style={styles.suggestionIconWrapper}>
                        <Clock size={18} color="#0077b6" />
                      </div>
                      <div>
                        <h3 style={styles.suggestionTitle}>Medicamentos sugeridos a dar</h3>
                        <p style={styles.suggestionSubtitle}>
                          Lotes recomendados más próximos a vencer (FEFO). Al dar clic en <strong>Dispensar y Cobrar</strong>, el sistema descontará automáticamente de estos lotes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {lotesSugeridos && lotesSugeridos.length > 0 ? (
                    <div className="dispensar-table-responsive" style={styles.suggestionTableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={{ ...styles.th, width: '22%' }}>Medicamento</th>
                            <th style={{ ...styles.th, width: '14%' }}>Número de Lote</th>
                            <th style={{ ...styles.th, width: '18%' }}>Fecha de Vencimiento</th>
                            <th style={{ ...styles.th, width: '11%', textAlign: 'center' }}>Stock</th>
                            <th style={{ ...styles.th, width: '11%', textAlign: 'center' }}>A Descontar</th>
                            <th style={{ ...styles.th, width: '12%', textAlign: 'right' }}>Precio Unit.</th>
                            <th style={{ ...styles.th, width: '12%', textAlign: 'right' }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lotesSugeridos.map((lote, idx) => {
                            const dias = lote.diasParaVencer;
                            const esCritico = dias !== null && dias !== undefined && dias <= 30;
                            const esAlerta = dias !== null && dias !== undefined && dias > 30 && dias <= 90;
                            const pUnit = Number(lote.precioUnitario || 0);
                            const cant = Number(lote.cantidadADescontar || 0);
                            const subtotal = pUnit * cant;

                            return (
                              <tr key={idx} style={styles.tr}>
                                <td style={styles.td}>
                                  <strong style={{ color: '#03045e', fontSize: '13px' }}>
                                    {lote.medicamentoNombre}
                                  </strong>
                                </td>
                                <td style={styles.td}>
                                  <span style={styles.loteBadge}>{lote.numeroLote || 'S/L'}</span>
                                </td>
                                <td style={styles.td}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ color: '#1e293b', fontWeight: '600', fontSize: '13px' }}>
                                      {formatFecha(lote.fechaVencimiento)}
                                    </span>
                                    {lote.tieneStock && dias !== null && (
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          color: esCritico ? '#dc2626' : esAlerta ? '#d97706' : '#059669',
                                        }}
                                      >
                                        {dias < 0
                                          ? `Vencido hace ${Math.abs(dias)} días`
                                          : dias === 0
                                          ? 'Vence hoy'
                                          : `Vence en ${dias} días`}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                  <span
                                    style={{
                                      ...styles.stockLoteBadge,
                                      background: lote.stockDisponible > 0 ? '#ecfdf5' : '#fef2f2',
                                      color: lote.stockDisponible > 0 ? '#059669' : '#dc2626',
                                      borderColor: lote.stockDisponible > 0 ? '#a7f3d0' : '#fecaca',
                                    }}
                                  >
                                    {lote.stockDisponible}{' '}
                                    {lote.stockDisponible === 1 ? 'unidad' : 'unidades'}
                                  </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                  <span style={styles.descontarBadge}>
                                    - {cant} {cant === 1 ? 'unidad' : 'unidades'}
                                  </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <span style={{ color: '#475569', fontWeight: '600', fontSize: '13px' }}>
                                    Q {pUnit.toFixed(2)}
                                  </span>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                  <strong style={{ color: '#059669', fontSize: '13px' }}>
                                    Q {subtotal.toFixed(2)}
                                  </strong>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="6" style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#475569' }}>
                              Subtotal Medicamentos:
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#059669', fontSize: '14px' }}>
                              Q {totalMedicamentosOriginal.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div style={styles.suggestionEmpty}>
                      <p style={{ margin: 0, color: '#64748b' }}>
                        No hay lotes sugeridos disponibles para esta consulta médica.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL: AGREGAR MEDICAMENTO                              */}
          {/* ======================================================== */}
          {modalMedOpen && (
            <div style={styles.modalOverlay}>
              <div style={{ ...styles.modalCard, maxWidth: '600px' }}>
                <div style={styles.modalHeader}>
                  <div style={styles.modalIconMed}>
                    <Pill size={22} color="#0284c7" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.modalTitle}>Agregar Medicamento a la Receta</h3>
                    <p style={styles.modalSub}>
                      Busca y selecciona un medicamento activo del inventario de farmacia.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalMedOpen(false)}
                    style={styles.btnCloseModal}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ padding: '0 0 16px' }}>
                  {/* Buscador de medicamentos */}
                  <div style={styles.searchWrapper}>
                    <Search size={16} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, presentación o principio activo..."
                      value={busquedaMed}
                      onChange={(e) => setBusquedaMed(e.target.value)}
                      style={styles.searchInput}
                      autoFocus
                    />
                  </div>

                  {/* Lista de medicamentos encontrados */}
                  <div style={styles.medResultsList}>
                    {cargandoMedsCatalogo ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                        <span style={{ marginLeft: '8px' }}>Cargando catálogo...</span>
                      </div>
                    ) : medicamentosFiltrados.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        No se encontraron medicamentos activos con ese criterio.
                      </div>
                    ) : (
                      medicamentosFiltrados.map((m) => {
                        const isSelected = medSeleccionado?.idMedicamento === m.idMedicamento;
                        return (
                          <div
                            key={m.idMedicamento}
                            onClick={() => handleSeleccionarMed(m)}
                            style={{
                              ...styles.medResultItem,
                              borderColor: isSelected ? '#0284c7' : '#e2e8f0',
                              backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <strong style={{ color: '#03045e', fontSize: '13.5px', display: 'block' }}>
                                {m.nombre}
                              </strong>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {m.presentacion || 'Sin presentación'}
                                {m.concentracion ? ` • ${m.concentracion}` : ''}
                                {m.casaFarmaceuticaNombre ? ` • ${m.casaFarmaceuticaNombre}` : ''}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', display: 'block' }}>
                                Q {Number(m.precio ?? m.precioVenta ?? 0).toFixed(2)}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                Stock: {m.unidades ?? m.stockTotal ?? m.stockDisponible ?? 0}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Campos si hay medicamento seleccionado */}
                  {medSeleccionado && (
                    <div style={styles.selectedMedConfigBox}>
                      <div style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase' }}>
                          Medicamento Seleccionado:
                        </span>
                        <h4 style={{ margin: '2px 0 0', color: '#03045e', fontSize: '14px' }}>
                          {medSeleccionado.nombre} {medSeleccionado.concentracion ? `(${medSeleccionado.concentracion})` : ''}
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                          <span>Presentación: <strong>{medSeleccionado.presentacion || '—'}</strong></span>
                          <span>•</span>
                          <span>
                            Lotes con Stock:{' '}
                            <strong style={{ color: lotesMedSeleccionado.length > 0 ? '#059669' : '#dc2626' }}>
                              {cargandoLotesMed
                                ? 'Consultando...'
                                : lotesMedSeleccionado.length > 0
                                ? `${lotesMedSeleccionado.length} lote(s) disponibles`
                                : 'Sin stock activo'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div style={styles.gridConfigInputs}>
                        <div>
                          <label style={styles.inputLabel}>Dosis / Toma:</label>
                          <input
                            type="text"
                            value={dosisNuevoMed}
                            onChange={(e) => setDosisNuevoMed(e.target.value)}
                            style={styles.formInput}
                            placeholder="Ej. 1 tableta, 5 ml..."
                          />
                        </div>

                        <div>
                          <label style={styles.inputLabel}>Frecuencia:</label>
                          <input
                            type="text"
                            value={frecuenciaNuevoMed}
                            onChange={(e) => setFrecuenciaNuevoMed(e.target.value)}
                            style={styles.formInput}
                            placeholder="Ej. Cada 8 hrs, Cada 12 hrs..."
                          />
                        </div>

                        <div>
                          <label style={styles.inputLabel}>Duración:</label>
                          <input
                            type="text"
                            value={duracionNuevoMed}
                            onChange={(e) => setDuracionNuevoMed(e.target.value)}
                            style={styles.formInput}
                            placeholder="Ej. 3 días, 5 días..."
                          />
                        </div>

                        <div>
                          <label style={styles.inputLabel}>Cantidad a Entregar:</label>
                          <input
                            type="number"
                            min="1"
                            value={cantidadNuevoMed}
                            onChange={(e) => setCantidadNuevoMed(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            style={styles.formInput}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setModalMedOpen(false)}
                    style={styles.btnModalCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAgregarMedicamento}
                    disabled={!medSeleccionado}
                    style={{
                      ...styles.btnModalConfirmDeliver,
                      opacity: !medSeleccionado ? 0.5 : 1,
                      cursor: !medSeleccionado ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Agregar a la Receta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL: AGREGAR PROCEDIMIENTO                             */}
          {/* ======================================================== */}
          {modalProcOpen && (
            <div style={styles.modalOverlay}>
              <div style={{ ...styles.modalCard, maxWidth: '520px' }}>
                <div style={styles.modalHeader}>
                  <div style={styles.modalIconProc}>
                    <Activity size={22} color="#0077b6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.modalTitle}>Agregar Procedimiento Clínico</h3>
                    <p style={styles.modalSub}>
                      Selecciona un procedimiento del catálogo de la clínica para agregarlo a la cuenta.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalProcOpen(false)}
                    style={styles.btnCloseModal}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ padding: '0 0 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={styles.inputLabel}>Procedimiento:</label>
                    {cargandoProcsCatalogo ? (
                      <div style={{ padding: '10px', color: '#64748b', fontSize: '13px' }}>
                        Cargando catálogo de procedimientos...
                      </div>
                    ) : (
                      <select
                        style={styles.formSelect}
                        value={procSeleccionado?.idProcedimiento || ''}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const p = catalogoProcedimientos.find((item) => item.idProcedimiento === id);
                          setProcSeleccionado(p || null);
                        }}
                      >
                        <option value="">-- Selecciona un procedimiento --</option>
                        {catalogoProcedimientos.map((p) => (
                          <option key={p.idProcedimiento} value={p.idProcedimiento}>
                            {p.nombre} — Q {Number(p.precio || 0).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={styles.inputLabel}>Cantidad (Servicios):</label>
                      <input
                        type="number"
                        min="1"
                        value={cantidadNuevoProc}
                        onChange={(e) => setCantidadNuevoProc(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        style={styles.formInput}
                      />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>Precio Unitario:</label>
                      <div style={styles.priceReadonlyBox}>
                        Q {Number(procSeleccionado?.precio || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={styles.inputLabel}>Instrucciones del Procedimiento (Opcional):</label>
                    <textarea
                      rows="2"
                      value={instruccionesNuevoProc}
                      onChange={(e) => setInstruccionesNuevoProc(e.target.value)}
                      style={styles.formTextarea}
                      placeholder="Ej. Nebulización con solución salina, curación en brazo..."
                    />
                  </div>

                  {procSeleccionado && (
                    <div style={styles.subtotalPreviewBox}>
                      <span style={{ color: '#475569', fontSize: '13px', fontWeight: '500' }}>
                        Subtotal a sumar:
                      </span>
                      <strong style={{ color: '#0077b6', fontSize: '16px' }}>
                        Q {(Number(procSeleccionado.precio || 0) * cantidadNuevoProc).toFixed(2)}
                      </strong>
                    </div>
                  )}
                </div>

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setModalProcOpen(false)}
                    style={styles.btnModalCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAgregarProcedimiento}
                    disabled={!procSeleccionado}
                    style={{
                      ...styles.btnModalConfirmDeliver,
                      opacity: !procSeleccionado ? 0.5 : 1,
                      cursor: !procSeleccionado ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Agregar Procedimiento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL: CONFIRMAR DISPENSACIÓN Y COBRO                    */}
          {/* ======================================================== */}
          {confirmandoEntrega && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <div style={styles.modalHeader}>
                  <div style={styles.modalIconWarning}>
                    <AlertTriangle size={24} color="#d97706" />
                  </div>
                  <div>
                    <h3 style={styles.modalTitle}>Confirmar Entrega y Cobro</h3>
                    <p style={styles.modalSub}>
                      {tieneMedicamentos
                        ? 'Esta acción descontará el inventario según los medicamentos editados y finalizará el turno.'
                        : 'Esta acción registrará el pago de consulta y procedimientos, finalizando el turno del paciente.'}
                    </p>
                  </div>
                </div>

                <div style={styles.modalBody}>
                  <p style={{ margin: '0 0 14px', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                    ¿Confirmas {tieneMedicamentos ? 'la entrega de medicamentos y cobro' : 'el cobro'} para{' '}
                    <strong>{receta?.nombreCompletoPaciente}</strong>?
                  </p>

                  <div style={styles.modalSummaryBox}>
                    <div style={styles.modalSummaryRow}>
                      <span>
                        {receta?.nombreTarifaConsulta ? `${receta.nombreTarifaConsulta}:` : 'Tarifa Consulta Médica:'}
                      </span>
                      <strong style={{ color: noPagaConsulta ? '#059669' : '#1e293b' }}>
                        {noPagaConsulta ? 'Q 0.00 (Exonerada)' : `Q ${precioConsultaOriginal.toFixed(2)}`}
                      </strong>
                    </div>

                    <div style={styles.modalSummaryRow}>
                      <span>Medicamentos a Dispensar ({medicamentos.length}):</span>
                      <strong style={{ color: esExoneracionTotal ? '#059669' : '#1e293b' }}>
                        {esExoneracionTotal
                          ? `Q 0.00 (Exonerado - Valor: Q ${totalMedicamentosOriginal.toFixed(2)})`
                          : `Q ${totalMedicamentos.toFixed(2)}`}
                      </strong>
                    </div>

                    <div style={styles.modalSummaryRow}>
                      <span>Procedimientos Clínicos ({procedimientos.length}):</span>
                      <strong style={{ color: esExoneracionTotal ? '#059669' : '#1e293b' }}>
                        {esExoneracionTotal
                          ? `Q 0.00 (Exonerado - Valor: Q ${totalProcedimientosOriginal.toFixed(2)})`
                          : `Q ${totalProcedimientosOriginal.toFixed(2)}`}
                      </strong>
                    </div>

                    <div style={{ ...styles.modalSummaryRow, borderTop: '1px solid #cbd5e1', paddingTop: '8px', marginTop: '6px' }}>
                      <span style={{ fontWeight: '700', color: '#03045e' }}>Total a Cobrar al Paciente:</span>
                      <span style={{ fontWeight: '800', color: esExoneracionTotal ? '#059669' : '#0077b6', fontSize: '16px' }}>
                        Q {totalAPagar.toFixed(2)} {esExoneracionTotal && `(${esBecado ? 'Becado' : 'S/R'})`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.modalFooter}>
                  <button
                    onClick={() => setConfirmandoEntrega(false)}
                    style={styles.btnModalCancel}
                    disabled={entregando || procesandoEntrega}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDarMedicamentos}
                    style={styles.btnModalConfirmDeliver}
                    disabled={entregando || procesandoEntrega}
                  >
                    {entregando || procesandoEntrega ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '6px' }} />
                        <span>{tieneMedicamentos ? 'Registrando entrega...' : 'Registrando cobro...'}</span>
                      </>
                    ) : tieneMedicamentos ? (
                      'Confirmar y Finalizar'
                    ) : (
                      'Confirmar Cobro'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODAL: ENTREGA / COBRO EXITOSO                          */}
          {/* ======================================================== */}
          {entregaFinalizada && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <div style={styles.modalHeader}>
                  <div style={styles.modalIconCheck}>
                    <CheckCircle2 size={24} color="#059669" />
                  </div>
                  <div>
                    <h3 style={styles.modalTitle}>
                      {tieneMedicamentos ? '¡Medicamentos Entregados con Éxito!' : '¡Cobro Registrado con Éxito!'}
                    </h3>
                    <p style={styles.modalSub}>
                      {tieneMedicamentos
                        ? 'El inventario ha sido actualizado y el turno del paciente ha finalizado.'
                        : 'El pago de la consulta y procedimientos ha sido registrado y el turno ha finalizado.'}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  {tieneMedicamentos ? (
                    <>
                      <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14px', lineHeight: 1.5 }}>
                        La receta médica se abrió para imprimir con los medicamentos actualizados. Si no se abrió o necesitas otra copia, puedes volver a imprimirla.
                      </p>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          style={styles.btnPrintModal}
                        >
                          <Printer size={16} />
                          <span>Volver a Imprimir Receta</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/farmacia/dispensacion/consulta')}
                          style={styles.btnFinalizarModal}
                        >
                          <span>Finalizar y Salir</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: '0 0 16px', color: '#334155', fontSize: '14px', lineHeight: 1.5 }}>
                        Esta consulta no requirió prescripción de medicamentos. El proceso de cobro se ha completado satisfactoriamente.
                      </p>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => navigate('/farmacia/dispensacion/consulta')}
                          style={styles.btnFinalizarModal}
                        >
                          <CheckCircle2 size={16} />
                          <span>Finalizar y Salir</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Componente Modular de Impresión de Receta (Con medicamentos sincronizados) */}
      {tieneMedicamentos && (
        <RecetaMedicaPrint receta={{ ...receta, medicamentos }} duplicar={false} />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '24px 32px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  odooHeaderCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatarThumbWrapper: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    fontSize: '22px',
    color: '#cbd5e1',
    fontWeight: '300',
  },
  headerEyebrow: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#0077b6',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  headerTitle: {
    margin: '2px 0 0',
    fontSize: '20px',
    fontWeight: '800',
    color: '#03045e',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  btnVolver: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
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
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  loadingBox: {
    padding: '48px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  billingCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  billingHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  billingEyebrow: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#0077b6',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  billingTotalAmount: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#03045e',
    lineHeight: '1.2',
  },
  billingDivider: {
    height: '1px',
    background: '#f1f5f9',
    margin: '2px 0',
  },
  billingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  billingLabel: {
    color: '#64748b',
    fontWeight: '500',
  },
  billingVal: {
    color: '#1e293b',
    fontWeight: '700',
  },
  modalidadCobroBox: {
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '1px dashed #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  modalidadTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '2px',
  },
  radioLabelWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#334155',
  },
  radioInput: {
    margin: 0,
    cursor: 'pointer',
    width: '15px',
    height: '15px',
    accentColor: '#0077b6',
  },
  radioText: {
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '1.2',
  },
  casoEspecialBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#b45309',
    background: '#fef3c7',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #fde68a',
    marginTop: '2px',
    display: 'inline-block',
  },
  exoneradoBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#059669',
    background: '#ecfdf5',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid #a7f3d0',
    alignSelf: 'flex-start',
  },
  actionButtonsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
  btnDar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 119, 182, 0.25)',
    transition: 'background 0.2s',
  },
  btnCancelar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '11px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: 0,
  },
  infoCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  infoTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#03045e',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  summaryItem: {
    background: '#f8fafc',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#03045e',
  },
  indicationsCard: {
    background: '#f0f9ff',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
    padding: '18px 20px',
  },
  indicationsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  indicationsTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#0369a1',
  },
  indicationsText: {
    margin: 0,
    fontSize: '14px',
    color: '#0f172a',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  tableCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  tableHeaderBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  tableTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#03045e',
  },
  badgeContador: {
    fontSize: '11.5px',
    fontWeight: '600',
    background: '#f1f5f9',
    color: '#475569',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
  },
  btnAddItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '7px 14px',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0, 119, 182, 0.2)',
    transition: 'all 0.15s ease',
  },
  btnAddItemSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#0077b6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tableResponsive: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: '13.5px',
    textAlign: 'left',
  },
  th: {
    background: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '11.5px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '11px 14px',
    borderBottom: '2px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '10px 14px',
    verticalAlign: 'middle',
    borderBottom: '1px solid #f1f5f9',
  },
  badgePres: {
    display: 'inline-block',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '2px 7px',
    borderRadius: '5px',
    fontSize: '11.5px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  badgeConc: {
    display: 'inline-block',
    background: '#e0f2fe',
    color: '#0369a1',
    border: '1px solid #bae6fd',
    padding: '2px 7px',
    borderRadius: '5px',
    fontSize: '11.5px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  editableInput: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 8px',
    fontSize: '12.5px',
    color: '#1e293b',
    background: '#ffffff',
    outline: 'none',
    transition: 'border 0.2s',
  },
  stepperContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    overflow: 'hidden',
    background: '#ffffff',
  },
  stepperBtn: {
    background: '#f1f5f9',
    border: 'none',
    width: '26px',
    height: '28px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    width: '42px',
    height: '28px',
    border: 'none',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#03045e',
    outline: 'none',
  },
  btnEliminar: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  warningStock: {
    fontSize: '11px',
    color: '#dc2626',
    fontWeight: '600',
  },
  emptyTable: {
    padding: '28px 20px',
    textAlign: 'center',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionCard: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  suggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionHeaderLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  suggestionIconWrapper: {
    background: '#e0f2fe',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTitle: {
    margin: '0 0 2px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#03045e',
  },
  suggestionSubtitle: {
    margin: 0,
    fontSize: '12.5px',
    color: '#64748b',
  },
  suggestionTableWrapper: {
    borderRadius: '8px',
    border: '1px solid #e0f2fe',
    overflowX: 'auto',
  },
  loteBadge: {
    display: 'inline-block',
    background: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  stockLoteBadge: {
    display: 'inline-block',
    border: '1px solid',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  descontarBadge: {
    display: 'inline-block',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  suggestionEmpty: {
    padding: '16px',
    textAlign: 'center',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
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
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },
  modalIconCheck: {
    background: '#d1fae5',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
  },
  modalIconWarning: {
    background: '#fef3c7',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
  },
  modalIconMed: {
    background: '#e0f2fe',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
  },
  modalIconProc: {
    background: '#e0f2fe',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
  },
  btnCloseModal: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  modalTitle: {
    margin: '0 0 4px',
    fontSize: '16px',
    color: '#0f172a',
    fontWeight: '700',
  },
  modalSub: {
    margin: 0,
    fontSize: '12.5px',
    color: '#64748b',
  },
  modalBody: {
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
  },
  modalSummaryBox: {
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: '#334155',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: 'auto',
  },
  btnModalCancel: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnModalConfirmDeliver: {
    background: '#059669',
    color: 'white',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnPrintModal: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0284c7',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)',
  },
  btnFinalizarModal: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#059669',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 12px',
    background: '#ffffff',
    marginBottom: '10px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '13.5px',
    color: '#1e293b',
  },
  medResultsList: {
    maxHeight: '180px',
    overflowY: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '4px',
    background: '#f8fafc',
    marginBottom: '14px',
  },
  medResultItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  selectedMedConfigBox: {
    background: '#f8fafc',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '12px',
  },
  gridConfigInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '4px',
  },
  formInput: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '7px 10px',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
    background: '#ffffff',
  },
  formSelect: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '7px 10px',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
    background: '#ffffff',
  },
  formTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '7px 10px',
    fontSize: '13px',
    color: '#1e293b',
    outline: 'none',
    background: '#ffffff',
    resize: 'vertical',
  },
  priceReadonlyBox: {
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '7px 10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#059669',
    background: '#f1f5f9',
  },
  subtotalPreviewBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '10px 14px',
  },
};
