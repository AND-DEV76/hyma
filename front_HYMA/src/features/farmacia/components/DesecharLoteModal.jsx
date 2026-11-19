import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, Layers, Hash, Trash2, ShieldAlert } from 'lucide-react';
import '../styles/farmacia.css';

export default function DesecharLoteModal({
  isOpen,
  onClose,
  onConfirm,
  medicamento,
  lotes = []
}) {
  const [selectedLoteId, setSelectedLoteId] = useState(null);
  const [cantidad, setCantidad] = useState(0);
  const [motivo, setMotivo] = useState('Desechado por vencimiento');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtrar lotes que tienen unidades disponibles, o todos los asociados si no hay con stock
  const lotesDisponibles = lotes.filter((l) => (Number(l.stockDisponible ?? l.cantidadInicial) || 0) > 0);
  const lotesParaSeleccion = lotesDisponibles.length > 0 ? lotesDisponibles : lotes;

  useEffect(() => {
    if (lotesParaSeleccion && lotesParaSeleccion.length > 0) {
      // Priorizar el lote que ya esté vencido o el primero disponible
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const vencido = lotesParaSeleccion.find((l) => {
        if (!l.fechaExpiracion) return false;
        const [y, m, d] = String(l.fechaExpiracion).split('-').map(Number);
        const exp = new Date(y, m - 1, d);
        return exp <= hoy;
      });

      const seleccionado = vencido || lotesParaSeleccion[0];
      setSelectedLoteId(seleccionado.idLote);
      const stock = Number(seleccionado.stockDisponible ?? seleccionado.cantidadInicial) || 0;
      setCantidad(stock > 0 ? stock : 1);
    } else {
      setSelectedLoteId(null);
      setCantidad(1);
    }
    setMotivo('Desechado por vencimiento');
    setErrorMsg('');
  }, [lotes, isOpen]);

  if (!isOpen) return null;

  const loteSeleccionado = lotes.find((l) => l.idLote === Number(selectedLoteId)) || lotesParaSeleccion[0];
  const maxStock = loteSeleccionado ? (Number(loteSeleccionado.stockDisponible ?? loteSeleccionado.cantidadInicial) || 0) : 0;

  const handleLoteChange = (id) => {
    setSelectedLoteId(Number(id));
    const lote = lotes.find((l) => l.idLote === Number(id));
    if (lote) {
      const stock = Number(lote.stockDisponible ?? lote.cantidadInicial) || 0;
      setCantidad(stock > 0 ? stock : 1);
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!selectedLoteId) {
      setErrorMsg('Debe seleccionar un lote para desechar.');
      return;
    }

    const cantNum = parseInt(cantidad, 10);
    if (isNaN(cantNum) || cantNum <= 0) {
      setErrorMsg('La cantidad a desechar debe ser mayor a 0.');
      return;
    }

    if (maxStock > 0 && cantNum > maxStock) {
      setErrorMsg(`No puede desechar más unidades de las disponibles en este lote (${maxStock} uds).`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await onConfirm(selectedLoteId, {
        cantidad: cantNum,
        motivo: motivo.trim() || 'Desechado por vencimiento',
      });
      onClose();
    } catch (err) {
      console.error('Error al desechar lote:', err);
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Error al procesar el desecho del medicamento.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getDiasVencimiento = (fechaStr) => {
    if (!fechaStr) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [y, m, d] = String(fechaStr).split('-').map(Number);
    const exp = new Date(y, m - 1, d);
    return Math.ceil((exp.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  const dias = loteSeleccionado?.fechaExpiracion ? getDiasVencimiento(loteSeleccionado.fechaExpiracion) : null;

  return (
    <div className="farmacia-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="farmacia-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', width: '92%' }}
      >
        {/* Cabecera del Modal */}
        <div
          className="farmacia-modal-header"
          style={{
            borderBottom: '1px solid #fee2e2',
            background: 'linear-gradient(to right, #fef2f2, #ffffff)',
          }}
        >
          <div className="farmacia-modal-title-box">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="farmacia-modal-title" style={{ color: '#991b1b', fontSize: '1.15rem' }}>
                Desechar por Vencimiento
              </h2>
              <p className="farmacia-modal-subtitle" style={{ color: '#b91c1c' }}>
                Baja de inventario por caducidad o deterioro
              </p>
            </div>
          </div>
          <button
            type="button"
            className="farmacia-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="farmacia-modal-form" style={{ padding: '20px' }}>
          {errorMsg && (
            <div
              className="farmacia-alert error"
              style={{ marginBottom: '14px', fontSize: '0.85rem' }}
            >
              {errorMsg}
            </div>
          )}

          {/* Información del Medicamento */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Medicamento
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              {medicamento?.nombre}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
              {medicamento?.presentacion || '—'} {medicamento?.concentracion ? `• ${medicamento.concentracion}` : ''}
            </div>
          </div>

          {/* Selector de Lote si hay más de 1 */}
          {lotesParaSeleccion.length > 1 ? (
            <div className="farmacia-form-group" style={{ marginBottom: '14px' }}>
              <label className="farmacia-form-label" style={{ fontWeight: 600 }}>
                Seleccionar Lote a Desechar:
              </label>
              <select
                className="farmacia-form-input"
                value={selectedLoteId || ''}
                onChange={(e) => handleLoteChange(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              >
                {lotesParaSeleccion.map((l) => (
                  <option key={l.idLote} value={l.idLote}>
                    Lote {l.numeroLote || 'S/L'} | Vence: {l.fechaExpiracion || 'S/F'} | {l.stockDisponible ?? l.cantidadInicial ?? 0} unidades disponibles
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>NO. LOTE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  {loteSeleccionado?.numeroLote || 'S/L'}
                </div>
              </div>
              <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>VENCIMIENTO</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: dias !== null && dias <= 0 ? '#dc2626' : '#1e293b' }}>
                  {loteSeleccionado?.fechaExpiracion || 'S/F'}
                  {dias !== null && dias <= 0 && (
                    <span style={{ fontSize: '0.7rem', color: '#dc2626', display: 'block' }}>
                      (Vencido)
                    </span>
                  )}
                </div>
              </div>
              <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>EN EXISTENCIA</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369a1' }}>
                  {maxStock} unidades
                </div>
              </div>
            </div>
          )}

          {/* Campo de Unidades a Desechar */}
          <div className="farmacia-form-group" style={{ marginBottom: '14px' }}>
            <label className="farmacia-form-label" style={{ fontWeight: 600 }}>
              Unidades a Desechar:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="1"
                max={maxStock > 0 ? maxStock : undefined}
                className="farmacia-form-input"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                style={{ maxWidth: '140px', fontWeight: 700, fontSize: '1rem' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                de <strong>{maxStock}</strong> unidades disponibles en este lote
              </span>
            </div>
          </div>

          {/* Motivo del Desecho */}
          <div className="farmacia-form-group" style={{ marginBottom: '16px' }}>
            <label className="farmacia-form-label" style={{ fontWeight: 600 }}>
              Motivo u Observación:
            </label>
            <input
              type="text"
              className="farmacia-form-input"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Desechado por vencimiento, frasco roto, caducidad..."
              required
            />
          </div>

          {/* Nota de Seguridad */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginBottom: '20px',
            }}
          >
            <ShieldAlert size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.76rem', color: '#92400e', lineHeight: 1.4 }}>
              <strong>Efecto en el sistema:</strong> Las unidades serán dadas de baja del inventario activo y se registrará formalmente como <strong>Salida por Vencimiento</strong> para la columna <em>Medicamento Vencido</em> del Control Mensual. No se borrará ningún dato histórico.
            </div>
          </div>

          {/* Botones de Acción */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '16px',
            }}
          >
            <button
              type="button"
              className="farmacia-btn-secondary"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '8px 16px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedLoteId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
              }}
            >
              <Trash2 size={16} />
              {submitting ? 'Procesando...' : 'Confirmar Desecho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
