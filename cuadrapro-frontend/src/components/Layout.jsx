// ==========================================
// CuadraPro - Layout Clean SaaS (Minimalist)
// Firma: buhonero0
// ==========================================
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, CircleDollarSign, Menu, X, ShieldCheck } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const token = localStorage.getItem('tokenCuadraPro');
  let userRol = 'Administrador';
  if (token) {
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      userRol = payload.rol || 'Administrador';
    } catch (e) {}
  }

  const cerrarSesion = () => { localStorage.removeItem('tokenCuadraPro'); navigate('/login'); };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Captura', icon: <CircleDollarSign size={18} />, path: '/captura' }
  ];
  if (userRol === 'SuperAdmin') menuItems.push({ name: 'Clientes', icon: <Users size={18} />, path: '/clientes' });
  menuItems.push({ name: 'Configuración', icon: <Settings size={18} />, path: '/configuracion' });

  return (
    <div className="flex h-screen bg-neutral-50 font-sans antialiased overflow-hidden text-neutral-900">
      {/* Overlay móvil */}
      {menuAbierto && <div className="fixed inset-0 bg-neutral-900/10 backdrop-blur-sm z-40 md:hidden transition-all" onClick={() => setMenuAbierto(false)}></div>}

      {/* Sidebar Minimalista White */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-neutral-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${menuAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-b2bDark rounded-lg text-white"><ShieldCheck size={18} /></div>
            <h1 className="text-sm font-extrabold tracking-tight uppercase text-neutral-900">Cuadra<span className="text-b2bHighlight">Pro</span></h1>
          </div>
          <button className="md:hidden text-neutral-400 hover:text-neutral-900" onClick={() => setMenuAbierto(false)}><X size={20} /></button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          <p className="px-4 mb-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Navegación</p>
          {menuItems.map((item) => {
            const activo = location.pathname === item.path;
            return (
              <button key={item.name} onClick={() => { navigate(item.path); setMenuAbierto(false); }} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-[15px] font-medium ${activo ? 'bg-neutral-100 text-neutral-900 shadow-sm' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}>
                <span className={`${activo ? 'text-b2bHighlight' : 'text-neutral-400 group-hover:text-neutral-600'}`}>{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-neutral-100">
          <button onClick={cerrarSesion} className="w-full flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all">
            <LogOut size={18} /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-50">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 flex items-center px-6 justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" onClick={() => setMenuAbierto(true)}>
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">
              {menuItems.find(i => i.path === location.pathname)?.name || 'Panel'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-tighter leading-none">{userRol}</span>
                <span className="text-xs font-semibold text-neutral-700">Miguel Lagunes</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600 shadow-sm ring-2 ring-white">
                ML
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 scroll-smooth">
          <div className="max-w-[1400px] mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
