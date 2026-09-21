import { useState, useEffect } from 'react';
import { ArrowDownToLine, History } from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { useFarmacia } from '../hooks/useFarmacia';
import EntradaMedicamentoForm from '../components/EntradaMedicamentoForm';
import HistorialEntradas from '../components/HistorialEntradas';
import '../styles/farmacia.css';

export default function MovimientosPage() {
  const {
    medicamentos,
    lotes,
    entradas,
    loading,
    error,
    refresh,
    guardarEntrada,
  } = useFarmacia();

  const [tab, setTab] = useState('registro');

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  return (
    <div className="farmacia-page">
      <AdminNavbar />
      <main className="farmacia-container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Farmacia', to: '/farmacia' },
            { label: 'Medicamentos', to: '/farmacia/medicamentos' },
            { label: 'Movimientos' },
          ]}
        />

        {/* Cabecera Principal */}
        <div className="farmacia-heading">
          <div>
            <span className="farmacia-eyebrow">MOVIMIENTOS DE INVENTARIO</span>
            <h1 className="farmacia-title">Entradas de Farmacia</h1>
            <p className="farmacia-subtitle">
              Registro de nuevos lotes, ingresos de stock y trazabilidad de compras y donaciones.
            </p>
          </div>
        </div>

        {/* Barra de Pill Tabs */}
        <div className="farmacia-subtabs-toolbar" style={{ marginBottom: '22px' }}>
          <div className="farmacia-subtabs-group">
            <button
              type="button"
              className={`farmacia-subtab-btn ${tab === 'registro' ? 'active' : ''}`}
              onClick={() => setTab('registro')}
            >
              <ArrowDownToLine size={15} />
              Registrar Entrada
            </button>
            <button
              type="button"
              className={`farmacia-subtab-btn ${tab === 'historial' ? 'active' : ''}`}
              onClick={() => setTab('historial')}
            >
              <History size={15} />
              Historial de Entradas
              {entradas.length > 0 && (
                <span className="farmacia-subtab-badge">{entradas.length}</span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="farmacia-alert error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="farmacia-loading-container">
            <div className="farmacia-spinner" />
            <p>Cargando movimientos de inventario...</p>
          </div>
        ) : (
          <div className="farmacia-content-area">
            {tab === 'registro' ? (
              <EntradaMedicamentoForm
                medicamentos={medicamentos}
                lotes={lotes}
                onSave={guardarEntrada}
                onNavigateHistorial={() => setTab('historial')}
              />
            ) : (
              <HistorialEntradas
                entradas={entradas}
                onNavigateNuevo={() => setTab('registro')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}