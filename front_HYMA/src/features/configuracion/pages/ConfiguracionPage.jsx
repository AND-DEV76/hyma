import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircleDollarSign,
  BookOpen,
  FlaskConical,
  ChevronRight,
  Settings,
  Sliders
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import '../styles/configuracion.css';

export default function ConfiguracionPage() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Usuario',
    nombreRol: 'INVITADO',
  };

  const isAdmin = user.nombreRol === 'ADMIN';
  const isFarmacia = user.nombreRol === 'FARMACIA';
  const isMedico = user.nombreRol === 'MEDICO';

  const opciones = [
    {
      id: 'tarifas',
      titulo: 'Tarifas de Consulta Médica',
      descripcion: 'Configuración de precios y aranceles de consulta médica general.',
      ruta: '/tarifas',
      icono: <CircleDollarSign size={26} />,
      show: isAdmin || isFarmacia,
    },
    {
      id: 'diagnosticos',
      titulo: 'Catálogo de Diagnósticos',
      descripcion: 'Gestión de catálogo de diagnósticos y categorías asociadas.',
      ruta: '/diagnosticos',
      icono: <BookOpen size={26} />,
      show: isAdmin || isMedico || isFarmacia,
    },
    {
      id: 'alergias',
      titulo: 'Alergias',
      descripcion: 'Administración del catálogo de sustancias y tipos de alergias.',
      ruta: '/alergias',
      icono: <FlaskConical size={26} />,
      show: isAdmin || isMedico || isFarmacia,
    },
  ];

  return (
    <div className="config-portal-page">
      <AdminNavbar />

      <main className="config-portal-container">
        {/* Breadcrumbs */}
        <Breadcrumb items={[{ label: 'Configuración' }]} showHome={true} />

        {/* Encabezado */}
        <div className="config-header">
          <span className="config-eyebrow">PORTAL PRINCIPAL</span>
          <h1 className="config-title">Configuración General</h1>
          <p className="config-subtitle">
            Administración de parámetros clínicos, tarifas y catálogos del sistema
          </p>
        </div>

        {/* Grilla: Icono a la izquierda + 3 Opciones a la derecha */}
        <div className="config-grid">
          {/* Tarjeta Izquierda con el Icono de Configuración */}
          <div className="config-logo-card">
            <div className="config-logo-glow" />
            <div className="config-hero-icon-wrapper">
              <Settings size={64} />
            </div>
            <div className="config-logo-caption">
              <h3>Obras Sociales San Martín</h3>
              <p>Módulo de Configuración y Parámetros del Sistema</p>
            </div>
          </div>

          {/* Columna Derecha con las Opciones según Rol */}
          <div className="config-options-list">
            {opciones
              .filter((opcion) => opcion.show)
              .map((opcion) => (
              <div
                key={opcion.id}
                className="config-option-card"
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
                <div className="config-circle-icon">
                  {opcion.icono}
                </div>

                {/* Textos */}
                <div className="config-option-content">
                  <h2 className="config-option-title">{opcion.titulo}</h2>
                  <p className="config-option-desc">{opcion.descripcion}</p>
                </div>

                {/* Flecha derecha */}
                <div className="config-option-arrow">
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
