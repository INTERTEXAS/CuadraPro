// ==========================================
// CuadraPro - Layout Clean SaaS (Minimalist Floating)
// Firma: buhonero0
// ==========================================
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, CircleDollarSign, Menu, X, ShieldCheck, WifiOff } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);

  const token = localStorage.getItem('tokenCuadraPro');
  let userRol = 'Administrador';
  let userName = 'Usuario';
  let userInitials = 'US';
  if (token) {
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      userRol = payload.rol || 'Administrador';
      userName = payload.nombre || payload.email || 'Usuario';
      // Generar iniciales: tomar la primera letra de cada palabra (máx 2)
      const partes = userName.trim().split(/\s+/);
      userInitials = partes.length >= 2 
        ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
        : userName.substring(0, 2).toUpperCase();
    } catch {
      userRol = 'Administrador';
    }
  }

  const cerrarSesion = () => { localStorage.removeItem('tokenCuadraPro'); navigate('/login'); };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Captura', icon: <CircleDollarSign size={18} />, path: '/captura' }
  ];
  if (userRol === 'SuperAdmin') menuItems.push({ name: 'Clientes', icon: <Users size={18} />, path: '/clientes' });
  menuItems.push({ name: 'Configuración', icon: <Settings size={18} />, path: '/configuracion' });

  useEffect(() => {
    // Interceptor REQUEST: Inyectar token automáticamente en cada petición
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('tokenCuadraPro');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor RESPONSE: Auto-logout en 401 + detección de red caída
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        setSinConexion(false);
        return response;
      },
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expirado o inválido: limpiar y redirigir
          localStorage.removeItem('tokenCuadraPro');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        if (!error.response || error.code === 'ERR_NETWORK') {
          setSinConexion(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <div className="flex h-screen bg-neutral-50 font-sans antialiased overflow-hidden text-neutral-900">
      {/* Overlay móvil */}
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-40 md:hidden transition-all duration-300" 
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}

      {/* Sidebar Flotante Clean SaaS */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r md:border border-neutral-200/50 flex flex-col z-50 transform transition-transform duration-300 ease-in-out 
          md:m-4 md:mr-0 md:rounded-2xl md:shadow-premium-md ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-neutral-900 rounded-lg text-white shadow-premium-sm transition-transform hover:scale-105 duration-200">
              <ShieldCheck size={16} />
            </div>
            <h1 className="text-sm font-extrabold tracking-tight uppercase text-neutral-900">
              Cuadra<span className="text-b2bHighlight">Pro</span>
            </h1>
          </div>
          <button className="md:hidden text-neutral-400 hover:text-neutral-950 transition-colors" onClick={() => setMenuAbierto(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          <p className="px-4 mb-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Navegación</p>
          {menuItems.map((item) => {
            const activo = location.pathname === item.path;
            return (
              <button 
                key={item.name} 
                onClick={() => { navigate(item.path); setMenuAbierto(false); }} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-[14px] font-semibold group
                  ${activo 
                    ? 'bg-neutral-900 text-white shadow-premium-md' 
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950'}`}
              >
                <span className={`${activo ? 'text-b2bHighlight' : 'text-neutral-400 group-hover:text-neutral-600 transition-colors'}`}>
                  {item.icon}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-neutral-100">
          <button 
            onClick={cerrarSesion} 
            className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        {/* Orbes decorativos tenues de fondo (SaaS Premium) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
          <div className="absolute top-[8%] right-[10%] w-[320px] h-[320px] bg-b2bHighlight/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[12%] left-[8%] w-[380px] h-[380px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Banner de Pérdida de Conexión */}
        <AnimatePresence>
          {sinConexion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/15 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-700 shrink-0 z-20"
            >
              <WifiOff size={13} className="animate-pulse text-amber-600" />
              Sin conexión con el servidor de CuadraPro. Algunas funciones pueden no responder.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Flotante con blur */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b md:border border-neutral-200/50 flex items-center px-6 justify-between z-10 shrink-0 md:m-4 md:rounded-2xl md:shadow-premium-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" 
              onClick={() => setMenuAbierto(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest bg-neutral-100/80 px-3 py-1.5 rounded-lg border border-neutral-200/10">
              {menuItems.find(i => i.path === location.pathname)?.name || 'Panel'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">{userRol}</span>
                <span className="text-xs font-bold text-neutral-800">{userName}</span>
             </div>
             <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-white shadow-premium-md ring-2 ring-white">
                {userInitials}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scroll-smooth">
          <div className="max-w-[1400px] mx-auto h-full animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
