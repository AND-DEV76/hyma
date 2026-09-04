import React, { useState } from 'react';
import { UserPlus, Users, AlertCircle } from 'lucide-react';
import { useRecepcion } from '../hooks/useRecepcion';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import BuscadorPaciente from '../components/BuscadorPaciente';
import ColaAtencion from '../components/ColaAtencion';
import FormularioPaciente from '../components/FormularioPaciente';
import '../styles/recepcion.css';

function RecepcionPage() {
  const {
    pacientes,
    cola,
    busqueda,
    setBusqueda,
    buscar,
    agregarPaciente,
    crearNuevoPaciente,
    quitarDeCola,
    cargandoPacientes,
    cargandoCola,
    guardando,
    error,
  } = useRecepcion();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleNuevoPaciente = async (datos) => {
    await crearNuevoPaciente(datos);
    setMostrarFormulario(false);
  };

  return (
    <div className="recepcion-page">
      <AdminNavbar />

      <main className="recepcion-container">
        {/* Barra Superior de Control estilo Odoo */}
        <header className="recepcion-control-panel">
          <div className="recepcion-panel-left">
            <h1 className="recepcion-main-title">Registrar Paciente</h1>
            <div className="recepcion-queue-pill">
              <Users size={14} />
              <span><strong>{cola.length}</strong> en cola</span>
            </div>
          </div>

          <div className="recepcion-panel-actions">
            <button
              type="button"
              onClick={() => setMostrarFormulario(true)}
              className="recepcion-btn-primary"
            >
              <UserPlus size={16} />
              <span>Nuevo Paciente</span>
            </button>
          </div>
        </header>

        {/* Error global si ocurre */}
        {error && (
          <div className="recepcion-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Espacio de Trabajo: Buscador y Cola */}
        <div className="recepcion-workspace-grid">
          <BuscadorPaciente
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            pacientes={pacientes}
            buscar={buscar}
            agregarPaciente={agregarPaciente}
            cargando={cargandoPacientes}
            guardando={guardando}
          />

          <ColaAtencion
            cola={cola}
            quitarDeCola={quitarDeCola}
            cargando={cargandoCola}
            guardando={guardando}
          />
        </div>
      </main>

      {/* Modal de Registro de Paciente */}
      {mostrarFormulario && (
        <FormularioPaciente
          onGuardar={handleNuevoPaciente}
          onCerrar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}
    </div>
  );
}

export default RecepcionPage;
