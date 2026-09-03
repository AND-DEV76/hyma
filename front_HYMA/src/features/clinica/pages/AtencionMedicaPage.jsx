import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClinica } from '../hooks/useClinica';
import * as clinicaService from '../services/clinicaService';
import AdminNavbar from '../../../components/AdminNavbar/AdminNavbar';

export default function AtencionMedicaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idPaciente = searchParams.get('idPaciente');
  const idCola = searchParams.get('idCola');

  const { finalizarAtencion, guardando, error: hookError } = useClinica();
  
  const [pacienteData, setPacienteData] = useState(null);
  const [loadingDatos, setLoadingDatos] = useState(true);
  
  // Section B
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [historiaEnfermedad, setHistoriaEnfermedad] = useState('');
  const [impresionClinica, setImpresionClinica] = useState('');
  const [planMedico, setPlanMedico] = useState('');
  
  // Section C
  const [examenFisico, setExamenFisico] = useState({ piel: '', conciencia: '', cardiopulmonar: '', abdomen: '', soma: '' });
  
  // Section D
  const [diagnosticos, setDiagnosticos] = useState([]); // { codigoCie10, descripcion }
  const [searchDiag, setSearchDiag] = useState('');
  const [diagResults, setDiagResults] = useState([]);
  
  // Section E
  const [observacionesTratamiento, setObservacionesTratamiento] = useState('');
  const [detallesTratamiento, setDetallesTratamiento] = useState([]); 
  // { idMedicamento, nombreMedicamento, dosis, frecuencia, duracion, cantidad }
  
  const [searchMed, setSearchMed] = useState('');
  const [medResults, setMedResults] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const data = await clinicaService.obtenerPacienteConsulta(idPaciente, idCola);
        setPacienteData(data);
      } catch (err) {
        console.error("Error fetching paciente data");
      } finally {
        setLoadingDatos(false);
      }
    };
    if (idPaciente) fetchDatos();
  }, [idPaciente, idCola]);

  const handleSearchDiag = async (e) => {
    const val = e.target.value;
    setSearchDiag(val);
    if (val.length > 2) {
      const res = await clinicaService.buscarDiagnosticosCie10(val);
      setDiagResults(res);
    } else {
      setDiagResults([]);
    }
  };

  const addDiagnostico = (d) => {
    if (!diagnosticos.find(x => x.codigoCie10 === d.codigo)) {
      setDiagnosticos([...diagnosticos, { codigoCie10: d.codigo, descripcion: d.descripcion }]);
    }
    setSearchDiag('');
    setDiagResults([]);
  };

  const removeDiagnostico = (codigo) => {
    setDiagnosticos(diagnosticos.filter(d => d.codigoCie10 !== codigo));
  };

  const handleSearchMed = async (e) => {
    const val = e.target.value;
    setSearchMed(val);
    if (val.length > 2) {
      const res = await clinicaService.buscarMedicamentos(val);
      setMedResults(res);
    } else {
      setMedResults([]);
    }
  };

  const addDetalleTratamiento = (med) => {
    if (!detallesTratamiento.find(x => x.idMedicamento === med.idMedicamento)) {
      setDetallesTratamiento([...detallesTratamiento, {
        idMedicamento: med.idMedicamento, nombreMedicamento: med.nombre,
        dosis: '', frecuencia: '', duracion: '', cantidad: 1
      }]);
    }
    setSearchMed('');
    setMedResults([]);
  };

  const updateDetalle = (idMed, field, val) => {
    setDetallesTratamiento(detallesTratamiento.map(dt => 
      dt.idMedicamento === idMed ? { ...dt, [field]: val } : dt
    ));
  };

  const removeDetalle = (idMed) => {
    setDetallesTratamiento(detallesTratamiento.filter(dt => dt.idMedicamento !== idMed));
  };

  const handleSubmit = async () => {
    const payload = {
      idPaciente: Number(idPaciente),
      idCola: Number(idCola),
      idSignoVital: pacienteData?.ultimoSignoVital?.idSignoVital,
      motivoConsulta,
      historiaEnfermedadActual: historiaEnfermedad,
      impresionClinica,
      planMedico,
      examenFisico: { ...examenFisico },
      diagnosticos,
      tratamiento: {
        observaciones: observacionesTratamiento,
        detalles: detallesTratamiento.map(dt => ({
          idMedicamento: dt.idMedicamento,
          dosis: dt.dosis,
          frecuencia: dt.frecuencia,
          duracion: dt.duracion,
          cantidad: Number(dt.cantidad)
        }))
      }
    };
    
    const res = await finalizarAtencion(payload);
    if (res.success) {
      alert("Consulta finalizada correctamente");
      navigate('/clinica');
    }
  };

  if (loadingDatos) return <p style={{padding: '20px'}}>Cargando datos...</p>;

  return (
    <div style={styles.page}>
      <AdminNavbar />
      <div style={styles.content}>
        <h1 style={styles.title}>Atención Médica</h1>
        {hookError && <div style={styles.error}>{hookError}</div>}
        
        {/* Section A: Paciente */}
        <section style={styles.section}>
          <h2>Datos del Paciente</h2>
          <div style={styles.grid2}>
            <div>
              <p><strong>Nombres:</strong> {pacienteData?.paciente?.nombres} {pacienteData?.paciente?.apellidos}</p>
              <p><strong>Antecedentes:</strong> {pacienteData?.paciente?.antecedentesPersonalesPatologicos || 'N/A'}</p>
            </div>
            {pacienteData?.ultimoSignoVital && (
              <div style={styles.vitalsBox}>
                <h4>Últimos Signos Vitales</h4>
                <p>PA: {pacienteData.ultimoSignoVital.presionArterial} | FC: {pacienteData.ultimoSignoVital.frecuenciaCardiaca} | Temp: {pacienteData.ultimoSignoVital.temperatura}°C</p>
                <p>Peso: {pacienteData.ultimoSignoVital.peso}kg | SatO2: {pacienteData.ultimoSignoVital.saturacionOxigeno}% | IMC: {pacienteData.ultimoSignoVital.imc}</p>
              </div>
            )}
          </div>
        </section>

        {/* Section B: Consulta */}
        <section style={styles.section}>
          <h2>Consulta</h2>
          <textarea placeholder="Motivo de Consulta" value={motivoConsulta} onChange={e=>setMotivoConsulta(e.target.value)} style={styles.textarea} />
          <textarea placeholder="Historia de la Enfermedad Actual" value={historiaEnfermedad} onChange={e=>setHistoriaEnfermedad(e.target.value)} style={styles.textarea} />
          <textarea placeholder="Impresión Clínica" value={impresionClinica} onChange={e=>setImpresionClinica(e.target.value)} style={styles.textarea} />
          <textarea placeholder="Plan Médico" value={planMedico} onChange={e=>setPlanMedico(e.target.value)} style={styles.textarea} />
        </section>

        {/* Section C: Examen Físico */}
        <section style={styles.section}>
          <h2>Examen Físico</h2>
          <div style={styles.grid2}>
            <input placeholder="Piel" value={examenFisico.piel} onChange={e=>setExamenFisico({...examenFisico, piel: e.target.value})} style={styles.input} />
            <input placeholder="Conciencia" value={examenFisico.conciencia} onChange={e=>setExamenFisico({...examenFisico, conciencia: e.target.value})} style={styles.input} />
            <input placeholder="Cardiopulmonar" value={examenFisico.cardiopulmonar} onChange={e=>setExamenFisico({...examenFisico, cardiopulmonar: e.target.value})} style={styles.input} />
            <input placeholder="Abdomen" value={examenFisico.abdomen} onChange={e=>setExamenFisico({...examenFisico, abdomen: e.target.value})} style={styles.input} />
            <input placeholder="Soma" value={examenFisico.soma} onChange={e=>setExamenFisico({...examenFisico, soma: e.target.value})} style={styles.input} />
          </div>
        </section>

        {/* Section D: Diagnósticos */}
        <section style={styles.section}>
          <h2>Diagnósticos CIE-10</h2>
          <div>
            <input type="text" placeholder="Buscar código o descripción..." value={searchDiag} onChange={handleSearchDiag} style={styles.input} />
            {diagResults.length > 0 && (
              <ul style={styles.autocompleteList}>
                {diagResults.map(d => (
                  <li key={d.idCie10} onClick={() => addDiagnostico(d)} style={styles.autocompleteItem}>
                    {d.codigo} - {d.descripcion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ul>
            {diagnosticos.map(d => (
              <li key={d.codigoCie10}>{d.codigoCie10} - {d.descripcion} <button onClick={() => removeDiagnostico(d.codigoCie10)} style={styles.btnSmallDanger}>X</button></li>
            ))}
          </ul>
        </section>

        {/* Section E: Tratamiento */}
        <section style={styles.section}>
          <h2>Tratamiento</h2>
          <textarea placeholder="Observaciones generales de tratamiento" value={observacionesTratamiento} onChange={e=>setObservacionesTratamiento(e.target.value)} style={styles.textarea} />
          
          <div style={{marginTop: '20px'}}>
            <input type="text" placeholder="Buscar medicamento..." value={searchMed} onChange={handleSearchMed} style={styles.input} />
            {medResults.length > 0 && (
              <ul style={styles.autocompleteList}>
                {medResults.map(m => (
                  <li key={m.idMedicamento} onClick={() => addDetalleTratamiento(m)} style={styles.autocompleteItem}>
                    {m.nombre} ({m.presentacion} {m.concentracion})
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {detallesTratamiento.length > 0 && (
            <table style={styles.table}>
              <thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th><th>Cantidad</th><th>Acción</th></tr></thead>
              <tbody>
                {detallesTratamiento.map(dt => (
                  <tr key={dt.idMedicamento}>
                    <td>{dt.nombreMedicamento}</td>
                    <td><input value={dt.dosis} onChange={e=>updateDetalle(dt.idMedicamento, 'dosis', e.target.value)} style={styles.tdInput} /></td>
                    <td><input value={dt.frecuencia} onChange={e=>updateDetalle(dt.idMedicamento, 'frecuencia', e.target.value)} style={styles.tdInput} /></td>
                    <td><input value={dt.duracion} onChange={e=>updateDetalle(dt.idMedicamento, 'duracion', e.target.value)} style={styles.tdInput} /></td>
                    <td><input type="number" min="1" value={dt.cantidad} onChange={e=>updateDetalle(dt.idMedicamento, 'cantidad', e.target.value)} style={styles.tdInput} /></td>
                    <td><button onClick={() => removeDetalle(dt.idMedicamento)} style={styles.btnSmallDanger}>Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Actions */}
        <div style={styles.footer}>
          <button onClick={() => navigate('/clinica')} style={styles.btnCancel}>Cancelar</button>
          <button onClick={handleSubmit} disabled={guardando} style={styles.btnPrimary}>
            {guardando ? 'Guardando...' : 'Finalizar Consulta'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f7fcfe', minHeight: '100vh', fontFamily: "'Segoe UI', Verdana, sans-serif" },
  content: { maxWidth: '1000px', margin: '0 auto', padding: '30px' },
  title: { color: '#03045e', marginBottom: '20px' },
  section: { background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  vitalsBox: { background: '#e0f2fe', padding: '15px', borderRadius: '8px', fontSize: '14px' },
  textarea: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px', fontFamily: 'inherit' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' },
  autocompleteList: { listStyle: 'none', padding: 0, margin: '-10px 0 10px 0', border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto', background: 'white' },
  autocompleteItem: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
  tdInput: { width: '90%', padding: '5px' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '20px 0' },
  btnPrimary: { background: '#0077b6', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancel: { background: '#ccc', color: '#333', padding: '12px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnSmallDanger: { background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '6px', marginBottom: '20px' }
};
