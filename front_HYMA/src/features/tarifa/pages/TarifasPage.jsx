import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check,
  UserCheck,
  Baby,
  Info
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import tarifaService from '../../reportes/services/tarifaService';
import '../styles/tarifas.css';

export default function TarifasPage() {
  const [tabActiva, setTabActiva] = useState('GENERAL'); // 'GENERAL' | 'NINO'

  // Precios guardados en BD
  const [precioActualGeneral, setPrecioActualGeneral] = useState(50.0);
  const [precioActualNino, setPrecioActualNino] = useState(40.0);

  // Valores de los campos de entrada
  const [precioConsultaGeneral, setPrecioConsultaGeneral] = useState('50.00');
  const [precioConsultaNino, setPrecioConsultaNino] = useState('40.00');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const cargarTarifas = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [resGen, resNino] = await Promise.all([
        tarifaService.obtenerPrecioConsultaGeneral(),
        tarifaService.obtenerPrecioConsultaNino(),
      ]);

      const pGen = resGen?.precio ?? 50.0;
      const pNino = resNino?.precio ?? 40.0;

      setPrecioActualGeneral(pGen);
      setPrecioConsultaGeneral(Number(pGen).toFixed(2));

      setPrecioActualNino(pNino);
      setPrecioConsultaNino(Number(pNino).toFixed(2));
    } catch (err) {
      console.error('Error al cargar tarifas:', err);
      setErrorMsg('No se pudieron cargar las tarifas desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTarifas();
  }, []);

  const handleCambiarTab = (tab) => {
    setTabActiva(tab);
    setSuccessMsg('');
    setErrorMsg('');
  };

  // Bloqueo estricto de teclas de signo negativo y notación exponencial
  const handleKeyDownPrecio = (e) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // Filtrado y sanitización en tiempo real: nunca permitir números negativos
  const handlePrecioChange = (e, setter) => {
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

    setter(val);
    if (errorMsg) setErrorMsg('');
  };

  const handleGuardarTarifa = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (saving || loading) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const esGeneral = tabActiva === 'GENERAL';
    const precioStr = esGeneral ? precioConsultaGeneral : precioConsultaNino;
    const nombreTarifa = esGeneral ? 'Tarifa de Consulta Médica' : 'Tarifa de Consulta Médica Niño';

    try {
      if (precioStr === '' || precioStr === null) {
        throw new Error(`Debe ingresar un monto para ${nombreTarifa.toLowerCase()}.`);
      }

      const num = parseFloat(precioStr);
      if (isNaN(num)) {
        throw new Error('Ingrese un precio numérico válido.');
      }

      if (num < 0) {
        throw new Error('El precio no puede ser negativo. Debe ser un monto mayor o igual a 0.');
      }

      if (esGeneral) {
        await tarifaService.actualizarPrecioConsultaGeneral(num);
        setPrecioActualGeneral(num);
        setSuccessMsg(`Tarifa de Consulta Médica actualizada a Q ${num.toFixed(2)} correctamente.`);
      } else {
        await tarifaService.actualizarPrecioConsultaNino(num);
        setPrecioActualNino(num);
        setSuccessMsg(`Tarifa de Consulta Médica Niño actualizada a Q ${num.toFixed(2)} correctamente.`);
      }

      await cargarTarifas();
    } catch (err) {
      console.error('Error al actualizar tarifa:', err);
      const msg = err.response?.data?.message || err.message || 'Error al actualizar la tarifa.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const esGeneral = tabActiva === 'GENERAL';
  const precioActualMostrado = esGeneral ? precioActualGeneral : precioActualNino;
  const precioInputMostrado = esGeneral ? precioConsultaGeneral : precioConsultaNino;
  const setPrecioInputMostrado = esGeneral ? setPrecioConsultaGeneral : setPrecioConsultaNino;

  return (
    <div className="tarifas-container">
      <AdminNavbar />

      <main className="tarifas-content">
        {/* Breadcrumb de navegación */}
        <Breadcrumb
          items={[
            { label: 'Configuración', to: '/configuracion' },
            { label: 'Tarifas de Consulta' }
          ]}
        />

        {/* Header principal */}
        <div className="tarifas-header">
          <div className="tarifas-header-info">
            <h1>
              <CircleDollarSign size={24} className="text-emerald-600" />
              Tarifas de Consulta Médica
            </h1>
            <p>Configuración de precios de atención general y pediátrica</p>
          </div>

          <div className="tarifas-header-actions">
            <button
              className="btn-refresh-tarifa"
              onClick={cargarTarifas}
              disabled={loading}
              title="Recargar tarifas"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación: Tarifa de Consulta Médica | Tarifa de Consulta Médica Niño */}
        <div className="tarifas-nav-container">
          <div className="tarifas-nav-tabs">
            <button
              type="button"
              className={`tarifa-nav-btn ${esGeneral ? 'active' : ''}`}
              onClick={() => handleCambiarTab('GENERAL')}
            >
              <UserCheck size={18} />
              <span>Tarifa de Consulta Médica</span>
            </button>

            <span className="tarifa-nav-divider">|</span>

            <button
              type="button"
              className={`tarifa-nav-btn ${!esGeneral ? 'active' : ''}`}
              onClick={() => handleCambiarTab('NINO')}
            >
              <Baby size={18} />
              <span>Tarifa de Consulta Médica Niño</span>
            </button>
          </div>
        </div>

        {/* Card Principal Simplificada */}
        <div className="tarifa-main-card">
          {/* Tarjeta de Precio Actual */}
          <div className="tarifa-hero-card">
            <div className="tarifa-hero-info">
              <span className="hero-tag">
                {esGeneral ? 'Precio Actual (≥ 13 años)' : 'Precio Actual (< 13 años)'}
              </span>
              <h3>
                {esGeneral ? 'Tarifa de Consulta Médica' : 'Tarifa de Consulta Médica Niño'}
              </h3>
            </div>

            <div className="tarifa-hero-badge">
              Q {Number(precioActualMostrado ?? 0).toFixed(2)}
            </div>
          </div>

          {/* Formulario de actualización */}
          <div className="tarifa-form-section">
            <form onSubmit={handleGuardarTarifa}>
              <label htmlFor="precioInput">
                {esGeneral
                  ? 'Modificar precio de Consulta Médica (Quetzales):'
                  : 'Modificar precio de Consulta Médica Niño (Quetzales):'}
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
                    value={precioInputMostrado}
                    onChange={(e) => handlePrecioChange(e, setPrecioInputMostrado)}
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

          {/* Nota informativa de regla de negocio automática */}
          <div className="tarifa-info-note">
            <Info size={16} className="text-sky-600 flex-shrink-0" />
            <span>
              {esGeneral
                ? 'El sistema aplica esta tarifa automáticamente a todos los pacientes de 13 años en adelante (≥ 13 años).'
                : 'El sistema detecta automáticamente la edad del paciente según su fecha de nacimiento y aplica esta tarifa en Farmacia cuando el paciente es menor de 13 años (< 13 años).'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
