import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';

/**
 * Breadcrumb Component
 * @param {Array<{ label: string, to?: string, icon?: React.ReactNode }>} items
 * @param {boolean} showHome
 */
export default function Breadcrumb({ items = [], showHome = true }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const homePath = user.nombreRol === 'MEDICO'
    ? '/clinica'
    : (user.nombreRol === 'ENFERMERA' ? '/recepcion' : '/dashboard');

  return (
    <nav aria-label="Navegación secundaria" className="hyma-breadcrumb-nav">
      {showHome && (
        <>
          <div className="hyma-breadcrumb-item">
            <Link to={homePath} className="hyma-breadcrumb-link" title="Inicio">
              <Home size={15} />
              <span>Inicio</span>
            </Link>
          </div>
          {items.length > 0 && (
            <span className="hyma-breadcrumb-separator" aria-hidden="true">
              <ChevronRight size={14} />
            </span>
          )}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <div className="hyma-breadcrumb-item">
              {item.to && !isLast ? (
                <Link to={item.to} className="hyma-breadcrumb-link">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="hyma-breadcrumb-current" aria-current="page">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            </div>

            {!isLast && (
              <span className="hyma-breadcrumb-separator" aria-hidden="true">
                <ChevronRight size={14} />
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
