import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Search,
  X,
  Package,
  MinusCircle,
  Plus,
  History,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Building2,
  Tag,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { listarMedicamentos } from '../services/medicamentoService';
import { listarLotes } from '../services/loteService';
import usoClinicaService from '../services/usoClinicaService';
import '../styles/usoClinica.css';

export default function UsoClinicaPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('insumos'); // 'insumos' | 'historial'
  const [medicamentos, setMedicamentos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos'); // 'todos' | 'con_stock' | 'agotados'

  // Modal de consumo
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
  const [cantidadDescontar, setCantidadDescontar] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [toastExito, setToastExito] = useState('');

  // Cargar datos
  const cargarDatos = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    try {
      const [medsData, lotesData, histData] = await Promise.all([
        listarMedicamentos(),
        listarLotes().catch(() => []),
        usoClinicaService.listarHistorialConsumoClinica().catch(() => []),
      ]);

      setMedicamentos(Array.isArray(medsData) ? medsData : []);
      setLotes(Array.isArray(lotesData) ? lotesData : []);
      setHistorial(Array.isArray(histData) ? histData : []);
    } catch (err) {
      console.error('Error al cargar datos de uso en clínica:', err);
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Mapeo de lotes por medicamento para cálculo de costos y precios
  const lotesPorMed = useMemo(() => {
    const map = {};
    (lotes || []).forEach((l) => {
      const id = Number(l.idMedicamento);
      if (!map[id]) map[id] = [];
      map[id].push(l);
    });
    return map;
  }, [lotes]);

  // Filtrar sólo insumos marcados para uso en clínica
  const insumosClinica = useMemo(() => {
    return (medicamentos || [])
      .filter((m) => m.esUsoClinica === true)
      .map((m) => {
        const medLotes = (lotesPorMed[m.idMedicamento] || []).filter(
          (l) => l.estado == null || l.estado === 'ACTIVO'
        );

        const stockTotal =
          medLotes.length > 0
            ? medLotes.reduce((acc, l) => acc + (Number(l.cantidadInicial ?? l.stockDisponible) || 0), 0)
            : Number(m.unidades || 0);

        // Precios
        let precioCompra = 0;
        let precioVenta = Number(m.precio || 0);

        if (medLotes.length > 0) {
          const lReciente = medLotes[medLotes.length - 1];
          precioCompra = Number(lReciente.precioUnitario || 0);
          precioVenta = Number(lReciente.precioVenta || (precioCompra * 1.25));
        } else if (precioVenta > 0) {
          precioCompra = precioVenta / 1.25;
        }

        return {
          ...m,
          stockTotal,
          precioCompra,
          precioVenta,
          valorTotalCompra: stockTotal * precioCompra,
          valorTotalVenta: stockTotal * precioVenta,
        };
      });
  }, [medicamentos, lotesPorMed]);

  // Insumos filtrados por búsqueda y estado
  const insumosFiltrados = useMemo(() => {
    return insumosClinica.filter((item) => {
      const texto = `${item.nombre || ''} ${item.presentacion || ''} ${item.concentracion || ''}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase().trim());

      let coincideStock = true;
      if (filtroStock === 'con_stock') coincideStock = item.stockTotal > 0;
      if (filtroStock === 'agotados') coincideStock = item.stockTotal === 0;

      return coincideBusqueda && coincideStock;
    });
  }, [insumosClinica, busqueda, filtroStock]);

  // Totales para KPIs
  const kpis = useMemo(() => {
    const totalItems = insumosClinica.length;
    const totalUnidades = insumosClinica.reduce((acc, i) => acc + i.stockTotal, 0);
    const totalValorCompra = insumosClinica.reduce((acc, i) => acc + i.valorTotalCompra, 0);
    const totalValorVenta = insumosClinica.reduce((acc, i) => acc + i.valorTotalVenta, 0);
    const totalConsumosMes = historial.length;

    return { totalItems, totalUnidades, totalValorCompra, totalValorVenta, totalConsumosMes };
  }, [insumosClinica, historial]);

  // Manejar apertura de modal de consumo
  const handleAbrirConsumo = (item) => {
    setInsumoSeleccionado(item);
    setCantidadDescontar(1);
    setObservaciones('Consumo en área de curaciones / clínica médica');
    setErrorModal('');
  };

  const handleCerrarConsumo = () => {
    if (guardando) return;
    setInsumoSeleccionado(null);
    setErrorModal('');
  };

  // Confirmar consumo y descontar
  const handleConfirmarConsumo = async (e) => {
    e.preventDefault();
    if (!insumoSeleccionado) return;

    const cant = parseInt(cantidadDescontar, 10);
    if (!cant || cant < 1) {
      setErrorModal('La cantidad debe ser de al menos 1 unidad.');
      return;
    }

    if (cant > insumoSeleccionado.stockTotal) {
      setErrorModal(`Stock insuficiente. Disponible: ${insumoSeleccionado.stockTotal} unidades.`);
      return;
    }

    try {
      setGuardando(true);
      setErrorModal('');

      const response = await usoClinicaService.registrarConsumoClinica({
        idMedicamento: insumoSeleccionado.idMedicamento,
        cantidad: cant,
        observaciones: observaciones.trim() || 'Consumo en clínica médica',
      });

      // Actualizar estado local del stock
      setMedicamentos((prev) =>
        prev.map((m) =>
          m.idMedicamento === insumoSeleccionado.idMedicamento
            ? { ...m, unidades: Math.max(0, (m.unidades || 0) - cant) }
            : m
        )
      );

      // Agregar al historial localmente
      if (response) {
        setHistorial((prev) => [response, ...prev]);
      }

      handleCerrarConsumo();
      setToastExito(`Se descontaron ${cant} unidad(es) de ${insumoSeleccionado.nombre}`);
      setTimeout(() => setToastExito(''), 3500);

      // Refrescar en segundo plano para sincronizar lotes
      cargarDatos(true);
    } catch (err) {
      console.error('Error al registrar consumo:', err);
      setErrorModal(err.response?.data?.message || 'Error al procesar el descuento de inventario.');
    } finally {
      setGuardando(false);
    }
  };

  const formatFecha = (str) => {
    if (!str) return '—';
    try {
      const d = new Date(str);
      return d.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return str;
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className="uso-clinica-page">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Farmacia', to: '/farmacia' },
            { label: 'Uso en Clínica' },
          ]}
        />

        {/* Encabezado */}
        <header className="uso-clinica-header">
          <div className="uso-clinica-header-info">
            <div className="uso-clinica-title-row">
              <div className="uso-clinica-title-icon">
                <Stethoscope size={24} />
              </div>
              <h1 className="uso-clinica-title">Insumos de Uso en Clínica</h1>
            </div>
            <p className="uso-clinica-subtitle">
              Control de inventario interno, registro de consumo diario y material médico (alcohol, gasas, algodón, desinfectantes).
            </p>
          </div>

          <div className="uso-clinica-header-actions">
            <button
              type="button"
              className="btn-ir-catalogo"
              onClick={() => navigate('/farmacia/medicamentos/catalogo')}
              title="Ir al catálogo maestro para etiquetar insumos de clínica"
            >
              <Tag size={15} />
              <span>Gestionar en Catálogo</span>
            </button>
          </div>
        </header>

        {/* KPIs */}
        <div className="uso-clinica-kpis">
          <div className="uso-clinica-kpi-card">
            <div className="uso-clinica-kpi-icon green">
              <Package size={22} />
            </div>
            <div className="uso-clinica-kpi-body">
              <span className="uso-clinica-kpi-label">Insumos Registrados</span>
              <span className="uso-clinica-kpi-value">{kpis.totalItems}</span>
            </div>
          </div>

          <div className="uso-clinica-kpi-card">
            <div className="uso-clinica-kpi-icon blue">
              <Stethoscope size={22} />
            </div>
            <div className="uso-clinica-kpi-body">
              <span className="uso-clinica-kpi-label">Unidades en Stock</span>
              <span className="uso-clinica-kpi-value">{kpis.totalUnidades}</span>
            </div>
          </div>

          <div className="uso-clinica-kpi-card">
            <div className="uso-clinica-kpi-icon amber">
              <DollarSign size={22} />
            </div>
            <div className="uso-clinica-kpi-body">
              <span className="uso-clinica-kpi-label">Valor en Compra</span>
              <span className="uso-clinica-kpi-value">
                Q {kpis.totalValorCompra.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="uso-clinica-kpi-card">
            <div className="uso-clinica-kpi-icon purple">
              <History size={22} />
            </div>
            <div className="uso-clinica-kpi-body">
              <span className="uso-clinica-kpi-label">Consumos Registrados</span>
              <span className="uso-clinica-kpi-value">{kpis.totalConsumosMes}</span>
            </div>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="uso-clinica-tabs">
          <button
            type="button"
            className={`uso-clinica-tab-btn ${activeTab === 'insumos' ? 'active' : ''}`}
            onClick={() => setActiveTab('insumos')}
          >
            <Package size={16} />
            <span>Insumos y Stock</span>
            <span className="uso-clinica-tab-badge">{insumosClinica.length}</span>
          </button>

          <button
            type="button"
            className={`uso-clinica-tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            <History size={16} />
            <span>Historial de Consumo</span>
            <span className="uso-clinica-tab-badge">{historial.length}</span>
          </button>
        </div>

        {/* Contenido: Tab 1 (Insumos y Stock) */}
        {activeTab === 'insumos' && (
          <>
            {/* Toolbar */}
            <div className="uso-clinica-toolbar">
              <div className="uso-clinica-search-wrapper">
                <Search size={16} className="uso-clinica-search-icon" />
                <input
                  type="text"
                  className="uso-clinica-search-input"
                  placeholder="Buscar insumo por nombre, presentación o concentración..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button
                    type="button"
                    className="uso-clinica-search-clear"
                    onClick={() => setBusqueda('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`farmacia-quick-pill ${filtroStock === 'todos' ? 'active' : ''}`}
                  onClick={() => setFiltroStock('todos')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid ' + (filtroStock === 'todos' ? '#059669' : '#cbd5e1'),
                    background: filtroStock === 'todos' ? '#059669' : '#ffffff',
                    color: filtroStock === 'todos' ? '#ffffff' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Todos ({insumosClinica.length})
                </button>
                <button
                  type="button"
                  className={`farmacia-quick-pill ${filtroStock === 'con_stock' ? 'active' : ''}`}
                  onClick={() => setFiltroStock('con_stock')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid ' + (filtroStock === 'con_stock' ? '#059669' : '#cbd5e1'),
                    background: filtroStock === 'con_stock' ? '#059669' : '#ffffff',
                    color: filtroStock === 'con_stock' ? '#ffffff' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Con Stock
                </button>
                <button
                  type="button"
                  className={`farmacia-quick-pill ${filtroStock === 'agotados' ? 'active' : ''}`}
                  onClick={() => setFiltroStock('agotados')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid ' + (filtroStock === 'agotados' ? '#059669' : '#cbd5e1'),
                    background: filtroStock === 'agotados' ? '#059669' : '#ffffff',
                    color: filtroStock === 'agotados' ? '#ffffff' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Agotados
                </button>
              </div>
            </div>

            {/* Tabla */}
            {loading ? (
              <div className="farmacia-loading-container" style={{ padding: '60px 0' }}>
                <Loader2 size={32} className="animate-spin text-emerald-600" />
                <p>Cargando insumos de clínica...</p>
              </div>
            ) : insumosFiltrados.length > 0 ? (
              <div className="uso-clinica-table-card">
                <table className="uso-clinica-table">
                  <thead>
                    <tr>
                      <th>Insumo / Descripción</th>
                      <th>Categoría</th>
                      <th>Proveedor</th>
                      <th style={{ textAlign: 'center' }}>Stock Disponible</th>
                      <th style={{ textAlign: 'right' }}>Costo Compra</th>
                      <th style={{ textAlign: 'right' }}>Precio (+25%)</th>
                      <th style={{ textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumosFiltrados.map((item) => {
                      const badgeClass =
                        item.stockTotal > 5 ? 'alto' : item.stockTotal > 0 ? 'medio' : 'agotado';

                      return (
                        <tr key={item.idMedicamento}>
                          <td>
                            <span className="med-nombre-principal">{item.nombre}</span>
                            <span className="med-detalles-sub">
                              {item.presentacion || 'Sin presentación'}
                              {item.concentracion ? ` • ${item.concentracion}` : ''}
                            </span>
                          </td>
                          <td>
                            {item.categoriaNombre ? (
                              <span className="farmacia-badge-pill category">
                                {item.categoriaNombre}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td>
                            <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                              {item.casaFarmaceuticaNombre || '—'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`stock-badge ${badgeClass}`}>
                              {item.stockTotal} {item.stockTotal === 1 ? 'unidad' : 'unidades'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                            Q {item.precioCompra.toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                            Q {item.precioVenta.toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-descontar-stock"
                              onClick={() => handleAbrirConsumo(item)}
                              disabled={item.stockTotal <= 0}
                              title={
                                item.stockTotal <= 0
                                  ? 'Sin stock para descontar'
                                  : 'Registrar gasto o consumo'
                              }
                            >
                              <MinusCircle size={14} />
                              <span>Descontar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="uso-clinica-empty">
                <Stethoscope size={44} className="mx-auto text-slate-300" />
                <h3>No se encontraron insumos de uso en clínica</h3>
                <p>
                  {insumosClinica.length === 0
                    ? 'Aún no has marcado medicamentos o insumos como "Uso en Clínica" en el Catálogo Maestro.'
                    : 'No hay insumos que coincidan con los filtros aplicados.'}
                </p>
                {insumosClinica.length === 0 && (
                  <button
                    type="button"
                    className="btn-ir-catalogo"
                    onClick={() => navigate('/farmacia/medicamentos/catalogo')}
                  >
                    <Plus size={16} />
                    <span>Ir al Catálogo y Marcar Insumos</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Contenido: Tab 2 (Historial de Consumo) */}
        {activeTab === 'historial' && (
          <div className="uso-clinica-table-card">
            {historial.length > 0 ? (
              <table className="uso-clinica-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Insumo Consumido</th>
                    <th>Usuario Responsable</th>
                    <th style={{ textAlign: 'center' }}>Cant. Descontada</th>
                    <th style={{ textAlign: 'right' }}>Costo Estimado</th>
                    <th>Observación / Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item, idx) => (
                    <tr key={item.idSalida || idx}>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {formatFecha(item.fechaSalida)}
                      </td>
                      <td>
                        <span className="med-nombre-principal">{item.medicamentoNombre}</span>
                        {item.presentacion && (
                          <span className="med-detalles-sub">{item.presentacion}</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>
                        {item.usuarioNombre || 'Personal Clínico'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.82rem',
                          }}
                        >
                          -{item.cantidad} {item.cantidad === 1 ? 'ud' : 'uds'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                        Q {Number(item.total || 0).toFixed(2)}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {item.observaciones || 'Consumo interno'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="uso-clinica-empty">
                <History size={40} className="mx-auto text-slate-300" />
                <h3>No hay consumos registrados</h3>
                <p>Cada vez que descuentes un insumo (alcohol, gasas, etc.), quedará registrado aquí con auditoría completa.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal de Consumo / Descuento */}
        {insumoSeleccionado && (
          <div className="consumo-modal-overlay" onClick={handleCerrarConsumo}>
            <div className="consumo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="consumo-modal-header">
                <div className="consumo-modal-title-box">
                  <div className="consumo-modal-icon">
                    <MinusCircle size={20} />
                  </div>
                  <div>
                    <h2 className="consumo-modal-title">Registrar Consumo</h2>
                    <p className="consumo-modal-sub">Descuento de stock por uso interno en clínica</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="farmacia-modal-close"
                  onClick={handleCerrarConsumo}
                  title="Cerrar ventana"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmarConsumo}>
                <div className="consumo-modal-body">
                  {errorModal && (
                    <div className="paciente-modal-error">
                      <AlertCircle size={16} />
                      <span>{errorModal}</span>
                    </div>
                  )}

                  {/* Tarjeta del Insumo */}
                  <div className="consumo-med-card">
                    <div>
                      <div className="consumo-med-name">{insumoSeleccionado.nombre}</div>
                      <div className="consumo-med-meta">
                        {insumoSeleccionado.presentacion || 'Sin presentación'}
                        {insumoSeleccionado.concentracion ? ` • ${insumoSeleccionado.concentracion}` : ''}
                      </div>
                    </div>
                    <div className="consumo-med-stock">
                      <div className="consumo-med-stock-val">{insumoSeleccionado.stockTotal}</div>
                      <div className="consumo-med-stock-lbl">Disponible</div>
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div className="consumo-form-group">
                    <label className="consumo-form-label">
                      Cantidad a Descontar <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="consumo-form-input"
                      value={cantidadDescontar}
                      onChange={(e) => setCantidadDescontar(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      min={1}
                      max={insumoSeleccionado.stockTotal}
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Nuevo stock restante:{' '}
                      <strong>{Math.max(0, insumoSeleccionado.stockTotal - (parseInt(cantidadDescontar, 10) || 0))} unidades</strong>
                    </span>
                  </div>

                  {/* Observaciones */}
                  <div className="consumo-form-group">
                    <label className="consumo-form-label">Destino / Observación del Consumo</label>
                    <textarea
                      className="consumo-form-textarea"
                      rows={2}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ej. Uso en curación de herida, desinfección de consultorio..."
                    />
                  </div>
                </div>

                <div className="consumo-modal-footer">
                  <button
                    type="button"
                    className="farmacia-btn-secondary"
                    onClick={handleCerrarConsumo}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-confirmar-consumo"
                    disabled={guardando || insumoSeleccionado.stockTotal <= 0}
                  >
                    {guardando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Descontando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Confirmar Descuento</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast flotante */}
        {toastExito && (
          <div className="pacientes-toast-success">
            <CheckCircle2 size={18} />
            <span>{toastExito}</span>
          </div>
        )}
      </div>
    </>
  );
}
