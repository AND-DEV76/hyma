import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  ChevronDown, 
  HeartPulse, 
  AlertCircle,
  FileText,
  Pill,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function HistorialConsultasAccordion({ consultas = [], ultimaConsulta = null }) {
  // Consolidar lista de consultas
  const consultasHistorial = consultas && consultas.length > 0 
    ? consultas 
    : (ultimaConsulta ? [ultimaConsulta] : []);

  const [consultasExpandidas, setConsultasExpandidas] = useState({});

  const toggleExpandirTodas = () => {
    const allExpanded = consultasHistorial.every((c, idx) => consultasExpandidas[c.idConsulta || `idx-${idx}`]);
    const newState = {};
    consultasHistorial.forEach((c, idx) => {
      newState[c.idConsulta || `idx-${idx}`] = !allExpanded;
    });
    setConsultasExpandidas(newState);
  };

  const toggleConsulta = (key) => {
    setConsultasExpandidas(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Encabezado Principal */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            backgroundColor: '#e0f2fe',
            color: '#0077b6',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <History size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#03045e', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              Historial de Consultas
            </h3>
          </div>
          {consultasHistorial.length > 0 && (
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#0284c7',
              backgroundColor: '#e0f2fe',
              padding: '3px 8px',
              borderRadius: '20px',
              border: '1px solid #bae6fd'
            }}>
              {consultasHistorial.length} {consultasHistorial.length === 1 ? 'consulta' : 'consultas previas'}
            </span>
          )}
        </div>

        {consultasHistorial.length > 1 && (
          <button
            type="button"
            onClick={toggleExpandirTodas}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#0077b6',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '4px 10px',
              transition: 'all 0.15s ease'
            }}
          >
            {consultasHistorial.every((c, idx) => consultasExpandidas[c.idConsulta || `idx-${idx}`]) ? 'Colapsar todas' : 'Expandir todas'}
          </button>
        )}
      </div>

      {/* Lista de Consultas o Estado Vacío */}
      {consultasHistorial.length === 0 ? (
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backgroundColor: '#f8fafc',
        }}>
          <AlertCircle size={26} color="#94a3b8" />
          <div>
            <p style={{ margin: 0, fontWeight: '600', color: '#475569', fontSize: '14px' }}>
              El paciente no cuenta con consultas médicas previas registradas
            </p>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
              No se han registrado atenciones médicas en la clínica para este paciente.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {consultasHistorial.map((consulta, cIdx) => {
            const key = consulta.idConsulta || `idx-${cIdx}`;
            const estaExpandida = Boolean(consultasExpandidas[key]);
            const esUltima = cIdx === 0;

            const fechaFormat = consulta.fechaConsulta 
              ? new Date(consulta.fechaConsulta).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Sin fecha';

            return (
              <div 
                key={key} 
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Botón de acordeón individual */}
                <button
                  type="button"
                  onClick={() => toggleConsulta(key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    border: 'none',
                    backgroundColor: estaExpandida ? '#f0f9ff' : '#ffffff',
                    borderBottom: estaExpandida ? '1px solid #e2e8f0' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: estaExpandida ? '#0077b6' : (esUltima ? '#e0f2fe' : '#f1f5f9'),
                        color: estaExpandida ? '#ffffff' : (esUltima ? '#0077b6' : '#64748b'),
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      <History size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '14.5px',
                          fontWeight: '700',
                          color: esUltima ? '#0077b6' : '#1e293b'
                        }}>
                          {esUltima ? 'Última Consulta' : `Consulta ${fechaFormat}`}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#0284c7',
                          backgroundColor: '#e0f2fe',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          <Calendar size={12} style={{ marginRight: '4px' }} />
                          {fechaFormat}
                        </span>
                        {esUltima && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            color: '#0369a1',
                            backgroundColor: '#e0f2fe',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            Más Reciente
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                        Atendido por: Dr(a). <strong>{consulta.medico || 'Médico tratante'}</strong>
                        {consulta.especialidadMedico ? ` (${consulta.especialidadMedico})` : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#0077b6' }}>
                      {estaExpandida ? 'Ocultar datos' : 'Ver datos'}
                    </span>
                    <div
                      style={{
                        transform: estaExpandida ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <ChevronDown size={18} color="#0077b6" />
                    </div>
                  </div>
                </button>

                {/* Cuerpo Desplegable */}
                {estaExpandida && (
                  <div style={{ padding: '16px 20px', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      
                      {/* Banner Resumen */}
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        padding: '10px 14px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                        flexWrap: 'wrap'
                      }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Fecha y Hora</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                            {consulta.fechaConsulta ? new Date(consulta.fechaConsulta).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Médico Evaluador</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                            Dr(a). {consulta.medico || 'No especificado'}
                          </span>
                        </div>
                        {consulta.especialidadMedico && (
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>Especialidad</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                              {consulta.especialidadMedico}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Signos Vitales de Triaje en esta Consulta */}
                      {consulta.signoVital && (
                        <div style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <HeartPulse size={15} color="#0284c7" />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                              Signos Vitales de Triaje en esta Consulta
                            </span>
                            {consulta.signoVital.fechaRegistro && (
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                ({new Date(consulta.signoVital.fechaRegistro).toLocaleDateString('es-GT')})
                              </span>
                            )}
                          </div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
                            gap: '8px'
                          }}>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Presión Art.</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.presionArterial || '--'}</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Frec. Cardíaca</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.frecuenciaCardiaca ? `${consulta.signoVital.frecuenciaCardiaca} lpm` : '--'}</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Temperatura</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.temperatura ? `${consulta.signoVital.temperatura} °C` : '--'}</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Glucosa</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.glicemia ? `${consulta.signoVital.glicemia} mg/dL` : '--'}</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Frec. Resp.</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.frecuenciaRespiratoria ? `${consulta.signoVital.frecuenciaRespiratoria} rpm` : '--'}</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Sat. SpO2</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.saturacionOxigeno ? `${consulta.signoVital.saturacionOxigeno} %` : '--'}</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Peso</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.peso ? `${consulta.signoVital.peso} kg` : '--'}</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Talla</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.talla ? `${consulta.signoVital.talla} cm` : '--'}</span>
                            </div>
                            <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>IMC</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{consulta.signoVital.imc ? `${consulta.signoVital.imc}` : '--'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Motivo de Consulta e Historia Actual */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                            Motivo de Consulta
                          </span>
                          <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                            {consulta.motivoConsulta || 'Sin motivo registrado'}
                          </p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                            Historia de la Enfermedad Actual
                          </span>
                          <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                            {consulta.historiaEnfermedadActual || 'Sin historia registrada'}
                          </p>
                        </div>
                      </div>

                      {/* Impresión Clínica y Plan Médico */}
                      {(consulta.impresionClinica || consulta.planMedico) && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                          {consulta.impresionClinica && (
                            <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                Impresión Clínica
                              </span>
                              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                                {consulta.impresionClinica}
                              </p>
                            </div>
                          )}
                          {consulta.planMedico && (
                            <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                Plan Médico
                              </span>
                              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                                {consulta.planMedico}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Órdenes de Laboratorio */}
                      {consulta.laboratorio && (
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                            Órdenes de Laboratorio
                          </span>
                          <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                            {consulta.laboratorio}
                          </p>
                        </div>
                      )}

                      {/* Diagnósticos CIE-10 */}
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Diagnósticos Asignados
                        </span>
                        {consulta.diagnosticos?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {consulta.diagnosticos.map((d, dIdx) => (
                              <div key={dIdx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                padding: '6px 10px',
                                borderRadius: '6px'
                              }}>
                                {d.codigoCie10 && (
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    color: '#0369a1',
                                    backgroundColor: '#e0f2fe',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {d.codigoCie10}
                                  </span>
                                )}
                                <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
                                  {d.descripcion || (typeof d === 'string' ? d : '')}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                            No se registraron diagnósticos formales CIE-10.
                          </span>
                        )}
                      </div>

                      {/* Tratamiento y Receta */}
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Tratamiento y Receta Médica
                        </span>
                        {consulta.medicamentos?.length > 0 ? (
                          <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#475569', fontWeight: '700' }}>Medicamento</th>
                                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#475569', fontWeight: '700' }}>Dosis & Indicaciones</th>
                                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#475569', fontWeight: '700', width: '70px' }}>Cant.</th>
                                </tr>
                              </thead>
                              <tbody>
                                {consulta.medicamentos.map((m, mIdx) => (
                                  <tr key={mIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '8px 12px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: '600', color: '#03045e' }}>{m.medicamento}</span>
                                        {m.esUsoClinica && (
                                          <span style={{
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            backgroundColor: '#fef3c7',
                                            color: '#b45309',
                                            border: '1px solid #fde68a',
                                            padding: '1px 5px',
                                            borderRadius: '4px'
                                          }}>
                                            Uso en Clínica
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                                        {[m.presentacion, m.concentracion].filter(Boolean).join(' • ')}
                                      </div>
                                    </td>
                                    <td style={{ padding: '8px 12px', color: '#334155' }}>
                                      <span>{m.dosis || '--'}</span>
                                      {m.frecuencia && <span style={{ color: '#0077b6', marginLeft: '6px' }}>• {m.frecuencia}</span>}
                                      {m.duracion && <span style={{ color: '#64748b', marginLeft: '6px' }}>• por {m.duracion}</span>}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>
                                      {m.cantidad || '--'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', display: 'block', marginBottom: '8px' }}>
                            No se recetaron medicamentos en esta consulta.
                          </span>
                        )}

                        {consulta.indicacionesTratamiento && (
                          <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '2px' }}>
                              Indicaciones Generales / Observaciones:
                            </span>
                            <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: '1.4' }}>
                              {consulta.indicacionesTratamiento}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Examen Físico si existe */}
                      {consulta.examenFisico && Object.values(consulta.examenFisico).some(v => Boolean(v && String(v).trim())) && (
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Examen Físico Registrado
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                            {consulta.examenFisico.piel && (
                              <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Piel: </span>
                                <span style={{ fontSize: '12.5px', color: '#1e293b' }}>{consulta.examenFisico.piel}</span>
                              </div>
                            )}
                            {consulta.examenFisico.conciencia && (
                              <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Conciencia: </span>
                                <span style={{ fontSize: '12.5px', color: '#1e293b' }}>{consulta.examenFisico.conciencia}</span>
                              </div>
                            )}
                            {consulta.examenFisico.cardiopulmonar && (
                              <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Cardiopulmonar: </span>
                                <span style={{ fontSize: '12.5px', color: '#1e293b' }}>{consulta.examenFisico.cardiopulmonar}</span>
                              </div>
                            )}
                            {consulta.examenFisico.abdomen && (
                              <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Abdomen: </span>
                                <span style={{ fontSize: '12.5px', color: '#1e293b' }}>{consulta.examenFisico.abdomen}</span>
                              </div>
                            )}
                            {consulta.examenFisico.soma && (
                              <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>SOMA: </span>
                                <span style={{ fontSize: '12.5px', color: '#1e293b' }}>{consulta.examenFisico.soma}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
