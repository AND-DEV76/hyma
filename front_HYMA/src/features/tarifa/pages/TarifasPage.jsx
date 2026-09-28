import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import tarifaService from '../../reportes/services/tarifaService';
import '../styles/tarifas.css';

export default function TarifasPage() {
  const [precioActual, setPrecioActual] = useState(50.0);
  const [precioConsulta, setPrecioConsulta] = useState('50.00');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const cargarTarifa = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await tarifaService.obtenerPrecioConsultaGeneral();
      const p = res?.precio ?? 50.0;
      setPrecioActual(p);
      setPrecioConsulta(Number(p).toFixed(2));
    } catch (err) {
      console.error('Error al cargar tarifa:', err);
      setErrorMsg('No se pudo cargar la tarifa desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTarifa();
  }, []);

  // Bloqueo estricto de teclas de signo negativo y notación exponencial
  const handleKeyDownPrecio = (e) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // Filtrado y sanitización en tiempo real: nunca permitir números negativos
  const handlePrecioChange = (e) => {
    let val = e.target.value;
    // Eliminar cualquier signo negativo o caracter no numérico (excepto punto decimal)
    val = val.replace(/[^0-9.]/g, '');

    // Evitar múltiples puntos decimales
    const partes = val.split('.');
    if (partes.length > 2) {
      val = partes[0] + '.' + partes.slice(1).join('');
    }

    // Limitar a máximo 2 decimales
    if (partes.length === 2 && partes[1].length > 2) {
      val = `${partes[0]}.${partes[1].slice(0, 2)}`;
    }

    setPrecioConsulta(val);
    if (errorMsg) setErrorMsg('');
  };

  const handleGuardarPrecioConsulta = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (saving || loading) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (precioConsulta === '' || precioConsulta === null) {
        throw new Error('Debe ingresar un monto para la tarifa.');
      }

      const num = parseFloat(precioConsulta);
      if (isNaN(num)) {
        throw new Error('Ingrese un precio numérico válido.');
      }

      if (num < 0) {
        throw new Error('El precio no puede ser negativo. Debe ser un monto mayor o igual a 0.');
      }

      await tarifaService.actualizarPrecioConsultaGeneral(num);
      setPrecioActual(num);
      setSuccessMsg(`Tarifa actualizada a Q ${num.toFixed(2)} correctamente.`);
      await cargarTarifa();
    } catch (err) {
      console.error('Error al actualizar tarifa:', err);
      const msg = err.response?.data?.message || err.message || 'Error al actualizar la tarifa.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tarifas-container">
      <AdminNavbar />

      <main className="tarifas-content">
        {/* Breadcrumb de navegación */}
        <Breadcrumb
          items={[
            { label: 'Configuración', to: '/configuracion' },
            { label: 'Tarifa de Consulta' }
          ]}
        />

        {/* Header principal */}
        <div className="tarifas-header">
          <div className="tarifas-header-info">
            <h1>
              <CircleDollarSign size={24} className="text-emerald-600" />
              Tarifa de Consulta Médica
            </h1>
            <p>Precio estándar de atención médica</p>
          </div>

          <div className="tarifas-header-actions">
            <button
              className="btn-refresh-tarifa"
              onClick={cargarTarifa}
              disabled={loading}
              title="Recargar tarifa"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Card Principal Simplificada */}
        <div className="tarifa-main-card">
          {/* Tarjeta de Precio Actual */}
          <div className="tarifa-hero-card">
            <div className="tarifa-hero-info">
              <span className="hero-tag">Precio Actual</span>
              <h3>Consulta General</h3>
            </div>

            <div className="tarifa-hero-badge">
              Q {Number(precioActual ?? 0).toFixed(2)}
            </div>
          </div>

          {/* Formulario de actualización */}
          <div className="tarifa-form-section">
            <form onSubmit={handleGuardarPrecioConsulta}>
              <label htmlFor="precioInput">
                Modificar precio (Quetzales):
              </label>

              <div className="tarifa-input-wrap">
                <div className="tarifa-input-container">
                  <span className="tarifa-currency-prefix">Q</span>
                  <input
                    id="precioInput"
                    name="precioInput"
                    type="number"
                    step="0.50"
                    min="0"
                    max="99999.99"
                    value={precioConsulta}
                    onChange={handlePrecioChange}
                    onKeyDown={handleKeyDownPrecio}
                    className="tarifa-input-field"
                    required
                    placeholder="0.00"
                    title="El precio debe ser un monto mayor o igual a 0"
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
                      Guardar Tarifa
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
        </div>
      </main>
    </div>
  );
}
