import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  ArrowLeft, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  AlertCircle,
  Clock,
  ChevronRight,
  ShieldAlert,
  HeartPulse,
  X
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import socialService from '../../social/services/socialService';
import * as clinicaService from '../services/clinicaService';
import HistorialConsultasAccordion from '../../../components/HistorialConsultas/HistorialConsultasAccordion';
import '../../social/styles/social.css';

export default function ExpedientesClinicosPage() {
  const navigate = useNavigate();
  const { idPaciente: routeIdPaciente } = useParams();

  const [busqueda, setBusqueda] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);

  const [selectedPacienteId, setSelectedPacienteId] = useState(routeIdPaciente || null);
  const [pacienteData, setPacienteData] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
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

  // Si cambia el id en la ruta
  useEffect(() => {
    if (routeIdPaciente) {
      cargarDetallePaciente(routeIdPaciente);
    } else {
      setSelectedPacienteId(null);
      setPacienteData(null);
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

  const cargarDetallePaciente = async (idPaciente) => {
    try {
      setSelectedPacienteId(idPaciente);
      setLoadingDetalle(true);
      setError(null);
      const data = await clinicaService.obtenerPacienteConsulta(idPaciente);
      setPacienteData(data);
    } catch (err) {
      console.error('Error cargando expediente clínico:', err);
      setError('No se pudo cargar el expediente clínico del paciente.');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleSeleccionarPaciente = (idPaciente) => {
    navigate(`/expedientes/${idPaciente}`);
  };

  const handleVolverALista = () => {
    navigate('/expedientes');
  };

  const pacienteInfo = pacienteData?.paciente;

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="social-page-container">
        {/* Breadcrumb de navegación */}
        <Breadcrumb 
          items={selectedPacienteId && pacienteInfo ? [
            { label: 'Expedientes', path: '/expedientes' },
            { label: `${pacienteInfo.nombres || ''} ${pacienteInfo.apellidos || ''}`.trim() }
          ] : [
            { label: 'Expedientes Clínicos' }
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
                title="Volver al listado de pacientes"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div style={{
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={20} />
              </div>
            )}
            <div>
              <h1>{selectedPacienteId ? 'Expediente del Paciente' : 'Expedientes Clínicos'}</h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                {selectedPacienteId 
                  ? 'Ficha clínica completa e historial de consultas médicas' 
                  : 'Consulta rápida de expedientes clínicos y antecedentes'}
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

        {/* VISTA 1: LISTADO DE PACIENTES */}
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
                          <div className="social-btn-open-exp">
                            Ver Expediente <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="social-empty-state">
                    <BookOpen size={48} className="text-gray-300 mb-2" />
                    <h3>No se encontraron pacientes</h3>
                    <p>Prueba buscando con otro nombre, apellido o teléfono.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* VISTA 2: DETALLE DEL EXPEDIENTE CLÍNICO */}
        {selectedPacienteId && (
          <div>
            {loadingDetalle || !pacienteData ? (
              <div className="social-loading-state" style={{ minHeight: '300px' }}>
                <div className="social-spinner" />
                <p>Cargando historial del paciente...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* TARJETA: DATOS DEL PACIENTE */}
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
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '18px'
                      }}>
                        {pacienteInfo?.nombres?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                          {`${pacienteInfo?.nombres || ''} ${pacienteInfo?.apellidos || ''}`.trim()}
                        </h2>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Expediente #{pacienteInfo?.idPaciente} • Registrado en clínica
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GRID DE DATOS DEMOGRÁFICOS */}
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
                        {pacienteInfo?.telefono || 'No registrado'}
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Comunidad / Residencia</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                        {pacienteInfo?.comunidad || 'No registrada'}
                      </span>
                    </div>
                  </div>

                  {/* ALERGIAS Y ANTECEDENTES */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <ShieldAlert size={15} color="#e11d48" />
                        <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '700', textTransform: 'uppercase' }}>
                          Alergias Registradas
                        </span>
                      </div>
                      {pacienteInfo?.alergias && pacienteInfo.alergias.length > 0 ? (
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
                      ) : (
                        <span style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic' }}>
                          No se han reportado alergias medicamentosas o alimentarias.
                        </span>
                      )}
                    </div>

                    {(pacienteInfo?.antecedentesPersonalesPatologicos || pacienteInfo?.antecedentesPersonalesFamiliares) && (
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Antecedentes Médicos
                        </span>
                        {pacienteInfo?.antecedentesPersonalesPatologicos && (
                          <p style={{ margin: '0 0 4px', fontSize: '12.5px', color: '#334155' }}>
                            <strong>Patológicos:</strong> {pacienteInfo.antecedentesPersonalesPatologicos}
                          </p>
                        )}
                        {pacienteInfo?.antecedentesPersonalesFamiliares && (
                          <p style={{ margin: 0, fontSize: '12.5px', color: '#334155' }}>
                            <strong>Familiares:</strong> {pacienteInfo.antecedentesPersonalesFamiliares}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* HISTORIAL COMPLETO DE CONSULTAS MÉDICAS */}
                <HistorialConsultasAccordion 
                  consultas={pacienteData?.historialConsultas}
                  ultimaConsulta={pacienteData?.ultimaConsulta}
                />

              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
