import { Routes, Route } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import LoginPage from './features/auth/pages/LoginPage';
import InicioPage from './features/inicio/pages/InicioPage';
import RecepcionPage from './features/recepcion/pages/RecepcionPage';
import PreconsultaPage from './features/preconsulta/pages/PreconsultaPage';
import SignosVitalesPage from './features/preconsulta/pages/SignosVitalesPage';
import FarmaciaPage from './features/farmacia/pages/FarmaciaPage';
import MedicosPage from './features/doctor/pages/MedicosPage';
import UsuariosPage from './features/usuario/pages/UsuariosPage';
import AlergiaPage from './features/alergia/pages/AlergiaPage';

import ClinicaPage from './features/clinica/pages/ClinicaPage';
import AtencionMedicaPage from './features/clinica/pages/AtencionMedicaPage';
import DiagnosticosPage from './features/diagnostico/pages/DiagnosticosPage';

function App() {
  return (
          <Routes>
        <Route path="/" element={<><Navbar /><Hero /></>} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- RUTAS PROTEGIDAS Y ROLES --- */}
        <Route path="/*" element={
          <AppRoutes>
            <Route path="/inicio" element={<InicioPage />} />
            <Route path="/recepcion" element={<RecepcionPage />} />
            <Route path="/preconsulta" element={<PreconsultaPage />} />
            <Route path="/preconsulta/signos" element={<SignosVitalesPage />} />
            <Route path="/farmacia/*" element={<FarmaciaPage />} />
            <Route path="/medicos" element={<MedicosPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/alergias" element={<AlergiaPage />} />
            
            <Route path="/clinica" element={<ClinicaPage />} />
            <Route path="/clinica/atencion" element={<AtencionMedicaPage />} />
            <Route path="/diagnosticos" element={<DiagnosticosPage />} />
          </AppRoutes>
        } />
      </Routes>
      );
}

export default App;
