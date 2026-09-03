import { useEffect, useState } from 'react';
import { useDiagnosticos } from '../hooks/useDiagnosticos';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

export default function DiagnosticosPage() {
  const { data, loading, cargarDatos, crear, actualizar, eliminar } = useDiagnosticos();
  const [buscar, setBuscar] = useState('');
  const [page, setPage] = useState(0);

  // Simple modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ idCie10: null, codigo: '', descripcion: '' });

  useEffect(() => {
    cargarDatos(buscar, page);
  }, [cargarDatos, buscar, page]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setFormData(item);
    } else {
      setIsEditing(false);
      setFormData({ idCie10: null, codigo: '', descripcion: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let res;
    if (isEditing) {
      res = await actualizar(formData.idCie10, { codigo: formData.codigo, descripcion: formData.descripcion });
    } else {
      res = await crear({ codigo: formData.codigo, descripcion: formData.descripcion });
    }
    if (res.success) {
      setShowModal(false);
      cargarDatos(buscar, page);
    } else {
      alert(res.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este código?")) {
      const res = await eliminar(id);
      if (res.success) cargarDatos(buscar, page);
      else alert(res.error || 'Error al eliminar');
    }
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h2>Catálogo de Diagnósticos CIE-10</h2>
          <button onClick={() => handleOpenModal()} style={styles.btnPrimary}>Nuevo Diagnóstico</button>
        </div>
        
        <input type="text" placeholder="Buscar por código o descripción..." value={buscar} onChange={e => {setBuscar(e.target.value); setPage(0);}} style={styles.searchInput} />
        
        {loading ? <p>Cargando...</p> : (
          <table style={styles.table}>
            <thead>
              <tr><th>Código</th><th>Descripción</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {data.content?.map(d => (
                <tr key={d.idCie10}>
                  <td><strong>{d.codigo}</strong></td>
                  <td>{d.descripcion}</td>
                  <td>
                    <button onClick={() => handleOpenModal(d)} style={styles.btnSmallInfo}>Editar</button>
                    <button onClick={() => handleDelete(d.idCie10)} style={styles.btnSmallDanger}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination placeholder */}
        <div style={styles.pagination}>
          <button disabled={page === 0} onClick={() => setPage(page-1)}>Anterior</button>
          <span> Página {page + 1} de {data.totalPages} </span>
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage(page+1)}>Siguiente</button>
        </div>
      </div>

      {showModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <h3>{isEditing ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}</h3>
            <form onSubmit={handleSave}>
              <div style={{marginBottom: '10px'}}>
                <label>Código CIE-10:</label>
                <input required value={formData.codigo} onChange={e=>setFormData({...formData, codigo: e.target.value})} style={styles.input} />
              </div>
              <div style={{marginBottom: '10px'}}>
                <label>Descripción:</label>
                <textarea required value={formData.descripcion} onChange={e=>setFormData({...formData, descripcion: e.target.value})} style={styles.input} rows="3" />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={styles.btnPrimary}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '#f7fcfe', minHeight: '100vh', fontFamily: "'Segoe UI', Verdana, sans-serif" },
  content: { maxWidth: '900px', margin: '0 auto', padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnPrimary: { background: '#0077b6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnSmallInfo: { background: '#0284c7', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' },
  btnSmallDanger: { background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
  searchInput: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc' },
  table: { width: '100%', background: 'white', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' },
  pagination: { marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBackdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: 'white', padding: '30px', borderRadius: '8px', width: '400px' },
  input: { width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }
};
