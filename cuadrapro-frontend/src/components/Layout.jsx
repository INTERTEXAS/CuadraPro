// ==========================================
// CuadraPro - Layout Clean SaaS (Minimalist Floating)
// Firma: MLagunes
// ==========================================
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, CircleDollarSign, Menu, X, 
  ShieldCheck, WifiOff, Bell, Search, LineChart, Wallet, Sun, Moon, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);
  const [tema, setTema] = useState(localStorage.getItem('cuadrapro-theme') || 'dark');

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
    { name: 'Inicio', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Directorio B2B', icon: <Users size={18} />, path: '/clientes', hidden: userRol !== 'SuperAdmin' },
    { name: 'Conciliación', icon: <CircleDollarSign size={18} />, path: '/captura' },
    { name: 'Reportes', icon: <LineChart size={18} />, path: '/reportes' },
    { name: 'Comisiones', icon: <Wallet size={18} />, path: '/pagos' },
    { name: 'Configuración', icon: <Settings size={18} />, path: '/configuracion' }
  ];

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

  const [advertenciaInactividad, setAdvertenciaInactividad] = useState(false);
  const [segundosInactividad, setSegundosInactividad] = useState(30);

  useEffect(() => {
    // 2 minutos totales (120 segundos)
    const TIEMPO_LIMITE_SEGUNDOS = 120;
    // Advertencia a los 90 segundos (faltando 30 segundos)
    const TIEMPO_ADVERTENCIA_SEGUNDOS = 90;

    let segundosTranscurridos = 0;
    let intervaloId;

    const tick = () => {
      segundosTranscurridos += 1;
      
      if (segundosTranscurridos >= TIEMPO_LIMITE_SEGUNDOS) {
        clearInterval(intervaloId);
        sessionStorage.setItem('sesionExpiradaInactividad', 'true');
        cerrarSesion();
      } else if (segundosTranscurridos >= TIEMPO_ADVERTENCIA_SEGUNDOS) {
        setAdvertenciaInactividad(true);
        setSegundosInactividad(TIEMPO_LIMITE_SEGUNDOS - segundosTranscurridos);
      } else {
        setAdvertenciaInactividad(false);
      }
    };

    const reiniciarTemporizador = () => {
      segundosTranscurridos = 0;
      setAdvertenciaInactividad(false);
      if (intervaloId) clearInterval(intervaloId);
      intervaloId = setInterval(tick, 1000);
    };

    const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    eventos.forEach((evt) => window.addEventListener(evt, reiniciarTemporizador));

    reiniciarTemporizador();

    return () => {
      if (intervaloId) clearInterval(intervaloId);
      eventos.forEach((evt) => window.removeEventListener(evt, reiniciarTemporizador));
    };
  }, []);

  const fechaActual = new Date().toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const primerNombre = userName.split(' ')[0];

  return (
    <div className="flex h-screen bg-[#f8f9fa] dark:bg-[#0B0F19] font-sans antialiased overflow-hidden text-neutral-600 dark:text-neutral-300 transition-colors duration-300">
      {/* Overlay móvil */}
      {menuAbierto && (
        <div 
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300" 
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}

      {/* Sidebar Flotante Clean SaaS */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white dark:bg-[#0B0F19] border-r border-neutral-200/60 dark:border-neutral-800/60 flex flex-col z-50 transform transition-transform duration-300 ease-in-out 
          md:m-0 md:rounded-none md:shadow-none ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100 dark:border-neutral-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-b2bHighlight/10 rounded-lg text-b2bHighlight shadow-premium-sm transition-transform hover:scale-105 duration-200 border border-b2bHighlight/20">
              <ShieldCheck size={16} />
            </div>
            <h1 className="text-sm font-extrabold tracking-tight uppercase text-neutral-900 dark:text-white font-title">
              Cuadra<span className="text-b2bHighlight">Pro</span>
            </h1>
          </div>
          <button className="md:hidden text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors" onClick={() => setMenuAbierto(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const activo = location.pathname === item.path;
            if (item.hidden) return null;
            return (
              <button 
                key={item.name} 
                onClick={() => { 
                  if (item.path !== '#') {
                    navigate(item.path); 
                  }
                  setMenuAbierto(false); 
                }} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-[14px] font-semibold group
                  ${activo 
                    ? 'bg-b2bHighlight/10 text-b2bHighlight font-bold border border-b2bHighlight/20' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/30 hover:text-neutral-900 dark:hover:text-white border border-transparent'}`}
              >
                <span className={`${activo ? 'text-b2bHighlight' : 'text-neutral-450 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors'}`}>
                  {item.icon}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-2">
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
            className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-neutral-500 dark:text-neutral-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] dark:bg-[#0B0F19] relative overflow-hidden transition-colors duration-300">
        {/* Orbes decorativos tenues de fondo (SaaS Premium) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
          <div className="absolute top-[8%] right-[10%] w-[420px] h-[420px] bg-b2bHighlight/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[12%] left-[8%] w-[480px] h-[480px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Banner de Pérdida de Conexión */}
        <AnimatePresence>
          {sinConexion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 shrink-0 z-20"
            >
              <WifiOff size={13} className="animate-pulse text-amber-500" />
              Sin conexión con el servidor de CuadraPro. Algunas funciones pueden no responder.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header superior idéntico al de la foto */}
        <header className="h-20 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center px-8 justify-between z-10 shrink-0 relative bg-white/80 dark:bg-[#0B0F19]/40 backdrop-blur-md transition-colors duration-300">
          <div className="flex items-center gap-4 w-full max-w-md">
            <button 
              className="md:hidden p-2 -ml-2 text-neutral-450 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded-lg transition-colors" 
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú lateral"
            >
              <Menu size={20} />
            </button>
            
            {/* Buscador Global como el de la foto */}
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={15} />
              <input 
                type="text" 
                placeholder="Búsqueda global..." 
                className="w-full bg-white dark:bg-[#151922]/50 border border-neutral-200 dark:border-neutral-800 focus:border-b2bHighlight/40 focus:outline-none rounded-xl pl-11 pr-4 py-2.5 text-xs text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            {/* Notificaciones flotantes */}
            <div className="flex items-center gap-2 text-neutral-550 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors">
              <span className="text-[11px] font-semibold tracking-wider">Notificaciones</span>
              <div className="relative">
                <Bell size={16} />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#00C49F] rounded-full"></span>
              </div>
            </div>

            {/* Perfil de Usuario Premium (Sarah Jensen, CEO) */}
            <div className="flex items-center gap-3 border-l border-neutral-200 dark:border-neutral-800/80 pl-6">
               <div className="w-9 h-9 rounded-full bg-neutral-150 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-850 dark:text-white shadow-md overflow-hidden">
                  {userInitials === 'US' ? (
                    <span className="text-base pt-0.5">👩‍💼</span>
                  ) : (
                    <span>{userInitials}</span>
                  )}
               </div>
               <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-bold text-neutral-800 dark:text-white leading-none">{userName}</span>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">
                    {userRol === 'SuperAdmin' ? 'Director General' : 'Consultor'}
                  </span>
               </div>
            </div>
          </div>
        </header>

        {/* Contenedor del contenido principal */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-24 md:p-8 scroll-smooth z-10 relative">
          <div className="max-w-[1400px] mx-auto h-full">
            
            {/* Fila de Bienvenida idéntica a la foto */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  ¡Buenos días, {primerNombre}!
                </h2>
                <p className="text-xs text-neutral-400 dark:text-neutral-405 mt-1">
                  Aquí tienes tu resumen de CuadraPro
                </p>
              </div>
              
              <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest bg-white dark:bg-[#151922]/50 border border-neutral-200 dark:border-neutral-850 px-4 py-2 rounded-xl shadow-premium-sm dark:shadow-none">
                {fechaActual}
              </div>
            </div>

            {children}
          </div>
        </div>

        {/* Barra de Navegación Inferior Móvil (Thumb-friendly) */}
        <nav className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-t border-neutral-200/60 dark:border-neutral-800/60 md:hidden z-40 flex items-center justify-around py-2 px-4 shadow-lg transition-colors duration-300">
          {menuItems.map((item) => {
            const activo = location.pathname === item.path;
            if (item.hidden) return null;
            return (
              <button 
                key={item.name} 
                onClick={() => { 
                  if (item.path !== '#') {
                    navigate(item.path); 
                  }
                  setMenuAbierto(false); 
                }} 
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 text-[10px] font-bold relative
                  ${activo ? 'text-neutral-900 dark:text-white' : 'text-neutral-450 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-350'}`}
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

      {/* Advertencia de Inactividad Flotante */}
      <AnimatePresence>
        {advertenciaInactividad && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-[#151922] p-8 rounded-[28px] border border-neutral-250 dark:border-neutral-800 shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600"></div>
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6 border border-amber-100 dark:border-amber-500/20">
                <AlertTriangle size={28} className="animate-bounce" />
              </div>
              <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-2 font-title">¿Sigues ahí?</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                Tu sesión contable de CuadraPro se cerrará por seguridad en <span className="font-mono font-bold text-amber-500 text-sm">{segundosInactividad}</span> segundos debido a inactividad.
              </p>
              <button 
                onClick={() => {
                  // Simular evento para reiniciar
                  window.dispatchEvent(new Event('mousedown'));
                }}
                className="w-full py-3 bg-[#00C49F] hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md border border-[#00C49F]/10"
              >
                Mantener Sesión Activa
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
