import React, { useState, useEffect } from 'react';
import {
  Percent,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check,
  Info,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import {
  obtenerPorcentajeMedicamento,
  actualizarPorcentajeMedicamento,
} from '../services/parametroService';
import '../../tarifa/styles/tarifas.css';

export default function PorcentajeMedicamentoPage() {
  const [porcentajeActual, setPorcentajeActual] = useState(25.0);
  const [porcentajeInput, setPorcentajeInput] = useState('25.00');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Costo base para simulación interactiva
  const [costoSimulacion, setCostoSimulacion] = useState('10.00');

  const cargarPorcentaje = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await obtenerPorcentajeMedicamento();
      const pct = data?.porcentaje != null ? Number(data.porcentaje) : 25.0;
      setPorcentajeActual(pct);
      setPorcentajeInput(Number(pct).toFixed(2));
    } catch (err) {
      console.error('Error al cargar porcentaje:', err);
      setErrorMsg('No se pudo cargar el porcentaje desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPorcentaje();
  }, []);

  // Bloqueo estricto de teclas negativas o exponenciales
  const handleKeyDownPorcentaje = (e) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // Filtrado y sanitización en tiempo real: nunca permitir números negativos y max 2 decimales
  const handlePorcentajeChange = (e) => {
    let val = e.target.value;
    val = val.replace(/[^0-9.]/g, '');

    const partes = val.split('.');
    if (partes.length > 2) {
      val = partes[0] + '.' + partes.slice(1).join('');
    }

    if (partes.length === 2 && partes[1].length > 2) {
      val = `${partes[0]}.${partes[1].slice(0, 2)}`;
    }

    setPorcentajeInput(val);
    if (errorMsg) setErrorMsg('');
  };

  const handleGuardarPorcentaje = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (saving || loading) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (porcentajeInput === '' || porcentajeInput === null) {
        throw new Error('Debe ingresar un porcentaje válido.');
      }

      const num = parseFloat(porcentajeInput);
      if (isNaN(num)) {
        throw new Error('Ingrese un porcentaje numérico válido.');
      }

      if (num < 0) {
        throw new Error('El porcentaje no puede ser negativo. Debe ser mayor o igual a 0%.');
      }

      const res = await actualizarPorcentajeMedicamento(num);
      const nuevoPct = res?.porcentaje != null ? Number(res.porcentaje) : num;
      setPorcentajeActual(nuevoPct);
      setSuccessMsg(`¡Porcentaje de medicamento actualizado a ${nuevoPct.toFixed(2)}% correctamente! Se aplicó a los lotes en existencia.`);
      await cargarPorcentaje();
    } catch (err) {
      console.error('Error al actualizar porcentaje:', err);
      const msg = err.response?.data?.message || err.message || 'Error al actualizar el porcentaje.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // Cálculo en vivo para el simulador
  const pctNumerico = parseFloat(porcentajeInput) || 0;
  const costoNum = parseFloat(costoSimulacion) || 0;
  const margenMonto = (costoNum * (pctNumerico / 100));
  const precioFinalCalculado = costoNum + margenMonto;

  return (
    <div className="tarifas-container">
      <AdminNavbar />

      <main className="tarifas-content">
        {/* Breadcrumb de navegación */}
        <Breadcrumb
          items={[
            { label: 'Configuración', to: '/configuracion' },
            { label: 'Porcentaje de Medicamento' },
          ]}
        />

        {/* Header principal */}
        <div className="tarifas-header">
          <div className="tarifas-header-info">
            <h1>
              <Percent size={24} className="text-emerald-600" />
              Porcentaje de Medicamento
            </h1>
            <p>Configuración del margen porcentual sobre el costo unitario para calcular el precio final de venta</p>
          </div>

          <div className="tarifas-header-actions">
            <button
              className="btn-refresh-tarifa"
              onClick={cargarPorcentaje}
              disabled={loading}
              title="Recargar configuración"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Card Principal */}
        <div className="tarifa-main-card">
          {/* Tarjeta de Porcentaje Actual */}
          <div className="tarifa-hero-card">
            <div className="tarifa-hero-info">
              <span className="hero-tag">Margen de Venta Configurado</span>
              <h3>Porcentaje de Ganancia por Medicamento</h3>
            </div>

            <div className="tarifa-hero-badge" style={{ background: '#059669', color: '#ffffff' }}>
              {Number(porcentajeActual ?? 0).toFixed(2)} %
            </div>
          </div>

          {/* Formulario de actualización */}
          <div className="tarifa-form-section">
            <form onSubmit={handleGuardarPorcentaje}>
              <label htmlFor="porcentajeInput">
                Modificar porcentaje de incremento sobre costo unitario (%):
              </label>

              <div className="tarifa-input-wrap">
                <div className="tarifa-input-container">
                  <span className="tarifa-currency-prefix" style={{ fontWeight: '700' }}>%</span>
                  <input
                    id="porcentajeInput"
                    name="porcentajeInput"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1000.00"
                    value={porcentajeInput}
                    onChange={handlePorcentajeChange}
                    onKeyDown={handleKeyDownPorcentaje}
                    className="tarifa-input-field"
                    required
                    placeholder="25.00"
                    title="El porcentaje debe ser un monto mayor o igual a 0%"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-guardar-tarifa"
                  disabled={saving || loading}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Guardar Porcentaje
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Mensajes de confirmación y error */}
            {successMsg && (
              <div className="tarifa-alert success">
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="tarifa-alert error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Simulador Interactivo en Vivo */}
          <div style={{
            margin: '20px 0 10px',
            padding: '16px 20px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Calculator size={18} style={{ color: '#0284c7' }} />
              <strong style={{ fontSize: '14px', color: '#1e293b' }}>
                Simulación Interactiva en Tiempo Real
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Costo Unitario de Compra (Q):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={costoSimulacion}
                  onChange={(e) => setCostoSimulacion(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="tarifa-input-field"
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>

              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  Margen ({pctNumerico.toFixed(2)}%):
                </div>
                <strong style={{ color: '#0284c7', fontSize: '15px' }}>
                  + Q {margenMonto.toFixed(2)}
                </strong>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  Precio Final de Venta:
                </div>
                <strong style={{ color: '#059669', fontSize: '18px', fontWeight: '800' }}>
                  Q {precioFinalCalculado.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          {/* Nota informativa de regla de negocio automática */}
          <div className="tarifa-info-note">
            <Info size={16} className="text-sky-600 flex-shrink-0" />
            <span>
              Al guardar este porcentaje, el sistema actualiza automáticamente el Precio Final de Venta de todos los lotes existentes. Dicho precio es el que se cobra en Dispensación de consultas médicas, Venta en mostrador, comprobante impreso y en los reportes de inventario.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
