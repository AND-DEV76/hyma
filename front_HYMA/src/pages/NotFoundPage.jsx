import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, LayoutDashboard, Stethoscope, AlertTriangle } from 'lucide-react';
import saludLogo from '../assets/images/log1.png';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleGoHome = () => {
    if (token && user) {
      const userRoles = (user.roles && user.roles.length > 0)
        ? user.roles
        : (user.nombreRol ? [user.nombreRol] : []);

      if (userRoles.includes('MEDICO')) {
        navigate('/clinica');
      } else if (userRoles.includes('ENFERMERA')) {
        navigate('/recepcion');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={styles.container}>
      {/* Barra superior de navegación / identidad institucional */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <img src={saludLogo} alt="Logo HYMA" style={styles.logo} />
          <div style={styles.brandText}>
            <span style={styles.brandTitle}>Programa de Salud</span>
            <span style={styles.brandSubtitle}>Hombre y Mujer en Acción</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          style={styles.navHomeBtn}
          title="Ir al portal público"
        >
          <Home size={15} />
          <span>Página Principal</span>
        </button>
      </header>

      {/* Tarjeta Central 404 */}
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>
            <Stethoscope size={42} style={styles.icon} />
          </div>

          <span style={styles.codeBadge}>ERROR 404</span>

          <h1 style={styles.title}>Página no encontrada</h1>

          <p style={styles.description}>
            La ruta a la que intentas acceder no existe en el sistema, fue modificada o no cuentas con los permisos necesarios.
          </p>

          {location.pathname && (
            <div style={styles.pathBadge}>
              <span style={styles.pathLabel}>Ruta solicitada:</span>
              <code style={styles.pathCode}>{location.pathname}</code>
            </div>
          )}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={handleGoHome}
              style={styles.btnPrimary}
            >
              <LayoutDashboard size={18} />
              <span>{token ? 'Ir a mi Panel de Control' : 'Iniciar Sesión'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={styles.btnSecondary}
            >
              <Home size={18} />
              <span>Inicio Público</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              style={styles.btnOutline}
            >
              <ArrowLeft size={18} />
              <span>Regresar</span>
            </button>
          </div>

          <div style={styles.footerNote}>
            <AlertTriangle size={14} color="#0077b6" />
            <span>Si crees que esto es un error del sistema, contacta al administrador técnico de HYMA.</span>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} HYMA — Fundación Hombre y Mujer en Acción
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#0f172a',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: '42px',
    height: '42px',
    objectFit: 'contain',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#03045e',
    letterSpacing: '-0.2px',
  },
  brandSubtitle: {
    fontSize: '0.78rem',
    color: '#64748b',
    fontWeight: '500',
  },
  navHomeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    maxWidth: '560px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)',
    padding: '40px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconCircle: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  icon: {
    color: '#0077b6',
  },
  codeBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    fontSize: '0.75rem',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '9999px',
    letterSpacing: '1px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#03045e',
    margin: '0 0 10px',
    letterSpacing: '-0.5px',
  },
  description: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: '1.55',
    margin: '0 0 20px',
    maxWidth: '440px',
  },
  pathBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '6px 14px',
    marginBottom: '28px',
    fontSize: '0.85rem',
  },
  pathLabel: {
    color: '#64748b',
    fontWeight: '500',
  },
  pathCode: {
    color: '#0369a1',
    fontWeight: '600',
    fontFamily: "monospace",
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '24px',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#0077b6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '0.92rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    color: '#03045e',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '12px 18px',
    fontSize: '0.92rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '0.92rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  footerNote: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '0.78rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
    width: '100%',
    justifyContent: 'center',
  },
  footer: {
    textAlign: 'center',
    padding: '16px',
    fontSize: '0.8rem',
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
};
