import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import React from 'react';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes({ children }) {
  return (
    <Routes>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        const path = child.props.path;
        if (!path || path === '*') {
          return <Route key="wildcard" path="*" element={child.props.element || <NotFoundPage />} />;
        }

        let allowedRoles = [];

        if (path.startsWith('/usuarios') || path === '/farmacia/parametros') allowedRoles = ['ADMIN'];
        else if (path === '/recepcion' || path.startsWith('/preconsulta')) allowedRoles = ['ADMIN', 'ENFERMERA'];
        else if (path.startsWith('/farmacia') || path.startsWith('/reportes')) allowedRoles = ['ADMIN', 'FARMACIA'];
        else if (path.startsWith('/dashboard')) allowedRoles = ['ADMIN', 'FARMACIA'];
        else if (path === '/medicos') allowedRoles = ['ADMIN', 'FARMACIA'];
        else if (path.startsWith('/clinica')) allowedRoles = ['ADMIN', 'MEDICO'];
        else if (path.startsWith('/diagnosticos')) allowedRoles = ['ADMIN', 'MEDICO', 'FARMACIA'];
        else if (path === '/alergias') allowedRoles = ['ADMIN', 'MEDICO', 'FARMACIA'];
        else if (path.startsWith('/tarifas')) allowedRoles = ['ADMIN', 'FARMACIA'];
        else if (path.startsWith('/configuracion')) allowedRoles = ['ADMIN', 'MEDICO', 'FARMACIA'];
        
        return (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute allowedRoles={allowedRoles}>{child.props.element}</ProtectedRoute>}
          />
        );
      })}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
