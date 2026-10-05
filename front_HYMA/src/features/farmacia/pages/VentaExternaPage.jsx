import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  RotateCcw,
  Loader2,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { listarMedicamentos } from '../services/medicamentoService';
import { registrarVentaExterna } from '../services/dispensacionService';
import '../styles/ventaExterna.css';

export default function VentaExternaPage() {
  const navigate = useNavigate();

  // Estados de datos
  const [medicamentos, setMedicamentos] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Carrito de venta
  const [itemsVenta, setItemsVenta] = useState([]);

  // Proceso de venta
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [ventaExitosa, setVentaExitosa] = useState(null);

  // Cargar catálogo de medicamentos activos con stock
  const cargarCatalogo = async () => {
    setLoadingMeds(true);
    try {
      const data = await listarMedicamentos({ estado: true });
      setMedicamentos(data || []);
    } catch (err) {
      console.error('Error cargando medicamentos:', err);
      setError('No se pudo cargar el catálogo de medicamentos.');
    } finally {
      setLoadingMeds(false);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  // Filtrar medicamentos por búsqueda
  const medicamentosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return [];
    const term = busqueda.toLowerCase().trim();
    return medicamentos.filter((m) =>
      (m.nombre && m.nombre.toLowerCase().includes(term)) ||
      (m.presentacion && m.presentacion.toLowerCase().includes(term)) ||
      (m.concentracion && m.concentracion.toLowerCase().includes(term)) ||
      (m.codigoBarras && m.codigoBarras.toLowerCase().includes(term))
    );
  }, [medicamentos, busqueda]);

  // Agregar medicamento al carrito
  const agregarAlCarrito = (med) => {
    const stockDisp = med.unidades || 0;
    if (stockDisp <= 0) return;

    const existe = itemsVenta.find((it) => it.idMedicamento === med.idMedicamento);
    if (existe) {
      const cantActual = parseInt(existe.cantidad, 10) || 0;
      if (cantActual < stockDisp) {
        const nuevaCant = cantActual + 1;
        setItemsVenta(itemsVenta.map((it) =>
          it.idMedicamento === med.idMedicamento
            ? { ...it, cantidad: nuevaCant, subtotal: Number((nuevaCant * it.precioUnitario).toFixed(2)) }
            : it
        ));
      } else {
        alert(`No puedes agregar más unidades de ${med.nombre}. Stock disponible: ${stockDisp} unidades.`);
      }
    } else {
      const precio = Number(med.precio || 0);
      setItemsVenta([
        ...itemsVenta,
        {
          idMedicamento: med.idMedicamento,
          nombre: med.nombre,
          presentacion: med.presentacion,
          concentracion: med.concentracion,
          stockDisponible: stockDisp,
          cantidad: 1,
          precioUnitario: precio,
          subtotal: precio,
        },
      ]);
    }
  };

  // Modificar cantidad en carrito
  const cambiarCantidad = (idMed, nuevaCantidad) => {
    setItemsVenta(itemsVenta.map((it) => {
      if (it.idMedicamento === idMed) {
        if (nuevaCantidad === '' || nuevaCantidad === null) {
          return {
            ...it,
            cantidad: '',
            subtotal: 0,
          };
        }
        let cant = parseInt(nuevaCantidad, 10);
        if (isNaN(cant) || cant < 1) {
          cant = 1;
        }
        if (cant > it.stockDisponible) {
          cant = it.stockDisponible;
        }
        return {
          ...it,
          cantidad: cant,
          subtotal: Number((cant * it.precioUnitario).toFixed(2)),
        };
      }
      return it;
    }));
  };

  // Al desenfocar el campo de cantidad, asegurar mínimo 1
  const handleBlurCantidad = (idMed) => {
    setItemsVenta(itemsVenta.map((it) => {
      if (it.idMedicamento === idMed) {
        let c = parseInt(it.cantidad, 10);
        if (isNaN(c) || c < 1) {
          c = 1;
        }
        if (c > it.stockDisponible) {
          c = it.stockDisponible;
        }
        return {
          ...it,
          cantidad: c,
          subtotal: Number((c * it.precioUnitario).toFixed(2)),
        };
      }
      return it;
    }));
  };

  // Modificar precio unitario en carrito
  const cambiarPrecioUnitario = (idMed, nuevoPrecio) => {
    const p = parseFloat(nuevoPrecio);
    setItemsVenta(itemsVenta.map((it) => {
      if (it.idMedicamento === idMed) {
        const val = isNaN(p) || p < 0 ? 0 : p;
        const cant = parseInt(it.cantidad, 10) || 0;
        return {
          ...it,
          precioUnitario: val,
          subtotal: Number((cant * val).toFixed(2)),
        };
      }
      return it;
    }));
  };

  // Eliminar item del carrito
  const eliminarDelCarrito = (idMed) => {
    setItemsVenta(itemsVenta.filter((it) => it.idMedicamento !== idMed));
  };

  // Cálculo de totales
  const totalPagar = useMemo(() => {
    return itemsVenta.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  }, [itemsVenta]);

  const totalUnidades = useMemo(() => {
    return itemsVenta.reduce((acc, it) => acc + (parseInt(it.cantidad, 10) || 0), 0);
  }, [itemsVenta]);

  // Confirmar y registrar venta externa
  const handleConfirmarVenta = async () => {
    if (itemsVenta.length === 0 || procesando) return;

    for (const it of itemsVenta) {
      const cant = parseInt(it.cantidad, 10);
      if (isNaN(cant) || cant < 1) {
        alert(`La cantidad para ${it.nombre} debe ser al menos 1.`);
        return;
      }
      if (cant > it.stockDisponible) {
        alert(`La cantidad para ${it.nombre} (${cant}) excede el stock disponible (${it.stockDisponible} unidades).`);
        return;
      }
    }

    setProcesando(true);
    setError('');

    try {
      const payload = {
        cliente: 'Público General',
        observaciones: 'Venta directa en mostrador',
        items: itemsVenta.map((it) => ({
          idMedicamento: it.idMedicamento,
          cantidad: it.cantidad,
          precioUnitario: it.precioUnitario,
        })),
      };

      const res = await registrarVentaExterna(payload);
      setVentaExitosa(res);
      cargarCatalogo();
    } catch (err) {
      console.error('Error al registrar venta externa:', err);
      const msg = err.response?.data?.message || err.message;
      setError(msg || 'Ocurrió un error al registrar la venta externa.');
    } finally {
      setProcesando(false);
    }
  };

  // Reiniciar formulario para una nueva venta
  const handleNuevaVenta = () => {
    setItemsVenta([]);
    setError('');
    setBusqueda('');
    setVentaExitosa(null);
  };

  // Cancelar la venta y volver a dispensación
  const handleCancelarVenta = () => {
    setItemsVenta([]);
    navigate('/farmacia/dispensacion');
  };

  return (
    <div className="ve-page">
      <AdminNavbar />

      <main className="ve-container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Farmacia', to: '/farmacia' },
            { label: 'Dispensación', to: '/farmacia/dispensacion' },
            { label: 'Venta Externa' },
          ]}
        />

        {/* Encabezado */}
        <div className="ve-header">
          <div>
            <span className="ve-eyebrow">DISPENSACIÓN EN MOSTRADOR</span>
            <h1 className="ve-title">Venta Externa de Medicamentos</h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/farmacia/dispensacion')}
            className="ve-btn-volver"
          >
            <ArrowLeft size={16} />
            <span>Volver a Dispensación</span>
          </button>
        </div>

        {error && (
          <div className="ve-error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* 1. SECCIÓN: BUSCADOR */}
        <div className="ve-card">
          <div className="ve-card-header">
            <h2 className="ve-card-title">
              <Search size={18} color="#0077b6" />
              Buscador
            </h2>
            {busqueda.trim() && (
              <span className="ve-badge-count">
                {medicamentosFiltrados.length} encontrados
              </span>
            )}
          </div>

          {/* Caja de Input */}
          <div className="ve-search-box">
            <div className="ve-search-input-wrapper">
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Buscar medicamento por nombre, presentación o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="ve-search-input"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="ve-btn-clear"
                  title="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Área de Resultados o Sugerencia */}
          <div className="ve-search-results-area">
            {loadingMeds ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#0077b6' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Cargando catálogo...
                </p>
              </div>
            ) : !busqueda.trim() ? (
              <div className="ve-search-hint">
                <Search size={28} color="#cbd5e1" />
                <span>Escribe el nombre de un medicamento para buscar y agregarlo a la venta</span>
              </div>
            ) : medicamentosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                No se encontraron medicamentos activos que coincidan con "<strong>{busqueda}</strong>".
              </div>
            ) : (
              <div className="ve-search-results-grid">
                {medicamentosFiltrados.map((m) => {
                  const stock = m.unidades || 0;
                  const sinStock = stock <= 0;
                  const enCarrito = itemsVenta.find((it) => it.idMedicamento === m.idMedicamento);

                  return (
                    <div
                      key={m.idMedicamento}
                      className={`ve-search-item ${enCarrito ? 'en-carrito' : ''}`}
                    >
                      <div className="ve-item-info">
                        <span className="ve-item-nombre" title={m.nombre}>
                          {m.nombre}
                        </span>
                        <span className="ve-item-pres">
                          {[m.presentacion, m.concentracion].filter(Boolean).join(' • ') || 'Sin presentación'}
                        </span>
                        <div className="ve-item-meta">
                          <span className="ve-item-precio">
                            Q {Number(m.precio || 0).toFixed(2)}
                          </span>
                          <span className={`ve-item-stock ${stock > 0 ? 'disponible' : 'agotado'}`}>
                            {stock > 0 ? `${stock} disponibles` : 'Sin stock'}
                          </span>
                          {enCarrito && (
                            <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: '700' }}>
                              (En venta: {enCarrito.cantidad})
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => agregarAlCarrito(m)}
                        disabled={sinStock}
                        className="ve-btn-agregar"
                        title={sinStock ? 'Sin stock disponible' : 'Agregar medicamento'}
                      >
                        <Plus size={15} />
                        <span>Agregar</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. SECCIÓN: MEDICAMENTOS A VENDER */}
        <div className="ve-card">
          <div className="ve-card-header">
            <h2 className="ve-card-title">
              <ShoppingBag size={18} color="#0077b6" />
              Medicamentos a Vender
            </h2>
            <span className="ve-badge-count">
              {itemsVenta.length} {itemsVenta.length === 1 ? 'ítem' : 'ítems'}
            </span>
          </div>

          <div className="ve-cart-table-wrapper">
            {itemsVenta.length === 0 ? (
              <div className="ve-cart-empty">
                <ShoppingBag size={42} color="#cbd5e1" />
                <p style={{ margin: '10px 0 4px', fontWeight: '600', color: '#64748b' }}>
                  El carrito de venta está vacío
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  Utiliza el buscador de arriba para agregar medicamentos a la venta.
                </p>
              </div>
            ) : (
              <table className="ve-cart-table">
                <thead>
                  <tr>
                    <th className="ve-th" style={{ width: '40%' }}>Medicamento</th>
                    <th className="ve-th" style={{ width: '18%', textAlign: 'center' }}>Cantidad</th>
                    <th className="ve-th" style={{ width: '18%', textAlign: 'right' }}>Precio Unit.</th>
                    <th className="ve-th" style={{ width: '18%', textAlign: 'right' }}>Subtotal</th>
                    <th className="ve-th" style={{ width: '6%', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {itemsVenta.map((it) => (
                    <tr key={it.idMedicamento} className="ve-tr">
                      <td className="ve-td">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>
                            {it.nombre}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {[it.presentacion, it.concentracion].filter(Boolean).join(' • ')}
                          </span>
                          <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: '600' }}>
                            Stock disponible: {it.stockDisponible} uds
                          </span>
                        </div>
                      </td>

                      <td className="ve-td" style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          max={it.stockDisponible}
                          value={it.cantidad}
                          onChange={(e) => cambiarCantidad(it.idMedicamento, e.target.value)}
                          onBlur={() => handleBlurCantidad(it.idMedicamento)}
                          className="ve-qty-input"
                        />
                      </td>

                      <td className="ve-td" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Q</span>
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            value={it.precioUnitario}
                            onChange={(e) => cambiarPrecioUnitario(it.idMedicamento, e.target.value)}
                            className="ve-price-input"
                          />
                        </div>
                      </td>

                      <td className="ve-td" style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#0369a1', fontSize: '13px' }}>
                          Q {it.subtotal.toFixed(2)}
                        </strong>
                      </td>

                      <td className="ve-td" style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => eliminarDelCarrito(it.idMedicamento)}
                          className="ve-btn-trash"
                          title="Quitar medicamento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Barra de Totales y Botón Confirmar Venta */}
          <div className="ve-total-bar">
            <div className="ve-total-info">
              <span className="ve-total-eyebrow">Total a Cobrar</span>
              <div className="ve-total-amount">
                Q {totalPagar.toFixed(2)}
              </div>
              <span className="ve-total-units">
                {totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'} en total
              </span>
            </div>

            <div className="ve-actions-group">
              <button
                type="button"
                onClick={handleCancelarVenta}
                disabled={procesando}
                className="ve-btn-cancelar"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmarVenta}
                disabled={itemsVenta.length === 0 || procesando}
                className="ve-btn-confirmar"
              >
                {procesando ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Registrando Venta...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Confirmar Venta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Venta Exitosa y Comprobante */}
        {ventaExitosa && (
          <div className="ve-modal-overlay">
            <div className="ve-modal-card">
              <div className="ve-modal-header">
                <div className="ve-modal-icon-check">
                  <CheckCircle2 size={24} color="#059669" />
                </div>
                <div>
                  <h3 className="ve-modal-title">¡Venta Registrada Exitosamente!</h3>
                  <p className="ve-modal-sub">
                    El inventario ha sido descontado por FEFO y el ingreso fue sumado a la recaudación del día.
                  </p>
                </div>
              </div>

              {/* Ticket imprimible */}
              <div id="ticket-venta-externa" className="ve-ticket-box">
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    Obras Sociales San Martín
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Comprobante de Venta en Mostrador
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                    Salida #{ventaExitosa.idSalida} • {new Date(ventaExitosa.fechaSalida || Date.now()).toLocaleString('es-GT')}
                  </p>
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', margin: '8px 0' }}>
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '11px', textAlign: 'left' }}>
                        <th>Medicamento</th>
                        <th style={{ textAlign: 'center' }}>Cant.</th>
                        <th style={{ textAlign: 'right' }}>P.Unit</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ventaExitosa.detalles || []).map((det, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '4px 0' }}>
                            <strong style={{ color: '#1e293b' }}>{det.nombreMedicamento}</strong>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>
                              Lote: {det.numeroLote || 'N/A'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '4px' }}>{det.cantidad}</td>
                          <td style={{ textAlign: 'right', padding: '4px' }}>Q{Number(det.precioUnitario).toFixed(2)}</td>
                          <td style={{ textAlign: 'right', padding: '4px', fontWeight: '700' }}>Q{Number(det.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>TOTAL PAGADO:</strong>
                  <strong style={{ fontSize: '18px', color: '#059669' }}>
                    Q {Number(ventaExitosa.totalVenta || 0).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Botones del modal */}
              <div className="ve-modal-footer">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="ve-btn-print"
                >
                  <Printer size={16} />
                  <span>Imprimir Comprobante</span>
                </button>

                <button
                  type="button"
                  onClick={handleNuevaVenta}
                  className="ve-btn-otra-venta"
                >
                  <RotateCcw size={16} />
                  <span>Realizar Otra Venta</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/farmacia/dispensacion')}
                  className="ve-btn-close-modal"
                >
                  Volver a Dispensación
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
