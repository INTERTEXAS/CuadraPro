// ==========================================
// CuadraPro - Configuración Maestría SaaS (v2.0 + Soporte)
// Firma: buhonero0
// ==========================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Zap, ShieldCheck, Settings, Users, Server, Activity, ArrowRight, Check, Package, X, HelpCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Configuracion() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState('perfil');
  const [soporteAbierto, setSoporteAbierto] = useState(false);
  const [ticketEnviado, setTicketEnviado] = useState(false);

  const token = localStorage.getItem('tokenCuadraPro');
  let userRol = 'Administrador';
  try {
    if (token) {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      userRol = payload.rol || 'Administrador';
    }
  } catch (e) { console.error("Error decodificando el token."); }

  const planes = [
    { 
      nombre: 'Lite', precio: '$199', desc: 'Ideal para negocios locales pequeños.',
      features: ['Hasta 500 transacciones', 'Dashboard básico', 'Exportación CSV', 'Soporte vía email']
    },
    { 
      nombre: 'Pro B2B', precio: '$499', desc: 'La solución estándar para Pymes.',
      features: ['Transacciones ilimitadas', 'Dashboard Premium', 'Exportación Excel (.xlsx)', 'Gestión multi-usuario', 'Soporte prioritario'],
      actual: userRol !== 'SuperAdmin'
    },
    { 
      nombre: 'Enterprise', precio: 'Custom', desc: 'Para grandes corporativos.',
      features: ['Integración API directa', 'Conciliación bancaria masiva', 'Cuenta Manager dedicado', 'SLA de 99.9%']
    }
  ];

  const manejarTicket = (e) => {
    e.preventDefault();
    setTicketEnviado(true);
    setTimeout(() => {
      setTicketEnviado(false);
      setSoporteAbierto(false);
    }, 2500);
  };

  const springConfig = { type: "spring", stiffness: 300, damping: 30 };
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: springConfig } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* HEADER DINÁMICO */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[10px] font-black uppercase tracking-widest border border-neutral-200">System Core</span>
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tighter">Centro de Control</h2>
          <p className="text-sm text-neutral-400 font-medium mt-1">Configuración global y gestión de servicios.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-neutral-100 p-1.5 rounded-2xl w-fit border border-neutral-200">
           <button onClick={() => setTabActiva('perfil')} className={`px-6 py-2.5 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${tabActiva === 'perfil' ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}>Perfil</button>
           <button onClick={() => setTabActiva('planes')} className={`px-6 py-2.5 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${tabActiva === 'planes' ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}>Planes</button>
           {userRol === 'SuperAdmin' && (
             <button onClick={() => setTabActiva('admin')} className={`px-6 py-2.5 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${tabActiva === 'admin' ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}>Admin</button>
           )}
        </div>
      </motion.div>

      {/* 1. PESTAÑA PERFIL */}
      <AnimatePresence mode="wait">
      {tabActiva === 'perfil' && (
        <motion.div key="perfil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springConfig} className="bg-white p-12 rounded-3xl border border-neutral-200 shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-neutral-50 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-neutral-100"><ShieldCheck size={40} /></div>
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Seguridad de la Bóveda</h3>
            <p className="text-neutral-500 text-sm mt-4 leading-relaxed">Tu sesión está protegida bajo cifrado AES-256. <br/> Actualmente operando como <strong>{userRol}</strong>.</p>
            <div className="mt-10 flex justify-center gap-4">
               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md shadow-neutral-200">Cambiar Password</motion.button>
               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSoporteAbierto(true)} className="px-6 py-2.5 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">Soporte</motion.button>
            </div>
        </motion.div>
      )}

      {/* 2. PESTAÑA PLANES */}
      {tabActiva === 'planes' && (
        <motion.div key="planes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springConfig} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planes.map((plan) => (
              <motion.div whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }} key={plan.nombre} className={`p-8 rounded-3xl border transition-all flex flex-col ${plan.actual ? 'bg-white border-b2bHighlight shadow-xl shadow-b2bHighlight/5 ring-1 ring-b2bHighlight' : 'bg-neutral-50 border-neutral-200 shadow-sm hover:border-neutral-300'}`}>
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-black uppercase tracking-widest text-neutral-400">{plan.nombre}</span>
                     {plan.actual && <span className="px-2 py-0.5 bg-b2bHighlight text-white text-[9px] font-black rounded-full uppercase tracking-tighter">Tu Nivel</span>}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-neutral-900 tracking-tighter">{plan.precio}</span>
                    {plan.precio !== 'Custom' && <span className="text-xs font-bold text-neutral-400">/ mes</span>}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">{plan.desc}</p>
                </div>
                <div className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs font-medium text-neutral-600"><Check size={12} className={plan.actual ? 'text-b2bHighlight' : 'text-neutral-300'} /> {f}</div>
                  ))}
                </div>
                <div className="flex gap-2 w-full mt-auto">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.actual ? 'bg-b2bHighlight text-white hover:bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900'}`}>
                    {plan.actual ? 'Gestionar' : 'Seleccionar Plan'}
                  </motion.button>
                  {plan.actual && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSoporteAbierto(true)} className="px-4 bg-white border border-neutral-200 text-neutral-500 rounded-xl hover:bg-neutral-50 transition-colors">
                       <HelpCircle size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50/30 font-black text-[10px] text-neutral-400 uppercase tracking-widest">Matriz Técnica de Beneficios</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 bg-white">
                    <th className="px-8 py-4">Característica</th>
                    <th className="px-8 py-4 text-center">Lite</th>
                    <th className="px-8 py-4 text-center bg-b2bHighlight/5 text-neutral-900">Pro B2B</th>
                    <th className="px-8 py-4 text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-[11px] font-medium text-neutral-600">
                  <tr className="hover:bg-neutral-50/50 transition-colors"><td className="px-8 py-4 font-bold text-neutral-900">Límite de Transacciones</td><td className="px-8 py-4 text-center">500 / mes</td><td className="px-8 py-4 text-center bg-b2bHighlight/5 font-black text-neutral-900 text-xs">Ilimitado</td><td className="px-8 py-4 text-center italic">Personalizado</td></tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors"><td className="px-8 py-4 font-bold text-neutral-900">Usuarios Administradores</td><td className="px-8 py-4 text-center">1 Usuario</td><td className="px-8 py-4 text-center bg-b2bHighlight/5">Hasta 5 Usuarios</td><td className="px-8 py-4 text-center font-bold text-neutral-900">Ilimitados</td></tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors"><td className="px-8 py-4 font-bold text-neutral-900">Retención de Auditoría</td><td className="px-8 py-4 text-center text-neutral-400">7 días</td><td className="px-8 py-4 text-center bg-b2bHighlight/5">180 días</td><td className="px-8 py-4 text-center">Historial Infinito</td></tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors"><td className="px-8 py-4 font-bold text-neutral-900">Formatos de Exportación</td><td className="px-8 py-4 text-center">Sólo CSV</td><td className="px-8 py-4 text-center bg-b2bHighlight/5 font-bold text-neutral-800">CSV, Excel & PDF</td><td className="px-8 py-4 text-center">Todo + JSON API</td></tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors"><td className="px-8 py-4 font-bold text-neutral-900">Inteligencia de Datos</td><td className="px-8 py-4 text-center">Básica</td><td className="px-8 py-4 text-center bg-b2bHighlight/5">Avanzada (KPIs)</td><td className="px-8 py-4 text-center font-bold text-indigo-600">IA Predictiva</td></tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors"><td className="px-8 py-4 font-bold text-neutral-900">Acceso a API B2B</td><td className="px-8 py-4 text-center text-neutral-300">No disponible</td><td className="px-8 py-4 text-center bg-b2bHighlight/5">Sólo Lectura</td><td className="px-8 py-4 text-center font-bold text-neutral-900">Acceso Total</td></tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors"><td className="px-8 py-4 font-bold text-neutral-900">Soporte Técnico</td><td className="px-8 py-4 text-center text-neutral-400">Email (48h)</td><td className="px-8 py-4 text-center bg-b2bHighlight/5">Chat Prioritario</td><td className="px-8 py-4 text-center font-bold text-indigo-600">Manager 24/7</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. PESTAÑA ADMIN */}
      {tabActiva === 'admin' && userRol === 'SuperAdmin' && (
        <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springConfig} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.button whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }} onClick={() => navigate('/dashboard')} className="group bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm hover:border-b2bHighlight transition-all text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-b2bHighlight/10 transition-colors"></div>
            <div className="p-4 bg-neutral-900 text-white rounded-2xl w-fit mb-6 shadow-xl shadow-neutral-200 group-hover:scale-110 transition-transform"><Server size={28} /></div>
            <h3 className="text-lg font-bold text-neutral-900">Estado de Red</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-6">Salud global de la infraestructura.</p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">Ver Diagnóstico <ArrowRight size={14} /></div>
          </motion.button>
          <motion.button whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }} onClick={() => navigate('/clientes')} className="group bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm hover:border-b2bHighlight transition-all text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-b2bHighlight/10 transition-colors"></div>
            <div className="p-4 bg-neutral-900 text-white rounded-2xl w-fit mb-6 shadow-xl shadow-neutral-200 group-hover:scale-110 transition-transform"><Users size={28} /></div>
            <h3 className="text-lg font-bold text-neutral-900">Gestión de Tenants</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-6">Administración de clientes maestros.</p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-600">Gestionar B2B <ArrowRight size={14} /></div>
          </motion.button>
        </motion.div>
      )}
      </AnimatePresence>

      {/* MODAL SOPORTE TIPO EMIL KOWALSKI */}
      <AnimatePresence>
      {soporteAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setSoporteAbierto(false)}></motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={springConfig} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row border border-neutral-100">
            <div className="bg-neutral-50 p-8 md:w-2/5 border-r border-neutral-100 hidden md:flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-8 text-b2bHighlight">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-emerald-50"><HelpCircle size={24} /></div>
                  <h3 className="font-black uppercase tracking-widest text-xs text-neutral-900">Centro de Ayuda</h3>
                </div>
                <div className="space-y-6">
                  <div><h4 className="text-sm font-bold text-neutral-800 mb-1">¿Sincronización de flujos?</h4><p className="text-xs text-neutral-500 leading-relaxed font-medium">Las métricas se procesan en tiempo real tras cada captura.</p></div>
                  <div><h4 className="text-sm font-bold text-neutral-800 mb-1">¿Cambios en el plan?</h4><p className="text-xs text-neutral-500 leading-relaxed font-medium">El upgrade es automático; el downgrade aplica al siguiente ciclo.</p></div>
                  <div><h4 className="text-sm font-bold text-neutral-800 mb-1">¿Datos en Excel?</h4><p className="text-xs text-neutral-500 leading-relaxed font-medium">Descarga tus reportes estructurados (.xlsx) desde el Dashboard.</p></div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-neutral-200">
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Soporte Nivel 2: Activo</p>
              </div>
            </div>

            <div className="p-8 md:w-3/5 bg-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Crear Ticket</h3>
                  <p className="text-xs text-neutral-400 mt-1 font-medium">Tiempo estimado de respuesta: <span className="text-b2bHighlight font-bold">2 horas</span>.</p>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSoporteAbierto(false)} className="p-2 bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 rounded-full transition-colors"><X size={18} /></motion.button>
              </div>

              <AnimatePresence mode="wait">
              {ticketEnviado ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={springConfig} className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner"><Check size={32} strokeWidth={3} /></div>
                  <div>
                    <h4 className="text-lg font-black text-neutral-900">¡Ticket Registrado!</h4>
                    <p className="text-sm text-neutral-500 mt-1">Tu Asesor CuadraPro ha sido notificado.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={manejarTicket} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">Clasificación de Consulta</label>
                    <select className="w-full px-4 py-3 text-sm font-medium bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all text-neutral-700">
                      <option>Soporte Técnico / Bug</option>
                      <option>Dudas sobre Conciliación</option>
                      <option>Facturación y Pagos</option>
                      <option>Upgrade de Suscripción</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">Descripción del Problema</label>
                    <textarea required rows="4" className="w-full px-4 py-3 text-sm font-medium bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all placeholder:text-neutral-300 resize-none text-neutral-700" placeholder="Detalla cómo podemos ayudarte hoy..."></textarea>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-neutral-200 flex items-center justify-center gap-2 mt-4 transition-colors">
                    <Send size={16} /> Enviar al Centro de Soporte
                  </motion.button>
                </motion.form>
              )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Footer de Seguridad */}
      <motion.div variants={itemVariants} className="pt-10 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-3 text-neutral-400">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Protocolo de Seguridad AES-256 Activo</span>
         </div>
         <p className="text-[10px] font-medium text-neutral-300 uppercase tracking-widest">CuadraPro v1.0.4 • Bóveda Certificada</p>
      </motion.div>
    </motion.div>
  );
}
