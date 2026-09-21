import { useState, useEffect } from 'react';
import { Pill, Tag, Building2 } from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { useFarmacia } from '../hooks/useFarmacia';
import MedicamentosList from '../components/MedicamentosList';
import CatalogoTablaView from '../components/CatalogoTablaView';
import '../styles/farmacia.css';

export default function CatalogoMedicamentosPage() {
  const {
    categorias,
    casas,
    medicamentos,
    lotes,
    loading,
    error,
    refresh,
    guardarCategoria,
    borrarCategoria,
    guardarCasa,
    borrarCasa,
    guardarMedicamento,
  } = useFarmacia();

  const [tab, setTab] = useState('medicamentos');

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
            { label: 'Catálogo' },
          ]}
        />

        {/* Cabecera Principal */}
        <div className="farmacia-heading">
          <div>
            <span className="farmacia-eyebrow">CATÁLOGOS MAESTROS</span>
            <h1 className="farmacia-title">Catálogo de Farmacia</h1>
            <p className="farmacia-subtitle">
              Administración de medicamentos, categorías terapéuticas y casas farmacéuticas proveedoras.
            </p>
          </div>
        </div>

        {/* Barra de Pill Tabs */}
        <div className="farmacia-subtabs-toolbar" style={{ marginBottom: '22px' }}>
          <div className="farmacia-subtabs-group">
            <button
              type="button"
              className={`farmacia-subtab-btn ${tab === 'medicamentos' ? 'active' : ''}`}
              onClick={() => setTab('medicamentos')}
            >
              <Pill size={15} />
              Medicamentos
              {medicamentos.length > 0 && (
                <span className="farmacia-subtab-badge">{medicamentos.length}</span>
              )}
            </button>
            <button
              type="button"
              className={`farmacia-subtab-btn ${tab === 'categorias' ? 'active' : ''}`}
              onClick={() => setTab('categorias')}
            >
              <Tag size={15} />
              Categorías de Medicamentos
              {categorias.length > 0 && (
                <span className="farmacia-subtab-badge">{categorias.length}</span>
              )}
            </button>
            <button
              type="button"
              className={`farmacia-subtab-btn ${tab === 'casas' ? 'active' : ''}`}
              onClick={() => setTab('casas')}
            >
              <Building2 size={15} />
              Casas Farmacéuticas
              {casas.length > 0 && (
                <span className="farmacia-subtab-badge">{casas.length}</span>
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
            <p>Cargando información del catálogo...</p>
          </div>
        ) : (
          <div className="farmacia-content-area">
            {tab === 'medicamentos' && (
              <MedicamentosList
                medicamentos={medicamentos}
                lotes={lotes}
                categorias={categorias}
                casas={casas}
                onSaveMedicamento={guardarMedicamento}
                soloConExistencias={false}
                mostrarDesactivar={true}
                mostrarBotonNuevo={true}
                titulo="Catálogo Maestro de Medicamentos"
                esCatalogo={true}
              />
            )}

            {tab === 'categorias' && (
              <CatalogoTablaView
                title="Categorías de Medicamentos"
                singularLabel="categoría"
                icon={<Tag size={16} />}
                items={categorias}
                medicamentos={medicamentos}
                medFkField="idCategoriaMedicamento"
                placeholder="Ej. Analgésicos, Antibióticos, Antiinflamatorios..."
                onSave={guardarCategoria}
                onDelete={borrarCategoria}
              />
            )}

            {tab === 'casas' && (
              <CatalogoTablaView
                title="Casas Farmacéuticas"
                singularLabel="casa farmacéutica"
                icon={<Building2 size={16} />}
                items={casas}
                medicamentos={medicamentos}
                medFkField="idCasaFarmaceutica"
                placeholder="Ej. Bayer, Pfizer, Roemmers, Roche..."
                onSave={guardarCasa}
                onDelete={borrarCasa}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}