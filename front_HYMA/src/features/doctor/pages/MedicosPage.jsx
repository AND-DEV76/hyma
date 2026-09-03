import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicos } from '../hooks/useMedicos';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

const initialFormState = {
  nombres: '',
  apellidos: '',
  especialidad: '',
  telefono: '',
  correo: '',
  idUsuario: '',
};

export default function MedicosPage() {
  const navigate = useNavigate();
  const {
    medicos,
    usuariosMedicos,
    loading,
    error,
    createMedico,
    updateMedico,
    deleteMedico,
  } = useMedicos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado reactivo de médicos
  const filteredMedicos = useMemo(() => {
    return medicos.filter((m) => {
      const full = `${m.nombres} ${m.apellidos} ${m.especialidad} ${m.correo} ${m.username || ''}`.toLowerCase();
      return full.includes(searchTerm.toLowerCase());
    });
  }, [medicos, searchTerm]);

  // Especialidades únicas para métricas
  const totalEspecialidades = useMemo(() => {
    const specs = new Set(medicos.map((m) => m.especialidad).filter(Boolean));
    return specs.size;
  }, [medicos]);

  const totalConUsuario = useMemo(() => {
    return medicos.filter((m) => m.idUsuario).length;
  }, [medicos]);

  const handleOpenModal = (medico = null) => {
    setFormError('');
    if (medico) {
      setEditingId(medico.idMedico);
      setFormData({
        nombres: medico.nombres || '',
        apellidos: medico.apellidos || '',
        especialidad: medico.especialidad || '',
        telefono: medico.telefono || '',
        correo: medico.correo || '',
        idUsuario: medico.idUsuario ? String(medico.idUsuario) : '',
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const payload = {
      ...formData,
      idUsuario: formData.idUsuario ? Number(formData.idUsuario) : null,
    };

    try {
      let result;
      if (editingId) {
        result = await updateMedico(editingId, payload);
      } else {
        result = await createMedico(payload);
      }

      if (result.success) {
        handleCloseModal();
      } else {
        setFormError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a este médico del cuerpo médico?')) {
      await deleteMedico(id);
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
              / <span>Médicos</span>
            </div>
            <h1 style={styles.title}>Cuerpo Médico y Especialistas</h1>
            <p style={styles.subtitle}>
              Administración de profesionales de la salud, especialidades y vinculación con cuentas del sistema.
            </p>
          </div>

          <button onClick={() => handleOpenModal()} style={styles.btnCreate}>
            <span style={styles.btnIcon}>+</span> Nuevo Médico
          </button>
        </div>

        {/* Métricas */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Médicos</div>
            <div style={styles.metricValue}>{medicos.length}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Especialidades</div>
            <div style={{ ...styles.metricValue, color: '#0d9488' }}>{totalEspecialidades}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Con Cuenta Vinculada</div>
            <div style={{ ...styles.metricValue, color: '#0284c7' }}>{totalConUsuario}</div>
          </div>
        </div>

        {/* Barra de Búsqueda */}
        <div style={styles.filterCard}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, especialidad o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.btnClearSearch}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Error Global */}
        {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

        {/* Tabla */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Cargando catálogo médico...</p>
          </div>
        ) : filteredMedicos.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>👨‍⚕️</div>
            <h3 style={styles.emptyTitle}>No se encontraron médicos</h3>
            <p style={styles.emptyText}>
              No hay registros que coincidan con la búsqueda o aún no se ha registrado ningún médico.
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Médico / Especialista</th>
                  <th style={styles.th}>Especialidad</th>
                  <th style={styles.th}>Contacto</th>
                  <th style={styles.th}>Cuenta de Usuario</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicos.map((m) => (
                  <tr key={m.idMedico} style={styles.row}>
                    <td style={{ ...styles.td, color: '#64748b', fontWeight: 600 }}>
                      #{m.idMedico}
                    </td>

                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatarDoc}>Dr</div>
                        <div>
                          <div style={styles.nameText}>
                            {m.nombres} {m.apellidos}
                          </div>
                          <div style={styles.subText}>ID: {m.idMedico}</div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.badgeSpecialty}>
                        {m.especialidad || 'Medicina General'}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.contactItem}>
                        <span>📞</span> {m.telefono || 'Sin teléfono'}
                      </div>
                      <div style={styles.contactItemSub}>
                        <span>✉️</span> {m.correo || 'Sin correo'}
                      </div>
                    </td>

                    <td style={styles.td}>
                      {m.username ? (
                        <span style={styles.badgeUser}>
                          <span style={styles.userDot}></span>
                          {m.username}
                        </span>
                      ) : (
                        <span style={styles.badgeNoUser}>Sin vincular</span>
                      )}
                    </td>

                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleOpenModal(m)}
                          style={styles.btnEdit}
                          title="Editar información"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(m.idMedico)}
                          style={styles.btnDelete}
                          title="Eliminar médico"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>
                  {editingId ? 'Editar Perfil Médico' : 'Registrar Nuevo Médico'}
                </h3>
                <p style={styles.modalSub}>
                  {editingId
                    ? 'Actualiza los datos de contacto y especialidad del médico.'
                    : 'Ingresa los datos para dar de alta al médico en el catálogo.'}
                </p>
              </div>
              <button onClick={handleCloseModal} style={styles.btnClose}>
                ✕
              </button>
            </div>

            {formError && (
              <div style={styles.formErrorBanner}>
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    required
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Ej: Carlos Eduardo"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    required
                    value={formData.apellidos}
                    onChange={handleChange}
                    placeholder="Ej: Mendoza Ruiz"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Especialidad Médica</label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  placeholder="Ej: Pediatría, Medicina Interna, Cardiología..."
                  style={styles.input}
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono de Contacto</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 555-0192"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Correo Electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="medico@hyma.org"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Cuenta de Usuario del Sistema (Opcional)</label>
                <select
                  name="idUsuario"
                  value={formData.idUsuario}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">— Ningún usuario asignado —</option>
                  {usuariosMedicos.map((u) => (
                    <option key={u.idUsuario} value={u.idUsuario}>
                      {u.username} (ID: {u.idUsuario})
                    </option>
                  ))}
                </select>
                <span style={styles.inputHelp}>
                  Permite al médico autenticarse para firmar consultas y recetas médicas.
                </span>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={styles.btnCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.btnSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Guardando...'
                    : editingId
                    ? 'Guardar Cambios'
                    : 'Registrar Médico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Segoe UI', Verdana, sans-serif",
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
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
  btnCreate: {
    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
    transition: 'all 0.2s ease',
  },
  btnIcon: {
    fontSize: '1.2rem',
    lineHeight: '1',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
  filterCard: {
    backgroundColor: '#ffffff',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '0 12px',
  },
  searchIcon: {
    fontSize: '0.9rem',
    marginRight: '8px',
    color: '#64748b',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    padding: '10px 0',
    fontSize: '0.92rem',
    outline: 'none',
    width: '100%',
    color: '#0f172a',
  },
  btnClearSearch: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    padding: '14px 20px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  row: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '16px 20px',
    verticalAlign: 'middle',
    color: '#0f172a',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarDoc: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#ccfbf1',
    color: '#0f766e',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
  },
  nameText: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '0.95rem',
  },
  subText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  badgeSpecialty: {
    backgroundColor: '#f0fdfa',
    color: '#0f766e',
    border: '1px solid #99f6e4',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '700',
  },
  contactItem: {
    fontSize: '0.86rem',
    fontWeight: '600',
    color: '#334155',
  },
  contactItemSub: {
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: '2px',
  },
  badgeUser: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '700',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    border: '1px solid #bae6fd',
  },
  userDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#0284c7',
  },
  badgeNoUser: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  actionButtons: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  btnEdit: {
    backgroundColor: '#f8fafc',
    color: '#0d9488',
    border: '1px solid #99f6e4',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDelete: {
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #fecdd3',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '4rem 2rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.92rem',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '3.5rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 4, 94, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 20px 40px rgba(3, 4, 94, 0.2)',
    border: '1px solid #e2e8f0',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  modalSub: {
    fontSize: '0.82rem',
    color: '#64748b',
    margin: 0,
  },
  btnClose: {
    background: '#f1f5f9',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: 'bold',
  },
  formErrorBanner: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.84rem',
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    fontSize: '0.92rem',
    outline: 'none',
    color: '#0f172a',
  },
  select: {
    padding: '11px 14px',
    borderRadius: '9px',
    border: '1px solid #cbd5e1',
    fontSize: '0.92rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    cursor: 'pointer',
  },
  inputHelp: {
    fontSize: '0.74rem',
    color: '#64748b',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '0.5rem',
  },
  btnCancel: {
    padding: '11px 18px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '9px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  btnSubmit: {
    padding: '11px 22px',
    backgroundColor: '#0d9488',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
  },
};