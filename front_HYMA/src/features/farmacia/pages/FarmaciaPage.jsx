import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowDownToLine, History } from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import { useFarmacia } from '../hooks/useFarmacia';
import MedicamentosList from '../components/MedicamentosList';
import CatalogosFarmacia from '../components/CatalogosFarmacia';
import EntradaMedicamentoForm from '../components/EntradaMedicamentoForm';
import FarmaciaDashboard from '../components/FarmaciaDashboard';
import HistorialEntradas from '../components/HistorialEntradas';
import LotesFarmacia from '../components/LotesFarmacia';
import ParametrosFarmacia from '../components/ParametrosFarmacia';
import '../styles/farmacia.css';

const tabs = [
  { key: 'dashboard', label: 'Resumen' },
  { key: 'medicamentos', label: 'Medicamentos' },
  { key: 'catalogos', label: 'Catálogos' },
  { key: 'entradas', label: 'Entradas' },
  { key: 'lotes', label: 'Lotes activos' },
  { key: 'parametros', label: 'Parámetros' },
];

function FarmaciaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    dashboard,
    categorias,
    casas,
    medicamentos,
    lotes,
    entradas,
    parametros,
    loading,
    error,
    guardarCategoria,
    borrarCategoria,
    guardarCasa,
    borrarCasa,
    guardarMedicamento,
    guardarEntrada,
    actualizarParametro,
  } = useFarmacia();

  const section = location.pathname.split('/')[2] || 'dashboard';
  const currentTab = tabs.some((tab) => tab.key === section) ? section : 'dashboard';
  const [vistaEntrada, setVistaEntrada] = useState('registro');
  const goTo = (nextSection) => navigate(nextSection === 'dashboard' ? '/farmacia' : '/farmacia/' + nextSection);

  const deleteWithConfirmation = async (type, id) => {
    const label = type === 'categoria' ? 'la categoría' : 'la casa farmacéutica';
    if (window.confirm('¿Deseas eliminar ' + label + '?')) {
      const result = type === 'categoria' ? await borrarCategoria(id) : await borrarCasa(id);
      if (result && !result.success && result.error) {
        alert(result.error);
      }
      return result;
    }
    return { success: false };
  };

  return (
    <div className="farmacia-page">
      <AdminNavbar />
      <main className="farmacia-container">
        {/* Cabecera Principal */}
        <div className="farmacia-heading">
          <div>
            <span className="farmacia-eyebrow">GESTIÓN ADMINISTRATIVA</span>
            <h1 className="farmacia-title">Farmacia e Inventario</h1>
            <p className="farmacia-subtitle">
              Administración de medicamentos, control de lotes y movimientos de stock.
            </p>
          </div>
        </div>

        {/* Barra de Pestañas Odoo */}
        <nav className="farmacia-tabs-bar" aria-label="Navegación de farmacia">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`farmacia-nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => goTo(tab.key)}
              >
                <span>{tab.label}</span>
                {tab.key === 'medicamentos' && medicamentos.length > 0 && (
                  <span className="farmacia-tab-badge">{medicamentos.length}</span>
                )}
                {tab.key === 'entradas' && entradas.length > 0 && (
                  <span className="farmacia-tab-badge">{entradas.length}</span>
                )}
                {tab.key === 'lotes' && lotes.length > 0 && (
                  <span className="farmacia-tab-badge">{lotes.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        {error && (
          <div className="farmacia-alert error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="farmacia-loading-container">
            <div className="farmacia-spinner" />
            <p>Cargando información del módulo de farmacia...</p>
          </div>
        ) : (
          <div className="farmacia-content-area">
            {/* 1. Resumen / Dashboard */}
            {currentTab === 'dashboard' && (
              <FarmaciaDashboard dashboard={dashboard} onNavigate={goTo} />
            )}

            {/* 2. Vista Exclusiva: Medicamentos Registrados */}
            {currentTab === 'medicamentos' && (
              <MedicamentosList
                medicamentos={medicamentos}
                categorias={categorias}
                casas={casas}
                onSaveMedicamento={guardarMedicamento}
              />
            )}

            {/* 3. Vista Exclusiva: Nuevo Medicamento, Categorías y Casas Farmacéuticas */}
            {currentTab === 'catalogos' && (
              <CatalogosFarmacia
                categorias={categorias}
                casas={casas}
                onSaveCategoria={guardarCategoria}
                onDeleteCategoria={(id) => deleteWithConfirmation('categoria', id)}
                onSaveCasa={guardarCasa}
                onDeleteCasa={(id) => deleteWithConfirmation('casa', id)}
                onSaveMedicamento={guardarMedicamento}
              />
            )}

            {/* 4. Entradas de inventario divididas en dos vistas: Registro e Historial */}
            {currentTab === 'entradas' && (
              <div className="farmacia-entradas-wrapper">
                <div className="farmacia-subtabs-toolbar">
                  <div className="farmacia-subtabs-group">
                    <button
                      type="button"
                      className={`farmacia-subtab-btn ${vistaEntrada === 'registro' ? 'active' : ''}`}
                      onClick={() => setVistaEntrada('registro')}
                    >
                      <ArrowDownToLine size={15} />
                      Registrar Entrada
                    </button>
                    <button
                      type="button"
                      className={`farmacia-subtab-btn ${vistaEntrada === 'historial' ? 'active' : ''}`}
                      onClick={() => setVistaEntrada('historial')}
                    >
                      <History size={15} />
                      Historial de Entradas
                      {entradas.length > 0 && (
                        <span className="farmacia-subtab-badge">{entradas.length}</span>
                      )}
                    </button>
                  </div>
                </div>

                {vistaEntrada === 'registro' ? (
                  <EntradaMedicamentoForm
                    medicamentos={medicamentos}
                    onSave={guardarEntrada}
                    onNavigateHistorial={() => setVistaEntrada('historial')}
                  />
                ) : (
                  <HistorialEntradas
                    entradas={entradas}
                    onNavigateNuevo={() => setVistaEntrada('registro')}
                  />
                )}
              </div>
            )}

            {/* 5. Lotes Activos */}
            {currentTab === 'lotes' && (
              <LotesFarmacia lotes={lotes} medicamentos={medicamentos} />
            )}

            {/* 6. Parámetros del sistema */}
            {currentTab === 'parametros' && (
              <ParametrosFarmacia parametros={parametros} onSave={actualizarParametro} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default FarmaciaPage;
