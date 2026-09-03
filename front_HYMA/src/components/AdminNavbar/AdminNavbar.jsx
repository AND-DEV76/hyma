import { useLocation, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Usuario',
    nombreRol: 'INVITADO',
  };

  const isAdmin = user.nombreRol === 'ADMIN';
  const isEnfermera = user.nombreRol === 'ENFERMERA';
  const isFarmacia = user.nombreRol === 'FARMACIA';
  const isMedico = user.nombreRol === 'MEDICO';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="admin-navbar">
      <button className="admin-brand" onClick={() => navigate('/inicio')}>
        <span className="brand-title">HYMA</span>
        <span className="brand-sub">Sistema clínico</span>
      </button>

      <nav className="admin-nav-links" aria-label="Navegación principal">
        <button className={`nav-tab ${isActive('/inicio') ? 'active' : ''}`} onClick={() => navigate('/inicio')}>
          Inicio
        </button>

        {(isAdmin || isEnfermera) && (
          <>
            <button className={`nav-tab ${isActive('/recepcion') ? 'active' : ''}`} onClick={() => navigate('/recepcion')}>
              Recepción
            </button>
            <button className={`nav-tab ${location.pathname.startsWith('/preconsulta') ? 'active' : ''}`} onClick={() => navigate('/preconsulta')}>
              Preconsulta
            </button>
          </>
        )}

        {(isAdmin || isMedico) && (
          <>
            <button className={`nav-tab ${location.pathname.startsWith('/clinica') ? 'active' : ''}`} onClick={() => navigate('/clinica')}>
              Clínica
            </button>
            <button className={`nav-tab ${isActive('/diagnosticos') ? 'active' : ''}`} onClick={() => navigate('/diagnosticos')}>
              Diagnósticos CIE-10
            </button>
          </>
        )}

        {(isAdmin || isFarmacia) && (
          <>
            <button className={`nav-tab ${isActive('/farmacia') || location.pathname.startsWith('/farmacia/') ? 'active' : ''}`} onClick={() => navigate('/farmacia')}>
              Farmacia
            </button>
            <button className={`nav-tab ${isActive('/medicos') ? 'active' : ''}`} onClick={() => navigate('/medicos')}>
              Médicos
            </button>
          </>
        )}

        {isAdmin && (
          <>
            <button className={`nav-tab ${isActive('/usuarios') ? 'active' : ''}`} onClick={() => navigate('/usuarios')}>
              Usuarios
            </button>
            <button className={`nav-tab ${isActive('/alergias') ? 'active' : ''}`} onClick={() => navigate('/alergias')}>
              Alergias
            </button>
          </>
        )}
      </nav>

      <div className="admin-nav-right">
        <div className="user-profile-badge">
          <span className="user-name">{user.username}</span>
          <span className="user-role-pill">{user.nombreRol}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Salir
        </button>
      </div>
    </header>
  );
}
