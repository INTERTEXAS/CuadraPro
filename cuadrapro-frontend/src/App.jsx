// ==========================================
// CuadraPro - Enrutador Maestro B2B
// Firma: MLagunes
// ==========================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Captura from './pages/Captura';
import Configuracion from './pages/Configuracion';
import Reportes from './pages/Reportes';
import Pagos from './pages/Pagos';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          {/* Rutas Privadas: Protegidas por JWT + envueltas en Layout */}
          <Route path="/dashboard" element={<RutaProtegida><Layout><Dashboard /></Layout></RutaProtegida>} />
          <Route path="/captura" element={<RutaProtegida><Layout><Captura /></Layout></RutaProtegida>} />
          <Route path="/clientes" element={<RutaProtegida><Layout><Clientes /></Layout></RutaProtegida>} />
          <Route path="/configuracion" element={<RutaProtegida><Layout><Configuracion /></Layout></RutaProtegida>} />
          <Route path="/reportes" element={<RutaProtegida><Layout><Reportes /></Layout></RutaProtegida>} />
          <Route path="/pagos" element={<RutaProtegida><Layout><Pagos /></Layout></RutaProtegida>} />
          {/* Ruta Comodín 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
