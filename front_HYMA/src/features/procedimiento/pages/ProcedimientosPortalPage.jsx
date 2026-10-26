import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Settings,
  ChevronRight,
  Syringe,
  ClipboardList
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import '../../farmacia/styles/farmaciaPortal.css';

export default function ProcedimientosPortalPage() {
  const navigate = useNavigate();

  const opciones = [
    {
      id: 'pacientes-aplicar',
      titulo: 'Pacientes por Aplicar',
      descripcion: 'Cola de pacientes en espera para aplicación de medicamentos inyectables o procedimientos clínicos.',
      ruta: '/procedimientos/pacientes',
      icono: <Activity size={26} color="#0284c7" />,
    },
    {
      id: 'historial-procedimientos',
      titulo: 'Historial de Procedimientos',
      descripcion: 'Consulta de atenciones realizadas, registro de procedimientos clínicos completados y cancelados.',
      ruta: '/procedimientos/historial',
      icono: <CheckCircle2 size={26} color="#059669" />,
    },
    {
      id: 'configuracion-procedimientos',
      titulo: 'Configuración y Aranceles',
      descripcion: 'Catálogo de procedimientos clínicos, administración de nombres y configuración de tarifas.',
      ruta: '/procedimientos/configuracion',
      icono: <Settings size={26} color="#6366f1" />,
    },
  ];

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="farmacia-portal-container">
        {/* Breadcrumbs */}
        <Breadcrumb items={[{ label: 'Procedimientos' }]} showHome={true} />

        {/* Encabezado */}
        <div className="portal-header">
          <span className="portal-eyebrow" style={{ color: '#0284c7' }}>ÁREA CLÍNICA Y QUIRÚRGICA</span>
          <h1 className="portal-title">Procedimientos Clínicos</h1>
          <p className="portal-subtitle">
            Seleccione el módulo o servicio al que desea ingresar
          </p>
        </div>

        {/* Grilla: Logo / Emblema a la izquierda + Opciones a la derecha */}
        <div className="portal-grid">
          {/* Tarjeta Izquierda con Emblema */}
          <div className="portal-logo-card" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '36px 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
            border: '1px solid #ccfbf1',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              border: '2px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.15)'
            }}>
              <Activity size={48} color="#0284c7" />
            </div>

            <div className="portal-logo-caption">
              <span style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: '700',
                color: '#0d9488',
                backgroundColor: '#ccfbf1',
                padding: '3px 10px',
                borderRadius: '12px',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                Atención Médica Menor
              </span>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Obras Sociales San Martín
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                Módulo Integrado de Procedimientos, Aplicación de Medicamentos y Curaciones
              </p>
            </div>
          </div>

          {/* Columna Derecha con las Opciones */}
          <div className="portal-options-list">
            {opciones.map((opcion) => (
              <div
                key={opcion.id}
                className="portal-option-card"
                onClick={() => navigate(opcion.ruta)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(opcion.ruta);
                  }
                }}
              >
                <div className="portal-option-icon-wrapper">
                  {opcion.icono}
                </div>
                <div className="portal-option-info">
                  <h3 className="portal-option-title">{opcion.titulo}</h3>
                  <p className="portal-option-description">{opcion.descripcion}</p>
                </div>
                <ChevronRight className="portal-option-chevron" size={20} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
