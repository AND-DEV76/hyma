import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlergias } from '../hooks/useAlergias';
import { AlergiaForm } from '../components/AlergiaForm';
import { AlergiaList } from '../components/AlergiaList';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

export const AlergiaPage = () => {
  const navigate = useNavigate();
  const { alergias, loading, error, agregarAlergia, editarAlergia, borrarAlergia } = useAlergias();
  const [alergiaEditar, setAlergiaEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado reactivo de alergias
  const filteredAlergias = useMemo(() => {
    return alergias.filter((a) =>
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alergias, searchTerm]);

  const handleFormSubmit = async (data) => {
    if (alergiaEditar) {
      const res = await editarAlergia(alergiaEditar.idAlergia, data);
      if (res.success) setAlergiaEditar(null);
      return res;
    } else {
      return await agregarAlergia(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta alergia del catálogo?')) {
      borrarAlergia(id);
      if (alergiaEditar && alergiaEditar.idAlergia === id) {
        setAlergiaEditar(null);
      }
    }
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <main style={styles.container}>
        {/* Encabezado */}
        <div style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              <span onClick={() => navigate('/inicio')} style={styles.breadcrumbLink}>
                Inicio
              </span>{' '}
              / <span>Alergias</span>
            </div>
            <h1 style={styles.title}>Catálogo de Alergias</h1>
            <p style={styles.subtitle}>
              Registro de alérgenos y reacciones médicas para el historial clínico y seguridad de los pacientes.
            </p>
          </div>
        </div>

        {/* Métricas */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Alergias Registradas</div>
            <div style={{ ...styles.metricValue, color: '#f59e0b' }}>{alergias.length}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Resultados Filtrados</div>
            <div style={{ ...styles.metricValue, color: '#0284c7' }}>{filteredAlergias.length}</div>
          </div>
        </div>

        {/* Alerta de Error */}
        {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

        {/* Layout en Grid: Formulario + Listado */}
        <div style={styles.layoutGrid}>
          {/* Panel Izquierdo: Formulario */}
          <div style={styles.formCol}>
            <AlergiaForm
              onSubmit={handleFormSubmit}
              alergiaEditar={alergiaEditar}
              onCancel={() => setAlergiaEditar(null)}
            />
          </div>

          {/* Panel Derecho: Lista */}
          <div style={styles.listCol}>
            {/* Buscador */}
            <div style={styles.searchCard}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Buscar alergia (ej: Penicilina, Polen, Maní)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={styles.btnClear}>
                  ✕
                </button>
              )}
            </div>

            {loading ? (
              <div style={styles.loadingBox}>
                <p style={{ color: '#64748b', fontWeight: 600 }}>Cargando catálogo...</p>
              </div>
            ) : (
              <AlergiaList
                alergias={filteredAlergias}
                onEdit={(alergia) => setAlergiaEditar(alergia)}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

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
  header: {
    marginBottom: '2rem',
  },
  breadcrumb: {
    fontSize: '0.82rem',
    color: '#64748b',
    fontWeight: 600,
    marginBottom: '6px',
  },
  breadcrumbLink: {
    color: '#0077b6',
    cursor: 'pointer',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '0.92rem',
    color: '#64748b',
    margin: 0,
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    padding: '1.2rem 1.5rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '4px',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: '1.75rem',
    alignItems: 'start',
  },
  formCol: {
    position: 'sticky',
    top: '90px',
  },
  listCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  searchIcon: {
    fontSize: '0.95rem',
    color: '#64748b',
    marginRight: '8px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.92rem',
    width: '100%',
    color: '#0f172a',
  },
  btnClear: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '4px',
  },
  loadingBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
};
export default AlergiaPage;