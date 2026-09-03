function HistorialEntradas({ entradas }) {
  return (
    <section className="farmacia-card">
      <div className="farmacia-card-header">
        <div><h2>Historial de entradas</h2><p>Auditoría de movimientos registrados por fecha y usuario.</p></div>
      </div>
      <div className="farmacia-table-wrap">
        <table className="farmacia-table">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Usuario</th><th>Detalle</th><th>Observaciones</th></tr></thead>
          <tbody>
            {entradas.map((entrada) => (
              <tr key={entrada.idEntrada}>
                <td>{entrada.fechaEntrada ? new Date(entrada.fechaEntrada).toLocaleString('es-GT') : '—'}</td>
                <td><span className="farmacia-status active">{entrada.tipoEntrada}</span></td>
                <td>{entrada.usuarioNombre || 'Sistema'}</td>
                <td>
                  <div className="farmacia-detail-list" style={{ margin: 0 }}>
                    {entrada.detalles?.map((detalle) => <span key={detalle.idDetalleEntrada}>{detalle.medicamentoNombre} · {detalle.cantidad} unidades</span>)}
                  </div>
                </td>
                <td>{entrada.observaciones || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entradas.length === 0 && <div className="farmacia-empty">Aún no hay entradas registradas. Empecemos a cargar el inventario.</div>}
      </div>
    </section>
  );
}

export default HistorialEntradas;
