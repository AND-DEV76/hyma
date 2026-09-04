import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Plus, FlaskConical, Loader2 } from 'lucide-react';
import { createAlergia } from '../../alergia/api/alergiaApi';

/**
 * Selector de Alergias estilo Odoo Many2many Tags.
 * Permite buscar entre las alergias existentes, seleccionarlas como tags
 * y crear una nueva alergia directamente desde el input si no existe.
 */
export default function AlergiasSelector({
  alergias = [],
  selectedIds = [],
  onChange,
  onNuevaAlergia,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Mapa de alergias seleccionadas
  const selectedAlergias = useMemo(() => {
    const idSet = new Set(selectedIds);
    return alergias.filter((a) => idSet.has(a.idAlergia));
  }, [alergias, selectedIds]);

  // Alergias disponibles para seleccionar (filtradas por query y no seleccionadas aún)
  const filteredOptions = useMemo(() => {
    const idSet = new Set(selectedIds);
    const cleanQuery = query.trim().toLowerCase();

    return alergias
      .filter((a) => !idSet.has(a.idAlergia))
      .filter((a) => cleanQuery === '' || a.nombre.toLowerCase().includes(cleanQuery));
  }, [alergias, selectedIds, query]);

  // Determinar si el texto escrito coincide exactamente con alguna alergia existente
  const exactMatchExists = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return true;
    return alergias.some((a) => a.nombre.toLowerCase() === cleanQuery);
  }, [alergias, query]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (alergia) => {
    if (!selectedIds.includes(alergia.idAlergia)) {
      onChange([...selectedIds, alergia.idAlergia]);
    }
    setQuery('');
    setCreateError('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleRemove = (idAlergia, e) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== idAlergia));
  };

  const handleCreateNew = async () => {
    const nombreLimpio = query.trim();
    if (!nombreLimpio) return;

    try {
      setIsCreating(true);
      setCreateError('');
      const nueva = await createAlergia({ nombre: nombreLimpio });

      if (onNuevaAlergia) {
        onNuevaAlergia(nueva);
      }

      // Seleccionar automáticamente la recién creada
      onChange([...selectedIds, nueva.idAlergia]);
      setQuery('');
      setIsOpen(false);
    } catch (err) {
      setCreateError(
        err.response?.data?.errors?.nombre ||
          err.response?.data?.message ||
          'No se pudo crear la alergia.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && query === '' && selectedIds.length > 0) {
      // Eliminar el último tag si el input está vacío y presiona retroceso
      onChange(selectedIds.slice(0, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      } else if (!exactMatchExists && query.trim()) {
        handleCreateNew();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="odoo-tags-wrapper" ref={containerRef}>
      {/* Contenedor tipo Input con Tags integrados */}
      <div
        className={`odoo-tags-box ${isOpen ? 'focused' : ''}`}
        onClick={() => {
          setIsOpen(true);
          if (inputRef.current) inputRef.current.focus();
        }}
      >
        {/* Tags seleccionados */}
        {selectedAlergias.map((alergia) => (
          <span key={alergia.idAlergia} className="odoo-tag-chip">
            <FlaskConical size={12} className="odoo-tag-icon" />
            <span className="odoo-tag-label">{alergia.nombre}</span>
            <button
              type="button"
              onClick={(e) => handleRemove(alergia.idAlergia, e)}
              className="odoo-tag-close"
              title="Quitar alergia"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* Input inline de búsqueda / creación */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setCreateError('');
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedAlergias.length === 0
              ? 'Buscar o escribir para crear alergia...'
              : 'Agregar otra...'
          }
          className="odoo-tags-input"
        />

        {query && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              if (inputRef.current) inputRef.current.focus();
            }}
            className="odoo-tags-clear-btn"
            title="Limpiar texto"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {createError && (
        <div className="odoo-tags-error-msg">
          <span>{createError}</span>
        </div>
      )}

      {/* Menú Desplegable Odoo */}
      {isOpen && (
        <div className="odoo-dropdown-menu" role="listbox">
          {filteredOptions.length > 0 ? (
            <div className="odoo-dropdown-list">
              {filteredOptions.slice(0, 10).map((alergia) => (
                <div
                  key={alergia.idAlergia}
                  onClick={() => handleSelect(alergia)}
                  className="odoo-dropdown-item"
                  role="option"
                  aria-selected="false"
                >
                  <FlaskConical size={14} className="odoo-item-icon" />
                  <span>{alergia.nombre}</span>
                </div>
              ))}
            </div>
          ) : (
            query.trim() !== '' &&
            exactMatchExists && (
              <div className="odoo-dropdown-empty">
                Ya has seleccionado esta alergia.
              </div>
            )
          )}

          {/* Opción Odoo: Crear "X" */}
          {query.trim() !== '' && !exactMatchExists && (
            <div
              onClick={handleCreateNew}
              className={`odoo-dropdown-create-btn ${isCreating ? 'disabled' : ''}`}
            >
              {isCreating ? (
                <>
                  <Loader2 size={14} className="spin-icon" />
                  <span>Creando "{query.trim()}"...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>
                    Crear <strong>"{query.trim()}"</strong>
                  </span>
                </>
              )}
            </div>
          )}

          {filteredOptions.length === 0 && query.trim() === '' && (
            <div className="odoo-dropdown-empty">
              Todas las alergias registradas ya están seleccionadas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

