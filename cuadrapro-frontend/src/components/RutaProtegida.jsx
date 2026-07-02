// ==========================================
// CuadraPro - Guardia de Rutas Protegidas
// Firma: MLagunes
// ==========================================
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function RutaProtegida({ children }) {
  const [estado, setEstado] = useState('verificando'); // 'verificando' | 'valido' | 'invalido'

  useEffect(() => {
    const token = localStorage.getItem('tokenCuadraPro');
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado('invalido');
      return;
    }

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const expiraEn = payload.exp * 1000;
      if (Date.now() >= expiraEn) {
        localStorage.removeItem('tokenCuadraPro');

        setEstado('invalido');
      } else {

        setEstado('valido');
      }
    } catch {
      localStorage.removeItem('tokenCuadraPro');

      setEstado('invalido');
    }
  }, []);

  if (estado === 'verificando') {
    return null;
  }

  if (estado === 'invalido') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
