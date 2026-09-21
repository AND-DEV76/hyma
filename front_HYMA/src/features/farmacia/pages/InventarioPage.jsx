import { useState, useEffect } from 'react';
import { Package, ArrowUpRight } from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { useFarmacia } from '../hooks/useFarmacia';
import MedicamentosList from '../components/MedicamentosList';
import SalidasList from '../components/SalidasList';
import '../styles/farmacia.css';

export default function InventarioPage() {
  const {
    categorias,
    casas,
    medicamentos,
    lotes,
    loading,
    error,
    refresh,
    guardarMedicamento,
  } = useFarmacia();

  const [tab, setTab] = useState('stock');

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
            { label: 'Inventario' },
          ]}
        />

        {/* Cabecera Principal */}
        <div className="farmacia-heading">
          <div>
            <span className="farmacia-eyebrow">CONTROL DE INVENTARIO</span>
            <h1 className="farmacia-title">Inventario de Farmacia</h1>
            <p className="farmacia-subtitle">
              Gestión de stock físico disponible en existencia y registro de salidas de medicamentos.
            </p>
          </div>
        </div>

        {/* Barra de Pill Tabs */}
        <div className="farmacia-subtabs-toolbar" style={{ marginBottom: '22px' }}>
          <div className="farmacia-subtabs-group">
            <button
              type="button"
              className={`farmacia-subtab-btn ${tab === 'stock' ? 'active' : ''}`}
              onClick={() => setTab('stock')}
            >
              <Package size={15} />
              Stock Actual
            </button>
            <button
              type="button"
              className={`farmacia-subtab-btn ${tab === 'salidas' ? 'active' : ''}`}
              onClick={() => setTab('salidas')}
            >
              <ArrowUpRight size={15} />
              Salidas de Inventario
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
            <p>Cargando información de inventario...</p>
          </div>
        ) : (
          <div className="farmacia-content-area">
            {tab === 'stock' ? (
              <MedicamentosList
                medicamentos={medicamentos}
                lotes={lotes}
                categorias={categorias}
                casas={casas}
                onSaveMedicamento={guardarMedicamento}
                soloConExistencias={true}
                mostrarDesactivar={false}
                mostrarBotonNuevo={false}
                titulo="Stock Actual con Existencias"
              />
            ) : (
              <SalidasList />
            )}
          </div>
        )}
      </main>
    </div>
  );
}