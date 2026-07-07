import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, Check, Zap, Landmark, BarChart3, Database, KeyRound, 
  Sparkles, Smile, ArrowUpRight, HelpCircle, HeartHandshake, CloudDownload, 
  FileSignature, ArrowLeftRight, CreditCard, Wallet, Cpu, Timer, History, 
  FileSpreadsheet, LineChart, Fingerprint, Users, FileCheck, MessageSquare, 
  XCircle, TrendingDown, AlertCircle, CheckCircle2, UserCheck, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();
  const [planPeriodo, setPlanPeriodo] = useState('mensual'); // 'mensual' | 'anual'
  const [modoComparar, setModoComparar] = useState('con'); // 'con' (Con CuadraPro) | 'sin' (Sin CuadraPro)
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tokenCuadraPro');
    if (token) {
      try {
        const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const expiraEn = payload.exp * 1000;
        if (Date.now() < expiraEn) {
          navigate('/dashboard');
        } else {
          localStorage.removeItem('tokenCuadraPro');
        }
      } catch {
        localStorage.removeItem('tokenCuadraPro');
      }
    }
  }, [navigate]);

  const irAlLogin = () => {
    setSaliendo(true);
    setTimeout(() => {
      navigate('/login');
    }, 450);
  };

  // Apps de la grilla tipo Odoo
  const apps = [
    { nombre: 'Contabilidad', icono: <BarChart3 size={20} />, color: 'bg-emerald-500/10 text-emerald-500', desc: 'Conciliación contable automatizada.' },
    { nombre: 'Descargas SAT', icono: <CloudDownload size={20} />, desc: 'Descarga masiva de XML y metadatos.', color: 'bg-indigo-500/10 text-indigo-500' },
    { nombre: 'Firma SAT', icono: <FileSignature size={20} />, desc: 'Validación de e.firma y vigencia.', color: 'bg-sky-500/10 text-sky-500' },
    { nombre: 'Conciliación SPEI', icono: <ArrowLeftRight size={20} />, desc: 'Cotejo de transferencias SPEI en segundos.', color: 'bg-violet-500/10 text-violet-500' },
    { nombre: 'Comisiones Clip', icono: <CreditCard size={20} />, desc: 'Cálculo de sobretasas y dispersiones.', color: 'bg-rose-500/10 text-rose-500' },
    { nombre: 'Mercado Pago', icono: <Wallet size={20} />, desc: 'Reportes de retenciones e IVA MP.', color: 'bg-blue-500/10 text-blue-500' },
    { nombre: 'Inteligencia Artificial', icono: <Cpu size={20} />, desc: 'Cotejo de descripciones difíciles con IA.', color: 'bg-amber-500/10 text-amber-500' },
    { nombre: 'Bóveda Segura', icono: <KeyRound size={20} />, desc: 'Resguardo encriptado AES-256 de claves.', color: 'bg-teal-500/10 text-teal-500' },
    { nombre: 'Registro de Horas', icono: <Timer size={20} />, desc: 'Tiempos de analistas y despachos.', color: 'bg-orange-500/10 text-orange-500' },
    { nombre: 'Auditoría Activa', icono: <History size={20} />, desc: 'Historial inalterable de cada conciliación.', color: 'bg-cyan-500/10 text-cyan-500' },
    { nombre: 'Reportes Excel', icono: <FileSpreadsheet size={20} />, desc: 'Exportación rápida para auditoría.', color: 'bg-lime-500/10 text-lime-500' },
    { nombre: 'Dashboard B2B', icono: <LineChart size={20} />, desc: 'Analíticas contables ejecutivas.', color: 'bg-purple-500/10 text-purple-500' },
    { nombre: 'Doble Factor (2FA)', icono: <Fingerprint size={20} />, desc: 'Seguridad extendida por PIN único.', color: 'bg-yellow-500/10 text-yellow-500' },
    { nombre: 'Multiusuarios', icono: <Users size={20} />, desc: 'Roles y permisos para contadores.', color: 'bg-pink-500/10 text-pink-500' },
    { nombre: 'Facturas CFDI 4.0', icono: <FileCheck size={20} />, desc: 'Validación de vigencia en el SAT.', color: 'bg-fuchsia-500/10 text-fuchsia-500' },
    { nombre: 'Centro de Soporte', icono: <MessageSquare size={20} />, desc: 'Soporte prioritario corporativo.', color: 'bg-red-500/10 text-red-500' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 45 }}
      animate={{ opacity: saliendo ? 0 : 1, y: saliendo ? -45 : 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#f8f9fa] text-neutral-800 font-sans antialiased relative overflow-x-hidden selection:bg-[#00c49f]/30 selection:text-neutral-900"
    >
      
      {/* Google Fonts link customizado y scroll suave */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Outfit:wght@400;600;800;900&display=swap');
        html {
          scroll-behavior: smooth;
        }
        .font-handwritten {
          font-family: 'Caveat', cursive;
        }
        .font-title {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>

      {/* Header / Barra de Navegación */}
      <header className="sticky top-0 z-50 bg-[#f8f9fa]/90 backdrop-blur-md border-b border-neutral-200/50 px-6 py-4 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 bg-neutral-900 rounded-xl">
              <ShieldCheck className="text-b2bHighlight" size={20} />
            </div>
            <span className="text-lg font-black tracking-tight uppercase text-neutral-900 font-title">
              Cuadra<span className="text-b2bHighlight">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-neutral-500">
            <a href="#features" className="hover:text-neutral-900 transition-colors">Características</a>
            <a href="#mfa-info" className="hover:text-neutral-900 transition-colors">Bóveda y Apps</a>
            <a href="#precios" className="hover:text-neutral-900 transition-colors">Tarifas</a>
          </nav>

          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={irAlLogin}
              className="text-[11px] font-black uppercase tracking-widest text-neutral-600 hover:text-neutral-900 transition-colors px-4 py-2"
            >
              Inicia sesión
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={irAlLogin}
              className="text-[11px] font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-full shadow-md transition-all"
            >
              Pruébalo gratis
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section (Fondo claro con acentos dibujados a mano) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 md:px-12 flex flex-col items-center text-center">
        
        {/* Título Principal */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-neutral-900 tracking-tight leading-[1.1] max-w-5xl font-title uppercase">
          Gestiona todo tu negocio contable desde <br />
          
          {/* Resaltado estilo rotulador amarillo */}
          <span className="relative inline-block px-4 py-1 mt-2 text-neutral-950 before:absolute before:inset-x-0 before:bottom-2 before:top-2 before:-z-10 before:bg-[#ffc043] before:rounded-[8px] before:rotate-[-1.5deg]">
            un solo software
          </span>
        </h1>

        <h2 className="text-3xl md:text-5xl font-extrabold text-neutral-800 tracking-tight mt-6 font-title">
          ¡Sencillo, eficiente y a &nbsp;
          
          {/* Subrayado azul */}
          <span className="relative inline-block after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[6px] after:bg-[#00c49f] after:rounded-full">
            buen precio!
          </span>
        </h2>

        {/* Anotación manuscrita y flechita */}
        <div className="absolute right-[5%] top-[55%] hidden xl:block rotate-[6deg] max-w-[200px]">
          <span className="font-handwritten text-neutral-500 text-xl font-bold leading-none block">
            Desde Mex$ 499.00 al mes <br />
            (SaaS Inicial)
          </span>
          <svg className="w-16 h-16 text-neutral-400 mt-1 ml-4" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,20 Q40,10 70,50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M70,50 L58,45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M70,50 L68,36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 w-full sm:w-auto">
          <motion.button 
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={irAlLogin}
            className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Comienza ahora, es gratis
          </motion.button>
          <motion.a 
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-neutral-200/80 hover:bg-neutral-200 text-neutral-800 font-black text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 border border-neutral-300/40"
          >
            Ver demostración
          </motion.a>
        </div>

        {/* Pequeña tarjeta con la bandera de México vectorizada */}
        <div className="inline-flex items-center gap-2.5 bg-white border border-neutral-200 shadow-sm px-4 py-2 rounded-full mt-6 text-xs font-semibold">
          <div className="w-4 h-3 flex overflow-hidden rounded-[2px] border border-neutral-200">
            <div className="w-1/3 bg-[#006847]"></div>
            <div className="w-1/3 bg-[#ffffff] flex items-center justify-center"><div className="w-1 h-1 bg-[#b22234] rounded-full"></div></div>
            <div className="w-1/3 bg-[#ce1126]"></div>
          </div>
          <span className="text-neutral-500">Curso Contabilidad Guadalajara:</span>
          <button onClick={irAlLogin} className="text-b2bHighlight font-bold hover:underline">Regístrate →</button>
        </div>

      </section>

      {/* Sección del Testimonio Contable flotante estilo Odoo */}
      <section className="bg-neutral-100 py-16 border-t border-b border-neutral-200/60 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative flex flex-col items-center">
          
          {/* Cita Flotante con burbuja */}
          <div className="relative bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-neutral-200 max-w-xl text-center z-10">
            {/* Cola de la burbuja */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-r border-b border-neutral-200 rotate-45"></div>
            
            <p className="text-neutral-800 font-medium italic text-base leading-relaxed">
              "¡Si simplificamos todo el proceso contable, podemos lograr cuadrar lo que sea y enfocar el equipo a crecer!"
            </p>
            <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-4">
              - María González, CFO de Grupo Financiero México
            </span>
          </div>

          {/* Foto de perfil flotante con icono y sticker */}
          <div className="flex items-center gap-4 mt-8">
            <div className="w-14 h-14 rounded-full border-2 border-white shadow-sm overflow-hidden bg-neutral-200 flex items-center justify-center">
              <UserCheck className="text-neutral-500" size={26} />
            </div>
            <div className="bg-[#ffc043] rounded-full p-2.5 shadow-sm text-neutral-950 flex items-center justify-center">
              <Smile size={18} />
            </div>
          </div>

          <h3 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight text-center mt-12 font-title uppercase">
            Mejora la &nbsp;
            <span className="relative inline-block px-1">
              calidad de tu trabajo
              <svg className="absolute bottom-[-6px] left-0 w-full h-[6px]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,0 100,5" stroke="#ea4335" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h3>

        </div>
      </section>

      {/* Grilla Interactiva de Apps tipo Odoo */}
      <section id="mfa-info" className="max-w-7xl mx-auto px-6 py-20 md:px-12 text-center">
        
        <div className="max-w-3xl mx-auto mb-12">
          <h4 className="text-sm font-black text-b2bHighlight uppercase tracking-widest mb-3">Tu ecosistema contable</h4>
          <h3 className="text-3xl md:text-5xl font-black text-neutral-900 uppercase font-title leading-tight">
            Imagina una gran variedad de herramientas a tu alcance.
          </h3>
          <p className="text-neutral-500 text-xs md:text-sm max-w-xl mx-auto mt-4 font-semibold leading-relaxed">
            ¿Quieres conciliar un depósito o validar un CFDI? Hay una aplicación justo para eso. Sin complicaciones, sin costo extra y puedes activarla con un clic.
          </p>
        </div>

        {/* Grilla de iconos de Odoo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5">
          {apps.map((app, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={irAlLogin}
              className="bg-white border border-neutral-200/80 rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer hover:shadow-md hover:border-neutral-300 transition-all aspect-square"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${app.color}`}>
                {app.icono}
              </div>
              <span className="text-[10px] font-black text-neutral-800 uppercase tracking-wider text-center mt-3 leading-tight block w-full truncate">
                {app.nombre}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Switch Interactivo "Con CuadraPro" vs "Sin CuadraPro" */}
        <div className="bg-neutral-100/80 border border-neutral-200 rounded-[32px] p-8 md:p-10 max-w-4xl mx-auto mt-20 text-left relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-neutral-200">
            <div>
              <h4 className="text-lg font-black uppercase text-neutral-900 tracking-tight">Comparativa de Operación Contable</h4>
              <p className="text-neutral-500 text-xs mt-1">Mira la diferencia de automatizar tus conciliaciones bancarias.</p>
            </div>
            
            {/* Control de switch */}
            <div className="flex items-center gap-2.5 bg-white border border-neutral-200 p-1.5 rounded-full shadow-sm">
              <button 
                onClick={() => setModoComparar('sin')}
                className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${modoComparar === 'sin' ? 'bg-[#ea4335] text-white' : 'text-neutral-400'}`}
              >
                Sin CuadraPro
              </button>
              <button 
                onClick={() => setModoComparar('con')}
                className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${modoComparar === 'con' ? 'bg-[#00c49f] text-white' : 'text-neutral-400'}`}
              >
                Con CuadraPro
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {modoComparar === 'sin' ? (
              <motion.div 
                key="sin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-neutral-700"
              >
                <div className="space-y-2">
                  <XCircle className="text-red-500" size={24} />
                  <h5 className="text-xs font-black uppercase text-neutral-900">Conciliación Manual</h5>
                  <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                    Tus analistas pasan horas descargando archivos de Excel del portal del SAT y cotejando contra transferencias una por una. Errores constantes.
                  </p>
                </div>
                <div className="space-y-2">
                  <TrendingDown className="text-red-500" size={24} />
                  <h5 className="text-xs font-black uppercase text-neutral-900">Comisiones Fantasma</h5>
                  <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                    No sabes con exactitud qué comisiones te retiene Clip y Mercado Pago. Descuadres mensuales de dinero sin justificación fiscal.
                  </p>
                </div>
                <div className="space-y-2">
                  <AlertCircle className="text-red-500" size={24} />
                  <h5 className="text-xs font-black uppercase text-neutral-900">Riesgo ante el SAT</h5>
                  <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                    Diferencias de saldos entre tus declaraciones contables y tus estados de cuenta bancarios reales. Riesgo inminente de auditorías.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="con"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-neutral-700"
              >
                <div className="space-y-2">
                  <Zap className="text-emerald-500" size={24} />
                  <h5 className="text-xs font-black uppercase text-[#00c49f]">Cotejo Automático</h5>
                  <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                    Nuestro motor de sincronización coteja depósitos SPEI contra facturas SAT de manera inteligente y en un solo clic. Cero retrasos.
                  </p>
                </div>
                <div className="space-y-2">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  <h5 className="text-xs font-black uppercase text-[#00c49f]">Auditoría de Comisiones</h5>
                  <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                    Cálculo exacto del costo por transacción de comisiones bancarias. Recuperación garantizada de saldos y claridad total.
                  </p>
                </div>
                <div className="space-y-2">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                  <h5 className="text-xs font-black uppercase text-[#00c49f]">Cumplimiento al 100%</h5>
                  <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
                    Reportes contables listos y cotejados para tu declaración fiscal mensual. Tranquilidad absoluta ante el SAT.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </section>

      {/* Características Principales */}
      <section id="features" className="bg-[#0b0f19] text-white py-24 relative overflow-hidden">
        {/* Luces y orbes de fondo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#00c49f]/10 filter blur-[100px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 filter blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-[10px] font-black tracking-widest text-[#00c49f] uppercase mb-3">Seguridad de grado bancario</h2>
            <h3 className="text-3xl md:text-5xl font-black uppercase font-title text-white">Optimizado para mejorar tu productividad</h3>
            <p className="text-neutral-400 text-xs mt-3 leading-relaxed font-semibold">
              Desarrollado bajo los más estrictos estándares de encriptación de datos contables corporativos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl text-left">
              <Zap className="text-[#00c49f] mb-4" size={24} />
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2">Conciliación Instantánea</h4>
              <p className="text-neutral-400 text-xs leading-relaxed font-semibold">
                Sincroniza y asocia comisiones bancarias contra depósitos y facturas XML del SAT en segundos.
              </p>
            </div>
            <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl text-left">
              <Database className="text-blue-400 mb-4" size={24} />
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2">Bóveda Encriptada</h4>
              <p className="text-neutral-400 text-xs leading-relaxed font-semibold">
                Tus credenciales de SPEI y claves CIEC del SAT están protegidas con cifrado AES-256 inalterable.
              </p>
            </div>
            <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl text-left">
              <BarChart3 className="text-purple-400 mb-4" size={24} />
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2">Métricas Financieras</h4>
              <p className="text-neutral-400 text-xs leading-relaxed font-semibold">
                Reportes listos en Excel y PDF para presentar de manera directa en juntas corporativas.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Sección de Tarifas / Precios */}
      <section id="precios" className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:px-12 text-center">
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-[10px] font-black tracking-widest text-[#00c49f] uppercase mb-3">Tarifas Transparentes</h2>
          <h3 className="text-3xl md:text-5xl font-black uppercase text-neutral-900 font-title">Planes diseñados para tu negocio</h3>
          <p className="text-neutral-500 text-xs mt-3 leading-relaxed font-semibold">
            Elige el plan ideal. Todos los planes cuentan con soporte técnico B2B y conciliación garantizada.
          </p>

          {/* Toggle Mensual/Anual */}
          <div className="inline-flex bg-white border border-neutral-200 p-1.5 rounded-full mt-8 shadow-sm">
            <button 
              onClick={() => setPlanPeriodo('mensual')}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${planPeriodo === 'mensual' ? 'bg-[#00c49f] text-neutral-950 shadow-sm' : 'text-neutral-400'}`}
            >
              Mensual
            </button>
            <button 
              onClick={() => setPlanPeriodo('anual')}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${planPeriodo === 'anual' ? 'bg-[#00c49f] text-neutral-950 shadow-sm' : 'text-neutral-400'}`}
            >
              Anual (-20%)
            </button>
          </div>
        </div>

        {/* Grid de precios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan Básico */}
          <div className="p-8 bg-white border border-neutral-200 shadow-sm rounded-[32px] flex flex-col justify-between text-left">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Básico</span>
              <h4 className="text-xl font-black uppercase text-neutral-900 mt-1 font-title">SaaS Inicial</h4>
              <div className="my-6">
                <span className="text-3xl font-black text-neutral-900 font-title">${planPeriodo === 'mensual' ? '499' : '399'}</span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider"> / mes</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed font-semibold mb-6">Ideal para pequeños comercios y profesionistas independientes.</p>
              
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Hasta 1,000 folios CFDI / mes</div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Conexión con 1 Banco</div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Soporte por Email</div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={irAlLogin}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all mt-8 text-center"
            >
              Comenzar prueba
            </motion.button>
          </div>

          {/* Plan Profesional (Recomendado) */}
          <div className="p-8 bg-white border-2 border-[#00c49f] shadow-md rounded-[32px] flex flex-col justify-between text-left relative">
            <span className="absolute top-4 right-4 bg-[#00c49f] text-neutral-950 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Recomendado</span>
            <div>
              <span className="text-[10px] font-black text-[#00c49f] uppercase tracking-widest">Profesional</span>
              <h4 className="text-xl font-black uppercase text-neutral-900 mt-1 font-title">SaaS Crecimiento</h4>
              <div className="my-6">
                <span className="text-3xl font-black text-neutral-900 font-title">${planPeriodo === 'mensual' ? '1,299' : '999'}</span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider"> / mes</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed font-semibold mb-6">Para empresas Medianas que operan multicanal en Clip y Mercado Pago.</p>
              
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> CFDI Ilimitados</div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Bancos Ilimitados (SPEI)</div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Integración con Clip / MP / SAT</div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Soporte Premium 24/7</div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={irAlLogin}
              className="w-full py-3 bg-[#00c49f] hover:bg-emerald-400 text-neutral-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all mt-8 text-center"
            >
              Comenzar prueba
            </motion.button>
          </div>

          {/* Plan Corporativo */}
          <div className="p-8 bg-white border border-neutral-200 shadow-sm rounded-[32px] flex flex-col justify-between text-left">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Corporativo</span>
              <h4 className="text-xl font-black uppercase text-neutral-900 mt-1 font-title">Enterprise B2B</h4>
              <div className="my-6">
                <span className="text-3xl font-black text-neutral-900 font-title">Custom</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed font-semibold mb-6">Solución a la medida con integraciones ERP corporativos (SAP, Oracle).</p>
              
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Integración ERP a la medida</div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Servidor Dedicado / On-premise</div>
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600"><Check size={12} className="text-[#00c49f] shrink-0" /> Account Manager Dedicado</div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={irAlLogin}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all mt-8 text-center"
            >
              Contactar Ventas
            </motion.button>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-200 bg-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight uppercase text-neutral-950 font-title">
              Cuadra<span className="text-b2bHighlight">Pro</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider"> - Bóveda de Conciliación Bancaria</span>
          </div>

          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            © 2026 CuadraPro. Todos los derechos reservados. Cifrado AES-256.
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
