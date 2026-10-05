import { Routes, Route, Navigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import LoginPage from './features/auth/pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

function RedirectHome() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.nombreRol === 'MEDICO') return <Navigate to="/clinica" replace />;
  if (user.nombreRol === 'ENFERMERA') return <Navigate to="/recepcion" replace />;
  if (user.nombreRol === 'SOCIAL') return <Navigate to="/social" replace />;
  return <Navigate to="/dashboard" replace />;
}
import RecepcionPage from './features/recepcion/pages/RecepcionPage';
import PreconsultaPage from './features/preconsulta/pages/PreconsultaPage';
import SignosVitalesPage from './features/preconsulta/pages/SignosVitalesPage';
import FarmaciaPortalPage from './features/farmacia/pages/FarmaciaPortalPage';
import FarmaciaPage from './features/farmacia/pages/FarmaciaPage';
import DispensacionHubPage from './features/farmacia/pages/DispensacionHubPage';
import DispensacionColaPage from './features/farmacia/pages/DispensacionColaPage';
import VentaExternaPage from './features/farmacia/pages/VentaExternaPage';
import DispensarMedicamentosPage from './features/farmacia/pages/DispensarMedicamentosPage';
import MedicamentosHubPage from './features/farmacia/pages/MedicamentosHubPage';
import InventarioPage from './features/farmacia/pages/InventarioPage';
import MovimientosPage from './features/farmacia/pages/MovimientosPage';
import CatalogoMedicamentosPage from './features/farmacia/pages/CatalogoMedicamentosPage';
import MedicosPage from './features/doctor/pages/MedicosPage';
import UsuariosPage from './features/usuario/pages/UsuariosPage';
import UsuariosPortalPage from './features/usuario/pages/UsuariosPortalPage';
import AlergiaPage from './features/alergia/pages/AlergiaPage';

import ClinicaPage from './features/clinica/pages/ClinicaPage';
import AtencionMedicaPage from './features/clinica/pages/AtencionMedicaPage';
import DiagnosticosPage from './features/diagnostico/pages/DiagnosticosPage';
import InformesHubPage from './features/reportes/pages/InformesHubPage';
import EstadisticaMensualPage from './features/reportes/pages/EstadisticaMensualPage';
import CasosEspecialesPage from './features/reportes/pages/CasosEspecialesPage';
import InventarioFarmaciaReportePage from './features/reportes/pages/InventarioFarmaciaReportePage';
import HospitalDashboardPage from './features/reportes/pages/HospitalDashboardPage';
import TarifasPage from './features/tarifa/pages/TarifasPage';
import ConfiguracionPage from './features/configuracion/pages/ConfiguracionPage';

import SocialPortalPage from './features/social/pages/SocialPortalPage';
import DashboardReferenciasPage from './features/social/pages/DashboardReferenciasPage';
import ExpedientesSocialPage from './features/social/pages/ExpedientesSocialPage';
import ContactosReferenciasPage from './features/social/pages/ContactosReferenciasPage';

function App() {
  return (
          <Routes>
        <Route path="/" element={<><Navbar /><Hero /></>} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- RUTAS PROTEGIDAS Y ROLES --- */}
        <Route path="/*" element={
          <AppRoutes>
            <Route path="/inicio" element={<RedirectHome />} />
            <Route path="/dashboard" element={<HospitalDashboardPage />} />
            <Route path="/recepcion" element={<RecepcionPage />} />
            <Route path="/preconsulta" element={<PreconsultaPage />} />
            <Route path="/preconsulta/signos" element={<SignosVitalesPage />} />
            <Route path="/farmacia" element={<FarmaciaPortalPage />} />
            <Route path="/farmacia/dispensacion" element={<DispensacionHubPage />} />
            <Route path="/farmacia/dispensacion/consulta" element={<DispensacionColaPage />} />
            <Route path="/farmacia/dispensacion/venta-externa" element={<VentaExternaPage />} />
            <Route path="/farmacia/dispensar" element={<DispensarMedicamentosPage />} />
            <Route path="/farmacia/medicamentos" element={<MedicamentosHubPage />} />
            <Route path="/farmacia/medicamentos/inventario" element={<InventarioPage />} />
            <Route path="/farmacia/medicamentos/movimientos" element={<MovimientosPage />} />
            <Route path="/farmacia/medicamentos/catalogo" element={<CatalogoMedicamentosPage />} />
            <Route path="/farmacia/informes" element={<InformesHubPage />} />
            <Route path="/farmacia/informes/estadistica" element={<EstadisticaMensualPage />} />
            <Route path="/farmacia/informes/inventario-farmacia" element={<InventarioFarmaciaReportePage />} />
            <Route path="/farmacia/informes/casos-especiales" element={<CasosEspecialesPage />} />
            <Route path="/farmacia/inventario/*" element={<FarmaciaPage />} />
            <Route path="/farmacia/inventario" element={<FarmaciaPage />} />
            <Route path="/farmacia/*" element={<FarmaciaPage />} />
            <Route path="/medicos" element={<MedicosPage />} />
            <Route path="/usuarios" element={<UsuariosPortalPage />} />
            <Route path="/usuarios/lista" element={<UsuariosPage />} />
            <Route path="/usuarios/gestion" element={<UsuariosPage />} />
            <Route path="/alergias" element={<AlergiaPage />} />
            
            <Route path="/clinica" element={<ClinicaPage />} />
            <Route path="/clinica/atencion" element={<AtencionMedicaPage />} />
            <Route path="/diagnosticos" element={<DiagnosticosPage />} />
            <Route path="/reportes" element={<InformesHubPage />} />
            <Route path="/reportes/estadistica" element={<EstadisticaMensualPage />} />
            <Route path="/reportes/inventario-farmacia" element={<InventarioFarmaciaReportePage />} />
            <Route path="/reportes/casos-especiales" element={<CasosEspecialesPage />} />
            <Route path="/tarifas" element={<TarifasPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            
            {/* TRABAJO SOCIAL */}
            <Route path="/social" element={<SocialPortalPage />} />
            <Route path="/social/dashboard-referencias" element={<DashboardReferenciasPage />} />
            <Route path="/social/expedientes" element={<ExpedientesSocialPage />} />
            <Route path="/social/contactos" element={<ContactosReferenciasPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </AppRoutes>
        } />
      </Routes>
      );
}

export default App;
