import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

export default function InicioPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Usuario',
    nombreRol: 'INVITADO',
  };

  const isAdmin = user.nombreRol === 'ADMIN';
  const isEnfermera = user.nombreRol === 'ENFERMERA';
  const isFarmacia = user.nombreRol === 'FARMACIA';
  const isMedico = user.nombreRol === 'MEDICO';

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.container}>
        {/* Banner de Bienvenida */}
        <section style={styles.welcomeBanner}>
          <div style={styles.bannerInfo}>
            <span style={styles.dateBadge}>📅 {currentDate}</span>
            <h1 style={styles.welcomeTitle}>
              ¡Hola de nuevo, <span style={styles.highlightName}>{user.username}</span>!
            </h1>
            <p style={styles.welcomeDesc}>
              Panel principal de administración y control operativo de la clínica HYMA.
            </p>
          </div>
          <div style={styles.bannerTag}>
            <span style={styles.roleLabel}>ROL ASIGNADO</span>
            <span style={styles.roleValue}>{user.nombreRol}</span>
          </div>
        </section>

        {/* Indicadores / Mini Stats */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, background: '#e0f2fe', color: '#0284c7' }}>
              🏥
            </div>
            <div>
              <div style={styles.statLabel}>Módulo Activo</div>
              <div style={styles.statValue}>Gestión Integral</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, background: '#dcfce7', color: '#16a34a' }}>
              🔒
            </div>
            <div>
              <div style={styles.statLabel}>Seguridad</div>
              <div style={styles.statValue}>JWT Activo (Argon2)</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, background: '#fef3c7', color: '#d97706' }}>
              ⚡
            </div>
            <div>
              <div style={styles.statLabel}>Estado Sistema</div>
              <div style={styles.statValue}>En línea (100%)</div>
            </div>
          </div>
        </section>

        {/* Secciones y Accesos a Módulos */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Módulos y Servicios Disponibles</h2>
          <span style={styles.sectionSubtitle}>Selecciona un área para comenzar a trabajar</span>
        </div>

        <section style={styles.modulesGrid}>
          {/* Módulo Recepción (ADMIN / ENFERMERA) */}
          {(isAdmin || isEnfermera) && (
            <div style={styles.moduleCard} onClick={() => navigate('/recepcion')}>
              <div style={styles.cardTop}>
                <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
                  🏥
                </div>
                <span style={styles.badgePermiso}>Recepción / Cola</span>
              </div>
              <h3 style={styles.cardTitle}>Recepción de Pacientes</h3>
              <p style={styles.cardDescription}>
                Búsqueda y registro de pacientes, asignación a cola de espera y control de turnos en tiempo real.
              </p>
              <div style={styles.cardAction}>
                <span>Ingresar al módulo</span>
                <span style={styles.arrowIcon}>→</span>
              </div>
            </div>
          )}

          {/* Módulo Médicos (ADMIN / FARMACIA / MEDICO) */}
          {(isAdmin || isFarmacia || isMedico) && (
            <div style={styles.moduleCard} onClick={() => navigate('/medicos')}>
              <div style={styles.cardTop}>
                <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
                  👨‍⚕️
                </div>
                <span style={styles.badgePermiso}>Personal Médico</span>
              </div>
              <h3 style={styles.cardTitle}>Gestión de Médicos</h3>
              <p style={styles.cardDescription}>
                Administración del personal médico, especialidades clínicas, información de contacto y usuarios vinculados.
              </p>
              <div style={styles.cardAction}>
                <span>Ingresar al módulo</span>
                <span style={styles.arrowIcon}>→</span>
              </div>
            </div>
          )}

          {/* Módulos Exclusivos de ADMIN */}
          {isAdmin && (
            <>
              <div style={styles.moduleCard} onClick={() => navigate('/usuarios')}>
                <div style={styles.cardTop}>
                  <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                    👥
                  </div>
                  <span style={{ ...styles.badgePermiso, background: '#ede9fe', color: '#6d28d9' }}>
                    Solo Admin
                  </span>
                </div>
                <h3 style={styles.cardTitle}>Control de Usuarios</h3>
                <p style={styles.cardDescription}>
                  Creación, edición y revocación de cuentas de usuario, asignación de roles y estados en el sistema.
                </p>
                <div style={styles.cardAction}>
                  <span>Administrar usuarios</span>
                  <span style={styles.arrowIcon}>→</span>
                </div>
              </div>

              <div style={styles.moduleCard} onClick={() => navigate('/alergias')}>
                <div style={styles.cardTop}>
                  <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    🧪
                  </div>
                  <span style={{ ...styles.badgePermiso, background: '#fef3c7', color: '#b45309' }}>
                    Solo Admin
                  </span>
                </div>
                <h3 style={styles.cardTitle}>Catálogo de Alergias</h3>
                <p style={styles.cardDescription}>
                  Registro y mantenimiento del catálogo de alergias y reacciones para asociar a los expedientes clínicos.
                </p>
                <div style={styles.cardAction}>
                  <span>Gestionar catálogo</span>
                  <span style={styles.arrowIcon}>→</span>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem',
  },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #03045e 0%, #0077b6 100%)',
    borderRadius: '16px',
    padding: '2rem 2.5rem',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 25px rgba(3, 4, 94, 0.12)',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  bannerInfo: {
    flex: '1',
    minWidth: '280px',
  },
  dateBadge: {
    display: 'inline-block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#90e0ef',
    textTransform: 'capitalize',
    marginBottom: '8px',
  },
  welcomeTitle: {
    fontSize: '1.85rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  highlightName: {
    color: '#caf0f8',
  },
  welcomeDesc: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#e0f2fe',
    opacity: 0.9,
  },
  bannerTag: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(8px)',
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: '0.65rem',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#90e0ef',
  },
  roleValue: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  statIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px',
  },
  sectionHeader: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  sectionSubtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  modulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '1.75rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(3, 4, 94, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
  },
  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  badgePermiso: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  cardDescription: {
    fontSize: '0.88rem',
    color: '#64748b',
    lineHeight: '1.5',
    margin: '0 0 1.5rem 0',
    flex: '1',
  },
  cardAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#0077b6',
  },
  arrowIcon: {
    fontSize: '1.1rem',
    transition: 'transform 0.2s ease',
  },
};