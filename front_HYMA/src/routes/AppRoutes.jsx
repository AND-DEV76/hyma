import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import React from 'react';

export default function AppRoutes({ children }) {
  return (
    <Routes>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        const path = child.props.path;
        let allowedRoles = [];

        if (path === '/usuarios' || path === '/alergias' || path === '/farmacia/parametros') allowedRoles = ['ADMIN'];
        else if (path === '/recepcion' || path.startsWith('/preconsulta')) allowedRoles = ['ADMIN', 'ENFERMERA'];
        else if (path.startsWith('/farmacia') || path === '/medicos') allowedRoles = ['ADMIN', 'FARMACIA'];
        else if (path.startsWith('/clinica') || path.startsWith('/diagnosticos')) allowedRoles = ['ADMIN', 'MEDICO'];
        
        return (
          <Route
            path={path}
            element={<ProtectedRoute allowedRoles={allowedRoles}>{child.props.element}</ProtectedRoute>}
          />
        );
      })}
    </Routes>
  );
}
