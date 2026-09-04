import React, { useEffect } from 'react';
import { Search, X, Plus, Phone, MapPin, UserCheck, Loader2 } from 'lucide-react';

function BuscadorPaciente({
  busqueda,
  setBusqueda,
  pacientes,
  buscar,
  agregarPaciente,
  cargando,
  guardando,
}) {
  useEffect(() => {
    const timer = setTimeout(() => buscar(busqueda), 350);
    return () => clearTimeout(timer);
  }, [busqueda, buscar]);

  return (
    <section className="recepcion-box">
      <div className="recepcion-box-header">
        <h2 className="recepcion-box-title">
          <Search size={17} style={{ color: '#0077b6' }} />
          <span>Buscar Paciente</span>
        </h2>
        {pacientes.length > 0 && (
          <span className="recepcion-box-count">{pacientes.length} encontrados</span>
        )}
      </div>

      <div className="recepcion-search-wrapper">
        <Search size={16} className="recepcion-search-icon" />
        <input
          id="patient-search"
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Nombre, apellido o teléfono..."
          className="recepcion-search-input"
          autoComplete="off"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            className="recepcion-search-clear"
            title="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {cargando && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0077b6', fontSize: '0.82rem', padding: '12px 4px' }}>
          <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Buscando...</span>
        </div>
      )}

      {!cargando && pacientes.length > 0 && (
        <div className="recepcion-results-container">
          {pacientes.map((paciente) => (
            <div key={paciente.idPaciente} className="recepcion-patient-row">
              <div className="recepcion-patient-info">
                <span className="recepcion-patient-name">
                  {paciente.nombres} {paciente.apellidos}
                </span>
                <div className="recepcion-patient-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={11} style={{ color: '#0077b6' }} />
                    {paciente.telefono || 'Sin teléfono'}
                  </span>
                  {paciente.comunidad && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} style={{ color: '#0077b6' }} />
                      {paciente.comunidad}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => agregarPaciente(paciente.idPaciente)}
                disabled={guardando}
                className="recepcion-btn-add"
                title="Poner en cola de espera"
              >
                <Plus size={13} />
                <span>Agregar a cola</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {!cargando && busqueda.trim() && pacientes.length === 0 && (
        <div className="recepcion-empty-box">
          <span>Sin resultados para "<strong>{busqueda}</strong>"</span>
        </div>
      )}

      {!cargando && !busqueda.trim() && (
        <div className="recepcion-empty-box">
          <span>Escribe en el campo de búsqueda para buscar en expedientes</span>
        </div>
      )}
    </section>
  );
}

export default BuscadorPaciente;
