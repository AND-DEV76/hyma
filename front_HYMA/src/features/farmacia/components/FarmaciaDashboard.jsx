function FarmaciaDashboard({ dashboard, onNavigate }) {
  if (!dashboard) {
    return <div className="farmacia-loading">Cargando indicadores de farmacia...</div>;
  }

  const stats = [
    { label: 'Medicamentos registrados', value: dashboard.totalMedicamentos, detail: 'Catálogo activo del sistema' },
    { label: 'Stock disponible', value: dashboard.stockTotal, detail: 'Unidades en lotes activos' },
    { label: 'Entradas del mes', value: dashboard.entradasDelMes, detail: 'Movimientos registrados' },
    { label: 'Vencen en 30 días', value: dashboard.lotesPorVencer30Dias, detail: 'Revisar con prioridad' },
    { label: 'Vencen en 60 días', value: dashboard.lotesPorVencer60Dias, detail: 'Planificar reposición' },
    { label: 'Vencen en 90 días', value: dashboard.lotesPorVencer90Dias, detail: 'Seguimiento preventivo' },
  ];

  return (
    <>
      <div className="farmacia-grid">
        {stats.map((stat) => (
          <article className="farmacia-stat" key={stat.label}>
            <div className="farmacia-stat-label">{stat.label}</div>
            <div className="farmacia-stat-value">{stat.value}</div>
            <div className="farmacia-stat-detail">{stat.detail}</div>
          </article>
        ))}
      </div>

      {dashboard.totalMedicamentos === 0 && (
        <div className="farmacia-empty farmacia-empty-panel">
          <span>No hay medicamentos ni lotes registrados. Empecemos a cargar el catalogo para comenzar a operar.</span>
          <button className="farmacia-button secondary" type="button" onClick={() => onNavigate('catalogos')}>
            Cargar medicamentos
          </button>
        </div>
      )}

      <section className="farmacia-card" style={{ marginTop: '18px' }}>
        <div className="farmacia-card-header">
          <div>
            <h2>Centro de operaciones</h2>
            <p>Accesos rápidos para mantener actualizado el inventario.</p>
          </div>
        </div>
        <div className="farmacia-actions">
          <button className="farmacia-button primary" onClick={() => onNavigate('catalogos')}>Gestionar medicamentos</button>
          <button className="farmacia-button secondary" onClick={() => onNavigate('entradas')}>Registrar entrada</button>
          <button className="farmacia-button ghost" onClick={() => onNavigate('lotes')}>Consultar lotes</button>
        </div>
      </section>
    </>
  );
}

export default FarmaciaDashboard;
