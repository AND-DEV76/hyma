import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  HeartPulse,
  Stethoscope,
  BookOpen,
  Pill,
  Package,
  Users,
  Shield,
  FlaskConical,
  FileSpreadsheet,
  CircleDollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import saludLogo from '../../assets/images/log1.png';
import './AdminNavbar.css';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Usuario',
    nombreRol: 'INVITADO',
  };

  const isAdmin = user.nombreRol === 'ADMIN';
  const isEnfermera = user.nombreRol === 'ENFERMERA';
  const isFarmacia = user.nombreRol === 'FARMACIA';
  const isMedico = user.nombreRol === 'MEDICO';

  // Sincronizar CSS variable en :root y body class
  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', isCollapsed);
    document.documentElement.style.setProperty(
      '--admin-sidebar-width',
      isCollapsed ? '78px' : '260px'
    );
    document.body.classList.add('has-admin-sidebar');

    return () => {
      document.body.classList.remove('has-admin-sidebar');
      document.documentElement.style.removeProperty('--admin-sidebar-width');
    };
  }, [isCollapsed]);

  // Cerrar drawer en móvil cuando cambie la ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname.startsWith('/dashboard');
    if (path === '/farmacia') {
      return (
        location.pathname.startsWith('/farmacia') ||
        location.pathname.startsWith('/reportes')
      );
    }
    if (path === '/preconsulta') return location.pathname.startsWith('/preconsulta');
    if (path === '/clinica') return location.pathname.startsWith('/clinica');
    if (path === '/configuracion') {
      return (
        location.pathname.startsWith('/configuracion') ||
        location.pathname.startsWith('/tarifas') ||
        location.pathname.startsWith('/diagnosticos') ||
        location.pathname.startsWith('/alergias')
      );
    }
    if (path === '/usuarios') {
      return (
        location.pathname.startsWith('/usuarios') ||
        location.pathname.startsWith('/medicos')
      );
    }
    return location.pathname === path;
  };

  // Grupos de navegación
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      show: isAdmin || isFarmacia,
    },
    {
      label: 'Recepción',
      path: '/recepcion',
      icon: UserCheck,
      show: isAdmin || isEnfermera,
    },
    {
      label: 'Preconsulta',
      path: '/preconsulta',
      icon: HeartPulse,
      show: isAdmin || isEnfermera,
    },
    {
      label: 'Clínica',
      path: '/clinica',
      icon: Stethoscope,
      show: isAdmin || isMedico,
    },
    {
      label: 'Farmacia',
      path: '/farmacia',
      icon: Pill,
      show: isAdmin || isFarmacia,
    },
    {
      label: 'Configuración',
      path: '/configuracion',
      icon: Settings,
      show: isAdmin || isMedico || isFarmacia,
    },
    {
      label: 'Usuarios',
      path: '/usuarios',
      icon: Shield,
      show: isAdmin,
    },
  ];

  const userInitial = (user.username || 'U').charAt(0).toUpperCase();

  return (
    <>
      {/* Botón flotante para abrir menú en móviles */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Abrir menú"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop para oscurecer en móvil */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Cabecera / Marca */}
        <div className="sidebar-header">
          <button
            className="sidebar-brand"
            onClick={() => navigate(isEnfermera ? '/recepcion' : (isMedico ? '/clinica' : '/dashboard'))}
            title="Programa de Salud - Obras Sociales San Martín"
          >
            <div className="brand-logo-wrapper">
              <img
                src={saludLogo}
                alt="Programa de Salud"
                className="sidebar-brand-img"
              />
            </div>
            {!isCollapsed && (
              <div className="brand-info">
                <span className="brand-title">Programa de Salud</span>
                <span className="brand-subtitle">San Martín</span>
              </div>
            )}
          </button>

          {/* Botón colapsar / expandir (desktop) */}
          <button
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          >
            {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>

        {/* Navegación principal */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            {!isCollapsed ? 'MENÚ PRINCIPAL' : '•••'}
          </div>

          <ul className="sidebar-menu">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <button
                      className={`sidebar-nav-item ${active ? 'active' : ''}`}
                      onClick={() => navigate(item.path)}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="nav-icon-box">
                        <Icon size={19} className="nav-icon" />
                      </div>
                      {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Pie / Perfil de usuario y Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card" title={isCollapsed ? `${user.username} (${user.nombreRol})` : undefined}>
            <div className="user-avatar">{userInitial}</div>
            {!isCollapsed && (
              <div className="user-details">
                <span className="user-name-text">{user.username}</span>
                <span className="user-role-tag">{user.nombreRol}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title="Cerrar sesión"
          >
            <LogOut size={18} className="logout-icon" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
