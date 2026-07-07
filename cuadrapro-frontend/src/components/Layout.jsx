// ==========================================
// CuadraPro - Layout Clean SaaS (Minimalist Floating)
// Firma: MLagunes
// ==========================================
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, CircleDollarSign, Menu, X, ShieldCheck, WifiOff, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);
  const [tema, setTema] = useState(localStorage.getItem('cuadrapro-theme') || 'light');

  useEffect(() => {
    if (tema === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cuadrapro-theme', tema);
  }, [tema]);

  const alternarTema = () => {
    setTema(prev => prev === 'light' ? 'dark' : 'light');
  };

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

  useEffect(() => {
    // Temporizador de inactividad contable: Auto-logout tras 2 minutos (120,000 ms)
    const TIEMPO_INACTIVIDAD = 2 * 60 * 1000;
    let timeoutId;

    const reiniciarTemporizador = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionStorage.setItem('sesionExpiradaInactividad', 'true');
        cerrarSesion();
      }, TIEMPO_INACTIVIDAD);
    };

    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    eventos.forEach((evt) => window.addEventListener(evt, reiniciarTemporizador));

    reiniciarTemporizador();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      eventos.forEach((evt) => window.removeEventListener(evt, reiniciarTemporizador));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-[#0a0a0a] font-sans antialiased overflow-hidden text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
      {/* Overlay móvil */}
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-neutral-950/20 backdrop-blur-sm z-40 md:hidden transition-all duration-300" 
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}

      {/* Sidebar Flotante Clean SaaS */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white dark:bg-[#121212] border-r md:border border-neutral-200/50 dark:border-neutral-800/80 flex flex-col z-50 transform transition-transform duration-300 ease-in-out 
          md:m-4 md:mr-0 md:rounded-2xl md:shadow-premium-md ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100 dark:border-neutral-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-neutral-900 dark:bg-[#1a1a1a] rounded-lg text-white shadow-premium-sm transition-transform hover:scale-105 duration-200 border dark:border-neutral-800/80">
              <ShieldCheck size={16} className="text-b2bHighlight" />
            </div>
            <h1 className="text-sm font-extrabold tracking-tight uppercase text-neutral-900 dark:text-white">
              Cuadra<span className="text-b2bHighlight">Pro</span>
            </h1>
          </div>
          <button className="md:hidden text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors" onClick={() => setMenuAbierto(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          <p className="px-4 mb-4 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Navegación</p>
          {menuItems.map((item) => {
            const activo = location.pathname === item.path;
            return (
              <button 
                key={item.name} 
                onClick={() => { navigate(item.path); setMenuAbierto(false); }} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-[14px] font-semibold group
                  ${activo 
                    ? 'bg-b2bHighlight/10 text-b2bHighlight font-bold border border-b2bHighlight/20 dark:border-b2bHighlight/30' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-950 dark:hover:text-white'}`}
              >
                <span className={`${activo ? 'text-b2bHighlight' : 'text-neutral-400 group-hover:text-neutral-600 transition-colors'}`}>
                  {item.icon}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
          {/* Selector de Tema */}
          <button 
            onClick={alternarTema} 
            className="w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-semibold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {tema === 'light' ? <Moon size={16} className="text-neutral-400" /> : <Sun size={16} className="text-amber-500" />}
              <span>Modo {tema === 'light' ? 'Oscuro' : 'Claro'}</span>
            </div>
            <div className="w-8 h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full p-0.5 transition-colors relative flex items-center shrink-0">
              <motion.div 
                layout 
                className="w-3.5 h-3.5 bg-white dark:bg-b2bHighlight rounded-full shadow"
                animate={{ x: tema === 'light' ? 0 : 12 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>

          <button 
            onClick={cerrarSesion} 
            className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
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
        <header className="h-16 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b md:border border-neutral-200/50 dark:border-neutral-800/80 flex items-center px-6 justify-between z-10 shrink-0 md:m-4 md:rounded-2xl md:shadow-premium-sm transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded-lg transition-colors" 
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú lateral"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xs font-bold text-neutral-900 dark:text-neutral-200 uppercase tracking-widest bg-neutral-100/80 dark:bg-neutral-800/40 px-3 py-1.5 rounded-lg border border-neutral-200/10 dark:border-neutral-800/20">
              {menuItems.find(i => i.path === location.pathname)?.name || 'Panel'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest leading-none mb-1">{userRol}</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-white">{userName}</span>
             </div>
             <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-[#1a1a1a] border border-neutral-800 dark:border-neutral-700 flex items-center justify-center text-xs font-bold text-white shadow-premium-md ring-2 ring-white dark:ring-[#121212]">
                {userInitials}
             </div>
          </div>
        </header>

        {/* Contenedor del contenido principal */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6 scroll-smooth">
          <div className="max-w-[1400px] mx-auto h-full animate-fade-in">
            {children}
          </div>
        </div>

        {/* Barra de Navegación Inferior Móvil (Thumb-friendly) */}
        <nav className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800/80 md:hidden z-40 flex items-center justify-around py-2 px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          {menuItems.map((item) => {
            const activo = location.pathname === item.path;
            return (
              <button 
                key={item.name} 
                onClick={() => { navigate(item.path); setMenuAbierto(false); }} 
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 text-[10px] font-bold relative
                  ${activo ? 'text-neutral-950 dark:text-white' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-350'}`}
                aria-label={`Ir a ${item.name}`}
              >
                <span className={`transition-colors duration-200 ${activo ? 'text-b2bHighlight' : 'text-neutral-400'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {activo && (
                  <span className="absolute -top-1 w-1.5 h-1.5 bg-b2bHighlight rounded-full shadow-[0_0_8px_rgba(0,196,159,0.6)]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
