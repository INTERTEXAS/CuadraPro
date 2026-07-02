// ==========================================
// CuadraPro - Login Clean SaaS (Premium Design + Recuperación)
// Firma: MLagunes
// ==========================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  
  // Estados para el flujo de recuperación de contraseña
  const [vista, setVista] = useState('login'); // 'login' | 'recuperar'
  const [pasoRecuperar, setPasoRecuperar] = useState(1); // 1: Solicitar, 2: Restablecer
  const [codigoRecuperar, setCodigoRecuperar] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [verNuevaPassword, setVerNuevaPassword] = useState(false);
  
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const manejarAcceso = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, { email, password });
      localStorage.setItem('tokenCuadraPro', respuesta.data.token);
      success('Acceso autorizado. Sincronizando bóvedas...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setCargando(false);
      const errorMsg = err.response?.data?.error || 'Error al conectar con la Bóveda.';
      toastError(errorMsg);
    }
  };

  const solicitarTokenRecuperacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/recuperar-password`, { email });
      success('Código de recuperación generado con éxito.');
      // Auto-completamos para facilitar la demostración de la prueba local
      setCodigoRecuperar(respuesta.data.token);
      setPasoRecuperar(2);
      setCargando(false);
    } catch (err) {
      setCargando(false);
      const errorMsg = err.response?.data?.error || 'El correo no está registrado en el sistema.';
      toastError(errorMsg);
    }
  };

  const confirmarNuevaPassword = async (e) => {
    e.preventDefault();
    
    // Validación de fortaleza de contraseña en el cliente
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(nuevaPassword.trim())) {
      toastError('La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.');
      return;
    }

    setCargando(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/recuperar-password`, {
        email,
        token: codigoRecuperar,
        nuevaPassword
      });
      success('Contraseña restablecida de forma segura. Ya puedes iniciar sesión.');
      setVista('login');
      setPasoRecuperar(1);
      setPassword('');
      setNuevaPassword('');
      setCargando(false);
    } catch (err) {
      setCargando(false);
      const errorMsg = err.response?.data?.error || 'Código incorrecto o expirado.';
      toastError(errorMsg);
    }
  };

  const springConfig = { type: "spring", stiffness: 300, damping: 25 };
  
  const inputClass = "w-full pl-11 pr-10 py-3 text-xs bg-neutral-50 border border-neutral-200/80 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight transition-all font-semibold placeholder:text-neutral-300 text-neutral-800";
  const labelClass = "block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans antialiased relative overflow-hidden">
      
      {/* Orbes Animados en el Fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[500px] h-[500px] bg-b2bHighlight/10 rounded-full filter blur-[100px]"
        ></motion.div>
        <motion.div 
          animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] -right-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full filter blur-[120px]"
        ></motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 25 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={springConfig} 
        className="w-full max-w-[420px] relative z-10"
      >
        
        {/* Branding Central */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.04, rotate: 3 }} 
            transition={springConfig} 
            className="p-4 bg-white rounded-[24px] shadow-premium-md border border-neutral-200/40 mb-5 relative group"
          >
            <div className="absolute inset-0 bg-b2bHighlight/5 rounded-[24px] filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ShieldCheck size={36} className="text-b2bHighlight relative z-10" />
          </motion.div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">
            Cuadra<span className="text-b2bHighlight">Pro</span>
          </h1>
          <p className="text-neutral-400 text-xs font-semibold tracking-wider mt-1.5 uppercase">Bóveda de Conciliación Bancaria</p>
        </div>

        {/* Card de Login Glassmorphic */}
        <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-[32px] border border-neutral-200/50 shadow-premium-xl">
          <AnimatePresence mode="wait">
            {vista === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={manejarAcceso} className="space-y-5">
                  <div>
                    <label className={labelClass}>Correo Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-neutral-300" size={14} />
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className={inputClass} 
                        placeholder="admin@empresa.com" 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Contraseña</label>
                      <button 
                        type="button" 
                        onClick={() => setVista('recuperar')}
                        className="text-[10px] font-bold text-b2bHighlight hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-neutral-300" size={14} />
                      <input 
                        type={verPassword ? 'text' : 'password'} 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className={inputClass} 
                        placeholder="••••••••" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setVerPassword(!verPassword)}
                        className="absolute right-4 top-3.5 text-neutral-300 hover:text-neutral-500 transition-colors"
                      >
                        {verPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={cargando}
                    className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-premium-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {cargando ? 'Autenticando...' : <>Acceder a Bóveda <ArrowRight size={13} /></>}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="recuperar"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {pasoRecuperar === 1 ? (
                  <form onSubmit={solicitarTokenRecuperacion} className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-800 mb-1">Recuperar Acceso</h3>
                      <p className="text-[11px] text-neutral-400 font-semibold mb-5 leading-relaxed">
                        Ingresa tu dirección de correo electrónico corporativo para enviarte una clave temporal de recuperación.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>Correo Corporativo</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-neutral-300" size={14} />
                        <input 
                          type="email" 
                          required 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className={inputClass} 
                          placeholder="admin@empresa.com" 
                        />
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit" 
                      disabled={cargando}
                      className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-premium-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {cargando ? 'Procesando...' : <>Solicitar Código <KeyRound size={13} /></>}
                    </motion.button>

                    <button 
                      type="button" 
                      onClick={() => setVista('login')}
                      className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-700 transition-colors mt-4"
                    >
                      <ArrowLeft size={12} /> Volver al Login
                    </button>
                  </form>
                ) : (
                  <form onSubmit={confirmarNuevaPassword} className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-800 mb-1">Establecer Nueva Contraseña</h3>
                      <p className="text-[11px] text-neutral-400 font-semibold mb-5 leading-relaxed">
                        Ingresa el código temporal de 6 dígitos enviado y configura tu nueva clave segura.
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>Código de Verificación</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-3.5 text-neutral-300" size={14} />
                        <input 
                          type="text" 
                          required 
                          maxLength={6}
                          value={codigoRecuperar} 
                          onChange={e => setCodigoRecuperar(e.target.value)} 
                          className={inputClass} 
                          placeholder="123456" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Nueva Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-neutral-300" size={14} />
                        <input 
                          type={verNuevaPassword ? 'text' : 'password'} 
                          required 
                          value={nuevaPassword} 
                          onChange={e => setNuevaPassword(e.target.value)} 
                          className={inputClass} 
                          placeholder="Mín. 8 caracteres (A-Z, 0-9)" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setVerNuevaPassword(!verNuevaPassword)}
                          className="absolute right-4 top-3.5 text-neutral-300 hover:text-neutral-500 transition-colors"
                        >
                          {verNuevaPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit" 
                      disabled={cargando}
                      className="w-full py-3.5 bg-b2bHighlight text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-premium-md flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {cargando ? 'Restableciendo...' : <>Restablecer Contraseña <Check size={13} /></>}
                    </motion.button>

                    <button 
                      type="button" 
                      onClick={() => { setPasoRecuperar(1); setCodigoRecuperar(''); }}
                      className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-700 transition-colors mt-4"
                    >
                      <ArrowLeft size={12} /> Solicitar Código de nuevo
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer de Seguridad */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-[9px] font-bold text-neutral-300 uppercase tracking-widest">
          <ShieldCheck size={12} />
          Bóveda Certificada AES-256
        </div>
      </motion.div>
    </div>
  );
}
