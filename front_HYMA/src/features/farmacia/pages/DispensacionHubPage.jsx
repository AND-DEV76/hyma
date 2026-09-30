import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Users,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import '../styles/farmaciaPortal.css';

export default function DispensacionHubPage() {
  const navigate = useNavigate();

  const opciones = [
    {
      id: 'consulta',
      titulo: 'Dispensación De Consulta',
      descripcion: 'Pacientes en espera de entrega de medicamentos recetados en consulta médica.',
      ruta: '/farmacia/dispensacion/consulta',
      icono: <Users size={26} />,
    },
    {
      id: 'venta-externa',
      titulo: 'Venta Externa',
      descripcion: 'Venta directa de medicamentos en mostrador sin consulta médica ni paciente.',
      ruta: '/farmacia/dispensacion/venta-externa',
      icono: <ShoppingBag size={26} />,
    },
  ];

  return (
    <div className="farmacia-portal-page">
      <AdminNavbar />

      <main className="farmacia-portal-container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Farmacia', to: '/farmacia' },
            { label: 'Dispensación' },
          ]}
        />

        {/* Encabezado */}
        <div className="portal-header">
          <span className="portal-eyebrow">MÓDULO DE DISPENSACIÓN</span>
          <h1 className="portal-title">Dispensación y Venta de Medicamentos</h1>
        </div>

        {/* Grilla: Logo a la izquierda + 2 Opciones a la derecha */}
        <div className="portal-grid">
          {/* Tarjeta Izquierda */}
          <div className="portal-logo-card">
            <div className="portal-logo-glow" />
            <div className="portal-hero-icon-wrapper">
              <Pill size={64} strokeWidth={2.2} />
            </div>
            <div className="portal-logo-caption">
              <h3>Obras Sociales San Martín</h3>
              <p>Entrega de Recetas y Venta Directa en Mostrador</p>
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
