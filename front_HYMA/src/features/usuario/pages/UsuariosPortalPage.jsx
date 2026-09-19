import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import '../styles/usuariosPortal.css';

export default function UsuariosPortalPage() {
  const navigate = useNavigate();

  const opciones = [
    {
      id: 'usuarios-sistema',
      titulo: 'Usuarios del Sistema',
      descripcion: 'Administración de cuentas de usuario, roles, contraseñas y permisos del sistema.',
      ruta: '/usuarios/lista',
      icono: <Users size={28} />,
    },
    {
      id: 'medicos',
      titulo: 'Médicos',
      descripcion: 'Registro del cuerpo médico, especialidades y vinculación de cuentas de usuario.',
      ruta: '/medicos',
      icono: <Stethoscope size={28} />,
    },
  ];

  return (
    <div className="usuarios-portal-page">
      <AdminNavbar />

      <main className="usuarios-portal-container">
        {/* Breadcrumbs */}
        <Breadcrumb items={[{ label: 'Usuarios y Personal' }]} showHome={true} />

        {/* Encabezado */}
        <div className="usuarios-portal-header">
          <span className="usuarios-portal-eyebrow">PORTAL PRINCIPAL</span>
          <h1 className="usuarios-portal-title">Gestión de Usuarios y Personal</h1>
          <p className="usuarios-portal-subtitle">
            Administración de cuentas de acceso, roles y vinculación del cuerpo médico
          </p>
        </div>

        {/* Grilla: Icono a la izquierda + 2 Opciones a la derecha */}
        <div className="usuarios-portal-grid">
          {/* Tarjeta Izquierda con Icono */}
          <div className="usuarios-portal-logo-card">
            <div className="usuarios-portal-logo-glow" />
            <div className="usuarios-hero-icon-wrapper">
              <ShieldCheck size={68} />
            </div>
            <div className="usuarios-portal-logo-caption">
              <h3>Obras Sociales San Martín</h3>
              <p>Módulo de Usuarios, Seguridad y Profesionales de Salud</p>
            </div>
          </div>

          {/* Columna Derecha con las 2 Opciones */}
          <div className="usuarios-portal-options-list">
            {opciones.map((opcion) => (
              <div
                key={opcion.id}
                className="usuarios-portal-option-card"
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
                <div className="usuarios-circle-icon">
                  {opcion.icono}
                </div>

                {/* Textos */}
                <div className="usuarios-portal-option-content">
                  <h2 className="usuarios-portal-option-title">{opcion.titulo}</h2>
                  <p className="usuarios-portal-option-desc">{opcion.descripcion}</p>
                </div>

                {/* Flecha derecha */}
                <div className="usuarios-portal-option-arrow">
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
