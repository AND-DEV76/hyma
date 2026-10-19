import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  X,
  MapPin,
  Phone,
  Edit3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Calendar
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import { listarPacientesRecientes, actualizarPaciente } from '../services/recepcionService';
import '../styles/pacientes.css';

// Función para calcular edad precisa a partir de la fecha de nacimiento
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  try {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento + (fechaNacimiento.includes('T') ? '' : 'T00:00:00'));
    if (isNaN(fechaNac.getTime())) return null;
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad >= 0 ? edad : 0;
  } catch (e) {
    return null;
  }
};

// Formato de fecha para el input type="date" (YYYY-MM-DD)
const formatFechaInput = (fecha) => {
  if (!fecha) return '';
  return fecha.split('T')[0];
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Estado del modal de edición
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    sexo: 'M',
    telefono: '',
    comunidad: '',
    antecedentesPersonalesPatologicos: '',
    antecedentesPersonalesFamiliares: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [toastExito, setToastExito] = useState('');

  // Cargar pacientes
  const cargarPacientes = useCallback(async (termino = '') => {
    try {
      setCargando(true);
      setError('');
      const data = await listarPacientesRecientes(termino.trim());
      setPacientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setError('No se pudo cargar el listado de pacientes. Verifica tu conexión.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Debounce en búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarPacientes(busqueda);
    }, 300);

    return () => clearTimeout(timer);
  }, [busqueda, cargarPacientes]);

  // Manejar apertura de modal de edición
  const handleAbrirEditar = (paciente) => {
    setPacienteEditando(paciente);
    setErrorModal('');
    setFormEdit({
      nombres: paciente.nombres || '',
      apellidos: paciente.apellidos || '',
      fechaNacimiento: formatFechaInput(paciente.fechaNacimiento) || '',
      sexo: paciente.sexo || 'M',
      telefono: paciente.telefono || '',
      comunidad: paciente.comunidad || '',
      antecedentesPersonalesPatologicos: paciente.antecedentesPersonalesPatologicos || '',
      antecedentesPersonalesFamiliares: paciente.antecedentesPersonalesFamiliares || '',
      alergiaIds: Array.from(paciente.alergiaIds || []),
    });
  };

  const handleCerrarEditar = () => {
    if (guardando) return;
    setPacienteEditando(null);
    setErrorModal('');
  };

  // Manejar submit de edición
  const handleGuardarEditar = async (e) => {
    e.preventDefault();
    if (!pacienteEditando) return;

    if (!formEdit.nombres.trim()) {
      setErrorModal('El nombre es obligatorio.');
      return;
    }
    if (!formEdit.apellidos.trim()) {
      setErrorModal('Los apellidos son obligatorios.');
      return;
    }
    if (!formEdit.fechaNacimiento) {
      setErrorModal('La fecha de nacimiento es obligatoria.');
      return;
    }
    if (!formEdit.sexo) {
      setErrorModal('El sexo es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      setErrorModal('');

      const payload = {
        nombres: formEdit.nombres.trim(),
        apellidos: formEdit.apellidos.trim(),
        fechaNacimiento: formEdit.fechaNacimiento,
        sexo: formEdit.sexo,
        telefono: formEdit.telefono ? formEdit.telefono.trim() : null,
        comunidad: formEdit.comunidad ? formEdit.comunidad.trim() : null,
        antecedentesPersonalesPatologicos: formEdit.antecedentesPersonalesPatologicos
          ? formEdit.antecedentesPersonalesPatologicos.trim()
          : null,
        antecedentesPersonalesFamiliares: formEdit.antecedentesPersonalesFamiliares
          ? formEdit.antecedentesPersonalesFamiliares.trim()
          : null,
        alergiaIds: formEdit.alergiaIds || [],
      };

      const actualizado = await actualizarPaciente(pacienteEditando.idPaciente, payload);

      // Actualizar en el estado local de la lista
      setPacientes((prev) =>
        prev.map((p) => (p.idPaciente === pacienteEditando.idPaciente ? { ...p, ...actualizado } : p))
      );

      handleCerrarEditar();
      setToastExito('Paciente actualizado con éxito');
      setTimeout(() => setToastExito(''), 3500);
    } catch (err) {
      console.error('Error al actualizar paciente:', err);
      const msg = err.response?.data?.message || 'Error al actualizar el paciente. Verifica los datos.';
      setErrorModal(msg);
    } finally {
      setGuardando(false);
    }
  };

  // Fecha máxima para fecha de nacimiento (hoy)
  const hoyStr = new Date().toISOString().split('T')[0];

  return (
    <>
      <AdminNavbar />

      <div className="pacientes-page-container">
        {/* Cabecera */}
        <header className="pacientes-header">
          <div className="pacientes-header-info">
            <div className="pacientes-title-row">
              <div className="pacientes-title-icon">
                <Users size={22} />
              </div>
              <h1 className="pacientes-title">Lista de Pacientes</h1>
            </div>
            <p className="pacientes-subtitle">
              Gestión y actualización de datos de pacientes registrados
            </p>
          </div>
        </header>

        {/* Barra de Búsqueda y Resultados */}
        <div className="pacientes-toolbar">
          <div className="pacientes-search-wrapper">
            <Search size={18} className="pacientes-search-icon" />
            <input
              type="text"
              className="pacientes-search-input"
              placeholder="Buscar por nombre, apellido, teléfono o comunidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                className="pacientes-search-clear"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="pacientes-status-badge">
            <UserCheck size={14} />
            <span>
              {busqueda.trim()
                ? `Resultados: ${pacientes.length}`
                : `Mostrando ${pacientes.length} pacientes recientes`}
            </span>
          </div>
        </div>

        {/* Mensaje de error general */}
        {error && (
          <div className="paciente-modal-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Lista de Tarjetas de Pacientes */}
        {cargando ? (
          <div className="pacientes-loading">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <span>Cargando pacientes...</span>
          </div>
        ) : pacientes.length > 0 ? (
          <div className="pacientes-list">
            {pacientes.map((p) => {
              const inicial = (p.nombres || 'P').charAt(0).toUpperCase();
              const nombreCompleto = `${p.nombres || ''} ${p.apellidos || ''}`.trim();
              const edad = calcularEdad(p.fechaNacimiento);

              return (
                <div key={p.idPaciente} className="paciente-card">
                  {/* Avatar con inicial */}
                  <div className="paciente-avatar">{inicial}</div>

                  {/* Información Principal */}
                  <div className="paciente-info">
                    <h2 className="paciente-name">{nombreCompleto}</h2>
                    <div className="paciente-meta">
                      {edad !== null && (
                        <span className="paciente-meta-item">
                          <strong>Edad:</strong> {edad} {edad === 1 ? 'año' : 'años'}
                        </span>
                      )}
                      {p.sexo && (
                        <span className="paciente-meta-item">
                          <strong>Sexo:</strong> {p.sexo === 'M' ? 'M' : 'F'}
                        </span>
                      )}
                      {p.comunidad && (
                        <span className="paciente-meta-item">
                          <MapPin size={13} /> {p.comunidad}
                        </span>
                      )}
                      {p.telefono && (
                        <span className="paciente-meta-item">
                          <Phone size={13} /> {p.telefono}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="paciente-actions">
                    <button
                      className="btn-editar-paciente"
                      onClick={() => handleAbrirEditar(p)}
                      title="Editar datos del paciente"
                    >
                      <Edit3 size={15} />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pacientes-empty">
            <Users size={44} className="mx-auto text-slate-400" />
            <h3>No se encontraron pacientes</h3>
            <p>
              {busqueda.trim()
                ? `No hay coincidencias para "${busqueda}". Intenta con otro nombre, apellido o teléfono.`
                : 'No hay pacientes registrados en el sistema.'}
            </p>
          </div>
        )}

        {/* Modal de Edición de Paciente */}
        {pacienteEditando && (
          <div className="paciente-modal-overlay" onClick={handleCerrarEditar}>
            <div className="paciente-modal" onClick={(e) => e.stopPropagation()}>
              {/* Header del Modal */}
              <div className="paciente-modal-header">
                <div className="paciente-modal-title-box">
                  <div className="paciente-modal-icon">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h2 className="paciente-modal-title">Editar Paciente</h2>
                    <p className="paciente-modal-sub">
                      Actualización de información de {pacienteEditando.nombres} {pacienteEditando.apellidos}
                    </p>
                  </div>
                </div>
                <button
                  className="paciente-modal-close"
                  onClick={handleCerrarEditar}
                  title="Cerrar ventana"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleGuardarEditar}>
                <div className="paciente-modal-body">
                  {errorModal && (
                    <div className="paciente-modal-error">
                      <AlertCircle size={16} />
                      <span>{errorModal}</span>
                    </div>
                  )}

                  <div className="paciente-form-grid">
                    {/* Nombres */}
                    <div className="paciente-form-group">
                      <label className="paciente-form-label">
                        Nombres <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="paciente-form-input"
                        value={formEdit.nombres}
                        onChange={(e) =>
                          setFormEdit((prev) => ({ ...prev, nombres: e.target.value }))
                        }
                        placeholder="Ej: Daniel Angel"
                        required
                        maxLength={100}
                      />
                    </div>

                    {/* Apellidos */}
                    <div className="paciente-form-group">
                      <label className="paciente-form-label">
                        Apellidos <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="paciente-form-input"
                        value={formEdit.apellidos}
                        onChange={(e) =>
                          setFormEdit((prev) => ({ ...prev, apellidos: e.target.value }))
                        }
                        placeholder="Ej: Ambrocio Coj"
                        required
                        maxLength={100}
                      />
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="paciente-form-group">
                      <label className="paciente-form-label">
                        Fecha de Nacimiento <span className="req">*</span>
                      </label>
                      <input
                        type="date"
                        className="paciente-form-input"
                        value={formEdit.fechaNacimiento}
                        onChange={(e) =>
                          setFormEdit((prev) => ({ ...prev, fechaNacimiento: e.target.value }))
                        }
                        max={hoyStr}
                        required
                      />
                    </div>

                    {/* Sexo */}
                    <div className="paciente-form-group">
                      <label className="paciente-form-label">
                        Sexo <span className="req">*</span>
                      </label>
                      <div className="paciente-sexo-options">
                        <label
                          className={`paciente-sexo-option ${
                            formEdit.sexo === 'M' ? 'active' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="sexo"
                            value="M"
                            checked={formEdit.sexo === 'M'}
                            onChange={() => setFormEdit((prev) => ({ ...prev, sexo: 'M' }))}
                          />
                          Masculino (M)
                        </label>
                        <label
                          className={`paciente-sexo-option ${
                            formEdit.sexo === 'F' ? 'active' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="sexo"
                            value="F"
                            checked={formEdit.sexo === 'F'}
                            onChange={() => setFormEdit((prev) => ({ ...prev, sexo: 'F' }))}
                          />
                          Femenino (F)
                        </label>
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className="paciente-form-group">
                      <label className="paciente-form-label">Teléfono</label>
                      <input
                        type="text"
                        className="paciente-form-input"
                        value={formEdit.telefono}
                        onChange={(e) =>
                          setFormEdit((prev) => ({ ...prev, telefono: e.target.value }))
                        }
                        placeholder="Ej: +502 7464-6466"
                        maxLength={20}
                      />
                    </div>

                    {/* Comunidad / Dirección */}
                    <div className="paciente-form-group">
                      <label className="paciente-form-label">Comunidad o Dirección</label>
                      <input
                        type="text"
                        className="paciente-form-input"
                        value={formEdit.comunidad}
                        onChange={(e) =>
                          setFormEdit((prev) => ({ ...prev, comunidad: e.target.value }))
                        }
                        placeholder="Ej: Barrio La Joya"
                        maxLength={150}
                      />
                    </div>

                    {/* Antecedentes Personales Patológicos */}
                    <div className="paciente-form-group col-span-2">
                      <label className="paciente-form-label">
                        Antecedentes Personales Patológicos
                      </label>
                      <textarea
                        className="paciente-form-textarea"
                        value={formEdit.antecedentesPersonalesPatologicos}
                        onChange={(e) =>
                          setFormEdit((prev) => ({
                            ...prev,
                            antecedentesPersonalesPatologicos: e.target.value,
                          }))
                        }
                        placeholder="Enfermedades previas, cirugías, tratamientos crónicos..."
                        rows={2}
                      />
                    </div>

                    {/* Antecedentes Familiares */}
                    <div className="paciente-form-group col-span-2">
                      <label className="paciente-form-label">
                        Antecedentes Personales Familiares
                      </label>
                      <textarea
                        className="paciente-form-textarea"
                        value={formEdit.antecedentesPersonalesFamiliares}
                        onChange={(e) =>
                          setFormEdit((prev) => ({
                            ...prev,
                            antecedentesPersonalesFamiliares: e.target.value,
                          }))
                        }
                        placeholder="Diabetes, hipertensión, cardiopatías en familiares directos..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer del Modal */}
                <div className="paciente-modal-footer">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={handleCerrarEditar}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-guardar" disabled={guardando}>
                    {guardando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Flotante de Éxito */}
        {toastExito && (
          <div className="pacientes-toast-success">
            <CheckCircle2 size={18} />
            <span>{toastExito}</span>
          </div>
        )}
      </div>
    </>
  );
}
