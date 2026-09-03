import { useState } from 'react';

function ParametrosFarmacia({ parametros, onSave }) {
  const [values, setValues] = useState({});
  const [savingKey, setSavingKey] = useState('');

  const valueFor = (parametro) => values[parametro.clave]?.valor ?? parametro.valor;
  const descriptionFor = (parametro) => values[parametro.clave]?.descripcion ?? parametro.descripcion ?? '';

  const save = async (parametro) => {
    setSavingKey(parametro.clave);
    await onSave(parametro.clave, {
      valor: valueFor(parametro),
      descripcion: descriptionFor(parametro),
    });
    setSavingKey('');
  };

  return (
    <section className="farmacia-card">
      <div className="farmacia-card-header">
        <div><h2>Parámetros de farmacia</h2><p>Configura las reglas que utilizan las operaciones de inventario.</p></div>
      </div>
      <div className="farmacia-table-wrap">
        <table className="farmacia-table">
          <thead><tr><th>Clave</th><th>Valor</th><th>Descripción</th><th /></tr></thead>
          <tbody>
            {parametros.map((parametro) => (
              <tr key={parametro.clave}>
                <td><strong>{parametro.clave}</strong></td>
                <td><input className="farmacia-input" value={valueFor(parametro)} onChange={(event) => setValues({ ...values, [parametro.clave]: { valor: event.target.value, descripcion: descriptionFor(parametro) } })} /></td>
                <td><input className="farmacia-input" value={descriptionFor(parametro)} onChange={(event) => setValues({ ...values, [parametro.clave]: { valor: valueFor(parametro), descripcion: event.target.value } })} /></td>
                <td><button className="farmacia-button primary" type="button" onClick={() => save(parametro)} disabled={savingKey === parametro.clave}>{savingKey === parametro.clave ? 'Guardando...' : 'Guardar'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {parametros.length === 0 && <div className="farmacia-empty">No hay parámetros configurados. Empecemos a cargar la configuración.</div>}
      </div>
    </section>
  );
}

export default ParametrosFarmacia;
