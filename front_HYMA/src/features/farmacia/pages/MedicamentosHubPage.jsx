import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowDownToLine,
  Layers,
  ChevronRight,
  Pill,
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import '../styles/farmaciaPortal.css';

export default function MedicamentosHubPage() {
  const navigate = useNavigate();

  const opciones = [
    {
      id: 'inventario',
      titulo: 'Inventario',
      descripcion: 'Stock disponible en existencia y control de salidas de medicamentos.',
      ruta: '/farmacia/medicamentos/inventario',
      icono: <Package size={26} />,
    },
    {
      id: 'movimientos',
      titulo: 'Movimientos',
      descripcion: 'Registro de entradas de inventario y detalle histórico de ingresos.',
      ruta: '/farmacia/medicamentos/movimientos',
      icono: <ArrowDownToLine size={26} />,
    },
    {
      id: 'catalogo',
      titulo: 'Catálogo',
      descripcion: 'Catálogo completo de medicamentos, categorías y casas farmacéuticas.',
      ruta: '/farmacia/medicamentos/catalogo',
      icono: <Layers size={26} />,
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
            { label: 'Medicamentos' },
          ]}
        />

        {/* Encabezado */}
        <div className="portal-header">
          <span className="portal-eyebrow">MÓDULO DE MEDICAMENTOS</span>
          <h1 className="portal-title">Inventario y Catálogo</h1>
          <p className="portal-subtitle">
            Seleccione el área o servicio al que desea ingresar
          </p>
        </div>

        {/* Grilla: Logo a la izquierda + 3 Opciones a la derecha */}
        <div className="portal-grid">
          {/* Tarjeta Izquierda */}
          <div className="portal-logo-card">
            <div className="portal-logo-glow" />
            <div className="portal-hero-icon-wrapper">
              <Pill size={64} strokeWidth={2.2} />
            </div>
            <div className="portal-logo-caption">
              <h3>Obras Sociales San Martín</h3>
              <p>Gestión Integral de Medicamentos e Insumos</p>
            </div>
          </div>

          {/* Columna Derecha con las 3 Opciones */}
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