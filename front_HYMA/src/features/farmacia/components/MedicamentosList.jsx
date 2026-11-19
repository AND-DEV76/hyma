import { useState, useMemo } from 'react';
import { Search, X, Plus, Edit2, CheckCircle2, XCircle, Pill, ChevronLeft, ChevronRight, AlertTriangle, Clock, AlertOctagon, Trash2, Calendar, PackageX } from 'lucide-react';
import MedicamentoModal from './MedicamentoModal';
import EditarLoteModal from './EditarLoteModal';
import DesecharLoteModal from './DesecharLoteModal';

const ITEMS_PER_PAGE = 12;

function MedicamentosList({
  medicamentos = [],
  lotes = [],
  categorias = [],
  casas = [],
  onSaveMedicamento,
  onSaveLote,
  onDesecharLote,
  soloConExistencias = false,
  mostrarDesactivar = true,
  mostrarBotonNuevo = true,
  titulo = 'Medicamentos Registrados',
  esCatalogo = false,
}) {
  const [buscar, setBuscar] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [casaId, setCasaId] = useState('');
  const [estado, setEstado] = useState('');
  const [filtroVencimiento, setFiltroVencimiento] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Modal State para Editar Lote (Inventario)
  const [isLoteModalOpen, setIsLoteModalOpen] = useState(false);
  const [selectedMedForLote, setSelectedMedForLote] = useState(null);

  // Modal State para Desechar Lote (Inventario)
  const [isDesecharModalOpen, setIsDesecharModalOpen] = useState(false);
  const [selectedMedForDesechar, setSelectedMedForDesechar] = useState(null);

  // Helper para calcular días restantes de vencimiento
  const getDiasParaVencer = (fechaStr) => {
    if (!fechaStr) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [y, m, d] = String(fechaStr).split('-').map(Number);
    const exp = new Date(y, m - 1, d);
    return Math.ceil((exp.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Mapear lotes por idMedicamento para consulta rápida
  const lotesPorMedicamento = useMemo(() => {
    const map = {};
    (lotes || []).forEach((lote) => {
      const id = Number(lote.idMedicamento);
      if (!map[id]) map[id] = [];
      map[id].push(lote);
    });
    return map;
  }, [lotes]);

  // Obtener unidades, precio, días de vencimiento y fecha mínima para cada medicamento
  const getMedMetadata = (item) => {
    const medLotes = lotesPorMedicamento[item.idMedicamento] || [];

    // 1. Unidades (stock disponible)
    let unidades = 0;
    if (medLotes.length > 0) {
      unidades = medLotes
        .filter((l) => l.estado == null || l.estado === 'ACTIVO')
        .reduce((acc, l) => acc + (Number(l.stockDisponible ?? l.cantidadInicial) || 0), 0);
    } else {
      unidades = item.unidades ?? 0;
    }

    // 2. Precio final de venta
    let precio = item.precio;
    if (medLotes.length > 0) {
      const conPrecio = medLotes.filter((l) => l.precioVenta != null || l.precioUnitario != null);
      if (conPrecio.length > 0) {
        const masReciente = conPrecio.reduce((prev, curr) => (curr.idLote > prev.idLote ? curr : prev), conPrecio[0]);
        precio = masReciente.precioVenta != null ? masReciente.precioVenta : masReciente.precioUnitario;
      }
    }

    // 3. Días mínimos para vencer y fecha más próxima
    let diasMinimos = null;
    let fechaMinima = null;
    if (item.proximoVencimiento) {
      diasMinimos = getDiasParaVencer(item.proximoVencimiento);
      fechaMinima = item.proximoVencimiento;
    } else if (medLotes.length > 0) {
      const conFecha = medLotes.filter((l) => l.fechaExpiracion);
      if (conFecha.length > 0) {
        // Encontrar el lote con expiración más próxima o ya vencida
        const ordenados = [...conFecha].sort((a, b) => new Date(a.fechaExpiracion) - new Date(b.fechaExpiracion));
        fechaMinima = ordenados[0].fechaExpiracion;
        diasMinimos = getDiasParaVencer(fechaMinima);
      }
    }

    return { unidades, precio, diasMinimos, fechaMinima };
  };

  // 1. Medicamentos Vencidos (estrictamente por fecha de expiración cumplida)
  const medicamentosVencidos = useMemo(() => {
    return (medicamentos || []).filter((m) => {
      const mLotes = lotesPorMedicamento[m.idMedicamento] || [];
      if (mLotes.length > 0) {
        return mLotes.some((l) => {
          const d = getDiasParaVencer(l.fechaExpiracion);
          return d !== null && d <= 0;
        });
      }
      const d = m.proximoVencimiento ? getDiasParaVencer(m.proximoVencimiento) : null;
      return d !== null && d <= 0;
    });
  }, [medicamentos, lotesPorMedicamento]);

  const countVencidos = medicamentosVencidos.length;

  // 2. Medicamentos Agotados (0 unidades en existencia física)
  const medicamentosAgotados = useMemo(() => {
    return (medicamentos || []).filter((m) => {
      const { unidades } = getMedMetadata(m);
      return (Number(unidades) || 0) === 0;
    });
  }, [medicamentos, lotesPorMedicamento]);

  const countAgotados = medicamentosAgotados.length;

  // 3. Medicamentos con Existencias (stock > 0)
  const medicamentosConExistencias = useMemo(() => {
    return (medicamentos || []).filter((m) => {
      const { unidades } = getMedMetadata(m);
      return (Number(unidades) || 0) > 0;
    });
  }, [medicamentos, lotesPorMedicamento]);

  // Medicamentos base según el filtro activo
  const baseMedicamentos = useMemo(() => {
    if (filtroVencimiento === 'vencidos') {
      return medicamentosVencidos;
    }
    if (filtroVencimiento === 'agotados') {
      return medicamentosAgotados;
    }
    if (!soloConExistencias) return medicamentos;
    return medicamentosConExistencias;
  }, [medicamentos, lotesPorMedicamento, soloConExistencias, filtroVencimiento, medicamentosVencidos, medicamentosAgotados, medicamentosConExistencias]);

  // Conteos de medicamentos vigentes que vencen pronto (de los que tienen stock)
  const count30 = useMemo(() => {
    return medicamentosConExistencias.filter((m) => {
      const { diasMinimos } = getMedMetadata(m);
      return diasMinimos !== null && diasMinimos > 0 && diasMinimos <= 30;
    }).length;
  }, [medicamentosConExistencias, lotesPorMedicamento]);

  const count60 = useMemo(() => {
    return medicamentosConExistencias.filter((m) => {
      const { diasMinimos } = getMedMetadata(m);
      return diasMinimos !== null && diasMinimos > 0 && diasMinimos <= 60;
    }).length;
  }, [medicamentosConExistencias, lotesPorMedicamento]);

  const count90 = useMemo(() => {
    return medicamentosConExistencias.filter((m) => {
      const { diasMinimos } = getMedMetadata(m);
      return diasMinimos !== null && diasMinimos > 0 && diasMinimos <= 90;
    }).length;
  }, [medicamentosConExistencias, lotesPorMedicamento]);

  // Filtering
  const filteredMedicamentos = useMemo(() => {
    return baseMedicamentos.filter((item) => {
      const text = `${item.nombre || ''} ${item.presentacion || ''} ${item.concentracion || ''}`.toLowerCase();
      const matchesSearch = text.includes(buscar.toLowerCase().trim());
      const matchesCat = !categoriaId || String(item.idCategoriaMedicamento) === categoriaId;
      const matchesCasa = !casaId || String(item.idCasaFarmaceutica) === casaId;
      const matchesEstado = estado === '' || String(item.estado) === estado;

      // Filtro de vencimiento (30, 60, 90 días)
      let matchesVencimiento = true;
      if (filtroVencimiento && filtroVencimiento !== 'vencidos' && filtroVencimiento !== 'agotados') {
        const { diasMinimos } = getMedMetadata(item);
        const maxDias = Number(filtroVencimiento);
        matchesVencimiento = diasMinimos !== null && diasMinimos > 0 && diasMinimos <= maxDias;
      }

      return matchesSearch && matchesCat && matchesCasa && matchesEstado && matchesVencimiento;
    });
  }, [baseMedicamentos, buscar, categoriaId, casaId, estado, filtroVencimiento, lotesPorMedicamento]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMedicamentos.length / ITEMS_PER_PAGE));
  const displayedMedicamentos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedicamentos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMedicamentos, currentPage]);

  const handleOpenCreateModal = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    if (soloConExistencias && onSaveLote) {
      setSelectedMedForLote(item);
      setIsLoteModalOpen(true);
    } else {
      setEditingMedicine(item);
      setIsModalOpen(true);
    }
  };

  const handleOpenDesecharModal = (item) => {
    setSelectedMedForDesechar(item);
    setIsDesecharModalOpen(true);
  };

  const handleToggleEstado = async (item) => {
    const nuevoEstado = !item.estado;
    const actionLabel = nuevoEstado ? 'activar' : 'desactivar';
    if (window.confirm(`¿Deseas ${actionLabel} el medicamento "${item.nombre}"?`)) {
      await onSaveMedicamento(item.idMedicamento, {
        nombre: item.nombre,
        presentacion: item.presentacion || null,
        concentracion: item.concentracion || null,
        idCategoriaMedicamento: item.idCategoriaMedicamento ? Number(item.idCategoriaMedicamento) : null,
        idCasaFarmaceutica: item.idCasaFarmaceutica ? Number(item.idCasaFarmaceutica) : null,
        estado: nuevoEstado,
      });
    }
  };

  return (
    <div className="farmacia-medicamentos-view">
      {/* Control Panel Odoo Style */}
      <div className="farmacia-control-panel">
        <div className="farmacia-panel-left">
          <h2 className="farmacia-main-title">{titulo}</h2>
          <span className="farmacia-count-pill">
            <Pill size={14} />
            <strong>{filteredMedicamentos.length}</strong>
            {filteredMedicamentos.length === 1 ? 'medicamento' : 'medicamentos'}
          </span>
        </div>

        <div className="farmacia-panel-right">
          {/* Integrated Search Box */}
          <div className="farmacia-search-box">
            <Search size={16} className="farmacia-search-icon" />
            <input
              type="text"
              className="farmacia-search-input"
              placeholder="Buscar por nombre o concentración..."
              value={buscar}
              onChange={(e) => {
                setBuscar(e.target.value);
                setCurrentPage(1);
              }}
            />
            {buscar && (
              <button
                type="button"
                className="farmacia-search-clear"
                onClick={() => {
                  setBuscar('');
                  setCurrentPage(1);
                }}
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Botón Principal Nuevo */}
          {mostrarBotonNuevo && (
            <button
              type="button"
              className="farmacia-btn-primary"
              onClick={handleOpenCreateModal}
            >
              <Plus size={16} />
              Nuevo Medicamento
            </button>
          )}
        </div>
      </div>

      {/* Botones de Filtro Rápido de Vencimiento */}
      {!esCatalogo && (
        <div className="farmacia-quick-filters-bar" style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: '4px' }}>
            Vencimientos / Stock:
          </span>
          <button
            type="button"
            onClick={() => { setFiltroVencimiento(''); setCurrentPage(1); }}
            className={`farmacia-quick-pill ${filtroVencimiento === '' ? 'active' : ''}`}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid ' + (filtroVencimiento === '' ? '#0077b6' : '#cbd5e1'),
              background: filtroVencimiento === '' ? '#0077b6' : 'white',
              color: filtroVencimiento === '' ? 'white' : '#334155',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Todos ({soloConExistencias ? medicamentosConExistencias.length : medicamentos.length})
          </button>

          <button
            type="button"
            onClick={() => { setFiltroVencimiento('30'); setCurrentPage(1); }}
            className={`farmacia-quick-pill ${filtroVencimiento === '30' ? 'active' : ''}`}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid ' + (filtroVencimiento === '30' ? '#dc2626' : '#fecaca'),
              background: filtroVencimiento === '30' ? '#dc2626' : '#fff5f5',
              color: filtroVencimiento === '30' ? 'white' : '#dc2626',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Clock size={13} />
            Vencen en 30 días ({count30})
          </button>

          <button
            type="button"
            onClick={() => { setFiltroVencimiento('60'); setCurrentPage(1); }}
            className={`farmacia-quick-pill ${filtroVencimiento === '60' ? 'active' : ''}`}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid ' + (filtroVencimiento === '60' ? '#d97706' : '#fed7aa'),
              background: filtroVencimiento === '60' ? '#d97706' : '#fffbeb',
              color: filtroVencimiento === '60' ? 'white' : '#b45309',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Clock size={13} />
            Vencen en 60 días ({count60})
          </button>

          <button
            type="button"
            onClick={() => { setFiltroVencimiento('90'); setCurrentPage(1); }}
            className={`farmacia-quick-pill ${filtroVencimiento === '90' ? 'active' : ''}`}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid ' + (filtroVencimiento === '90' ? '#0077b6' : '#bae6fd'),
              background: filtroVencimiento === '90' ? '#0077b6' : '#f0f9ff',
              color: filtroVencimiento === '90' ? 'white' : '#0077b6',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Clock size={13} />
            Vencen en 90 días ({count90})
          </button>

          <button
            type="button"
            onClick={() => { setFiltroVencimiento('vencidos'); setCurrentPage(1); }}
            className={`farmacia-quick-pill ${filtroVencimiento === 'vencidos' ? 'active' : ''}`}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid ' + (filtroVencimiento === 'vencidos' ? '#991b1b' : '#fecaca'),
              background: filtroVencimiento === 'vencidos' ? '#991b1b' : '#fff5f5',
              color: filtroVencimiento === 'vencidos' ? 'white' : '#991b1b',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <AlertOctagon size={13} />
            Medicamento Vencido ({countVencidos})
          </button>

          <button
            type="button"
            onClick={() => { setFiltroVencimiento('agotados'); setCurrentPage(1); }}
            className={`farmacia-quick-pill ${filtroVencimiento === 'agotados' ? 'active' : ''}`}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid ' + (filtroVencimiento === 'agotados' ? '#475569' : '#cbd5e1'),
              background: filtroVencimiento === 'agotados' ? '#475569' : '#f8fafc',
              color: filtroVencimiento === 'agotados' ? 'white' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <PackageX size={13} />
            Agotados ({countAgotados})
          </button>
        </div>
      )}

      {/* Filter Bar Row */}
      <div className="farmacia-filters-toolbar">
        <div className="farmacia-filter-group">
          <label htmlFor="filter-cat" className="farmacia-filter-label">Categoría:</label>
          <select
            id="filter-cat"
            className="farmacia-filter-select"
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="farmacia-filter-group">
          <label htmlFor="filter-casa" className="farmacia-filter-label">Casa Farmacéutica:</label>
          <select
            id="filter-casa"
            className="farmacia-filter-select"
            value={casaId}
            onChange={(e) => {
              setCasaId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todas las casas</option>
            {casas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="farmacia-filter-group">
          <label htmlFor="filter-estado" className="farmacia-filter-label">Estado:</label>
          <select
            id="filter-estado"
            className="farmacia-filter-select"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        {!esCatalogo && (
          <div className="farmacia-filter-group">
            <label htmlFor="filter-vencimiento" className="farmacia-filter-label">Vencimiento:</label>
            <select
              id="filter-vencimiento"
              className="farmacia-filter-select"
              value={filtroVencimiento}
              onChange={(e) => {
                setFiltroVencimiento(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todos los vencimientos</option>
              <option value="30">Vencen en 30 días</option>
              <option value="60">Vencen en 60 días</option>
              <option value="90">Vencen en 90 días</option>
              <option value="vencidos">Medicamento Vencido</option>
              <option value="agotados">Agotados / Sin Existencias</option>
            </select>
          </div>
        )}

        {(buscar || categoriaId || casaId || estado || (!esCatalogo && filtroVencimiento)) && (
          <button
            type="button"
            className="farmacia-btn-clear-filters"
            onClick={() => {
              setBuscar('');
              setCategoriaId('');
              setCasaId('');
              setEstado('');
              setFiltroVencimiento('');
              setCurrentPage(1);
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="farmacia-table-card">
        <div className="farmacia-table-responsive">
          <table className="farmacia-table">
            <thead>
              <tr>
                <th className="farmacia-th">Medicamento</th>
                <th className="farmacia-th">Presentación</th>
                <th className="farmacia-th">Categoría</th>
                <th className="farmacia-th">Casa Farmacéutica</th>
                {!esCatalogo && (
                  <>
                    <th className="farmacia-th">No. Lote / Vencimiento</th>
                    <th className="farmacia-th" style={{ textAlign: 'center' }}>Unidades</th>
                    <th className="farmacia-th" style={{ textAlign: 'right' }}>Precio</th>
                  </>
                )}
                <th className="farmacia-th">Estado</th>
                <th className="farmacia-th" style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedMedicamentos.map((item) => {
                const { unidades, precio, diasMinimos, fechaMinima } = getMedMetadata(item);
                const cantUnidades = Number(unidades) || 0;

                return (
                  <tr key={item.idMedicamento} className="farmacia-tr">
                    <td className="farmacia-td">
                      <div className="farmacia-med-info">
                        <span className="farmacia-med-name">{item.nombre}</span>
                        <span className="farmacia-med-conc">
                          {item.concentracion || 'Sin concentración especificada'}
                        </span>
                        {!esCatalogo && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' }}>
                            {diasMinimos !== null && diasMinimos <= 90 && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background:
                                    diasMinimos <= 0
                                      ? '#fee2e2'
                                      : diasMinimos <= 30
                                      ? '#fff1f2'
                                      : diasMinimos <= 60
                                      ? '#fef3c7'
                                      : '#e0f2fe',
                                  color:
                                    diasMinimos <= 0
                                      ? '#991b1b'
                                      : diasMinimos <= 30
                                      ? '#dc2626'
                                      : diasMinimos <= 60
                                      ? '#b45309'
                                      : '#0369a1',
                                  border:
                                    '1px solid ' +
                                    (diasMinimos <= 0
                                      ? '#fca5a5'
                                      : diasMinimos <= 30
                                      ? '#fecaca'
                                      : diasMinimos <= 60
                                      ? '#fde68a'
                                      : '#bae6fd'),
                                }}
                              >
                                <Clock size={10} />
                                {diasMinimos < 0
                                  ? `Vencido hace ${Math.abs(diasMinimos)}d`
                                  : diasMinimos === 0
                                  ? 'Vence hoy'
                                  : `Vence en ${diasMinimos}d`}
                                {fechaMinima ? ` (${fechaMinima})` : ''}
                              </span>
                            )}
                            {cantUnidades === 0 && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: '#f1f5f9',
                                  color: '#64748b',
                                  border: '1px solid #cbd5e1',
                                }}
                              >
                                <PackageX size={10} />
                                Agotado
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="farmacia-td">
                      <span className="farmacia-text-subtle">
                        {item.presentacion || '—'}
                      </span>
                    </td>
                    <td className="farmacia-td">
                      {item.categoriaNombre ? (
                        <span className="farmacia-badge-pill category">
                          {item.categoriaNombre}
                        </span>
                      ) : (
                        <span className="farmacia-text-subtle">Sin categoría</span>
                      )}
                    </td>
                    <td className="farmacia-td">
                      <span className="farmacia-text-subtle">
                        {item.casaFarmaceuticaNombre || '—'}
                      </span>
                    </td>
                    {!esCatalogo && (
                      <>
                        <td className="farmacia-td">
                          {(() => {
                            const medLotes = lotesPorMedicamento[item.idMedicamento] || [];
                            if (medLotes.length === 0) {
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span className="farmacia-text-subtle" style={{ fontWeight: 600 }}>S/L</span>
                                  {item.proximoVencimiento ? (
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <Calendar size={11} /> {item.proximoVencimiento}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sin fecha reg.</span>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {medLotes.map((l, i) => {
                                  const diasLote = getDiasParaVencer(l.fechaExpiracion);
                                  const estaVencido = diasLote !== null && diasLote <= 0;
                                  const vencePronto = diasLote !== null && diasLote > 0 && diasLote <= 60;
                                  
                                  const bgBadge = estaVencido ? '#fef2f2' : vencePronto ? '#fffbeb' : '#f8fafc';
                                  const borderBadge = estaVencido ? '#fca5a5' : vencePronto ? '#fde68a' : '#cbd5e1';
                                  const textLote = estaVencido ? '#991b1b' : '#0f172a';
                                  const textFecha = estaVencido ? '#dc2626' : vencePronto ? '#b45309' : '#475569';
                                  const stockLote = l.stockDisponible ?? l.cantidadInicial ?? 0;

                                  return (
                                    <div
                                      key={l.idLote || i}
                                      style={{
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                        background: bgBadge,
                                        border: `1px solid ${borderBadge}`,
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        minWidth: '130px',
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: textLote }}>
                                          {l.numeroLote ? `Lote: ${l.numeroLote}` : 'S/L'}
                                        </span>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: stockLote > 0 ? '#0369a1' : '#94a3b8' }}>
                                          ({stockLote} uds)
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: textFecha, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                        <Calendar size={11} style={{ flexShrink: 0 }} />
                                        <span>
                                          {estaVencido ? 'Venció: ' : 'Vence: '}
                                          {l.fechaExpiracion || 'S/F'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="farmacia-td" style={{ textAlign: 'center' }}>
                          <span
                            className="farmacia-badge-pill"
                            style={{
                              background: cantUnidades > 0 ? '#e0f2fe' : '#fee2e2',
                              color: cantUnidades > 0 ? '#03045e' : '#991b1b',
                              fontWeight: 700,
                              padding: '3px 10px',
                              border: cantUnidades > 0 ? '1px solid #bae6fd' : '1px solid #fecaca',
                            }}
                          >
                            {cantUnidades} {cantUnidades === 1 ? 'unidad' : 'unidades'}
                          </span>
                        </td>
                        <td className="farmacia-td" style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#03045e', fontSize: '0.88rem' }}>
                            {precio != null ? `Q ${Number(precio).toFixed(2)}` : '—'}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="farmacia-td">
                      <span className={`farmacia-status-pill ${item.estado ? 'active' : 'inactive'}`}>
                        {item.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="farmacia-td" style={{ textAlign: 'right' }}>
                      <div className="farmacia-actions-cell">
                        <button
                          type="button"
                          className="farmacia-action-btn edit"
                          onClick={() => handleOpenEditModal(item)}
                          title="Editar medicamento"
                        >
                          <Edit2 size={13} />
                          <span>Editar</span>
                        </button>

                        {onDesecharLote && (
                          <button
                            type="button"
                            className="farmacia-action-btn discard"
                            onClick={() => handleOpenDesecharModal(item)}
                            title={cantUnidades > 0 ? "Desechar medicamento por vencimiento" : "Sin existencias activas para desechar"}
                            disabled={cantUnidades === 0}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 9px',
                              borderRadius: '6px',
                              border: '1px solid ' + (cantUnidades > 0 ? '#fca5a5' : '#e2e8f0'),
                              background: cantUnidades > 0 ? '#fef2f2' : '#f8fafc',
                              color: cantUnidades > 0 ? '#dc2626' : '#94a3b8',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: cantUnidades > 0 ? 'pointer' : 'not-allowed',
                              opacity: cantUnidades > 0 ? 1 : 0.6,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Trash2 size={13} />
                            <span>{cantUnidades === 0 ? 'Desechado' : 'Desechar'}</span>
                          </button>
                        )}

                        {mostrarDesactivar && (
                          <button
                            type="button"
                            className={`farmacia-action-btn ${item.estado ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleEstado(item)}
                            title={item.estado ? 'Desactivar medicamento' : 'Activar medicamento'}
                          >
                            {item.estado ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                            <span>{item.estado ? 'Desactivar' : 'Activar'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMedicamentos.length === 0 && (
            <div className="farmacia-empty-state">
              <Pill size={36} className="farmacia-empty-icon" />
              <h3 className="farmacia-empty-title">
                {medicamentos.length === 0
                  ? 'No hay medicamentos en el catálogo'
                  : 'No se encontraron medicamentos'}
              </h3>
              <p className="farmacia-empty-desc">
                {medicamentos.length === 0
                  ? 'Comienza registrando tu primer medicamento para el inventario.'
                  : 'Intenta ajustar los criterios de búsqueda o filtros aplicados.'}
              </p>
              {medicamentos.length === 0 && (
                <button
                  type="button"
                  className="farmacia-btn-primary"
                  onClick={handleOpenCreateModal}
                  style={{ marginTop: '12px' }}
                >
                  <Plus size={16} />
                  Registrar Primer Medicamento
                </button>
              )}
            </div>
          )}
        </div>

        {/* Paginador */}
        {totalPages > 1 && (
          <div className="farmacia-pagination">
            <button
              type="button"
              className="farmacia-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>

            <span className="farmacia-page-info">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              className="farmacia-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar Medicamento de Catálogo */}
      {isModalOpen && (
        <MedicamentoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMedicine(null);
          }}
          medicineToEdit={editingMedicine}
          medicine={editingMedicine}
          categorias={categorias}
          casas={casas}
          onSave={onSaveMedicamento}
        />
      )}

      {/* Modal de Editar Entrada / Lote de Inventario */}
      {isLoteModalOpen && (
        <EditarLoteModal
          isOpen={isLoteModalOpen}
          onClose={() => {
            setIsLoteModalOpen(false);
            setSelectedMedForLote(null);
          }}
          onSave={onSaveLote}
          medicamento={selectedMedForLote}
          lotes={selectedMedForLote ? lotesPorMedicamento[selectedMedForLote.idMedicamento] || [] : []}
        />
      )}

      {/* Modal de Desechar por Vencimiento */}
      {isDesecharModalOpen && (
        <DesecharLoteModal
          isOpen={isDesecharModalOpen}
          onClose={() => {
            setIsDesecharModalOpen(false);
            setSelectedMedForDesechar(null);
          }}
          onConfirm={async (idLote, data) => {
            if (onDesecharLote) {
              await onDesecharLote(idLote, data);
            }
          }}
          medicamento={selectedMedForDesechar}
          lotes={selectedMedForDesechar ? lotesPorMedicamento[selectedMedForDesechar.idMedicamento] || [] : []}
        />
      )}
    </div>
  );
}

export default MedicamentosList;
