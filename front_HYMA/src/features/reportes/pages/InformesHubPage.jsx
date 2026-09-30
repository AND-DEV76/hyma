import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  HeartHandshake,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import '../../farmacia/styles/farmaciaPortal.css';

export default function InformesHubPage() {
  const navigate = useNavigate();

  const opciones = [
    {
      id: 'estadistica',
      titulo: 'Estadística Mensual',
      descripcion: 'Matriz mensual de morbilidad, grupos de edades, diagnósticos y recaudación médica.',
      ruta: '/reportes/estadistica',
      icono: <FileSpreadsheet size={26} />,
    },
    {
      id: 'casos-especiales',
      titulo: 'Casos Especiales',
      descripcion: 'Registro y control de atenciones y medicamentos 100% donados / exonerados.',
      ruta: '/reportes/casos-especiales',
      icono: <HeartHandshake size={26} />,
    },
  ];

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="farmacia-portal-container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Reportes' },
          ]}
        />

        {/* Encabezado */}
        <div className="portal-header">
          <span className="portal-eyebrow">MÓDULO DE REPORTES E INFORMES</span>
          <h1 className="portal-title">Informes y Estadísticas</h1>
          <p className="portal-subtitle">
            Seleccione el área o reporte al que desea ingresar
          </p>
        </div>

        {/* Grilla: Logo a la izquierda + Opciones a la derecha */}
        <div className="portal-grid">
          {/* Tarjeta Izquierda */}
          <div className="portal-logo-card">
            <div className="portal-logo-glow" />
            <div className="portal-hero-icon-wrapper">
              <FileSpreadsheet size={64} strokeWidth={2.2} />
            </div>
            <div className="portal-logo-caption">
              <h3>Obras Sociales San Martín</h3>
              <p>Informes Estadísticos y Control de Exoneraciones</p>
            </div>
          </div>

          {/* Columna Derecha con las 2 Opciones */}
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
                <div className="portal-circle-icon">
                  {opcion.icono}
                </div>

                {/* Textos */}
                <div className="portal-option-content">
                  <h2 className="portal-option-title">{opcion.titulo}</h2>
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
