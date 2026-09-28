import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  User,
  X,
  Users,
  Clock,
  Trash2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  Phone,
  MapPin,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useRecepcion } from '../hooks/useRecepcion';
import { iniciarPreconsulta } from '../../preconsulta/services/preconsultaService';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import FormularioPaciente from '../components/FormularioPaciente';
import '../styles/recepcion.css';

function RecepcionPage() {
  const navigate = useNavigate();
  const {
    pacientes,
    cola,
    busqueda,
    setBusqueda,
    buscar,
    agregarPaciente,
    crearNuevoPaciente,
    quitarDeCola,
    cargarCola,
    cargandoPacientes,
    cargandoCola,
    guardando,
    error: errorRecepcion,
  } = useRecepcion();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [agregandoId, setAgregandoId] = useState(null);
  const [atendiendoId, setAtendiendoId] = useState(null);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const searchContainerRef = useRef(null);

  // Debounce de búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setDropdownAbierto(false);
      return;
    }
    setDropdownAbierto(true);
    const timer = setTimeout(() => {
      buscar(busqueda);
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, buscar]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNuevoPaciente = async (datos) => {
    await crearNuevoPaciente(datos);
    setMostrarFormulario(false);
  };

  const handleAgregarACola = async (idPaciente) => {
    if (guardando || agregandoId !== null) return;
    setAgregandoId(idPaciente);
    setErrorLocal('');
    try {
      const ok = await agregarPaciente(idPaciente);
      if (ok) {
        setBusqueda('');
        setDropdownAbierto(false);
      }
    } finally {
      setAgregandoId(null);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!pacienteAEliminar || eliminando) return;
    setEliminando(true);
    setErrorLocal('');
    try {
      await quitarDeCola(pacienteAEliminar.idCola);
      setPacienteAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const handleAtenderPreconsulta = async (item) => {
    if (atendiendoId !== null || guardando) return;
    setErrorLocal('');
    setAtendiendoId(item.idCola);
    try {
      if (item.estado === 'PENDIENTE') {
        await iniciarPreconsulta(item.idCola);
      }
      navigate(`/preconsulta?idCola=${item.idCola}&idPaciente=${item.idPaciente}`);
    } catch (err) {
      setErrorLocal(err.response?.data?.message || 'No se pudo iniciar la preconsulta.');
    } finally {
      setAtendiendoId(null);
    }
  };

  const formatHora = (fecha) => {
    if (!fecha) return '--:--';
    try {
      const d = new Date(fecha);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="recepcion-page">
      <AdminNavbar />

      <main className="recepcion-container">
        {/* Error si ocurre */}
        {(errorRecepcion || errorLocal) && (
          <div className="recepcion-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorRecepcion || errorLocal}</span>
          </div>
        )}

        {/* Tarjeta Contenedora Principal - Basada en el bosquejo "VISTA RECEPCIÓN / VISTA 1" */}
        <div className="recepcion-main-card">
          
          {/* 1. Header: LISTA DE ESPERA DE PACIENTE */}
          <header className="recepcion-card-header">
            <div className="recepcion-header-left">
              <h1 className="recepcion-header-title">LISTA DE ESPERA DE PACIENTE</h1>
            </div>

            <div className="recepcion-header-right">
              <span className="recepcion-header-count">
                <Users size={15} />
                <span><strong>{cola.length}</strong> en espera</span>
              </span>
              <button
                type="button"
                onClick={() => cargarCola()}
                className="recepcion-header-refresh"
                title="Actualizar lista"
                disabled={cargandoCola}
              >
                <RefreshCw size={16} style={{ animation: cargandoCola ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>
          </header>

          {/* 2. Barra de Búsqueda y Botón [Nuevo] (Fila única) */}
          <div className="recepcion-search-bar-row">
            <div className="recepcion-search-field-container" ref={searchContainerRef}>
              <div className="recepcion-search-field">
                <div className="recepcion-search-field-icon-wrapper">
                  <Search size={18} className="recepcion-search-field-icon" />
                </div>
                <span className="recepcion-search-field-separator" aria-hidden="true"></span>
                <input
                  id="patient-search"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onFocus={() => {
                    if (busqueda.trim()) setDropdownAbierto(true);
                  }}
                  placeholder="Buscar por Nombre, Apellido o teléfono"
                  className="recepcion-search-field-input"
                  autoComplete="off"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusqueda('');
                      setDropdownAbierto(false);
                    }}
                    className="recepcion-search-clear"
                    title="Limpiar búsqueda"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Dropdown flotante de resultados de búsqueda */}
              {dropdownAbierto && busqueda.trim() && (
                <div className="recepcion-search-dropdown">
                  {cargandoPacientes ? (
                    <div className="recepcion-dropdown-loading">
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Buscando en expedientes médicos...</span>
                    </div>
                  ) : pacientes.length > 0 ? (
                    <div className="recepcion-dropdown-list">
                      <div className="recepcion-dropdown-header">
                        Expedientes encontrados ({pacientes.length}):
                      </div>
                      {pacientes.map((paciente) => (
                        <div key={paciente.idPaciente} className="recepcion-dropdown-item">
                          <div className="recepcion-dropdown-item-info">
                            <span className="recepcion-dropdown-item-name">
                              {paciente.nombres} {paciente.apellidos}
                            </span>
                            <div className="recepcion-dropdown-item-meta">
                              {paciente.telefono && (
                                <span>
                                  <Phone size={11} style={{ marginRight: '3px' }} />
                                  {paciente.telefono}
                                </span>
                              )}
                              {paciente.comunidad && (
                                <span>
                                  <MapPin size={11} style={{ marginRight: '3px' }} />
                                  {paciente.comunidad}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAgregarACola(paciente.idPaciente)}
                            disabled={guardando || agregandoId !== null}
                            className="recepcion-dropdown-btn-add"
                            title="Poner en lista de espera"
                          >
                            {agregandoId === paciente.idPaciente ? (
                              <>
                                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                <span>Agregando...</span>
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                <span>Poner en Espera</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="recepcion-dropdown-empty">
                      <span>No se encontró ningún expediente con "<strong>{busqueda}</strong>".</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownAbierto(false);
                          setMostrarFormulario(true);
                        }}
                        className="recepcion-dropdown-btn-new"
                      >
                        <UserPlus size={14} />
                        <span>Crear expediente nuevo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón [Nuevo] al extremo derecho de la barra de búsqueda */}
            <button
              type="button"
              onClick={() => setMostrarFormulario(true)}
              className="recepcion-btn-nuevo"
              title="Registrar nuevo paciente"
            >
              <UserPlus size={16} />
              <span>Nuevo</span>
            </button>
          </div>

          {/* 3. Lista de Pacientes en Espera (Tarjetas según bosquejo) */}
          <div className="recepcion-queue-section">
            {cargandoCola && cola.length === 0 ? (
              <div className="recepcion-queue-loading">
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#0077b6' }} />
                <span>Cargando lista de espera...</span>
              </div>
            ) : cola.length === 0 ? (
              <div className="recepcion-queue-empty">
                <Users size={38} color="#94a3b8" />
                <h3 className="recepcion-empty-title">No hay pacientes en lista de espera</h3>
                <p className="recepcion-empty-desc">
                  Busca un paciente con expediente en la barra superior o registra uno nuevo con el botón <strong>"Nuevo"</strong>.
                </p>
              </div>
            ) : (
              <div className="recepcion-cards-stack">
                {cola.map((item, index) => {
                  const isPendiente = item.estado === 'PENDIENTE';
                  const isEnPreconsulta = item.estado === 'EN_PRECONSULTA';

                  return (
                    <div key={item.idCola} className="recepcion-patient-card">
                      {/* Lado izquierdo: Ícono de paciente + Nombre del paciente en espera */}
                      <div className="recepcion-card-left">
                        <div className="recepcion-card-turn" title="Paciente en espera">
                          <User size={18} />
                        </div>

                        <div className="recepcion-card-details">
                          <div className="recepcion-card-title-row">
                            <span className="recepcion-card-patient-name">
                              {item.nombresPaciente} {item.apellidosPaciente}
                            </span>
                            <span className="recepcion-card-status-badge">
                              {isEnPreconsulta ? 'EN PRECONSULTA' : 'EN ESPERA'}
                            </span>
                          </div>

                          <div className="recepcion-card-meta-row">
                            <Clock size={12} style={{ color: '#0077b6' }} />
                            <span>
                              Hora de llegada: <strong>{formatHora(item.fechaIngreso)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lado derecho: Botones de Acción [Preconsulta] y [Eliminar] */}
                      <div className="recepcion-card-actions">
                        {isPendiente && (
                          <button
                            type="button"
                            onClick={() => handleAtenderPreconsulta(item)}
                            disabled={atendiendoId !== null || guardando}
                            className="recepcion-btn-preconsulta"
                            title="Pasar a toma de signos vitales (preconsulta)"
                          >
                            {atendiendoId === item.idCola ? (
                              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <>
                                <span>Preconsulta</span>
                                <ArrowRight size={13} />
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setPacienteAEliminar(item)}
                          disabled={guardando || eliminando}
                          className="recepcion-btn-eliminar"
                          title="Eliminar paciente de la lista de espera"
                        >
                          <Trash2 size={14} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Modal de Confirmación para Quitar/Eliminar de la Cola */}
      {pacienteAEliminar && (
        <div className="recepcion-modal-overlay">
          <div className="recepcion-confirm-modal">
            <div className="recepcion-confirm-icon-box">
              <Trash2 size={24} color="#e11d48" />
            </div>
            <h3 className="recepcion-confirm-title">¿Quitar de la lista de espera?</h3>
            <p className="recepcion-confirm-text">
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong>
                {pacienteAEliminar.nombresPaciente} {pacienteAEliminar.apellidosPaciente}
              </strong>{' '}
              de la lista de espera?
            </p>
            <div className="recepcion-confirm-actions">
              <button
                type="button"
                onClick={() => setPacienteAEliminar(null)}
                disabled={eliminando}
                className="recepcion-confirm-btn-cancel"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="recepcion-confirm-btn-delete"
              >
                {eliminando ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Sí, Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulario Nuevo Paciente */}
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
