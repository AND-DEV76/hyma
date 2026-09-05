import { Pill, Package, ArrowDownToLine, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

function FarmaciaDashboard({ dashboard, onNavigate }) {
  if (!dashboard) {
    return (
      <div className="farmacia-loading-container">
        <div className="farmacia-spinner" />
        <p>Cargando indicadores de farmacia...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Medicamentos registrados',
      value: dashboard.totalMedicamentos,
      detail: 'Catálogo activo del sistema',
      icon: <Pill size={22} />,
      colorClass: 'stat-blue',
    },
    {
      label: 'Stock disponible',
      value: `${dashboard.stockTotal} und.`,
      detail: 'Existencias en lotes activos',
      icon: <Package size={22} />,
      colorClass: 'stat-teal',
    },
    {
      label: 'Entradas del mes',
      value: dashboard.entradasDelMes,
      detail: 'Movimientos de inventario',
      icon: <ArrowDownToLine size={22} />,
      colorClass: 'stat-cyan',
    },
    {
      label: 'Vencen en 30 días',
      value: dashboard.lotesPorVencer30Dias,
      detail: 'Atención prioritaria',
      icon: <ShieldAlert size={22} />,
      colorClass: 'stat-danger',
    },
    {
      label: 'Vencen en 60 días',
      value: dashboard.lotesPorVencer60Dias,
      detail: 'Planificar rotación/reposición',
      icon: <AlertTriangle size={22} />,
      colorClass: 'stat-warning',
    },
    {
      label: 'Vencen en 90 días',
      value: dashboard.lotesPorVencer90Dias,
      detail: 'Monitoreo preventivo',
      icon: <Clock size={22} />,
      colorClass: 'stat-info',
    },
  ];

  return (
    <div className="farmacia-dashboard-view">
      {/* Stat Cards Grid */}
      <div className="farmacia-dashboard-grid">
        {stats.map((stat) => (
          <article className={`farmacia-stat-card ${stat.colorClass}`} key={stat.label}>
            <div className="farmacia-stat-header">
              <span className="farmacia-stat-label">{stat.label}</span>
              <div className="farmacia-stat-icon-wrap">{stat.icon}</div>
            </div>
            <div className="farmacia-stat-value">{stat.value}</div>
            <div className="farmacia-stat-detail">{stat.detail}</div>
          </article>
        ))}
      </div>

      {dashboard.totalMedicamentos === 0 && (
        <div className="farmacia-empty-banner">
          <div className="farmacia-empty-banner-text">
            <strong>Catálogo vacío</strong>
            <p>Aún no hay medicamentos registrados. Comienza configurando el catálogo o cargando medicamentos.</p>
          </div>
          <button
            className="farmacia-btn-primary"
            type="button"
            onClick={() => onNavigate('catalogos')}
          >
            Configurar Catálogos
          </button>
        </div>
      )}

      {/* Operaciones Rápidas */}
      <section className="farmacia-card farmacia-quick-actions-card">
        <div className="farmacia-card-header">
          <div>
            <h2 className="farmacia-card-title">Centro de Operaciones</h2>
            <p className="farmacia-card-subtitle">Accesos rápidos para la administración de inventario y medicamentos.</p>
          </div>
        </div>

        <div className="farmacia-quick-buttons">
          <button
            type="button"
            className="farmacia-btn-primary"
            onClick={() => onNavigate('medicamentos')}
          >
            <Pill size={16} />
            Ver Medicamentos
          </button>

          <button
            type="button"
            className="farmacia-btn-secondary"
            onClick={() => onNavigate('catalogos')}
          >
            Catálogos y Registro
          </button>

          <button
            type="button"
            className="farmacia-btn-secondary"
            onClick={() => onNavigate('entradas')}
          >
            <ArrowDownToLine size={16} />
            Registrar Entrada
          </button>

          <button
            type="button"
            className="farmacia-btn-secondary"
            onClick={() => onNavigate('lotes')}
          >
            <Package size={16} />
            Consultar Lotes
          </button>
        </div>
      </section>
    </div>
  );
}

export default FarmaciaDashboard;
