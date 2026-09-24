import React from 'react';
import saludLogo from '../../../assets/images/log1.png';

export const getDosisTexto = (m) => {
  if (m.dosis && m.dosis.trim()) {
    return m.dosis;
  }
  const pres = (m.presentacion || '').toLowerCase();
  if (pres.includes('jarabe') || pres.includes('suspensi') || pres.includes('soluci')) {
    return '1 cucharadita (5 ml)';
  }
  if (pres.includes('crema') || pres.includes('ung') || pres.includes('pomada') || pres.includes('gel') || pres.includes('vaginal')) {
    return '1 aplicación tópica';
  }
  if (pres.includes('inhalad') || pres.includes('spray') || pres.includes('aerosol')) {
    return '1-2 disparos';
  }
  return '1 unidad por toma';
};

export const getUnidadTexto = (m) => {
  const pres = (m.presentacion || '').toLowerCase();
  if (pres.includes('jarabe') || pres.includes('suspensi') || pres.includes('soluci')) {
    return Number(m.cantidad) === 1 ? 'frasco' : 'frascos';
  }
  if (pres.includes('crema') || pres.includes('ung') || pres.includes('pomada') || pres.includes('gel') || pres.includes('vaginal')) {
    return Number(m.cantidad) === 1 ? 'tubo' : 'tubos';
  }
  if (pres.includes('inhalad') || pres.includes('spray') || pres.includes('aerosol')) {
    return Number(m.cantidad) === 1 ? 'inhalador' : 'inhaladores';
  }
  return Number(m.cantidad) === 1 ? 'unidad' : 'unidades';
};

export const formatFechaReceta = (f) => {
  if (!f) {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')} / ${String(now.getMonth() + 1).padStart(2, '0')} / ${now.getFullYear()}`;
  }
  try {
    if (typeof f === 'string' && f.includes('T')) {
      const d = new Date(f);
      return `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}`;
    }
    if (typeof f === 'string' && f.includes('-')) {
      const [y, m, d] = f.split('T')[0].split('-').map(Number);
      return `${String(d).padStart(2, '0')} / ${String(m).padStart(2, '0')} / ${y}`;
    }
    const dt = new Date(f);
    return `${String(dt.getDate()).padStart(2, '0')} / ${String(dt.getMonth() + 1).padStart(2, '0')} / ${dt.getFullYear()}`;
  } catch {
    return String(f);
  }
};

export const formatUsoTexto = (m) => {
  const dosis = getDosisTexto(m);
  let freq = (m.frecuencia || '').trim();
  let dur = (m.duracion || '').trim();

  const parts = [];
  if (dosis) parts.push(dosis);

  if (freq) {
    if (/^cada\s+/i.test(freq)) {
      parts.push(freq);
    } else if (/^\d+$/.test(freq)) {
      parts.push(`cada ${freq} horas`);
    } else {
      parts.push(`cada ${freq}`);
    }
  }

  if (dur) {
    if (/^por\s+/i.test(dur)) {
      parts.push(dur);
    } else if (/^\d+$/.test(dur)) {
      parts.push(`por ${dur} días`);
    } else {
      parts.push(`por ${dur}`);
    }
  }

  return parts.length > 0 ? parts.join(' ') : 'Según indicaciones del médico';
};

/**
 * Renderiza el contenido de una boleta de receta médica individual (Media Carta vertical: 5.5in x 8.5in)
 */
function BoletaReceta({ receta, medicamentos }) {
  return (
    <div className="receta-half-sheet">
      {/* 1. Encabezado Institucional: Logo Izquierda + Clínicas Médicas Derecha */}
      <div className="receta-header">
        <div className="receta-logo-col">
          <img src={saludLogo} alt="Logo San Martín" className="receta-logo-img" />
        </div>
        <div className="receta-info-col">
          <h2 className="receta-clinica-title">Clínicas Médicas</h2>
          <p className="receta-clinica-sub bold">Medicina General</p>
          <p className="receta-clinica-sub">Clínica Dental y Psicológica</p>
          <p className="receta-clinica-sub italic">Atención para hombres, mujeres y niños</p>
        </div>
      </div>

      {/* 2. Datos Paciente y Fecha con líneas continuas */}
      <div className="receta-patient-section">
        <div className="receta-data-row">
          <span className="receta-data-label">Fecha:</span>
          <span className="receta-data-underline">{formatFechaReceta(receta?.fechaConsulta)}</span>
        </div>
        <div className="receta-data-row">
          <span className="receta-data-label">Nombre:</span>
          <span className="receta-data-underline bold">{receta?.nombreCompletoPaciente || '—'}</span>
        </div>
      </div>

      {/* 3. Indicaciones Generales del Médico (justo abajo de Nombre) */}
      {receta?.observacionesTratamiento && (
        <div className="receta-observaciones">
          <span className="receta-obs-prefix">* Indicaciones del Médico:</span>
          <span className="receta-obs-text">{receta.observacionesTratamiento}</span>
        </div>
      )}

      {/* 4. Lista de Medicamentos Prescritos */}
      <div className="receta-body-section">
        {medicamentos && medicamentos.length > 0 ? (
          <div className="receta-meds-list">
            {medicamentos.map((m, idx) => (
              <div key={m.idMedicamento || idx} className="receta-med-item">
                <div className="receta-med-line1">
                  <span className="receta-med-index">{idx + 1}.</span>
                  <span className="receta-med-name">
                    {m.nombre} {m.presentacion ? m.presentacion : ''} {m.concentracion ? m.concentracion : ''}
                  </span>
                  {m.cantidad && (
                    <span className="receta-med-qty">
                      #{m.cantidad} {getUnidadTexto(m)}
                    </span>
                  )}
                </div>
                <div className="receta-med-uso">
                  <span className="receta-uso-label">Uso: </span>
                  <span className="receta-uso-val">{formatUsoTexto(m)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="receta-empty-meds">Sin medicamentos prescritos.</p>
        )}
      </div>

      {/* 5. Pie: Firma de Médico + Datos de Contacto */}
      <div className="receta-footer-section">
        <div className="receta-signature-block">
          <div className="receta-signature-line"></div>
          <span className="receta-signature-role">Médico</span>
          <span className="receta-signature-doctor">
            {receta?.nombreMedico ? `Dr(a). ${receta.nombreMedico}` : 'Firma y Sello'}
          </span>
        </div>

        <div className="receta-contact-note">
          <p>En caso de complicaciones o dudas, comunicarse</p>
          <p>al tel. <strong>58960863</strong> de lunes a viernes</p>
          <p>de 8:00 a.m. a 4:00 p.m. o presentarse a esta clínica</p>
        </div>
      </div>
    </div>
  );
}

export default function RecetaMedicaPrint({ receta, duplicar = false }) {
  // Lista de medicamentos compatibles con DTO del backend (medicamentos o medicamentosRecetados)
  const medicamentos = receta?.medicamentos || receta?.medicamentosRecetados || [];

  return (
    <>
      {/* Estilos Exclusivos para Impresión en Hoja Carta Horizontal dividida en Media Carta (11in x 8.5in) */}
      <style>{`
        @media print {
          @page {
            size: 11in 8.5in landscape; /* Hoja Carta completa horizontal */
            margin: 0 !important;
          }
          html, body {
            width: 11in !important;
            height: 8.5in !important;
            max-height: 8.5in !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: #000000 !important;
            overflow: hidden !important;
          }
          .no-print-area {
            display: none !important;
          }
          body * {
            visibility: hidden !important;
          }
          #receta-medica-print, #receta-medica-print * {
            visibility: visible !important;
          }
          #receta-medica-print {
            display: flex !important;
            flex-direction: row !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 11in !important;
            height: 8.45in !important;
            max-height: 8.45in !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Media Carta Individual (5.5in de ancho x 8.45in de alto) */
          .receta-half-sheet {
            width: 5.5in !important;
            max-width: 5.5in !important;
            height: 8.45in !important;
            max-height: 8.45in !important;
            box-sizing: border-box !important;
            padding: 8mm 12mm 8mm 12mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }

          .receta-half-sheet-empty {
            width: 5.5in !important;
            max-width: 5.5in !important;
            height: 8.45in !important;
            max-height: 8.45in !important;
            box-sizing: border-box !important;
            background: transparent !important;
            overflow: hidden !important;
          }

          /* Encabezado */
          .receta-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding-bottom: 6px !important;
            border-bottom: 1.5px solid #000000 !important;
            margin-bottom: 12px !important;
          }
          .receta-logo-col {
            width: 70px !important;
            height: 70px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .receta-logo-img {
            width: 65px !important;
            height: 65px !important;
            object-fit: contain !important;
          }
          .receta-info-col {
            text-align: right !important;
            flex: 1 !important;
            padding-left: 10px !important;
          }
          .receta-clinica-title {
            margin: 0 0 2px !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            color: #000000 !important;
            letter-spacing: -0.01em !important;
          }
          .receta-clinica-sub {
            margin: 0 !important;
            font-size: 11px !important;
            color: #111111 !important;
            line-height: 1.3 !important;
          }
          .receta-clinica-sub.bold {
            font-weight: 700 !important;
          }
          .receta-clinica-sub.italic {
            font-style: italic !important;
            font-size: 9.5px !important;
            color: #333333 !important;
          }

          /* Datos Paciente y Fecha con línea continua */
          .receta-patient-section {
            margin-bottom: 12px !important;
            padding-bottom: 4px !important;
            border-bottom: 1px solid #000000 !important;
          }
          .receta-data-row {
            display: flex !important;
            align-items: flex-end !important;
            margin-bottom: 8px !important;
            font-size: 13.5px !important;
          }
          .receta-data-label {
            font-weight: 700 !important;
            width: 65px !important;
            color: #000000 !important;
            flex-shrink: 0 !important;
          }
          .receta-data-underline {
            flex: 1 !important;
            border-bottom: 1px solid #000000 !important;
            padding: 0 6px 1px !important;
            color: #000000 !important;
            min-height: 18px !important;
          }
          .receta-data-underline.bold {
            font-weight: 700 !important;
            text-transform: capitalize !important;
          }

          /* Indicaciones Generales del Médico (justo abajo de Nombre) */
          .receta-observaciones {
            margin-bottom: 12px !important;
            padding: 6px 10px !important;
            background: #fafafa !important;
            border: 1px dashed #64748b !important;
            border-radius: 4px !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
          }
          .receta-obs-prefix {
            font-weight: 800 !important;
            color: #000000 !important;
            display: block !important;
            margin-bottom: 2px !important;
          }
          .receta-obs-text {
            color: #111111 !important;
            white-space: pre-wrap !important;
          }

          /* Lista de Medicamentos Prescritos */
          .receta-body-section {
            flex: 1 !important;
            margin-bottom: 12px !important;
          }
          .receta-meds-list {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .receta-med-item {
            padding-bottom: 4px !important;
          }
          .receta-med-line1 {
            display: flex !important;
            align-items: baseline !important;
            gap: 6px !important;
            font-size: 13.5px !important;
          }
          .receta-med-index {
            font-weight: 800 !important;
            color: #000000 !important;
          }
          .receta-med-name {
            font-weight: 700 !important;
            color: #000000 !important;
            text-decoration: underline !important;
            flex: 1 !important;
          }
          .receta-med-qty {
            font-size: 12px !important;
            font-weight: 700 !important;
            color: #222222 !important;
            margin-left: 8px !important;
          }
          .receta-med-uso {
            font-size: 12px !important;
            margin-top: 3px !important;
            padding-left: 14px !important;
            line-height: 1.4 !important;
          }
          .receta-uso-label {
            font-weight: 700 !important;
            color: #111111 !important;
          }
          .receta-uso-val {
            color: #000000 !important;
          }
          .receta-empty-meds {
            font-style: italic !important;
            color: #666666 !important;
            font-size: 12.5px !important;
            margin: 6px 0 !important;
          }

          /* Pie de Receta: Firma Médico + Datos de Contacto */
          .receta-footer-section {
            margin-top: auto !important;
            padding-top: 10px !important;
          }
          .receta-signature-block {
            width: 220px !important;
            margin: 0 auto 12px !important;
            text-align: center !important;
          }
          .receta-signature-line {
            border-bottom: 1px solid #000000 !important;
            margin-bottom: 4px !important;
          }
          .receta-signature-role {
            display: block !important;
            font-size: 13px !important;
            font-weight: 800 !important;
            color: #000000 !important;
          }
          .receta-signature-doctor {
            display: block !important;
            font-size: 11px !important;
            color: #222222 !important;
            margin-top: 2px !important;
          }
          .receta-contact-note {
            text-align: center !important;
            font-size: 9.5px !important;
            color: #333333 !important;
            line-height: 1.35 !important;
            border-top: 1px solid #cccccc !important;
            padding-top: 6px !important;
          }
          .receta-contact-note p {
            margin: 0 !important;
          }
        }

        @media screen {
          #receta-medica-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Contenedor Imprimible: Hoja Carta Horizontal (11in x 8.5in) */}
      <div id="receta-medica-print">
        {/* Mitad Izquierda (Media Carta 5.5in x 8.5in) */}
        <BoletaReceta receta={receta} medicamentos={medicamentos} />

        {/* Mitad Derecha: Si duplicar = true, imprime 2da boleta; sino queda vacía para usar la mitad restante */}
        {duplicar ? (
          <BoletaReceta receta={receta} medicamentos={medicamentos} />
        ) : (
          <div className="receta-half-sheet-empty" />
        )}
      </div>
    </>
  );
}
