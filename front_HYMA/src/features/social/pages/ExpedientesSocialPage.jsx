import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderHeart, 
  Search, 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Share2, 
  Stethoscope, 
  X, 
  AlertCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import socialService from '../services/socialService';
import '../styles/social.css';

export default function ExpedientesSocialPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);
  const [expediente, setExpediente] = useState(null);
  const [loadingExpediente, setLoadingExpediente] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPacientes();
  }, []);

  // Búsqueda con debounce para optimizar rendimiento
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarPacientes(busqueda);
    }, 250);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const cargarPacientes = async (query = '') => {
    try {
      setLoadingPacientes(true);
      const data = await socialService.getPacientesRecientes(query);
      setPacientes(data || []);
    } catch (err) {
      console.error('Error cargando pacientes:', err);
      setError('Error al obtener el listado de pacientes.');
    } finally {
      setLoadingPacientes(false);
    }
  };

  const handleSeleccionarPaciente = async (idPaciente) => {
    try {
      setSelectedPacienteId(idPaciente);
      setLoadingExpediente(true);
      const data = await socialService.getExpedientePaciente(idPaciente);
      setExpediente(data);
    } catch (err) {
      console.error('Error cargando expediente:', err);
      alert('No se pudo cargar el expediente del paciente.');
    } finally {
      setLoadingExpediente(false);
    }
  };

  const handleCerrarModal = () => {
    setSelectedPacienteId(null);
    setExpediente(null);
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-HN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaStr;
    }
  };

  // Limpiar cualquier prefijo de código CIE-10 para mostrar solo la descripción
  const limpiarDiagnostico = (texto) => {
    if (!texto) return '';
    return texto.replace(/^\[.*?\]\s*/, '').trim();
  };

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="social-page-container">
        {/* Breadcrumb de navegación */}
        <Breadcrumb 
          items={[
            { label: 'Trabajo Social', path: '/social' },
            { label: 'Expedientes Médicos' }
          ]} 
          showHome={true} 
        />

        {/* HEADER BAR */}
        <div className="social-header">
          <div className="social-header-title">
            <button 
              className="social-btn-back"
              onClick={() => navigate('/social')}
              title="Volver al portal de Trabajo Social"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1>Expedientes - Trabajo Social</h1>
            </div>
          </div>

          {/* BUSCADOR */}
          <div className="social-search-wrapper">
            <Search size={16} className="social-search-icon" />
            <input
              type="text"
              className="social-search-input"
              placeholder="Buscar por Nombre, Apellido o Teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button 
                className="social-search-clear"
                onClick={() => setBusqueda('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="social-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* LISTA DE PACIENTES */}
        {loadingPacientes ? (
          <div className="social-loading-state">
            <div className="social-spinner" />
            <p>Buscando pacientes...</p>
          </div>
        ) : (
          <div className="social-pacientes-grid">
            {pacientes.length > 0 ? (
              pacientes.map((p) => {
                const nombreCompleto = `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Paciente sin nombre';
                const inicial = p.nombres?.charAt(0)?.toUpperCase() || 'P';

                return (
                  <div 
                    key={p.idPaciente} 
                    className="social-paciente-card"
                    onClick={() => handleSeleccionarPaciente(p.idPaciente)}
                  >
                    <div className="social-paciente-avatar">
                      {inicial}
                    </div>

                    <div className="social-paciente-info">
                      <h3 className="social-paciente-name">{nombreCompleto}</h3>
                      <div className="social-paciente-meta">
                        {p.edad !== null && p.edad !== undefined && (
                          <span className="social-meta-item">
                            <strong>Edad:</strong> {p.edad} años
                          </span>
                        )}
                        {p.sexo && (
                          <span className="social-meta-item">
                            <strong>Sexo:</strong> {p.sexo}
                          </span>
                        )}
                        {p.comunidad && (
                          <span className="social-meta-item">
                            <MapPin size={12} /> {p.comunidad}
                          </span>
                        )}
                        {p.telefono && (
                          <span className="social-meta-item">
                            <Phone size={12} /> {p.telefono}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="social-paciente-actions">
                      {Number(p.totalReferencias) > 0 ? (
                        <span className="social-badge-ref-count">
                          <Share2 size={12} /> {p.totalReferencias} {p.totalReferencias === 1 ? 'Referencia' : 'Referencias'}
                        </span>
                      ) : (
                        <span className="social-badge-ref-zero">Sin referencias</span>
                      )}
                      <div className="social-btn-open-exp">
                        Ver Expediente <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="social-empty-state">
                <FolderHeart size={48} className="text-gray-300 mb-2" />
                <h3>No se encontraron pacientes</h3>
                <p>Prueba buscando con otro nombre, apellido o teléfono.</p>
              </div>
            )}
          </div>
        )}

        {/* MODAL HORIZONTAL FLUIDO Y OPTIMIZADO */}
        {selectedPacienteId && (
          <div className="social-modal-overlay" onClick={handleCerrarModal}>
            <div className="social-modal-horizontal" onClick={(e) => e.stopPropagation()}>
              {loadingExpediente || !expediente ? (
                <div className="social-modal-loading">
                  <div className="social-spinner" />
                  <p>Cargando expediente del paciente...</p>
                </div>
              ) : (
                <>
                  {/* MODAL HEADER */}
                  <div className="social-modal-header">
                    <div className="social-modal-header-info">
                      <div className="social-modal-avatar">
                        {expediente.paciente?.nombres?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h2>{`${expediente.paciente?.nombres || ''} ${expediente.paciente?.apellidos || ''}`.trim()}</h2>
                        <p className="social-modal-sub">
                          Expediente Social y Clínico
                        </p>
                      </div>
                    </div>
                    <button className="social-modal-close" onClick={handleCerrarModal} title="Cerrar ventana">
                      <X size={20} />
                    </button>
                  </div>

                  {/* MODAL BODY HORIZONTAL (3 COLUMNAS PARALELAS) */}
                  <div className="social-modal-horizontal-body">
                    {/* COLUMNA 1: DATOS DEL PACIENTE */}
                    <div className="social-modal-col social-modal-col-patient">
                      <div className="social-col-header">
                        <User size={16} className="text-[#0284c7]" />
                        <h4>Datos del Paciente</h4>
                      </div>
                      
                      <div className="social-patient-details-box">
                        <div className="social-detail-item">
                          <span className="social-detail-label">Nombre Completo</span>
                          <span className="social-detail-val font-bold">
                            {`${expediente.paciente?.nombres || ''} ${expediente.paciente?.apellidos || ''}`.trim()}
                          </span>
                        </div>

                        <div className="social-detail-grid-2">
                          <div className="social-detail-item">
                            <span className="social-detail-label">Edad</span>
                            <span className="social-detail-val">
                              {expediente.paciente?.edad !== null && expediente.paciente?.edad !== undefined ? `${expediente.paciente?.edad} años` : 'N/A'}
                            </span>
                          </div>
                          <div className="social-detail-item">
                            <span className="social-detail-label">Sexo</span>
                            <span className="social-detail-val">{expediente.paciente?.sexo || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="social-detail-item">
                          <span className="social-detail-label">Teléfono</span>
                          <span className="social-detail-val">
                            <Phone size={13} className="inline mr-1 text-gray-500" />
                            {expediente.paciente?.telefono || 'No registrado'}
                          </span>
                        </div>

                        <div className="social-detail-item">
                          <span className="social-detail-label">Comunidad / Residencia</span>
                          <span className="social-detail-val">
                            <MapPin size={13} className="inline mr-1 text-gray-500" />
                            {expediente.paciente?.comunidad || 'No registrada'}
                          </span>
                        </div>

                        <div className="social-detail-item">
                          <span className="social-detail-label">Total Referencias</span>
                          <span className="social-pill-count" style={{ display: 'inline-block', width: 'fit-content', marginTop: '4px' }}>
                            {expediente.referencias?.length || 0} emitidas
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA 2: HISTORIAL DE REFERENCIAS MÉDICAS */}
                    <div className="social-modal-col social-modal-col-scroll">
                      <div className="social-col-header">
                        <div className="flex items-center gap-2">
                          <Share2 size={16} className="text-[#0284c7]" />
                          <h4>Referencias Médicas</h4>
                        </div>
                        <span className="social-pill-count">
                          {expediente.referencias?.length || 0}
                        </span>
                      </div>

                      <div className="social-col-scrollable-content">
                        {expediente.referencias && expediente.referencias.length > 0 ? (
                          <div className="social-referencias-list">
                            {expediente.referencias.map((ref) => (
                              <div key={ref.idReferencia} className="social-ref-card">
                                <div className="social-ref-header">
                                  <span className="social-ref-especialidad">
                                    {ref.especialidad}
                                  </span>
                                  <span className="social-ref-fecha">
                                    <Clock size={11} /> {formatFecha(ref.fechaReferencia)}
                                  </span>
                                </div>
                                <div className="social-ref-doctor">
                                  <Stethoscope size={13} /> <strong>Médico:</strong> {ref.medico}
                                </div>
                                {ref.motivoReferencia ? (
                                  <div className="social-ref-motivo">
                                    <strong>Motivo:</strong>
                                    <p>{ref.motivoReferencia}</p>
                                  </div>
                                ) : (
                                  <div className="social-ref-motivo-empty">
                                    Sin motivo especificado
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="social-empty-sub">
                            <p>Sin referencias médicas registradas.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA 3: HISTORIAL DE CONSULTAS Y DIAGNÓSTICOS (SIN CÓDIGO CIE-10 Y SIN SIGNOS VITALES) */}
                    <div className="social-modal-col social-modal-col-scroll">
                      <div className="social-col-header">
                        <div className="flex items-center gap-2">
                          <Stethoscope size={16} className="text-[#714B67]" />
                          <h4>Consultas & Diagnósticos</h4>
                        </div>
                        <span className="social-pill-count">
                          {expediente.consultas?.length || 0}
                        </span>
                      </div>

                      <div className="social-col-scrollable-content">
                        {expediente.consultas && expediente.consultas.length > 0 ? (
                          <div className="social-consultas-list">
                            {expediente.consultas.map((c) => (
                              <div key={c.idConsulta} className="social-consulta-card">
                                <div className="social-consulta-header">
                                  <div className="social-consulta-meta">
                                    <Calendar size={12} /> {formatFecha(c.fechaConsulta)}
                                  </div>
                                  <div className="social-consulta-medico">
                                    Dr(a). {c.medico}
                                  </div>
                                </div>

                                {/* DIAGNÓSTICOS CLÍNICOS (SOLO DESCRIPCIÓN) */}
                                <div className="social-consulta-diag-box">
                                  <strong>Diagnósticos:</strong>
                                  {c.diagnosticos && c.diagnosticos.length > 0 ? (
                                    <ul className="social-diag-list">
                                      {c.diagnosticos.map((diag, i) => (
                                        <li key={i}>
                                          <span className="social-diag-bullet" />
                                          {limpiarDiagnostico(diag)}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-gray-400 italic text-xs ml-2">Sin diagnósticos</span>
                                  )}
                                </div>

                                {c.motivoConsulta && (
                                  <div className="social-consulta-obs">
                                    <strong>Motivo:</strong> {c.motivoConsulta}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="social-empty-sub">
                            <p>Sin consultas registradas.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MODAL FOOTER */}
                  <div className="social-modal-footer">
                    <button className="social-btn-modal-close" onClick={handleCerrarModal}>
                      Cerrar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
