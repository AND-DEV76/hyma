import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FolderArchive,
  ChevronRight,
  Users,
  HeartHandshake,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import '../../farmacia/styles/farmaciaPortal.css';
import '../styles/social.css';

export default function SocialPortalPage() {
  const navigate = useNavigate();

  const opciones = [
    {
      id: 'dashboard',
      titulo: 'Dashboard Referencias Médicas',
      descripcion: 'Estadísticas mensuales, concentrado por especialidad, gráficos de distribución y exportación a Excel.',
      ruta: '/social/dashboard-referencias',
      icono: <BarChart3 size={28} color="#0284c7" />,
      badge: 'Estadísticas'
    },
    {
      id: 'expedientes',
      titulo: 'Expedientes Médicos',
      descripcion: 'Búsqueda de pacientes, consultas médicas y archivo histórico de referencias especializadas.',
      ruta: '/social/expedientes',
      icono: <FolderArchive size={28} color="#0284c7" />,
      badge: 'Historial'
    },
  ];

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="farmacia-portal-container">
        {/* Breadcrumbs */}
        <Breadcrumb items={[{ label: 'Trabajo Social' }]} showHome={true} />

        {/* Encabezado */}
        <div className="portal-header">
          <span className="portal-eyebrow" style={{ color: '#0284c7' }}>DEPARTAMENTO DE TRABAJO SOCIAL</span>
          <h1 className="portal-title">Gestión y Referencias Sociales</h1>
          <p className="portal-subtitle">
            Seleccione el módulo o servicio al que desea ingresar
          </p>
        </div>

        {/* Grilla: Logo / Emblema a la izquierda + Opciones a la derecha */}
        <div className="portal-grid">
          {/* Tarjeta Izquierda con el Emblema Vectorial de Trabajo Social (Sin imágenes PNG) */}
          <div className="portal-logo-card social-emblem-card">
            <div className="portal-logo-glow" />
            
            {/* Emblema Vectorial Exclusivo de Trabajo Social */}
            <div className="social-emblem-container">
              <div className="social-emblem-outer-ring">
                <div className="social-emblem-inner-ring">
                  <HeartHandshake size={68} className="social-emblem-icon" />
                </div>
              </div>
              <div className="social-emblem-mini-badge">
                <Users size={16} />
              </div>
            </div>

            <div className="portal-logo-caption">
              <span className="social-badge-tag">Atención Integral</span>
              <h3>Obras Sociales San Martín</h3>
              <p>Módulo de Trabajo Social, Canalización de Pacientes y Referencias Especializadas</p>
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
                    navigate(opcion.ruta);
                  }
                }}
              >
                {/* Círculo con el icono */}
                <div className="portal-circle-icon" style={{ backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }}>
                  {opcion.icono}
                </div>

                {/* Textos */}
                <div className="portal-option-content">
                  <div className="flex items-center gap-2">
                    <h2 className="portal-option-title">{opcion.titulo}</h2>
                    <span className="social-chip-badge">{opcion.badge}</span>
                  </div>
                  <p className="portal-option-desc">{opcion.descripcion}</p>
                </div>

                {/* Flecha derecha */}
                <div className="portal-option-arrow">
                  <ChevronRight size={26} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
