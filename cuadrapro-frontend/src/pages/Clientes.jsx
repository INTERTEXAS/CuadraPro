// ==========================================
// CuadraPro - Gestor 360 Clean SaaS (Premium Floating)
// Firma: MLagunes
// ==========================================
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Plus, Briefcase, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [formEmpresa, setFormEmpresa] = useState({ nombre_comercial: '', rfc: '', plan_suscripcion: 'Basico' });
  const [formUsuario, setFormUsuario] = useState({ empresa_id: '', nombre_completo: '', email: '', password: '' });
  const [recargaTrigger, setRecargaTrigger] = useState(0);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    let activo = true;
    const cargarClientes = async () => {
      try {
        const token = localStorage.getItem('tokenCuadraPro');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/clientes/lista`, { headers: { Authorization: `Bearer ${token}` } });
        if (activo) {
          setClientes(res.data);
          if (res.data.length > 0 && formUsuario.empresa_id === '') {
            setFormUsuario(prev => ({ ...prev, empresa_id: res.data[0].id }));
          }
        }
      } catch (error) { 
        console.error('Error cargando clientes', error); 
      }
    };

    cargarClientes();
    return () => {
      activo = false;
    };
  }, [recargaTrigger, formUsuario.empresa_id]);

  const registrarCliente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('tokenCuadraPro');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/clientes/registrar`, formEmpresa, { headers: { Authorization: `Bearer ${token}` } });
      success('Empresa dada de alta exitosamente en el directorio.');
      setFormEmpresa({ nombre_comercial: '', rfc: '', plan_suscripcion: 'Basico' });
      setRecargaTrigger(prev => prev + 1);
    } catch (error) { 
      toastError('Error al registrar empresa. Inténtalo de nuevo.'); 
      console.error(error);
    }
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();
    
    // Validación de fortaleza de contraseña: mínimo 8 caracteres, al menos una mayúscula y un número
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formUsuario.password.trim())) {
      toastError('La contraseña temporal debe tener al menos 8 caracteres, una mayúscula y un número.');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/registro`, formUsuario);
      success('Acceso B2B generado. La empresa ya puede operar su bóveda.');
      setFormUsuario({ ...formUsuario, nombre_completo: '', email: '', password: '' });
    } catch (error) { 
      toastError('Error al generar la llave de acceso B2B.'); 
      console.error(error);
    }
  };

  const inputClass = "w-full px-4 py-2.5 text-sm bg-neutral-50/60 dark:bg-[#1b2230] border border-neutral-200/80 dark:border-neutral-800 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight focus:bg-white dark:focus:bg-[#151922] transition-all placeholder:text-neutral-455 dark:placeholder:text-neutral-500 text-neutral-800 dark:text-white";
  const labelClass = "block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 ml-1";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Grid del Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formularios a la izquierda */}
        <div className="space-y-6 lg:col-span-1">
          {/* Formulario 1: Empresa */}
          <motion.div 
            variants={itemVariants} 
            className="bg-white dark:bg-[#151922]/50 p-6 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none hover:shadow-premium-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800/60">
              <div className="p-2 bg-emerald-50 dark:bg-[#00C49F]/10 rounded-lg text-b2bHighlight">
                <Plus size={16} />
              </div>
              <h2 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-widest font-title">1. Perfil de Cliente</h2>
            </div>
            <form onSubmit={registrarCliente} className="space-y-4">
              <div>
                <label className={labelClass}>Razón Social</label>
                <input 
                  type="text" 
                  required 
                  value={formEmpresa.nombre_comercial} 
                  onChange={e => setFormEmpresa({...formEmpresa, nombre_comercial: e.target.value})} 
                  className={inputClass} 
                  placeholder="Ej. Corporativo LAG" 
                />
              </div>
              <div>
                <label className={labelClass}>RFC Fiscal</label>
                <input 
                  type="text" 
                  required 
                  value={formEmpresa.rfc} 
                  onChange={e => setFormEmpresa({...formEmpresa, rfc: e.target.value})} 
                  className={inputClass} 
                  placeholder="ABCD123456XXX" 
                />
              </div>
              <div>
                <label className={labelClass}>Plan Contratado</label>
                <select 
                  value={formEmpresa.plan_suscripcion} 
                  onChange={e => setFormEmpresa({...formEmpresa, plan_suscripcion: e.target.value})} 
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="Basico">Básico (Lite)</option>
                  <option value="Pro">Profesional (Full)</option>
                  <option value="Premium">Enterprise (Custom)</option>
                </select>
              </div>
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit" 
                className="w-full py-3 bg-[#00C49F] hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md border border-[#00C49F]/10"
              >
                Dar de Alta
              </motion.button>
            </form>
          </motion.div>

          {/* Formulario 2: Usuario */}
          <motion.div 
            variants={itemVariants} 
            className="bg-white dark:bg-[#151922]/50 p-6 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none hover:shadow-premium-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800/60">
              <div className="p-2 bg-emerald-55 dark:bg-[#00C49F]/10 rounded-lg text-b2bHighlight">
                <UserPlus size={16} />
              </div>
              <h2 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-widest font-title">2. Llave de Acceso</h2>
            </div>
            <form onSubmit={registrarUsuario} className="space-y-4">
              <div>
                <label className={labelClass}>Vincular a Empresa</label>
                <select 
                  required 
                  value={formUsuario.empresa_id} 
                  onChange={e => setFormUsuario({...formUsuario, empresa_id: e.target.value})} 
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  {Array.isArray(clientes) && clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre_comercial}</option>
                  ))}
                  {(!Array.isArray(clientes) || clientes.length === 0) && (
                    <option value="">No hay empresas disponibles</option>
                  )}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nombre del Titular</label>
                <input 
                  type="text" 
                  required 
                  value={formUsuario.nombre_completo} 
                  onChange={e => setFormUsuario({...formUsuario, nombre_completo: e.target.value})} 
                  className={inputClass} 
                  placeholder="Ej. Juan Pérez" 
                />
              </div>
              <div>
                <label className={labelClass}>Email Administrativo</label>
                <input 
                  type="email" 
                  required 
                  value={formUsuario.email} 
                  onChange={e => setFormUsuario({...formUsuario, email: e.target.value})} 
                  className={inputClass} 
                  placeholder="admin@cliente.com" 
                />
              </div>
              <div>
                <label className={labelClass}>Contraseña Temporal</label>
                <input 
                  type="password" 
                  required 
                  value={formUsuario.password} 
                  onChange={e => setFormUsuario({...formUsuario, password: e.target.value})} 
                  className={inputClass} 
                  placeholder="••••••••" 
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit" 
                disabled={!Array.isArray(clientes) || clientes.length === 0}
                className="w-full py-3 bg-[#00C49F] hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md border border-[#00C49F]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generar Acceso
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Tabla a la derecha */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-[#151922]/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none lg:col-span-2 overflow-hidden hover:shadow-premium-md transition-all duration-300 h-full flex flex-col min-h-[500px]"
        >
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/60 flex justify-between items-center bg-neutral-50/40 dark:bg-neutral-900/10 shrink-0">
            <div className="flex items-center gap-3 text-neutral-550 dark:text-neutral-400">
              <Building2 size={18} />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight font-title">Directorio Maestro B2B</h2>
            </div>
            <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest bg-white dark:bg-neutral-850 px-3 py-1.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800 shadow-premium-sm dark:shadow-none">
              {clientes.length} Empresas Activas
            </span>
          </div>

          {/* Renderizado Condicional: Tabla o Empty State */}
          {Array.isArray(clientes) && clientes.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-850/60 bg-white dark:bg-[#151922]">
                    <th className="px-6 py-4.5 font-bold">Cliente</th>
                    <th className="px-6 py-4.5 font-bold">Identificación Fiscal</th>
                    <th className="px-6 py-4.5 font-bold">Nivel de Cuenta</th>
                    <th className="px-6 py-4.5 font-bold text-center">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850/50">
                  {clientes.map(cliente => (
                    <tr key={cliente.id} className="hover:bg-neutral-50 dark:hover:bg-[#1a2030]/20 transition-premium cursor-pointer group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-8.5 h-8.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-750 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:bg-[#00C49F] group-hover:text-white group-hover:border-b2bHighlight transition-all duration-200 shadow-premium-sm">
                            <Briefcase size={15}/>
                          </div>
                          <span className="text-sm font-semibold text-neutral-800 dark:text-white transition-colors group-hover:text-neutral-950 dark:group-hover:text-white">{cliente.nombre_comercial}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-mono text-neutral-500 dark:text-neutral-400">{cliente.rfc}</td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                          cliente.plan_suscripcion === 'Premium' 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40' 
                            : cliente.plan_suscripcion === 'Pro' 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-100/40' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/10'
                        }`}>
                          {cliente.plan_suscripcion}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center text-xs font-bold text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 dark:group-hover:text-neutral-500 transition-colors">#{cliente.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State Estilizado */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
              <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-750 rounded-2xl flex items-center justify-center text-neutral-450 dark:text-neutral-400 mb-5 shadow-premium-sm animate-pulse">
                <Building2 size={28} />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-1">Directorio vacío</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed font-semibold">
                No hay empresas clientes dadas de alta. Utiliza el formulario de la izquierda para registrar el primer inquilino B2B.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
