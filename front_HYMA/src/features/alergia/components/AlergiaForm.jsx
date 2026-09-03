import React, { useState, useEffect } from 'react';

export const AlergiaForm = ({ onSubmit, alergiaEditar, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (alergiaEditar) {
      setNombre(alergiaEditar.nombre);
    } else {
      setNombre('');
    }
    setErrorMessage('');
  }, [alergiaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMessage('El nombre de la alergia es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onSubmit({ nombre: nombre.trim() });
      if (res.success) {
        setNombre('');
        setErrorMessage('');
      } else {
        setErrorMessage(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ ...styles.iconBox, background: alergiaEditar ? '#fef3c7' : '#e0f2fe' }}>
          {alergiaEditar ? '✏️' : '➕'}
        </div>
        <div>
          <h3 style={styles.cardTitle}>
            {alergiaEditar ? 'Editar Alergia' : 'Nueva Alergia'}
          </h3>
          <p style={styles.cardSub}>
            {alergiaEditar
              ? `Editando registro #${alergiaEditar.idAlergia}`
              : 'Agrega un nuevo elemento al catálogo clínico'}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div style={styles.errorAlert}>
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nombre de la Alergia o Fármaco *</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Penicilina, Mariscos, Polen..."
            style={styles.input}
            disabled={isSubmitting}
          />
          <span style={styles.hintText}>
            Debe ser un nombre descriptivo para identificarlo en las recetas médicas.
          </span>
        </div>

        <div style={styles.actions}>
          {alergiaEditar && (
            <button
              type="button"
              onClick={onCancel}
              style={styles.btnCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            style={{
              ...styles.btnSubmit,
              backgroundColor: alergiaEditar ? '#f59e0b' : '#0077b6',
            }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Guardando...'
              : alergiaEditar
              ? 'Actualizar Alergia'
              : '+ Agregar Alergia'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.75rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '1.5rem',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 2px 0',
  },
  cardSub: {
    fontSize: '0.78rem',
    color: '#64748b',
    margin: 0,
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.84rem',
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
  hintText: {
    fontSize: '0.74rem',
    color: '#94a3b8',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '0.5rem',
  },
  btnCancel: {
    flex: 1,
    padding: '11px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '9px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  btnSubmit: {
    flex: 2,
    padding: '11px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
};