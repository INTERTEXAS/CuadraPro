// ==========================================
// CuadraPro - Gestor 360 Clean SaaS
// Firma: buhonero0
// ==========================================
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Plus, Briefcase, UserPlus, ShieldAlert } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [formEmpresa, setFormEmpresa] = useState({ nombre_comercial: '', rfc: '', plan_suscripcion: 'Basico' });
  const [formUsuario, setFormUsuario] = useState({ empresa_id: '', nombre_completo: '', email: '', password: '' });
  const [mensaje, setMensaje] = useState(null);

  const cargarClientes = async () => {
    try {
      const token = localStorage.getItem('tokenCuadraPro');
      const res = await axios.get('${import.meta.env.VITE_API_URL}/api/v1/clientes/lista', { headers: { Authorization: `Bearer ${token}` } });
      setClientes(res.data);
      if(res.data.length > 0 && formUsuario.empresa_id === '') {
        setFormUsuario(prev => ({...prev, empresa_id: res.data[0].id}));
      }
    } catch (error) { console.error('Error cargando clientes'); }
  };

  useEffect(() => { cargarClientes(); }, []);

  const mostrarAlerta = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const registrarCliente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('tokenCuadraPro');
      await axios.post('${import.meta.env.VITE_API_URL}/api/v1/clientes/registrar', formEmpresa, { headers: { Authorization: `Bearer ${token}` } });
      mostrarAlerta('Empresa dada de alta exitosamente.', 'exito');
      setFormEmpresa({ nombre_comercial: '', rfc: '', plan_suscripcion: 'Basico' });
      cargarClientes();
    } catch (error) { mostrarAlerta('Error al registrar empresa.', 'error'); }
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();
    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/v1/auth/registro', formUsuario);
      mostrarAlerta('Acceso B2B creado. El cliente ya puede entrar a su bóveda.', 'exito');
      setFormUsuario({ ...formUsuario, nombre_completo: '', email: '', password: '' });
    } catch (error) { mostrarAlerta('Error al crear el acceso.', 'error'); }
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all placeholder:text-neutral-400";
  const labelClass = "block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="space-y-10 animate-fade-in">
      {mensaje && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 border ${mensaje.tipo === 'exito' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-red-600 border-red-100'}`}>
          {mensaje.tipo === 'exito' ? <Briefcase size={16}/> : <ShieldAlert size={16}/>}
          {mensaje.texto}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formularios */}
        <div className="space-y-8 lg:col-span-1">
          {/* Empresa */}
          <div className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
              <Plus className="text-b2bHighlight" size={18} />
              <h2 className="text-xs font-black text-neutral-900 uppercase tracking-tighter">1. Perfil de Cliente</h2>
            </div>
            <form onSubmit={registrarCliente} className="space-y-4">
              <div>
                <label className={labelClass}>Razón Social</label>
                <input type="text" required value={formEmpresa.nombre_comercial} onChange={e => setFormEmpresa({...formEmpresa, nombre_comercial: e.target.value})} className={inputClass} placeholder="Ej. Corporativo LAG" />
              </div>
              <div>
                <label className={labelClass}>RFC Fiscal</label>
                <input type="text" required value={formEmpresa.rfc} onChange={e => setFormEmpresa({...formEmpresa, rfc: e.target.value})} className={inputClass} placeholder="ABCD123456XXX" />
              </div>
              <div>
                <label className={labelClass}>Plan Contratado</label>
                <select value={formEmpresa.plan_suscripcion} onChange={e => setFormEmpresa({...formEmpresa, plan_suscripcion: e.target.value})} className={inputClass}>
                  <option value="Basico">Básico (Lite)</option>
                  <option value="Pro">Profesional (Full)</option>
                  <option value="Premium">Enterprise (Custom)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-neutral-900 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-md shadow-neutral-200">Dar de Alta</button>
            </form>
          </div>

          {/* Usuario */}
          <div className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
              <UserPlus className="text-b2bHighlight" size={18} />
              <h2 className="text-xs font-black text-neutral-900 uppercase tracking-tighter">2. Llave de Acceso</h2>
            </div>
            <form onSubmit={registrarUsuario} className="space-y-4">
              <div>
                <label className={labelClass}>Vincular a Empresa</label>
                <select required value={formUsuario.empresa_id} onChange={e => setFormUsuario({...formUsuario, empresa_id: e.target.value})} className={inputClass}>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre_comercial}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nombre del Titular</label>
                <input type="text" required value={formUsuario.nombre_completo} onChange={e => setFormUsuario({...formUsuario, nombre_completo: e.target.value})} className={inputClass} placeholder="Ej. Juan Pérez" />
              </div>
              <div>
                <label className={labelClass}>Email Administrativo</label>
                <input type="email" required value={formUsuario.email} onChange={e => setFormUsuario({...formUsuario, email: e.target.value})} className={inputClass} placeholder="admin@cliente.com" />
              </div>
              <div>
                <label className={labelClass}>Contraseña Temporal</label>
                <input type="password" required value={formUsuario.password} onChange={e => setFormUsuario({...formUsuario, password: e.target.value})} className={inputClass} placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-b2bHighlight text-neutral-900 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500 transition-all shadow-md shadow-emerald-100">Generar Acceso</button>
            </form>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
            <div className="flex items-center gap-3 text-neutral-500">
              <Building2 size={20} />
              <h2 className="text-sm font-bold text-neutral-900">Directorio Maestro B2B</h2>
            </div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-neutral-100">{clientes.length} Empresas Activas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 bg-white">
                  <th className="px-8 py-4">Cliente</th>
                  <th className="px-8 py-4">Identificación Fiscal</th>
                  <th className="px-8 py-4">Nivel de Cuenta</th>
                  <th className="px-8 py-4 text-center">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {clientes.map(cliente => (
                  <tr key={cliente.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-b2bHighlight group-hover:text-white transition-all"><Briefcase size={16}/></div>
                        <span className="text-sm font-semibold text-neutral-800">{cliente.nombre_comercial}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono text-neutral-500">{cliente.rfc}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${cliente.plan_suscripcion === 'Premium' ? 'bg-indigo-50 text-indigo-600' : cliente.plan_suscripcion === 'Pro' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-600'}`}>{cliente.plan_suscripcion}</span>
                    </td>
                    <td className="px-8 py-5 text-center text-xs font-bold text-neutral-300">#{cliente.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
