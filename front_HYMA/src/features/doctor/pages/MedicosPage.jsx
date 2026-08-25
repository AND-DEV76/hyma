import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicos } from '../hooks/useMedicos';

const initialFormState = {
  nombres: '',
  apellidos: '',
  especialidad: '',
  telefono: '',
  correo: '',
  idUsuario: ''
};

function MedicosPage() {
  const navigate = useNavigate();
  const {
    medicos,
    usuariosMedicos,
    loading,
    error,
    createMedico,
    updateMedico,
    deleteMedico
  } = useMedicos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');

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
        idUsuario: medico.idUsuario ? String(medico.idUsuario) : ''
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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...formData,
      idUsuario: formData.idUsuario ? Number(formData.idUsuario) : null
    };

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
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>HYMA - Gestión de Médicos</div>
        <button onClick={() => navigate('/inicio')} style={styles.btnVolver}>
          ← Volver al Inicio
        </button>
      </header>

      <main style={styles.content}>
        <div style={styles.topBar}>
          <h2>👨‍⚕️ Catálogo de Médicos</h2>
          <button onClick={() => handleOpenModal()} style={styles.btnCrear}>
            + Nuevo Médico
          </button>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando registros...</p>
        ) : (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Nombre Completo</th>
                  <th style={styles.th}>Especialidad</th>
                  <th style={styles.th}>Contacto</th>
                  <th style={styles.th}>Usuario Asociado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.tdEmpty}>
                      No hay médicos registrados.
                    </td>
                  </tr>
                ) : (
                  medicos.map((medico) => (
                    <tr key={medico.idMedico} style={styles.tr}>
                      <td style={styles.td}>{medico.idMedico}</td>
                      <td style={styles.td}>
                        <strong>{medico.nombres} {medico.apellidos}</strong>
                      </td>
                      <td style={styles.td}>{medico.especialidad || 'N/A'}</td>
                      <td style={styles.td}>
                        <div>📞 {medico.telefono || 'Sin teléfono'}</div>
                        <small style={{ color: '#0077b6' }}>✉️ {medico.correo || 'Sin correo'}</small>
                      </td>
                      <td style={styles.td}>
                        {medico.username ? (
                          <span style={styles.badgeUser}>👤 {medico.username}</span>
                        ) : (
                          <span style={styles.badgeNone}>Sin Asignar</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleOpenModal(medico)}
                          style={styles.btnEdit}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => deleteMedico(medico.idMedico)}
                          style={styles.btnDelete}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>{editingId ? 'Editar Médico' : 'Registrar Nuevo Médico'}</h3>

            {formError && <div style={styles.errorAlert}>{formError}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label>Nombres *</label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Apellidos *</label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Especialidad</label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  placeholder="Ej. Pediatría, Cardiología..."
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* SELECTOR DE USUARIO FILTRADO POR ROL 'MEDICO' */}
              <div style={styles.formGroup}>
                <label>Usuario del Sistema (Solo rol MEDICO)</label>
                <select
                  name="idUsuario"
                  value={formData.idUsuario}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">-- Sin usuario asignado --</option>
                  {usuariosMedicos.map((u) => (
                    <option key={u.idUsuario} value={u.idUsuario}>
                      {u.username} (ID: {u.idUsuario})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={styles.btnCancel}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnSave}>
                  {editingId ? 'Guardar Cambios' : 'Registrar'}
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
  container: {
    minHeight: '100vh',
    backgroundColor: '#caf0f8',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: '#03045e',
    color: '#ffffff',
    padding: '15px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#90e0ef',
  },
  btnVolver: {
    backgroundColor: '#00b4d8',
    color: '#03045e',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  content: {
    padding: '30px 20px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    color: '#03045e',
  },
  btnCrear: {
    backgroundColor: '#03045e',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 10px 25px rgba(3, 4, 94, 0.08)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px',
    borderBottom: '2px solid #caf0f8',
    color: '#03045e',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle',
  },
  tdEmpty: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  tr: {
    transition: 'background-color 0.2s',
  },
  badgeUser: {
    backgroundColor: '#e0f7fa',
    color: '#006064',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  badgeNone: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  btnEdit: {
    backgroundColor: '#0077b6',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    marginRight: '8px',
    cursor: 'pointer',
  },
  btnDelete: {
    backgroundColor: '#d62828',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 4, 94, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    textAlign: 'left',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #90e0ef',
    fontSize: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '15px',
  },
  btnCancel: {
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  btnSave: {
    backgroundColor: '#03045e',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  errorAlert: {
    backgroundColor: '#ffdddd',
    color: '#d8000c',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
  },
};

export default MedicosPage;