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
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LayoutDashboard,
  Activity
} from 'lucide-react';
import saludLogo from '../../assets/images/log1.png';
import * as procedimientoService from '../../features/procedimiento/services/procedimientoService';
import './AdminNavbar.css';

export default function AdminNavbar({ onBeforeNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (targetPath) => {
    if (onBeforeNavigate) {
      const allow = onBeforeNavigate(targetPath);
      if (allow === false) return;
    }
    navigate(targetPath);
  };

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Usuario',
    nombreRol: 'INVITADO',
  };

  const normalizeRole = (r) => {
    if (!r) return '';
    const str = String(r).trim().toUpperCase();
    return str.startsWith('ROLE_') ? str.substring(5) : str;
  };

  const userRoles = [
    ...(Array.isArray(user.roles) ? user.roles : []),
    ...(user.nombreRol ? [user.nombreRol] : ['INVITADO'])
  ].map(normalizeRole);

  const hasRole = (role) => userRoles.includes(normalizeRole(role));

  const isAdmin = hasRole('ADMIN');
  const isEnfermera = hasRole('ENFERMERA');
  const isFarmacia = hasRole('FARMACIA');
  const isMedico = hasRole('MEDICO');
  const isSocial = hasRole('SOCIAL');
  const isRecepcion = hasRole('RECEPCION');

  const [pendientesProcedimientos, setPendientesProcedimientos] = useState(0);
  const [procedimientosSubmenuOpen, setProcedimientosSubmenuOpen] = useState(() => {
    return location.pathname.startsWith('/procedimientos');
  });

  useEffect(() => {
    if (location.pathname.startsWith('/procedimientos')) {
      setProcedimientosSubmenuOpen(true);
    }
  }, [location.pathname]);

  // Notificación de procedimientos pendientes para Farmacia y Enfermera
  useEffect(() => {
    if (!isFarmacia && !isEnfermera) return;

    let mounted = true;
    const fetchPendientes = async () => {
      try {
        const res = await procedimientoService.conteoPendientes();
        if (mounted && res && typeof res.pendientes === 'number') {
          setPendientesProcedimientos(res.pendientes);
        }
      } catch (err) {
        // Silencio para no interrumpir navegación
      }
    };

    fetchPendientes();
    const interval = setInterval(fetchPendientes, 25000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isFarmacia, isEnfermera, location.pathname]);

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
    if (onBeforeNavigate) {
      const allow = onBeforeNavigate('/login');
      if (allow === false) return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname.startsWith('/dashboard');
    if (path === '/social') return location.pathname.startsWith('/social');
    if (path === '/farmacia') {
      return (
        location.pathname.startsWith('/farmacia') &&
        !location.pathname.startsWith('/farmacia/informes')
      );
    }
    if (path === '/procedimientos') return location.pathname.startsWith('/procedimientos');
    if (path === '/reportes') {
      return (
        location.pathname.startsWith('/reportes') ||
        location.pathname.startsWith('/farmacia/informes')
      );
    }
    if (path === '/preconsulta') return location.pathname.startsWith('/preconsulta');
    if (path === '/pacientes') return location.pathname.startsWith('/pacientes');
    if (path === '/clinica') return location.pathname.startsWith('/clinica');
    if (path === '/social') return location.pathname.startsWith('/social');
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
      show: isAdmin || isEnfermera || isRecepcion,
    },
    {
      label: 'Pacientes',
      path: '/pacientes',
      icon: Users,
      show: isAdmin || isEnfermera || isRecepcion,
    },
    {
      label: 'Triaje',
      path: '/preconsulta',
      icon: HeartPulse,
      show: isAdmin || isEnfermera,
    },
    {
      label: 'Clínica',
      path: '/clinica',
      icon: Stethoscope,
      show: isAdmin || isMedico || isEnfermera,
    },
    {
      label: 'Farmacia',
      path: '/farmacia',
      icon: Pill,
      show: isAdmin || isFarmacia,
    },
    {
      label: 'Procedimientos',
      path: '/procedimientos',
      icon: Activity,
      show: isAdmin || isMedico || isFarmacia || isEnfermera,
      hasSubmenu: true,
      subItems: [
        {
          label: 'Pacientes por Aplicar',
          path: '/procedimientos',
          show: isAdmin || isMedico || isFarmacia || isEnfermera,
        },
        {
          label: 'Configuración',
          path: '/procedimientos/configuracion',
          show: isAdmin || isEnfermera,
        },
      ],
    },
    {
      label: 'Trabajo Social',
      path: '/social',
      icon: Users,
      show: isAdmin || isSocial,
    },
    {
      label: 'Reportes',
      path: '/reportes',
      icon: FileSpreadsheet,
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
            onClick={() => handleNav(isEnfermera || isRecepcion ? '/recepcion' : (isMedico ? '/clinica' : '/dashboard'))}
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
                const hasSub = item.hasSubmenu && item.subItems && item.subItems.some((s) => s.show);
                const isSubmenuOpen = hasSub && procedimientosSubmenuOpen;

                return (
                  <li key={item.path} style={{ position: 'relative' }}>
                    <button
                      className={`sidebar-nav-item ${active ? 'active' : ''}`}
                      onClick={() => {
                        if (hasSub && !isCollapsed) {
                          setProcedimientosSubmenuOpen((prev) => !prev);
                        }
                        handleNav(item.path);
                      }}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="nav-icon-box">
                        <Icon size={19} className="nav-icon" />
                      </div>
                      {!isCollapsed && <span className="nav-label">{item.label}</span>}

                      {/* Notificación para Farmacia y Enfermera */}
                      {item.path === '/procedimientos' && (isFarmacia || isEnfermera) && pendientesProcedimientos > 0 && (
                        !isCollapsed ? (
                          <span className="sidebar-nav-badge" title={`${pendientesProcedimientos} paciente(s) con procedimiento pendiente`}>
                            {pendientesProcedimientos}
                          </span>
                        ) : (
                          <span className="sidebar-badge-dot" title={`${pendientesProcedimientos} pendiente(s)`} />
                        )
                      )}

                      {/* Flecha indicadora de submenú si no está colapsado */}
                      {hasSub && !isCollapsed && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                          {isSubmenuOpen ? <ChevronUp size={14} color="#90e0ef" /> : <ChevronDown size={14} color="#90e0ef" />}
                        </div>
                      )}
                    </button>

                    {/* Submenú desplegable si no está colapsado */}
                    {hasSub && isSubmenuOpen && !isCollapsed && (
                      <ul className="sidebar-submenu">
                        {item.subItems
                          .filter((sub) => sub.show)
                          .map((sub) => {
                            const isSubActive = location.pathname === sub.path;
                            return (
                              <li key={sub.path}>
                                <button
                                  className={`sidebar-submenu-item ${isSubActive ? 'active' : ''}`}
                                  onClick={() => handleNav(sub.path)}
                                >
                                  <span>{sub.label}</span>
                                  {sub.path === '/procedimientos' && (isFarmacia || isEnfermera) && pendientesProcedimientos > 0 && (
                                    <span className="sidebar-nav-badge" style={{ fontSize: '10px', padding: '1px 5px' }}>
                                      {pendientesProcedimientos}
                                    </span>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                      </ul>
                    )}
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
                <span className="user-role-tag">{userRoles.join(' • ')}</span>
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
