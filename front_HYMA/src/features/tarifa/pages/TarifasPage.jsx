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
  const [precioConsulta, setPrecioConsulta] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const cargarTarifa = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await tarifaService.obtenerPrecioConsultaGeneral();
      setPrecioConsulta(res?.precio ?? 50.0);
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

  const handleGuardarPrecioConsulta = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const num = parseFloat(precioConsulta);
      if (isNaN(num) || num < 0) {
        throw new Error('Ingrese un precio válido mayor o igual a 0');
      }

      await tarifaService.actualizarPrecioConsultaGeneral(num);
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
              Q {Number(precioConsulta || 0).toFixed(2)}
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
                    type="number"
                    step="0.50"
                    min="0"
                    value={precioConsulta}
                    onChange={(e) => setPrecioConsulta(e.target.value)}
                    className="tarifa-input-field"
                    required
                    placeholder="0.00"
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
