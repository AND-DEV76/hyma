import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Pill, Check } from 'lucide-react';

function MedicamentoSearchInput({
  medicamentos = [],
  selectedId,
  onSelect,
  onClear,
  placeholder = 'Escribe para buscar medicamento...',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Medicamento actualmente seleccionado
  const selectedMed = useMemo(() => {
    if (!selectedId) return null;
    return medicamentos.find((m) => String(m.idMedicamento) === String(selectedId)) || null;
  }, [medicamentos, selectedId]);

  // Filtrado reactivo en tiempo real
  // Solo filtra cuando hay texto escrito por el usuario
  const filteredMedicamentos = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    const list = medicamentos.filter(
      (m) => m.estado !== false || String(m.idMedicamento) === String(selectedId)
    );

    return list
      .filter((m) => {
        const text = `${m.nombre || ''} ${m.concentracion || ''} ${m.presentacion || ''}`.toLowerCase();
        return text.includes(query);
      })
      .slice(0, 25);
  }, [medicamentos, searchTerm, selectedId]);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Si borró el texto o está vacío, la lista se cierra inmediatamente
    if (value.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleClearInput = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleSelect = (med) => {
    onSelect(med);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleRemoveSelection = () => {
    onClear();
    setSearchTerm('');
    setIsOpen(false);
  };

  const isDropdownVisible = isOpen && searchTerm.trim().length > 0 && !selectedMed;

  return (
    <div
      className={`med-search-container ${isDropdownVisible ? 'is-dropdown-open' : ''}`}
      ref={containerRef}
    >
      {selectedMed ? (
        <div
          className="med-search-selected-pill"
          title={`${selectedMed.nombre} ${selectedMed.concentracion ? '· ' + selectedMed.concentracion : ''}`}
        >
          <Pill size={15} className="med-search-pill-icon" />
          <div className="med-search-pill-content">
            <strong className="med-search-pill-name">{selectedMed.nombre}</strong>
            {selectedMed.concentracion && (
              <span className="med-search-pill-conc">{selectedMed.concentracion}</span>
            )}
          </div>
          <button
            type="button"
            className="med-search-pill-remove"
            onClick={handleRemoveSelection}
            title="Cambiar medicamento"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="med-search-input-wrap">
          <Search size={15} className="med-search-input-icon" />
          <input
            type="text"
            className="med-search-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchTerm.trim().length > 0) {
                setIsOpen(true);
              }
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="med-search-clear-btn"
              onClick={handleClearInput}
              title="Borrar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Popover flotante de coincidencias: solo se muestra cuando hay texto escrito */}
      {isDropdownVisible && (
        <div className="med-search-dropdown">
          {filteredMedicamentos.length > 0 ? (
            <ul className="med-search-results">
              {filteredMedicamentos.map((med) => {
                const isSelected = String(med.idMedicamento) === String(selectedId);
                return (
                  <li
                    key={med.idMedicamento}
                    className={`med-search-item ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleSelect(med)}
                  >
                    <div className="med-search-item-info">
                      <div className="med-search-item-header">
                        <strong className="med-search-item-name">{med.nombre}</strong>
                        {med.concentracion && (
                          <span className="med-search-item-badge">{med.concentracion}</span>
                        )}
                      </div>
                      {med.presentacion && (
                        <span className="med-search-item-sub">{med.presentacion}</span>
                      )}
                    </div>
                    {isSelected && <Check size={14} className="med-search-check" />}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="med-search-empty">
              No se encontraron coincidencias para "<strong>{searchTerm}</strong>"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicamentoSearchInput;
