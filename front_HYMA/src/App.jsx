import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './features/auth/pages/LoginPage';
import InicioPage from './features/inicio/pages/InicioPage';
import UsuariosPage from './features/usuario/pages/UsuariosPage';
import { AlergiaPage } from './features/alergia/pages/AlergiaPage';
import RecepcionPage from './features/recepcion/pages/RecepcionPage';
import MedicosPage from './features/doctor/pages/MedicosPage';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('user');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/inicio"
        element={
          <PrivateRoute>
            <InicioPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/medicos"
        element={
          <PrivateRoute>
            <MedicosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <UsuariosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/alergias"
        element={
          <PrivateRoute>
            <AlergiaPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/recepcion"
        element={
          <PrivateRoute>
            <RecepcionPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;