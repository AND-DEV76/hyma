import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import { useFarmacia } from '../hooks/useFarmacia';
import CatalogosFarmacia from '../components/CatalogosFarmacia';
import EntradaMedicamentoForm from '../components/EntradaMedicamentoForm';
import FarmaciaDashboard from '../components/FarmaciaDashboard';
import HistorialEntradas from '../components/HistorialEntradas';
import LotesFarmacia from '../components/LotesFarmacia';
import ParametrosFarmacia from '../components/ParametrosFarmacia';
import '../styles/farmacia.css';

const tabs = [
  { key: 'dashboard', label: 'Resumen' },
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
  const goTo = (nextSection) => navigate(nextSection === 'dashboard' ? '/farmacia' : '/farmacia/' + nextSection);

  const deleteWithConfirmation = (type, id) => {
    const label = type === 'categoria' ? 'la categoría' : 'la casa farmacéutica';
    if (window.confirm('¿Deseas eliminar ' + label + '?')) {
      return type === 'categoria' ? borrarCategoria(id) : borrarCasa(id);
    }
    return Promise.resolve({ success: false });
  };

  return (
    <div className="farmacia-page">
      <AdminNavbar />
      <main className="farmacia-container">
        <div className="farmacia-heading">
          <div>
            <p className="eyebrow">GESTIÓN ADMINISTRATIVA</p>
            <h1>Farmacia e inventario</h1>
            <p>Control de medicamentos, lotes y movimientos de entrada.</p>
          </div>
        </div>

        <nav className="farmacia-tabs" aria-label="Módulo de farmacia">
          {tabs.map((tab) => (
            <button key={tab.key} className={'farmacia-tab ' + (currentTab === tab.key ? 'active' : '')} onClick={() => goTo(tab.key)}>
              {tab.label}
            </button>
          ))}
        </nav>

        {error && <div className="farmacia-alert" role="alert">{error}</div>}

        {loading ? (
          <div className="farmacia-loading">Cargando información de farmacia...</div>
        ) : (
          <>
            {currentTab === 'dashboard' && <FarmaciaDashboard dashboard={dashboard} onNavigate={goTo} />}
            {currentTab === 'catalogos' && (
              <CatalogosFarmacia
                categorias={categorias}
                casas={casas}
                medicamentos={medicamentos}
                onSaveCategoria={guardarCategoria}
                onDeleteCategoria={(id) => deleteWithConfirmation('categoria', id)}
                onSaveCasa={guardarCasa}
                onDeleteCasa={(id) => deleteWithConfirmation('casa', id)}
                onSaveMedicamento={guardarMedicamento}
              />
            )}
            {currentTab === 'entradas' && (
              <div className="farmacia-layout-2">
                <EntradaMedicamentoForm medicamentos={medicamentos} onSave={guardarEntrada} />
                <HistorialEntradas entradas={entradas} />
              </div>
            )}
            {currentTab === 'lotes' && <LotesFarmacia lotes={lotes} medicamentos={medicamentos} />}
            {currentTab === 'parametros' && <ParametrosFarmacia parametros={parametros} onSave={actualizarParametro} />}
          </>
        )}
      </main>
    </div>
  );
}

export default FarmaciaPage;
