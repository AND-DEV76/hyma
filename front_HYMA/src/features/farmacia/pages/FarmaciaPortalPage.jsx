import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  FileSpreadsheet,
  Package,
  ChevronRight,
  Pill,
  Sparkles
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import farmaciaLogo from '../../../assets/images/farmacia.png';
import '../styles/farmaciaPortal.css';

export default function FarmaciaPortalPage() {
  const navigate = useNavigate();

  const opciones = [
    {
      id: 'dispersion',
      titulo: 'Dispersión',
      descripcion: 'Dispensación y entrega de recetas médicas a pacientes en espera.',
      ruta: '/farmacia/dispensacion',
      icono: <Pill size={26} />,
    },
    {
      id: 'informes',
      titulo: 'Informes',
      descripcion: 'Estadísticas mensuales, matriz de diagnóstico y reporte de recaudación.',
      ruta: '/reportes',
      icono: <FileSpreadsheet size={26} />,
    },
    {
      id: 'medicamentos',
      titulo: 'Medicamentos',
      descripcion: 'Inventario de farmacia, control de stock, lotes activos y catálogos.',
      ruta: '/farmacia/inventario',
      icono: <Package size={26} />,
    },
  ];

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="farmacia-portal-container">
        {/* Breadcrumbs */}
        <Breadcrumb items={[{ label: 'Farmacia' }]} showHome={true} />

        {/* Encabezado */}
        <div className="portal-header">
          <span className="portal-eyebrow">PORTAL PRINCIPAL</span>
          <h1 className="portal-title">Farmacia y Enfermería</h1>
          <p className="portal-subtitle">
            Seleccione el módulo o servicio al que desea ingresar
          </p>
        </div>

        {/* Grilla: Logo a la izquierda + 3 Opciones a la derecha */}
        <div className="portal-grid">
          {/* Tarjeta Izquierda con el Logo de Farmacia */}
          <div className="portal-logo-card">
            <div className="portal-logo-glow" />
            <img
              src={farmaciaLogo}
              alt="Logo Farmacia"
              className="portal-logo-img"
            />
            <div className="portal-logo-caption">
              <h3>Obras Sociales San Martín</h3>
              <p>Módulo Integrado de Salud y Medicamentos</p>
            </div>
          </div>

          {/* Columna Derecha con las 3 Opciones del Wireframe */}
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
