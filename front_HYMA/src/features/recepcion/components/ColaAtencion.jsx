import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, ArrowRight, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { iniciarPreconsulta } from '../../preconsulta/services/preconsultaService';

function ColaAtencion({ cola, quitarDeCola, cargando, guardando }) {
  const navigate = useNavigate();
  const [atendiendoId, setAtendiendoId] = useState(null);
  const [errorPreconsulta, setErrorPreconsulta] = useState('');

  const handleAtenderPreconsulta = async (item) => {
    setErrorPreconsulta('');
    setAtendiendoId(item.idCola);

    try {
      if (item.estado === 'PENDIENTE') {
        await iniciarPreconsulta(item.idCola);
      }
      navigate(`/preconsulta?idCola=${item.idCola}&idPaciente=${item.idPaciente}`);
    } catch (err) {
      setErrorPreconsulta(err.response?.data?.message || 'No se pudo iniciar la preconsulta. Intenta nuevamente.');
    } finally {
      setAtendiendoId(null);
    }
  };

  const formatStatus = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'EN_PRECONSULTA':
        return 'En Preconsulta';
      default:
        return estado;
    }
  };

  return (
    <section className="recepcion-box">
      <div className="recepcion-box-header">
        <h2 className="recepcion-box-title">
          <Users size={17} style={{ color: '#0077b6' }} />
          <span>Cola de Atención</span>
        </h2>
        <span className="recepcion-box-count">{cola.length} en espera</span>
      </div>

      {errorPreconsulta && (
        <div className="recepcion-alert-error" style={{ marginBottom: '12px' }} role="alert">
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorPreconsulta}</span>
        </div>
      )}

      {cargando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '8px', color: '#0077b6', fontSize: '0.85rem' }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Actualizando cola...</span>
        </div>
      ) : cola.length === 0 ? (
        <div className="recepcion-empty-box">
          <Users size={28} color="#94a3b8" />
          <span>No hay pacientes en cola de espera</span>
        </div>
      ) : (
        <div className="recepcion-queue-container">
          {cola.map((item, index) => {
            const isPendiente = item.estado === 'PENDIENTE';
            const isEnPreconsulta = item.estado === 'EN_PRECONSULTA';
            const horaIngreso = item.fechaIngreso
              ? new Date(item.fechaIngreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--';

            return (
              <div key={item.idCola} className="recepcion-queue-item">
                <div className="recepcion-queue-item-left">
                  <div className="recepcion-queue-num">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="recepcion-queue-name">
                      {item.nombresPaciente} {item.apellidosPaciente}
                    </div>
                    <div className="recepcion-queue-time">
                      <Clock size={11} />
                      <span>{horaIngreso}</span>
                    </div>
                  </div>
                </div>

                <div className="recepcion-queue-item-right">
                  <span
                    className={`recepcion-badge-status ${
                      isPendiente ? 'pendiente' : isEnPreconsulta ? 'en_preconsulta' : ''
                    }`}
                  >
                    {formatStatus(item.estado)}
                  </span>

                  {isPendiente && (
                    <button
                      type="button"
                      onClick={() => handleAtenderPreconsulta(item)}
                      className="recepcion-btn-attend"
                      disabled={atendiendoId !== null || guardando}
                      title="Pasar a preconsulta"
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

                  {isEnPreconsulta && (
                    <button
                      type="button"
                      onClick={() => handleAtenderPreconsulta(item)}
                      className="recepcion-btn-attend"
                      style={{ background: '#16a34a' }}
                      disabled={atendiendoId !== null || guardando}
                      title="Continuar preconsulta"
                    >
                      {atendiendoId === item.idCola ? (
                        <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <>
                          <span>Continuar</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => quitarDeCola(item.idCola)}
                    disabled={guardando || item.estado === 'FINALIZADO' || item.estado === 'CANCELADO'}
                    className="recepcion-btn-remove"
                    title="Quitar de cola"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ColaAtencion;
