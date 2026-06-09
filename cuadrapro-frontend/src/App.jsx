// ==========================================
// CuadraPro - Enrutador Maestro B2B
// Firma: buhonero0
// ==========================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Captura from './pages/Captura';
import Configuracion from './pages/Configuracion';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {/* Rutas Privadas envueltas en el Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/captura" element={<Layout><Captura /></Layout>} />
        <Route path="/clientes" element={<Layout><Clientes /></Layout>} />
        <Route path="/configuracion" element={<Layout><Configuracion /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
