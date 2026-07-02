// ==========================================
// CuadraPro - Configuración Maestría SaaS (v2.0 + Checkout + Soporte Mail)
// Firma: MLagunes
// ==========================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Users, Server, ArrowRight, Check, X, HelpCircle, Send, Plus, Trash2, Award, CreditCard, Lock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function Configuracion() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState('perfil');
  const [soporteAbierto, setSoporteAbierto] = useState(false);
  const [ticketEnviado, setTicketEnviado] = useState(false);
  const { success, error: toastError } = useToast();

  // Estados para datos de la empresa del usuario
  const [miEmpresa, setMiEmpresa] = useState(null);
  const [planActual, setPlanActual] = useState('Lite');
  const [tasaClip, setTasaClip] = useState(3.60);
  const [tasaMp, setTasaMp] = useState(3.40);
  const [tasaSat, setTasaSat] = useState(8.00);

  // Estados para cambio de contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para historial de auditoría
  const [auditorias, setAuditorias] = useState([]);

  // Estados para soporte
  const [clasificacionTicket, setClasificacionTicket] = useState('Soporte Técnico / Bug');
  const [descripcionTicket, setDescripcionTicket] = useState('');

  // Estados para Checkout Ficticio
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);

  const [colaboradores, setColaboradores] = useState([
    { nombre: 'Sofía Lagunes', email: 'sofia@tallerlag.com', rol: 'Contador' },
    { nombre: 'Carlos Ortiz', email: 'carlos@tallerlag.com', rol: 'Cajero' }
  ]);
  const [nuevoColaborador, setNuevoColaborador] = useState({ nombre: '', email: '', rol: 'Cajero' });

  const token = localStorage.getItem('tokenCuadraPro');
  let userRol = 'Administrador';
  try {
    if (token) {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      userRol = payload.rol || 'Administrador';
    }
  } catch { console.error("Error decodificando el token."); }

  const cargarMiEmpresa = async () => {
    try {
      const respuesta = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/clientes/mi-empresa`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMiEmpresa(respuesta.data);
      setPlanActual(respuesta.data.plan_suscripcion || 'Lite');
      setTasaClip(respuesta.data.tasa_clip ? (parseFloat(respuesta.data.tasa_clip) * 100).toFixed(2) : 3.60);
      setTasaMp(respuesta.data.tasa_mp ? (parseFloat(respuesta.data.tasa_mp) * 100).toFixed(2) : 3.40);
      setTasaSat(respuesta.data.tasa_sat ? (parseFloat(respuesta.data.tasa_sat) * 100).toFixed(2) : 8.00);
    } catch (err) {
      console.error("Error al obtener perfil del inquilino:", err);
    }
  };

  const guardarBoveda = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/clientes/actualizar-boveda`, {
        tasa_clip: parseFloat(tasaClip) / 100,
        tasa_mp: parseFloat(tasaMp) / 100,
        tasa_sat: parseFloat(tasaSat) / 100
      }, { headers: { Authorization: `Bearer ${token}` } });
      success('Bóveda fiscal y tasas de pasarelas guardadas con éxito.');
    } catch {
      toastError('Error al guardar configuración de bóveda.');
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    if (nuevaPassword !== confirmPassword) {
      toastError('Las contraseñas no coinciden.');
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(nuevaPassword.trim())) {
      toastError('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/auth/cambiar-password`, {
        passwordActual, nuevaPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      success('Contraseña actualizada con éxito.');
      setPasswordActual(''); setNuevaPassword(''); setConfirmPassword('');
    } catch (err) {
      toastError(err.response?.data?.error || 'Error al cambiar la contraseña.');
    }
  };

  const cargarAuditorias = async () => {
    try {
      const respuesta = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/clientes/auditorias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditorias(respuesta.data);
    } catch {
      console.error("Error al cargar historial de auditoría");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarMiEmpresa();
    cargarAuditorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planes = [
    { 
      nombre: 'Lite', precio: '$199', desc: 'Ideal para negocios locales pequeños.',
      features: ['Hasta 500 transacciones', 'Dashboard básico', 'Exportación CSV', 'Soporte vía email'],
      actual: planActual.toLowerCase() === 'lite'
    },
    { 
      nombre: 'Pro B2B', precio: '$499', desc: 'La solución estándar para Pymes.',
      features: ['Transacciones ilimitadas', 'Dashboard Premium', 'Exportación Excel (.xlsx)', 'Gestión multi-usuario', 'Soporte prioritario'],
      actual: planActual.toLowerCase() === 'pro b2b' || planActual.toLowerCase() === 'pro'
    },
    { 
      nombre: 'Enterprise', precio: 'Custom', desc: 'Para grandes corporativos.',
      features: ['Integración API directa', 'Conciliación bancaria masiva', 'Cuenta Manager dedicado', 'SLA de 99.9%'],
      actual: planActual.toLowerCase() === 'enterprise'
    }
  ];

  const abrirCheckout = (plan) => {
    if (plan.nombre === 'Enterprise' && plan.precio === 'Custom') {
      setClasificacionTicket('Upgrade de Suscripción');
      setDescripcionTicket('Hola, me interesa contratar el plan Enterprise para mi empresa. Solicito una cotización personalizada.');
      setSoporteAbierto(true);
      return;
    }
    setPlanSeleccionado(plan);
    setCheckoutAbierto(true);
  };

  const procesarPagoFicticio = async (e) => {
    e.preventDefault();
    
    // Validación básica de tarjeta
    if (numeroTarjeta.replace(/\s/g, '').length < 16) {
      toastError('Número de tarjeta incompleto.');
      return;
    }
    if (expiracion.length < 5) {
      toastError('Fecha de expiración incompleta.');
      return;
    }
    if (cvv.length < 3) {
      toastError('Código CVV incompleto.');
      return;
    }

    setProcesandoPago(true);

    setTimeout(async () => {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/clientes/actualizar-plan`, {
          plan_suscripcion: planSeleccionado.nombre
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProcesandoPago(false);
        setPagoCompletado(true);
        success(`¡Plan ${planSeleccionado.nombre} activado exitosamente!`);
        
        await cargarMiEmpresa();

        setTimeout(() => {
          setCheckoutAbierto(false);
          setPagoCompletado(false);
          setPlanSeleccionado(null);
          setNumeroTarjeta('');
          setExpiracion('');
          setCvv('');
        }, 1500);
      } catch (error) {
        console.error(error);
        setProcesandoPago(false);
        toastError('Error al actualizar plan en base de datos.');
      }
    }, 2200);
  };

  const manejarTicket = async (e) => {
    e.preventDefault();
    setTicketEnviado(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/soporte/crear-ticket`, {
        clasificacion: clasificacionTicket,
        descripcion: descripcionTicket
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTimeout(() => {
        setTicketEnviado(false);
        setSoporteAbierto(false);
        setDescripcionTicket('');
        success('Consulta enviada. Recibirás una respuesta en tu correo electrónico.');
      }, 1500);
    } catch (error) {
      console.error(error);
      setTicketEnviado(false);
      toastError('Error al enviar el ticket de ayuda.');
    }
  };

  const agregarColaborador = (e) => {
    e.preventDefault();
    if (!nuevoColaborador.nombre || !nuevoColaborador.email) {
      toastError('Por favor completa todos los campos del colaborador.');
      return;
    }
    setColaboradores([...colaboradores, nuevoColaborador]);
    setNuevoColaborador({ nombre: '', email: '', rol: 'Cajero' });
    success('Colaborador invitado con éxito. Se envió un correo de acceso.');
  };

  const eliminarColaborador = (email) => {
    setColaboradores(colaboradores.filter(c => c.email !== email));
    success('Acceso del colaborador revocado correctamente.');
  };

  // Formateadores de Checkout
  const formatearTarjeta = (val) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setNumeroTarjeta(parts.join(' '));
    } else {
      setNumeroTarjeta(v);
    }
  };

  const formatearExpiracion = (val) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      setExpiracion(`${v.substring(0, 2)}/${v.substring(2, 4)}`);
    } else {
      setExpiracion(v);
    }
  };

  const springConfig = { type: "spring", stiffness: 300, damping: 30 };
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: springConfig } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[10px] font-black uppercase tracking-widest border border-neutral-200">System Core</span>
          </div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tighter">Centro de Control</h2>
          <p className="text-sm text-neutral-400 font-medium mt-1">Configuración global y gestión de servicios.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-neutral-100 p-1.5 rounded-2xl w-fit border border-neutral-200">
           <button onClick={() => setTabActiva('perfil')} className={`px-6 py-2.5 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${tabActiva === 'perfil' ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}>Perfil y Equipo</button>
           <button onClick={() => setTabActiva('boveda')} className={`px-6 py-2.5 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${tabActiva === 'boveda' ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}>Bóvedas</button>
           <button onClick={() => setTabActiva('planes')} className={`px-6 py-2.5 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${tabActiva === 'planes' ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}>Planes y Consumo</button>
           {userRol === 'SuperAdmin' && (
             <button onClick={() => setTabActiva('admin')} className={`px-6 py-2.5 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all ${tabActiva === 'admin' ? 'bg-white text-neutral-900 shadow-md' : 'text-neutral-500 hover:text-neutral-800'}`}>Admin</button>
           )}
        </div>
      </motion.div>

      {/* PESTAÑA PERFIL Y COLABORADORES */}
      <AnimatePresence mode="wait">
      {tabActiva === 'perfil' && (
        <motion.div key="perfil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Registro de Colaboradores */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-premium-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight uppercase">Colaboradores de Equipo</h3>
                  <p className="text-xs text-neutral-400 font-medium">Gestiona accesos y roles de tu organización.</p>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 text-b2bHighlight px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Users size={12} /> {colaboradores.length} Activos
                </div>
              </div>

              <div className="divide-y divide-neutral-100">
                {colaboradores.map((colab) => (
                  <div key={colab.email} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-800">{colab.nombre}</h4>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">{colab.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{colab.rol}</span>
                      <button onClick={() => eliminarColaborador(colab.email)} className="p-2 text-neutral-300 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulario Invitación */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-premium-sm">
              <h3 className="text-sm font-black text-neutral-900 tracking-wider uppercase mb-6 ml-1">Invitar Colaborador</h3>
              <form onSubmit={agregarColaborador} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                  <input type="text" value={nuevoColaborador.nombre} onChange={e => setNuevoColaborador({...nuevoColaborador, nombre: e.target.value})} className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight focus:bg-white transition-all font-semibold text-neutral-800" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
                  <input type="email" value={nuevoColaborador.email} onChange={e => setNuevoColaborador({...nuevoColaborador, email: e.target.value})} className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight focus:bg-white transition-all font-semibold text-neutral-800" placeholder="juan@empresa.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Asignar Rol</label>
                  <div className="flex gap-2">
                    <select value={nuevoColaborador.rol} onChange={e => setNuevoColaborador({...nuevoColaborador, rol: e.target.value})} className="flex-1 px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight focus:bg-white transition-all font-semibold text-neutral-700">
                      <option>Cajero</option>
                      <option>Contador</option>
                      <option>Auditor</option>
                    </select>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="p-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl shadow-md"><Plus size={16} /></motion.button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Información General */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-premium-sm">
              <h3 className="text-lg font-black text-neutral-900 tracking-tight uppercase mb-6">Detalles de Empresa</h3>
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between border-b border-neutral-50 pb-2"><span className="text-neutral-400">Razón Social:</span><span className="text-neutral-800">{miEmpresa?.nombre_comercial || 'Cargando...'}</span></div>
                <div className="flex justify-between border-b border-neutral-50 pb-2"><span className="text-neutral-400">RFC Fiscal:</span><span className="text-neutral-800 font-mono">{miEmpresa?.rfc || 'Cargando...'}</span></div>
                <div className="flex justify-between border-b border-neutral-50 pb-2"><span className="text-neutral-400">Plan Actual:</span><span className="text-b2bHighlight font-black uppercase tracking-wider">{planActual}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Estado de Cuenta:</span><span className="text-emerald-500 font-black uppercase">{miEmpresa?.estado_suscripcion || 'Activa'}</span></div>
              </div>
            </div>

            {/* Cambio de Contraseña */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-premium-sm">
              <h3 className="text-sm font-black text-neutral-900 tracking-wider uppercase mb-6 ml-1">Cambiar Contraseña</h3>
              <form onSubmit={cambiarPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Contraseña Actual</label>
                  <input type="password" value={passwordActual} onChange={e => setPasswordActual(e.target.value)} required className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-semibold text-neutral-800" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Nueva Contraseña</label>
                  <input type="password" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} required className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-semibold text-neutral-800" placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Confirmar Nueva Contraseña</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-semibold text-neutral-800" placeholder="Repetir contraseña" />
                </div>
                <button type="submit" className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md">Actualizar Contraseña</button>
              </form>
            </div>
          </div>

        </motion.div>
      )}

      {/* HISTORIAL DE AUDITORÍA (Visible para todos) */}
      {tabActiva === 'perfil' && auditorias.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white rounded-3xl border border-neutral-200/60 shadow-premium-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Historial de Auditoría</h3>
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200/50">{auditorias.length} eventos</span>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 bg-neutral-50/50 sticky top-0">
                  <th className="px-6 py-3 font-bold">Fecha</th>
                  <th className="px-6 py-3 font-bold">Acción</th>
                  <th className="px-6 py-3 font-bold">Usuario</th>
                  <th className="px-6 py-3 font-bold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100/50">
                {auditorias.slice(0, 30).map((a) => (
                  <tr key={a.id} className="hover:bg-neutral-50/30 transition-all">
                    <td className="px-6 py-3 text-xs text-neutral-500 font-mono whitespace-nowrap">{new Date(a.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-3 text-xs font-bold text-neutral-800">{a.accion?.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-3 text-xs text-neutral-500">{a.nombre_completo || a.email || '—'}</td>
                    <td className="px-6 py-3 text-xs text-neutral-400 font-mono">{a.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      
      {/* PESTAÑA BOVEDAS */}
      {tabActiva === 'boveda' && (
        <motion.div key="boveda" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springConfig} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-premium-sm">
            <h3 className="text-lg font-black text-neutral-900 tracking-tight uppercase mb-6">Tasas de Pasarelas</h3>
            <p className="text-xs text-neutral-400 mb-6 font-medium">Define las tasas de comisión reales cobradas por tus proveedores para alimentar el detector de fugas.</p>
            <form onSubmit={guardarBoveda} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Comisión Clip (%)</label>
                <input type="number" step="0.01" value={tasaClip} onChange={e => setTasaClip(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-semibold text-neutral-800" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Comisión MercadoPago (%)</label>
                <input type="number" step="0.01" value={tasaMp} onChange={e => setTasaMp(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-semibold text-neutral-800" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Retención Fiscal SAT (%)</label>
                <input type="number" step="0.01" value={tasaSat} onChange={e => setTasaSat(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none font-semibold text-neutral-800" />
              </div>
              <button type="submit" className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md">Guardar Tasas Reales</button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-premium-sm opacity-60">
            <h3 className="text-lg font-black text-neutral-900 tracking-tight uppercase mb-6 flex gap-2 items-center"><Lock size={18}/> Credenciales CIEC / API Keys</h3>
            <p className="text-xs text-neutral-400 mb-6 font-medium">Conexión a SAT CIEC y APIs bancarias. Módulo Enterprise restringido en esta demo.</p>
            <div className="space-y-4">
              <input disabled type="password" value="*********" className="w-full px-4 py-2.5 text-xs bg-neutral-100 border border-neutral-200 rounded-xl font-mono text-neutral-400" />
              <input disabled type="password" value="*********" className="w-full px-4 py-2.5 text-xs bg-neutral-100 border border-neutral-200 rounded-xl font-mono text-neutral-400" />
            </div>
          </div>
          
        </motion.div>
      )}

      {/* PESTAÑA PLANES Y CONSUMO */}
      {tabActiva === 'planes' && (
        <motion.div key="planes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springConfig} className="space-y-10">
          
          {/* Widget de Cuotas de SaaS */}
          <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-premium-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="p-2 bg-emerald-50 text-b2bHighlight rounded-xl"><Award size={16} /></div>
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Consumo del Plan (Facturación Mensual)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Barra de progreso 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-neutral-800">Transacciones Conciliadas</span>
                  <span className="font-mono text-neutral-500 font-bold">182 / {planActual.toLowerCase() === 'lite' ? '500' : 'Ilimitado'}</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-b2bHighlight rounded-full transition-all duration-500" style={{ width: planActual.toLowerCase() === 'lite' ? '36.4%' : '5%' }}></div>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium">Cuota mensual del plan {planActual}</p>
              </div>

              {/* Barra de progreso 2 */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-neutral-800">Colaboradores Activos</span>
                  <span className="font-mono text-neutral-500 font-bold">3 / 5</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium">Inquilinos de trabajo activos</p>
              </div>

              {/* Barra de progreso 3 */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-neutral-800">Almacenamiento de Auditoría</span>
                  <span className="font-mono text-neutral-500 font-bold">4.2 MB / 10 MB</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: '42%' }}></div>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium">Historial e imágenes persistidas</p>
              </div>
            </div>
          </div>

          {/* Tarjetas de Planes */}
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
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => plan.actual ? success('Ya estás disfrutando de los beneficios de este plan.') : abrirCheckout(plan)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.actual ? 'bg-b2bHighlight text-white hover:bg-emerald-500 shadow-lg shadow-emerald-100' : 'bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900'}`}>
                    {plan.actual ? 'Activo' : 'Seleccionar Plan'}
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

          {/* Matriz Técnica de Beneficios */}
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

      {/* PESTAÑA ADMIN */}
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

      {/* MODAL DE CHECKOUT FICTICIO */}
      <AnimatePresence>
      {checkoutAbierto && planSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setCheckoutAbierto(false)}></motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={springConfig} className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-[400px] border border-neutral-100 overflow-hidden">
            
            {/* Header del Checkout */}
            <div className="p-6 bg-neutral-900 text-white flex justify-between items-center relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-b2bHighlight/10 rounded-bl-full"></div>
              <div className="flex items-center gap-2 relative z-10">
                <CreditCard size={18} className="text-b2bHighlight" />
                <h3 className="text-xs font-black uppercase tracking-widest">Pago de Membresía</h3>
              </div>
              <button onClick={() => setCheckoutAbierto(false)} className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors relative z-10"><X size={14} /></button>
            </div>

            {/* Contenido */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {pagoCompletado ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-50 text-b2bHighlight rounded-full flex items-center justify-center shadow-inner"><Check size={28} strokeWidth={3} /></div>
                    <div>
                      <h4 className="text-base font-black text-neutral-950 uppercase tracking-tight">¡Suscripción Activada!</h4>
                      <p className="text-xs text-neutral-400 font-semibold mt-1">El plan {planSeleccionado.nombre} está operando.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={procesarPagoFicticio} className="space-y-4">
                    
                    {/* Resumen del Plan */}
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/50 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Plan {planSeleccionado.nombre}</h4>
                        <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Renovación mensual automática</p>
                      </div>
                      <span className="text-xl font-black text-neutral-950">{planSeleccionado.precio}<span className="text-[10px] text-neutral-400 font-semibold">/mes</span></span>
                    </div>

                    {/* Número Tarjeta */}
                    <div>
                      <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Número de Tarjeta</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-3 text-neutral-300" size={14} />
                        <input 
                          type="text" 
                          required 
                          maxLength={19}
                          value={numeroTarjeta}
                          onChange={e => formatearTarjeta(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all font-semibold placeholder:text-neutral-300 text-neutral-700" 
                          placeholder="4000 1234 5678 9010" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiración */}
                      <div>
                        <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">Expiración</label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-3 text-neutral-300" size={14} />
                          <input 
                            type="text" 
                            required 
                            maxLength={5}
                            value={expiracion}
                            onChange={e => formatearExpiracion(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all font-semibold placeholder:text-neutral-300 text-neutral-700" 
                            placeholder="MM/AA" 
                          />
                        </div>
                      </div>
                      {/* CVV */}
                      <div>
                        <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-1">CVV</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 text-neutral-300" size={14} />
                          <input 
                            type="password" 
                            required 
                            maxLength={3}
                            value={cvv}
                            onChange={e => setCvv(e.target.value.replace(/[^0-9]/gi, ''))}
                            className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all font-semibold placeholder:text-neutral-300 text-neutral-700" 
                            placeholder="123" 
                          />
                        </div>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }} 
                      type="submit" 
                      disabled={procesandoPago}
                      className="w-full py-3 bg-neutral-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                      {procesandoPago ? 'Procesando Pago B2B...' : `Pagar ${planSeleccionado.precio}`}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
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
                    <h4 className="text-lg font-black text-neutral-900">¡Ticket Enviado!</h4>
                    <p className="text-sm text-neutral-500 mt-1">Recibirás respuesta directa en tu buzón.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={manejarTicket} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">Clasificación de Consulta</label>
                    <select value={clasificacionTicket} onChange={e => setClasificacionTicket(e.target.value)} className="w-full px-4 py-3 text-sm font-medium bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all text-neutral-700">
                      <option>Soporte Técnico / Bug</option>
                      <option>Dudas sobre Conciliación</option>
                      <option>Facturación y Pagos</option>
                      <option>Upgrade de Suscripción</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">Descripción del Problema</label>
                    <textarea required value={descripcionTicket} onChange={e => setDescripcionTicket(e.target.value)} rows="4" className="w-full px-4 py-3 text-sm font-medium bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all placeholder:text-neutral-300 resize-none text-neutral-700" placeholder="Detalla cómo podemos ayudarte hoy..."></textarea>
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

      {/* Footer */}
      <motion.div variants={itemVariants} className="pt-10 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-3 text-neutral-400">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Protocolo de Seguridad AES-256 Activo</span>
         </div>
         <p className="text-[10px] font-medium text-neutral-300 uppercase tracking-widest">CuadraPro v1.0.5 • Bóveda Certificada</p>
      </motion.div>
    </motion.div>
  );
}
