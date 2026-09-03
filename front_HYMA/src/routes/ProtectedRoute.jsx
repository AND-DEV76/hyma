import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Componente Guardián de Rutas (ProtectedRoute).
 * - Verifica si existe un token de sesión activo.
 * - Opcionalmente verifica si el rol del usuario está permitido para la ruta.
 * - Si no está autenticado, redirige a /login conservando la ubicación intentada.
 * - Si no tiene el rol necesario, redirige a /inicio.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // 1. Validar autenticación
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Validar autorización por rol si se especifican roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.nombreRol;
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/inicio" replace />;
    }
  }

  // 3. Si cumple con los requisitos, renderizar el componente protegido
  return children;
}

