import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Plus,
  Trash2,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import socialService from '../services/socialService';
import * as clinicaService from '../../clinica/services/clinicaService';
import HistorialConsultasAccordion from '../../../components/HistorialConsultas/HistorialConsultasAccordion';
import '../styles/social.css';

export default function ExpedientesSocialPage() {
  const navigate = useNavigate();
  const { idPaciente: routeIdPaciente } = useParams();

  const [busqueda, setBusqueda] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);

  const [selectedPacienteId, setSelectedPacienteId] = useState(routeIdPaciente || null);
  const [expediente, setExpediente] = useState(null);
  const [clinicaData, setClinicaData] = useState(null);
  const [loadingExpediente, setLoadingExpediente] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Estados para modal de Nueva Referencia
  const [modalRefAbierto, setModalRefAbierto] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [guardandoRef, setGuardandoRef] = useState(false);
  const [nuevaRef, setNuevaRef] = useState({
    idEspecialidad: '',
    idConsulta: '',
    motivoReferencia: ''
  });
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState('');

  useEffect(() => {
    cargarPacientes();
    cargarEspecialidades();
  }, []);

  // Búsqueda con debounce para optimizar rendimiento
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarPacientes(busqueda);
    }, 250);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // Si cambia el id en la ruta
  useEffect(() => {
    if (routeIdPaciente) {
      cargarExpedienteCompleto(routeIdPaciente);
    } else {
      setSelectedPacienteId(null);
      setExpediente(null);
      setClinicaData(null);
    }
  }, [routeIdPaciente]);

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

  const cargarEspecialidades = async () => {
    try {
      const data = await socialService.buscarEspecialidades();
      setEspecialidades(data || []);
    } catch (err) {
      console.error('Error cargando especialidades:', err);
    }
  };

  const cargarExpedienteCompleto = async (idPaciente) => {
    try {
      setSelectedPacienteId(idPaciente);
      setLoadingExpediente(true);
      setError(null);

      // Cargar en paralelo datos de trabajo social y datos clínicos completos
      const [socialRes, clinicaRes] = await Promise.all([
        socialService.getExpedientePaciente(idPaciente),
        clinicaService.obtenerPacienteConsulta(idPaciente).catch(e => {
          console.warn('No se pudieron obtener datos clínicos adicionales:', e);
          return null;
        })
      ]);

      setExpediente(socialRes);
      setClinicaData(clinicaRes);

      // Preseleccionar la última consulta si existe
      if (clinicaRes?.historialConsultas && clinicaRes.historialConsultas.length > 0) {
        setNuevaRef(prev => ({
          ...prev,
          idConsulta: clinicaRes.historialConsultas[0].idConsulta || ''
        }));
      } else if (socialRes?.consultas && socialRes.consultas.length > 0) {
        setNuevaRef(prev => ({
          ...prev,
          idConsulta: socialRes.consultas[0].idConsulta || ''
        }));
      }
    } catch (err) {
      console.error('Error cargando expediente:', err);
      setError('No se pudo cargar el expediente del paciente.');
    } finally {
      setLoadingExpediente(false);
    }
  };

  const handleSeleccionarPaciente = (idPaciente) => {
    navigate(`/social/expedientes/${idPaciente}`);
  };

  const handleVolverALista = () => {
    navigate('/social/expedientes');
  };

  const abrirModalNuevaRef = () => {
    setNuevaRef({
      idEspecialidad: '',
      idConsulta: (clinicaData?.historialConsultas?.[0]?.idConsulta) || (expediente?.consultas?.[0]?.idConsulta) || '',
      motivoReferencia: ''
    });
    setBusquedaEspecialidad('');
    setModalRefAbierto(true);
  };

  const cerrarModalNuevaRef = () => {
    setModalRefAbierto(false);
  };

  const handleGuardarReferencia = async (e) => {
    e.preventDefault();
    if (!nuevaRef.idEspecialidad) {
      alert('Por favor seleccione una especialidad para la referencia.');
      return;
    }

    try {
      setGuardandoRef(true);
      await socialService.crearReferenciaManual({
        idPaciente: Number(selectedPacienteId),
        idEspecialidad: Number(nuevaRef.idEspecialidad),
        idConsulta: nuevaRef.idConsulta ? Number(nuevaRef.idConsulta) : null,
        motivoReferencia: nuevaRef.motivoReferencia ? nuevaRef.motivoReferencia.trim() : null
      });

      setMensajeExito('Referencia médica agregada exitosamente.');
      setTimeout(() => setMensajeExito(null), 4000);
      cerrarModalNuevaRef();

      // Recargar expediente para refrescar lista de referencias y contadores
      await cargarExpedienteCompleto(selectedPacienteId);
    } catch (err) {
      console.error('Error al guardar referencia manual:', err);
      alert('Error al guardar la referencia: ' + (err.response?.data?.message || err.message));
    } finally {
      setGuardandoRef(false);
    }
  };

  const handleEliminarReferencia = async (idReferencia) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta referencia médica?')) {
      return;
    }

    try {
      await socialService.eliminarReferencia(idReferencia);
      setMensajeExito('Referencia médica eliminada.');
      setTimeout(() => setMensajeExito(null), 3000);
      await cargarExpedienteCompleto(selectedPacienteId);
    } catch (err) {
      console.error('Error al eliminar referencia:', err);
      alert('No se pudo eliminar la referencia.');
    }
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

  const pacienteInfo = clinicaData?.paciente || expediente?.paciente;

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="social-page-container">
        {/* Breadcrumb de navegación */}
        <Breadcrumb 
          items={selectedPacienteId && pacienteInfo ? [
            { label: 'Trabajo Social', path: '/social' },
            { label: 'Expedientes', path: '/social/expedientes' },
            { label: `${pacienteInfo.nombres || ''} ${pacienteInfo.apellidos || ''}`.trim() }
          ] : [
            { label: 'Trabajo Social', path: '/social' },
            { label: 'Expedientes' }
          ]} 
          showHome={true} 
        />

        {/* HEADER BAR */}
        <div className="social-header">
          <div className="social-header-title">
            {selectedPacienteId ? (
              <button 
                className="social-btn-back"
                onClick={handleVolverALista}
                title="Volver a la lista de pacientes"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <button 
                className="social-btn-back"
                onClick={() => navigate('/social')}
                title="Volver al portal de Trabajo Social"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1>{selectedPacienteId ? 'Expediente del Paciente' : 'Expedientes - Trabajo Social'}</h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                {selectedPacienteId 
                  ? 'Ficha social, gestión de referencias y antecedentes clínicos' 
                  : 'Consulta de pacientes, historial y referencias institucionales'}
              </p>
            </div>
          </div>

          {/* BUSCADOR (visible cuando estamos en la lista) */}
          {!selectedPacienteId && (
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
          )}
        </div>

        {error && (
          <div className="social-alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {mensajeExito && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13.5px',
            fontWeight: '600'
          }}>
            <CheckCircle size={18} color="#059669" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* VISTA 1: LISTA DE PACIENTES (IMAGE 2) */}
        {!selectedPacienteId && (
          <>
            {loadingPacientes ? (
              <div className="social-loading-state">
                <div className="social-spinner" />
                <p>Cargando pacientes...</p>
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
          </>
        )}

        {/* VISTA 2: DETALLE DEL EXPEDIENTE (PÁGINA COMPLETA) */}
        {selectedPacienteId && (
          <div>
            {loadingExpediente || (!expediente && !clinicaData) ? (
              <div className="social-loading-state" style={{ minHeight: '300px' }}>
                <div className="social-spinner" />
                <p>Cargando expediente del paciente...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. SECCIÓN: DATOS DEL PACIENTE */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '18px',
                        border: '1.5px solid #bae6fd'
                      }}>
                        {pacienteInfo?.nombres?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                          {`${pacienteInfo?.nombres || ''} ${pacienteInfo?.apellidos || ''}`.trim()}
                        </h2>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Expediente de Trabajo Social #{selectedPacienteId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GRID DEMOGRÁFICO */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Edad y Sexo</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                        {pacienteInfo?.edad !== null && pacienteInfo?.edad !== undefined ? `${pacienteInfo.edad} años` : 'N/A'} • {pacienteInfo?.sexo === 'M' ? 'Masculino' : (pacienteInfo?.sexo === 'F' ? 'Femenino' : (pacienteInfo?.sexo || 'N/A'))}
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Fecha de Nacimiento</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                        {pacienteInfo?.fechaNacimiento || 'No registrada'}
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Teléfono</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                        <Phone size={13} className="inline mr-1 text-gray-500" />
                        {pacienteInfo?.telefono || 'No registrado'}
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Comunidad / Residencia</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                        <MapPin size={13} className="inline mr-1 text-gray-500" />
                        {pacienteInfo?.comunidad || 'No registrada'}
                      </span>
                    </div>
                  </div>

                  {/* ALERGIAS SI EXISTEN */}
                  {pacienteInfo?.alergias && pacienteInfo.alergias.length > 0 && (
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <ShieldAlert size={15} color="#e11d48" />
                        <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '700', textTransform: 'uppercase' }}>
                          Alergias Registradas
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {pacienteInfo.alergias.map((al, idx) => (
                          <span key={idx} style={{
                            fontSize: '11.5px',
                            fontWeight: '700',
                            backgroundColor: '#ffe4e6',
                            color: '#be123c',
                            border: '1px solid #fecdd3',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            {typeof al === 'string' ? al : al.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. SECCIÓN: REFERENCIAS MÉDICAS (CON BOTÓN AGREGAR REFERENCIA) */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Share2 size={18} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#03045e', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          Referencias Médicas
                        </h3>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#0284c7',
                        backgroundColor: '#e0f2fe',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        border: '1px solid #bae6fd'
                      }}>
                        {expediente?.referencias?.length || 0} emitidas
                      </span>
                    </div>

                    {/* BOTÓN AGREGAR REFERENCIA */}
                    <button
                      type="button"
                      onClick={abrirModalNuevaRef}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                    >
                      <Plus size={16} />
                      Agregar Referencia
                    </button>
                  </div>

                  {/* LISTA DE REFERENCIAS */}
                  {expediente?.referencias && expediente.referencias.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                      {expediente.referencias.map((ref) => (
                        <div 
                          key={ref.idReferencia}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '14px 16px',
                            backgroundColor: '#f8fafc',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <span style={{
                                fontSize: '13.5px',
                                fontWeight: '800',
                                color: '#03045e',
                                display: 'block'
                              }}>
                                {ref.especialidad}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Clock size={11} /> {formatFecha(ref.fechaReferencia)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleEliminarReferencia(ref.idReferencia)}
                              title="Eliminar referencia"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                transition: 'color 0.15s ease'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Stethoscope size={13} color="#0284c7" />
                            <span><strong>Médico:</strong> Dr(a). {ref.medico}</span>
                          </div>

                          {ref.motivoReferencia ? (
                            <div style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '8px 10px',
                              fontSize: '12px',
                              color: '#334155',
                              lineHeight: '1.4'
                            }}>
                              <strong>Motivo: </strong>
                              {ref.motivoReferencia}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                              Sin motivo especificado
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '24px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px dashed #cbd5e1'
                    }}>
                      <Share2 size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                      <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '600', color: '#475569' }}>
                        Sin referencias médicas registradas para este paciente
                      </p>
                      <p style={{ margin: '4px 0 12px', fontSize: '12.5px', color: '#94a3b8' }}>
                        Si el médico olvidó registrarla durante la consulta, puedes agregarla manualmente con el botón superior.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. SECCIÓN: HISTORIAL COMPLETO DE CONSULTAS */}
                <HistorialConsultasAccordion 
                  consultas={clinicaData?.historialConsultas || expediente?.consultas}
                  ultimaConsulta={clinicaData?.ultimaConsulta}
                />

              </div>
            )}
          </div>
        )}

        {/* MODAL: AGREGAR REFERENCIA MÉDICA MANUAL */}
        {modalRefAbierto && (
          <div className="social-modal-overlay" onClick={cerrarModalNuevaRef}>
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '520px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
              }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    borderRadius: '8px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                      Agregar Referencia Médica
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      Se registrará en el expediente y se incluirá en las estadísticas del Excel
                    </p>
                  </div>
                </div>
                <button 
                  onClick={cerrarModalNuevaRef}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleGuardarReferencia}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* SELECCIÓN DE ESPECIALIDAD SEARCHABLE */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Especialidad de Referencia <span style={{ color: '#ef4444' }}>*</span>
                    </label>

                    {nuevaRef.idEspecialidad ? (
                      (() => {
                        const espSel = especialidades.find(
                          (e) => String(e.idEspecialidad) === String(nuevaRef.idEspecialidad)
                        );
                        return (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#f0fdf4',
                              border: '1.5px solid #86efac',
                              borderRadius: '8px',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#15803d' }}>
                                ✓ {espSel ? espSel.nombre : `Especialidad #${nuevaRef.idEspecialidad}`}
                              </div>
                              {espSel?.descripcion && (
                                <div style={{ fontSize: '12px', color: '#166534', marginTop: '2px' }}>
                                  {espSel.descripcion}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setNuevaRef({ ...nuevaRef, idEspecialidad: '' });
                                setBusquedaEspecialidad('');
                              }}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                color: '#475569',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              Cambiar
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            background: '#ffffff',
                          }}
                        >
                          <Search size={16} color="#64748b" />
                          <input
                            type="text"
                            placeholder="Buscar especialidad médica (ej. Oftalmología, Pediatría...)"
                            value={busquedaEspecialidad}
                            onChange={(e) => setBusquedaEspecialidad(e.target.value)}
                            style={{
                              border: 'none',
                              outline: 'none',
                              width: '100%',
                              fontSize: '13px',
                              color: '#0f172a',
                            }}
                          />
                          {busquedaEspecialidad && (
                            <button
                              type="button"
                              onClick={() => setBusquedaEspecialidad('')}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                              }}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>

                        {/* Lista scrolleable de opciones */}
                        <div
                          style={{
                            maxHeight: '170px',
                            overflowY: 'auto',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            background: '#ffffff',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                          }}
                        >
                          {(() => {
                            const filtradas = especialidades.filter((esp) => {
                              const q = busquedaEspecialidad.toLowerCase().trim();
                              if (!q) return true;
                              const nom = (esp.nombre || '').toLowerCase();
                              const desc = (esp.descripcion || '').toLowerCase();
                              return nom.includes(q) || desc.includes(q);
                            });

                            if (filtradas.length === 0) {
                              return (
                                <div
                                  style={{
                                    padding: '14px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: '12.5px',
                                  }}
                                >
                                  No se encontraron especialidades con ese nombre.
                                </div>
                              );
                            }

                            return filtradas.map((esp) => (
                              <div
                                key={esp.idEspecialidad}
                                onClick={() => setNuevaRef({ ...nuevaRef, idEspecialidad: esp.idEspecialidad })}
                                style={{
                                  padding: '8px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                              >
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                                  {esp.nombre}
                                </span>
                                {esp.descripcion && (
                                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                                    {esp.descripcion}
                                  </span>
                                )}
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SELECCIÓN DE CONSULTA VINCULADA */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Consulta Médica Asociada
                    </label>
                    <select
                      value={nuevaRef.idConsulta}
                      onChange={(e) => setNuevaRef({ ...nuevaRef, idConsulta: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0f172a',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {(clinicaData?.historialConsultas || expediente?.consultas || []).length > 0 ? (
                        (clinicaData?.historialConsultas || expediente?.consultas || []).map((c, idx) => (
                          <option key={c.idConsulta || idx} value={c.idConsulta}>
                            {idx === 0 ? 'Última Consulta' : 'Consulta'} - {formatFecha(c.fechaConsulta)} (Dr. {c.medico || 'Médico'})
                          </option>
                        ))
                      ) : (
                        <option value="">Última consulta registrada automáticamente</option>
                      )}
                    </select>
                  </div>

                  {/* MOTIVO DE LA REFERENCIA */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Motivo de Referencia / Observaciones
                    </label>
                    <textarea
                      rows={3}
                      value={nuevaRef.motivoReferencia}
                      onChange={(e) => setNuevaRef({ ...nuevaRef, motivoReferencia: e.target.value })}
                      placeholder="Ej. Referencia a oftalmología para control de fondo de ojo y evaluación de cataratas..."
                      maxLength={300}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0f172a',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {nuevaRef.motivoReferencia.length}/300 caracteres
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <button
                    type="button"
                    onClick={cerrarModalNuevaRef}
                    disabled={guardandoRef}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoRef}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: guardandoRef ? 'not-allowed' : 'pointer',
                      opacity: guardandoRef ? 0.7 : 1
                    }}
                  >
                    {guardandoRef ? 'Guardando...' : 'Guardar Referencia'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
