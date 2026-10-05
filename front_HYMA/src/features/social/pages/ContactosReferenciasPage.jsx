import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Building2,
  UserCheck,
  DollarSign,
  MapPin,
  Calendar,
  Phone,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  X,
  CheckCircle2,
  AlertCircle,
  FolderHeart,
  Loader2,
  Layers,
  Sparkles,
  Clock,
  CircleDollarSign
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import socialService from '../services/socialService';
import '../styles/social.css';

export default function ContactosReferenciasPage() {
  const navigate = useNavigate();

  // Estados principales
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Acordeón de especialidades abiertas/cerradas (por defecto todas abiertas)
  const [openSpecialties, setOpenSpecialties] = useState({});

  // Modales
  const [showModalEspecialidad, setShowModalEspecialidad] = useState(false);
  const [showModalContacto, setShowModalContacto] = useState(false);
  const [selectedEspecialidadParaContacto, setSelectedEspecialidadParaContacto] = useState(null);
  const [contactoEnEdicion, setContactoEnEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Modal confirmación eliminar
  const [itemAEliminar, setItemAEliminar] = useState(null); // { type: 'especialidad' | 'contacto', id, nombre }
  const [eliminando, setEliminando] = useState(false);

  // Formulario Especialidad
  const [formEspecialidad, setFormEspecialidad] = useState({
    nombre: '',
    descripcion: ''
  });

  // Formulario Contacto
  const [formContacto, setFormContacto] = useState({
    idEspecialidad: '',
    institucion: '',
    nombreMedico: '',
    precioConsulta: '',
    direccion: '',
    diasAtencion: '',
    telefono: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await socialService.listarEspecialidadesConContactos(query);
      setEspecialidades(data || []);
    } catch (err) {
      console.error('Error al cargar especialidades y contactos:', err);
      setError('No se pudo cargar el directorio de referencias.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado en tiempo real o debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos(busqueda);
    }, 250);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const toggleSpecialty = (idEspecialidad) => {
    setOpenSpecialties((prev) => ({
      ...prev,
      [idEspecialidad]: !prev[idEspecialidad]
    }));
  };

  // Abrir Modal Nueva Especialidad
  const handleAbrirModalEspecialidad = () => {
    setFormEspecialidad({ nombre: '', descripcion: '' });
    setError(null);
    setShowModalEspecialidad(true);
  };

  // Guardar Especialidad
  const handleGuardarEspecialidad = async (e) => {
    e.preventDefault();
    if (!formEspecialidad.nombre.trim()) {
      alert('El nombre de la especialidad es obligatorio.');
      return;
    }
    try {
      setGuardando(true);
      await socialService.crearEspecialidad({
        nombre: formEspecialidad.nombre.trim(),
        descripcion: formEspecialidad.descripcion.trim()
      });
      setShowModalEspecialidad(false);
      setSuccessMsg('Especialidad guardada exitosamente.');
      setTimeout(() => setSuccessMsg(null), 3500);
      await cargarDatos(busqueda);
    } catch (err) {
      console.error('Error guardando especialidad:', err);
      const msg = err.response?.data?.message || 'Error al guardar la especialidad. Verifique que no esté duplicada.';
      alert(msg);
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal Nuevo Contacto
  const handleAbrirModalContacto = (esp) => {
    setContactoEnEdicion(null);
    setSelectedEspecialidadParaContacto(esp);
    setFormContacto({
      idEspecialidad: esp ? esp.idEspecialidad : '',
      institucion: '',
      nombreMedico: '',
      precioConsulta: '',
      direccion: '',
      diasAtencion: '',
      telefono: ''
    });
    setError(null);
    setShowModalContacto(true);
  };

  // Abrir Modal Editar Contacto
  const handleAbrirEditarContacto = (contacto, esp) => {
    setContactoEnEdicion(contacto);
    setSelectedEspecialidadParaContacto(esp);
    setFormContacto({
      idEspecialidad: contacto.idEspecialidad || esp.idEspecialidad,
      institucion: contacto.institucion || '',
      nombreMedico: contacto.nombreMedico || '',
      precioConsulta: contacto.precioConsulta !== null && contacto.precioConsulta !== undefined ? contacto.precioConsulta : '',
      direccion: contacto.direccion || '',
      diasAtencion: contacto.diasAtencion || '',
      telefono: contacto.telefono || ''
    });
    setError(null);
    setShowModalContacto(true);
  };

  // Guardar Contacto (Crear o Actualizar)
  const handleGuardarContacto = async (e) => {
    e.preventDefault();
    if (!formContacto.idEspecialidad) {
      alert('Seleccione una especialidad válida.');
      return;
    }
    if (!formContacto.direccion.trim()) {
      alert('La dirección es obligatoria.');
      return;
    }
    if (formContacto.precioConsulta === '' || isNaN(formContacto.precioConsulta)) {
      alert('Ingrese un precio de consulta válido.');
      return;
    }
    if (formContacto.telefono && formContacto.telefono.trim()) {
      const telLimpio = formContacto.telefono.replace(/\D/g, '');
      if (telLimpio.length !== 8) {
        alert('El teléfono de contacto debe tener exactamente 8 dígitos.');
        return;
      }
    }

    try {
      setGuardando(true);
      const telFinal = formContacto.telefono ? formContacto.telefono.replace(/\D/g, '').slice(0, 8) : null;
      const payload = {
        idEspecialidad: Number(formContacto.idEspecialidad),
        institucion: formContacto.institucion.trim() || null,
        nombreMedico: formContacto.nombreMedico.trim() || null,
        precioConsulta: parseFloat(formContacto.precioConsulta),
        direccion: formContacto.direccion.trim(),
        diasAtencion: formContacto.diasAtencion.trim() || null,
        telefono: telFinal || null
      };

      if (contactoEnEdicion) {
        await socialService.actualizarCentro(contactoEnEdicion.idCentroReferencia, payload);
        setSuccessMsg('Contacto de referencia actualizado exitosamente.');
      } else {
        await socialService.crearCentro(payload);
        setSuccessMsg('Nuevo contacto de referencia agregado exitosamente.');
      }

      setShowModalContacto(false);
      setTimeout(() => setSuccessMsg(null), 3500);
      await cargarDatos(busqueda);
    } catch (err) {
      console.error('Error guardando contacto:', err);
      const msg = err.response?.data?.message || 'Error al guardar el contacto de referencia.';
      alert(msg);
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar Eliminación
  const handleConfirmarEliminar = async () => {
    if (!itemAEliminar || eliminando) return;
    try {
      setEliminando(true);
      if (itemAEliminar.type === 'contacto') {
        await socialService.eliminarCentro(itemAEliminar.id);
        setSuccessMsg('Contacto eliminado exitosamente.');
      } else if (itemAEliminar.type === 'especialidad') {
        await socialService.eliminarEspecialidad(itemAEliminar.id);
        setSuccessMsg('Especialidad eliminada exitosamente.');
      }
      setItemAEliminar(null);
      setTimeout(() => setSuccessMsg(null), 3500);
      await cargarDatos(busqueda);
    } catch (err) {
      console.error('Error eliminando elemento:', err);
      alert('No se pudo eliminar el elemento seleccionado.');
    } finally {
      setEliminando(false);
    }
  };

  const formatearPrecio = (precio) => {
    if (precio === null || precio === undefined) return 'Gratuito / N/A';
    const num = parseFloat(precio);
    if (isNaN(num)) return 'Gratuito / N/A';
    return `Q. ${num.toFixed(2)}`;
  };

  return (
    <div className="social-page-container">
      <AdminNavbar />

      <main style={{ maxWidth: '1250px', margin: '0 auto', width: '100%', padding: '24px 20px' }}>
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Trabajo Social', path: '/social' },
            { label: 'Contacto de Referencias' }
          ]}
          showHome={true}
        />

        {/* Encabezado Odoo Style */}
        <header className="social-header" style={{ marginBottom: '20px' }}>
          <div className="social-header-title">
            <button
              onClick={() => navigate('/social')}
              className="social-btn-back"
              title="Volver al Portal de Trabajo Social"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="social-eyebrow" style={{ color: '#0284c7', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
                DIRECTORIO INSTITUCIONAL
              </span>
              <h1>Contacto de Referencias</h1>
              <p className="social-subtitle">
                Catálogo de especialidades médicas y directorio de contactos para canalización de pacientes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleAbrirModalEspecialidad}
              className="directorio-btn-primary"
              title="Registrar nueva especialidad"
            >
              <Plus size={16} />
              <span>Nueva Especialidad</span>
            </button>
          </div>
        </header>

        {/* Alertas de Éxito / Error */}
        {successMsg && (
          <div className="directorio-alert-success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="social-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Barra de Búsqueda y Estadísticas Rápidas */}
        <section className="directorio-search-panel">
          <div className="directorio-search-input-wrapper">
            <Search size={18} className="directorio-search-icon" />
            <input
              type="text"
              placeholder="Buscar por especialidad, clínica, médico o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="directorio-search-input"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="directorio-search-clear"
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="directorio-count-chip">
            <Layers size={15} color="#0284c7" />
            <span><strong>{especialidades.length}</strong> {especialidades.length === 1 ? 'Especialidad' : 'Especialidades'}</span>
          </div>
        </section>

        {/* Listado de Especialidades y sus Contactos */}
        {loading ? (
          <div className="social-loading-state">
            <div className="social-spinner" />
            <p>Cargando directorio de especialidades y referencias...</p>
          </div>
        ) : especialidades.length === 0 ? (
          <div className="social-empty-state">
            <Stethoscope size={48} color="#94a3b8" />
            <h3>No se encontraron especialidades</h3>
            <p>
              {busqueda
                ? `No hay especialidades que coincidan con "${busqueda}".`
                : 'Aún no se han registrado especialidades en el sistema.'}
            </p>
            <button
              onClick={handleAbrirModalEspecialidad}
              className="directorio-btn-primary"
              style={{ marginTop: '16px' }}
            >
              <Plus size={16} />
              <span>Registrar Primera Especialidad</span>
            </button>
          </div>
        ) : (
          <div className="directorio-especialidades-list">
            {especialidades.map((esp) => {
              const isOpen = Boolean(openSpecialties[esp.idEspecialidad]);
              const contactos = esp.contactos || [];

              return (
                <div key={esp.idEspecialidad} className="directorio-especialidad-card">
                  {/* Cabecera de la Especialidad (Clickeable para colapsar/expandir) */}
                  <div
                    className="directorio-especialidad-header"
                    onClick={() => toggleSpecialty(esp.idEspecialidad)}
                  >
                    <div className="directorio-especialidad-info">
                      <div className="directorio-especialidad-icon-box">
                        <Stethoscope size={20} color="#0284c7" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h2 className="directorio-especialidad-name">{esp.nombre}</h2>
                          <span className={`directorio-badge-count ${contactos.length > 0 ? 'has-contacts' : 'empty'}`}>
                            {contactos.length} {contactos.length === 1 ? 'contacto' : 'contactos'}
                          </span>
                        </div>
                        {esp.descripcion && (
                          <p className="directorio-especialidad-desc">{esp.descripcion}</p>
                        )}
                      </div>
                    </div>

                    <div className="directorio-especialidad-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleAbrirModalContacto(esp)}
                        className="directorio-btn-add-contact"
                        title={`Agregar nuevo contacto a ${esp.nombre}`}
                      >
                        <Plus size={15} />
                        <span>Agregar Contacto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSpecialty(esp.idEspecialidad)}
                        className="directorio-btn-toggle"
                        title={isOpen ? 'Contraer' : 'Expandir'}
                      >
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo de Contactos (Referencias de esta especialidad) */}
                  {isOpen && (
                    <div className="directorio-contactos-body">
                      {contactos.length === 0 ? (
                        <div className="directorio-empty-contacts">
                          <p>No hay contactos de referencia registrados para <strong>{esp.nombre}</strong>.</p>
                          <button
                            type="button"
                            onClick={() => handleAbrirModalContacto(esp)}
                            className="directorio-btn-link"
                          >
                            + Agregar el primer centro o médico de referencia
                          </button>
                        </div>
                      ) : (
                        <div className="directorio-contactos-list">
                          {contactos.map((c) => (
                            <div key={c.idCentroReferencia} className="directorio-contacto-row">
                              {/* Columna 1: Institución, Dirección y Días/Horario abajo */}
                              <div className="directorio-col-institucion">
                                <div className="directorio-inst-header">
                                  <div className="directorio-inst-icon-box">
                                    <Building2 size={20} color="#0284c7" />
                                  </div>
                                  <h3 className="directorio-inst-name">
                                    {c.institucion || 'Centro / Clínica Especializada'}
                                  </h3>
                                </div>
                                <div className="directorio-inst-sub-details">
                                  {c.direccion && (
                                    <div className="directorio-sub-item">
                                      <MapPin size={14} className="directorio-sub-icon" />
                                      <span>{c.direccion}</span>
                                    </div>
                                  )}
                                  {c.diasAtencion && (
                                    <div className="directorio-sub-item">
                                      <Clock size={14} className="directorio-sub-icon" />
                                      <span>{c.diasAtencion}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Columna 2: Médico Principal, Teléfono, Costo Consulta */}
                              <div className="directorio-col-meta">
                                {c.nombreMedico && (
                                  <div className="directorio-meta-row">
                                    <div className="directorio-meta-label">
                                      <UserCheck size={14} />
                                      <span>Médico:</span>
                                    </div>
                                    <span className="directorio-meta-val">{c.nombreMedico}</span>
                                  </div>
                                )}

                                <div className="directorio-meta-row">
                                  <div className="directorio-meta-label">
                                    <Phone size={14} />
                                    <span>Teléfono:</span>
                                  </div>
                                  {c.telefono ? (
                                    <a href={`tel:${c.telefono}`} className="directorio-meta-phone">
                                      {c.telefono}
                                    </a>
                                  ) : (
                                    <span className="directorio-meta-empty">No registrado</span>
                                  )}
                                </div>

                                <div className="directorio-meta-row">
                                  <div className="directorio-meta-label">
                                    <CircleDollarSign size={14} />
                                    <span>Costo Consulta:</span>
                                  </div>
                                  <span className="directorio-precio-green">
                                    {formatearPrecio(c.precioConsulta)}
                                  </span>
                                </div>
                              </div>

                              {/* Columna 3: Acciones */}
                              <div className="directorio-col-actions">
                                <span className="directorio-actions-heading">Acciones</span>
                                <div className="directorio-actions-buttons">
                                  <button
                                    type="button"
                                    onClick={() => handleAbrirEditarContacto(c, esp)}
                                    className="directorio-btn-action edit"
                                    title="Editar contacto"
                                  >
                                    <Pencil size={15} />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setItemAEliminar({
                                      type: 'contacto',
                                      id: c.idCentroReferencia,
                                      nombre: c.institucion || c.nombreMedico || 'este contacto'
                                    })}
                                    className="directorio-btn-action delete"
                                    title="Eliminar contacto"
                                  >
                                    <Trash2 size={15} />
                                    <span>Eliminar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: NUEVA ESPECIALIDAD */}
        {showModalEspecialidad && (
          <div className="social-modal-overlay">
            <div className="social-modal-card" style={{ maxWidth: '480px' }}>
              <div className="social-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stethoscope size={20} color="#0284c7" />
                  </div>
                  <div>
                    <h2 className="social-modal-title">Nueva Especialidad</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Agregar catálogo de especialidad médica</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModalEspecialidad(false)}
                  className="social-btn-close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGuardarEspecialidad}>
                <div className="social-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px' }}>
                  <div>
                    <label className="directorio-label">
                      Nombre de la Especialidad <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Neurología, Cardiología, Nefrología..."
                      value={formEspecialidad.nombre}
                      onChange={(e) => setFormEspecialidad({ ...formEspecialidad, nombre: e.target.value })}
                      className="directorio-input"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="directorio-label">
                      Descripción <span style={{ fontSize: '11px', color: '#94a3b8' }}>(Opcional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Breve descripción o notas sobre esta especialidad..."
                      value={formEspecialidad.descripcion}
                      onChange={(e) => setFormEspecialidad({ ...formEspecialidad, descripcion: e.target.value })}
                      className="directorio-input"
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>

                <div className="social-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowModalEspecialidad(false)}
                    className="directorio-btn-secondary"
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="directorio-btn-primary"
                    disabled={guardando}
                  >
                    {guardando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Guardar Especialidad</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: AGREGAR / EDITAR CONTACTO DE REFERENCIA */}
        {showModalContacto && (
          <div className="social-modal-overlay">
            <div className="social-modal-card" style={{ maxWidth: '580px' }}>
              <div className="social-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} color="#0284c7" />
                  </div>
                  <div>
                    <h2 className="social-modal-title">
                      {contactoEnEdicion ? 'Editar Contacto de Referencia' : 'Nuevo Contacto de Referencia'}
                    </h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      Especialidad: <strong>{selectedEspecialidadParaContacto?.nombre || 'Seleccionada'}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModalContacto(false)}
                  className="social-btn-close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGuardarContacto}>
                <div className="social-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px', maxHeight: '68vh', overflowY: 'auto' }}>
                  {/* Especialidad selector si no está fija */}
                  <div>
                    <label className="directorio-label">Especialidad</label>
                    <select
                      value={formContacto.idEspecialidad}
                      onChange={(e) => setFormContacto({ ...formContacto, idEspecialidad: e.target.value })}
                      className="directorio-input"
                      required
                    >
                      <option value="">-- Seleccione una especialidad --</option>
                      {especialidades.map((esp) => (
                        <option key={esp.idEspecialidad} value={esp.idEspecialidad}>
                          {esp.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="directorio-label">
                        Institución / Clínica / Hospital
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Clínica San Rafael"
                        value={formContacto.institucion}
                        onChange={(e) => setFormContacto({ ...formContacto, institucion: e.target.value })}
                        className="directorio-input"
                      />
                    </div>
                    <div>
                      <label className="directorio-label">
                        Nombre del Médico
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Dr. Mario Estrada"
                        value={formContacto.nombreMedico}
                        onChange={(e) => setFormContacto({ ...formContacto, nombreMedico: e.target.value })}
                        className="directorio-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="directorio-label">
                        Precio Consulta (Q.) <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        value={formContacto.precioConsulta}
                        onChange={(e) => setFormContacto({ ...formContacto, precioConsulta: e.target.value })}
                        className="directorio-input"
                      />
                    </div>
                    <div>
                      <label className="directorio-label">
                        Teléfono de Contacto <span style={{ fontSize: '11px', color: '#64748b' }}>(8 dígitos)</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={8}
                        placeholder="Ej. 74857485"
                        value={formContacto.telefono}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                          setFormContacto({ ...formContacto, telefono: val });
                        }}
                        className="directorio-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="directorio-label">
                      Dirección Completa <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Bo. El Centro, 3ra Calle, Frente a Parque Central"
                      value={formContacto.direccion}
                      onChange={(e) => setFormContacto({ ...formContacto, direccion: e.target.value })}
                      className="directorio-input"
                    />
                  </div>

                  <div>
                    <label className="directorio-label">
                      Días y Horario de Atención
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Lunes a Viernes 8:00 AM - 4:00 PM"
                      value={formContacto.diasAtencion}
                      onChange={(e) => setFormContacto({ ...formContacto, diasAtencion: e.target.value })}
                      className="directorio-input"
                    />
                  </div>
                </div>

                <div className="social-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowModalContacto(false)}
                    className="directorio-btn-secondary"
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="directorio-btn-primary"
                    disabled={guardando}
                  >
                    {guardando ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>{contactoEnEdicion ? 'Actualizar Contacto' : 'Guardar Contacto'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMACIÓN ELIMINAR */}
        {itemAEliminar && (
          <div className="social-modal-overlay">
            <div className="social-modal-card" style={{ maxWidth: '420px', textAlign: 'center', padding: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                ¿Eliminar {itemAEliminar.type === 'contacto' ? 'contacto' : 'especialidad'}?
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
                ¿Está seguro de que desea eliminar <strong>{itemAEliminar.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setItemAEliminar(null)}
                  className="directorio-btn-secondary"
                  disabled={eliminando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarEliminar}
                  className="directorio-btn-danger"
                  disabled={eliminando}
                >
                  {eliminando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <span>Sí, Eliminar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
