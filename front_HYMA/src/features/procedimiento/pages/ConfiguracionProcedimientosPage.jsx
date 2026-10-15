import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  CircleDollarSign,
  Edit2,
  Check,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Search
} from 'lucide-react';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import procedimientoService from '../services/procedimientoService';

export default function ConfiguracionProcedimientosPage() {
  const [procedimientos, setProcedimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [precioInput, setPrecioInput] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cargarProcedimientos = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await procedimientoService.listarTodos();
      setProcedimientos(data || []);
    } catch (err) {
      console.error('Error al cargar procedimientos:', err);
      setErrorMsg('No se pudieron cargar los procedimientos desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProcedimientos();
  }, []);

  const iniciarEdicion = (proc) => {
    setEditandoId(proc.idProcedimiento);
    setPrecioInput(Number(proc.precio || 0).toFixed(2));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setPrecioInput('');
  };

  const handleKeyDownPrecio = (e) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const handlePrecioChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const partes = val.split('.');
    if (partes.length > 2) {
      val = partes[0] + '.' + partes.slice(1).join('');
    }
    if (partes.length === 2 && partes[1].length > 2) {
      val = `${partes[0]}.${partes[1].slice(0, 2)}`;
    }
    setPrecioInput(val);
  };

  const guardarPrecio = async (id, nombre) => {
    if (guardando) return;
    if (precioInput === '' || precioInput === null) {
      setErrorMsg('Debe ingresar un monto válido.');
      return;
    }
    const num = parseFloat(precioInput);
    if (isNaN(num) || num < 0) {
      setErrorMsg('El precio no puede ser negativo.');
      return;
    }

    setGuardando(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await procedimientoService.actualizarPrecio(id, num);
      setSuccessMsg(`Precio de "${nombre}" actualizado a Q ${num.toFixed(2)} correctamente.`);
      setEditandoId(null);
      await cargarProcedimientos();
    } catch (err) {
      console.error('Error al actualizar precio:', err);
      const msg = err.response?.data?.message || err.message || 'Error al actualizar el precio.';
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = procedimientos.filter((p) =>
    (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <AdminNavbar />

      <main style={styles.main}>
        <Breadcrumb
          items={[
            { label: 'Procedimientos', to: '/procedimientos' },
            { label: 'Configuración de Procedimientos' }
          ]}
        />

        {/* Encabezado */}
        <div style={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.headerIconWrap}>
                <Activity size={24} color="#0284c7" />
              </div>
              <h1 style={styles.headerTitle}>Configuración de Procedimientos</h1>
            </div>
            <p style={styles.headerSubtitle}>
              Administración de tarifas clínicas y costos por procedimiento
            </p>
          </div>

          <button
            onClick={cargarProcedimientos}
            disabled={loading}
            style={styles.btnRefresh}
            title="Recargar catálogo"
          >
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        {/* Alertas */}
        {successMsg && (
          <div style={styles.alertSuccess}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={styles.alertError}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tarjeta Principal */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.searchBox}>
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Buscar procedimiento por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <span style={styles.badgeCount}>
              {filtrados.length} procedimiento{filtrados.length === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '60px', textAlign: 'center' }}>#</th>
                  <th style={styles.th}>Nombre del Procedimiento</th>
                  <th style={{ ...styles.th, width: '200px', textAlign: 'right' }}>Precio Unitario (Q)</th>
                  <th style={{ ...styles.th, width: '160px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading && procedimientos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '30px' }}>
                      <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#0284c7' }} />
                      <div style={{ marginTop: '8px', color: '#64748b' }}>Cargando catálogo...</div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No se encontraron procedimientos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((proc, index) => {
                    const esEditando = editandoId === proc.idProcedimiento;
                    return (
                      <tr key={proc.idProcedimiento} style={styles.tr}>
                        <td style={{ ...styles.td, textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                          {index + 1}
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                              {proc.nombre}
                            </span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          {esEditando ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              <span style={{ color: '#0369a1', fontWeight: '700' }}>Q</span>
                              <input
                                type="number"
                                step="0.50"
                                min="0"
                                value={precioInput}
                                onChange={handlePrecioChange}
                                onKeyDown={handleKeyDownPrecio}
                                autoFocus
                                style={styles.inlineInput}
                              />
                            </div>
                          ) : (
                            <span style={styles.precioBadge}>
                              Q {Number(proc.precio || 0).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          {esEditando ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => guardarPrecio(proc.idProcedimiento, proc.nombre)}
                                disabled={guardando}
                                style={styles.btnSave}
                                title="Guardar nuevo precio"
                              >
                                <Check size={16} />
                                <span>Guardar</span>
                              </button>
                              <button
                                type="button"
                                onClick={cancelarEdicion}
                                disabled={guardando}
                                style={styles.btnCancel}
                                title="Cancelar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => iniciarEdicion(proc)}
                              style={styles.btnEdit}
                              title="Modificar precio"
                            >
                              <Edit2 size={15} />
                              <span>Cambiar Precio</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
  },
  main: {
    flex: 1,
    padding: '28px 36px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 52px',
  },
  btnRefresh: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#0284c7',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  alertSuccess: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '8px 14px',
    width: '320px',
    maxWidth: '100%',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#0f172a',
  },
  badgeCount: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  precioBadge: {
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: '800',
    color: '#0369a1',
    backgroundColor: '#f0f9ff',
    padding: '4px 12px',
    borderRadius: '6px',
    border: '1px solid #bae6fd',
  },
  inlineInput: {
    width: '100px',
    padding: '6px 8px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    borderRadius: '6px',
    border: '1.5px solid #0284c7',
    textAlign: 'right',
    outline: 'none',
  },
  btnEdit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#0284c7',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnSave: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#0284c7',
    border: 'none',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnCancel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#64748b',
    padding: '6px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
