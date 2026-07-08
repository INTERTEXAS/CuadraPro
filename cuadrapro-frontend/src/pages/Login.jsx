// ==========================================
// CuadraPro - Login Clean SaaS (Premium Design + Recuperación)
// Firma: MLagunes
// ==========================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff, Check, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  
  // Estados para el flujo de recuperación de contraseña y registro
  const [vista, setVista] = useState('login'); // 'login' | 'registro' | 'recuperar' | 'mfa'
  const [pasoRecuperar, setPasoRecuperar] = useState(1); // 1: Solicitar, 2: Restablecer
  const [codigoRecuperar, setCodigoRecuperar] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [verNuevaPassword, setVerNuevaPassword] = useState(false);

  // Estados para Registro (Sign Up)
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [passwordConfirmRegistro, setPasswordConfirmRegistro] = useState('');

  // Estados para el flujo interactivo de Google Login
  const [mostrarGoogleModal, setMostrarGoogleModal] = useState(false);
  const [gmailNuevo, setGmailNuevo] = useState('');
  const [mostrarInputGmail, setMostrarInputGmail] = useState(false);
  
  const [googleClient, setGoogleClient] = useState(null);
  
  // Estados para MFA y Remember Me
  const [rememberMe, setRememberMe] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpCodigo, setOtpCodigo] = useState('');
  const [timerMfa, setTimerMfa] = useState(60);
  
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  // Temporizador para el código 2FA
  useEffect(() => {
    let intervalo;
    if (vista === 'mfa' && timerMfa > 0) {
      intervalo = setInterval(() => {
        setTimerMfa(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [vista, timerMfa]);

  useEffect(() => {
    /* global google */
    let intervalId;
    let intentos = 0;

    const inicializarCliente = () => {
      if (typeof google !== 'undefined') {
        try {
          const client = google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1017409277028-xxxxxxxx.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            callback: async (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                await loginConGoogleReal(tokenResponse.access_token);
              }
            },
            error_callback: (err) => {
              console.error('Error en Google OAuth:', err);
              toastError('Error al iniciar el flujo de Google.');
            }
          });
          setGoogleClient(client);
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.error('Error inicializando Google Client:', err);
        }
      } else {
        intentos += 1;
        if (intentos > 15 && intervalId) {
          clearInterval(intervalId);
        }
      }
    };

    inicializarCliente();

    if (typeof google === 'undefined') {
      intervalId = setInterval(inicializarCliente, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [toastError]);

  const loginConGoogleReal = async (tokenAcceso) => {
    setCargando(true);
    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/google`, { access_token: tokenAcceso, rememberMe });
      if (respuesta.data.mfaRequerido) {
        setTempToken(respuesta.data.tempToken);
        setVista('mfa');
        setTimerMfa(60);
        setCargando(false);
        success('Código de verificación 2FA enviado a tu correo.');
        return;
      }
      localStorage.setItem('tokenCuadraPro', respuesta.data.token);
      success('Autenticación con Google exitosa. Sincronizando...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setCargando(false);
      const errorMsg = err.response?.data?.error || 'Error al conectar con la autenticación de Google.';
      toastError(errorMsg);
    }
  };


  useEffect(() => {
    if (sessionStorage.getItem('sesionExpiradaInactividad') === 'true') {
      toastError('Sesión cerrada por inactividad. Por seguridad contable, vuelve a ingresar.');
      sessionStorage.removeItem('sesionExpiradaInactividad');
    }
  }, [toastError]);

  useEffect(() => {
    if (localStorage.getItem('tokenCuadraPro')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const manejarAcceso = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, { email, password, rememberMe });
      if (respuesta.data.mfaRequerido) {
        setTempToken(respuesta.data.tempToken);
        setVista('mfa');
        setTimerMfa(60);
        setCargando(false);
        success('Código de verificación 2FA enviado a tu correo.');
        return;
      }
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

  const manejarRegistro = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmRegistro) {
      toastError('Las contraseñas no coinciden.');
      return;
    }
    setCargando(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/registro`, {
        nombre_completo: nombreRegistro,
        email,
        password
      });
      success('Cuenta contable creada. Iniciando sesión...');
      
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, { 
        email, 
        password,
        rememberMe 
      });
      
      if (respuesta.data.mfaRequerido) {
        setTempToken(respuesta.data.tempToken);
        setVista('mfa');
        setTimerMfa(60);
        setCargando(false);
        success('Código de verificación 2FA enviado a tu correo.');
        return;
      }
      
      localStorage.setItem('tokenCuadraPro', respuesta.data.token);
      success('Acceso autorizado. Sincronizando bóvedas...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setCargando(false);
      const errorMsg = err.response?.data?.error || 'Error al crear tu cuenta.';
      toastError(errorMsg);
    }
  };

  const loginConCuentaGoogle = async (correoSeleccionado) => {
    setMostrarGoogleModal(false);
    setCargando(true);
    try {
      // 1. Intentamos iniciar sesión directamente (si el usuario ya existe)
      try {
        const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, { 
          email: correoSeleccionado, 
          password: 'hola1234', // Contraseña por defecto para OAuth simulado
          rememberMe
        });
        if (respuesta.data.mfaRequerido) {
          setTempToken(respuesta.data.tempToken);
          setVista('mfa');
          setTimerMfa(60);
          setCargando(false);
          success('Código de verificación 2FA enviado a tu correo.');
          return;
        }
        localStorage.setItem('tokenCuadraPro', respuesta.data.token);
        success(`Autenticado con Google: ${correoSeleccionado}. Sincronizando...`);
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
        return;
      } catch (errLogin) {
        // Si el usuario no existe (401), procedemos a registrar y luego loguear
        if (errLogin.response?.status === 401) {
          // Registrar nuevo usuario con este Gmail
          await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/registro`, {
            nombre_completo: `Usuario Google (${correoSeleccionado.split('@')[0]})`,
            email: correoSeleccionado,
            password: 'hola1234'
          });
          
          // Loguearse ahora que ya está registrado
          const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
            email: correoSeleccionado,
            password: 'hola1234',
            rememberMe
          });
          if (respuesta.data.mfaRequerido) {
            setTempToken(respuesta.data.tempToken);
            setVista('mfa');
            setTimerMfa(60);
            setCargando(false);
            success('Código de verificación 2FA enviado a tu correo.');
            return;
          }
          localStorage.setItem('tokenCuadraPro', respuesta.data.token);
          success(`Cuenta Google creada e iniciada: ${correoSeleccionado}. Sincronizando...`);
          setTimeout(() => {
            navigate('/dashboard');
          }, 800);
          return;
        }
        throw errLogin;
      }
    } catch (err) {
      setCargando(false);
      const errorMsg = err.response?.data?.error || 'Error al conectar con la autenticación de Google.';
      toastError(errorMsg);
    }
  };

  const manejarVerificarMfa = async (e) => {
    e.preventDefault();
    if (otpCodigo.trim().length !== 6) {
      toastError('El código debe ser de 6 dígitos.');
      return;
    }
    setCargando(true);
    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/verificar-mfa`, {
        tempToken,
        codigo: otpCodigo
      });
      localStorage.setItem('tokenCuadraPro', respuesta.data.token);
      success('Acceso autorizado. Sincronizando bóvedas...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setCargando(false);
      const errorMsg = err.response?.data?.error || 'Código incorrecto o expirado.';
      toastError(errorMsg);
    }
  };

  const reenviarCodigoMfa = async () => {
    if (timerMfa > 0) return;
    setCargando(true);
    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/reenviar-mfa`, { tempToken });
      success(respuesta.data.mensaje || 'Se ha enviado un nuevo código a tu correo.');
      setTimerMfa(60);
      setOtpCodigo('');
      setCargando(false);
    } catch (err) {
      setCargando(false);
      const errorMsg = err.response?.data?.error || 'Error al reenviar el código.';
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
      
      {/* Botón flotante elegante para regresar al inicio */}
      <div className="absolute top-6 left-6 z-20">
        <motion.button
          whileHover={{ scale: 1.03, x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-neutral-200/60 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-800 rounded-full transition-all shadow-premium-sm"
        >
          <ArrowLeft size={12} />
          Regresar al inicio
        </motion.button>
      </div>
      
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
            {vista === 'login' && (
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

                  <div className="flex items-center ml-1">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-b2bHighlight bg-neutral-50 border-neutral-200 rounded focus:ring-b2bHighlight/20 focus:ring-2 cursor-pointer accent-b2bHighlight"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer select-none">
                      Mantener sesión iniciada
                    </label>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={cargando}
                    className="w-full py-3.5 bg-b2bHighlight hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-premium-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {cargando ? 'Autenticando...' : <>Acceder a Bóveda <ArrowRight size={13} /></>}
                  </motion.button>

                  {/* Separador de opciones */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200/50"></div>
                    </div>
                    <span className="relative bg-white px-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">o</span>
                  </div>

                  {/* Botón de Google */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => {
                      if (googleClient && import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('xxxxxxxx')) {
                        googleClient.requestAccessToken();
                      } else {
                        setMostrarGoogleModal(true);
                        success('Iniciando en modo simulación (configura VITE_GOOGLE_CLIENT_ID en .env para Google OAuth real).');
                      }
                    }}
                    className="w-full py-3.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-full transition-all shadow-premium-sm flex items-center justify-center gap-3"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuar con Google
                  </motion.button>

                  <div className="text-center mt-4 pt-2 border-t border-neutral-100/50">
                    <button
                      type="button"
                      onClick={() => {
                        setVista('registro');
                        setEmail('');
                        setPassword('');
                      }}
                      className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-widest"
                    >
                      ¿No tienes cuenta? <span className="text-b2bHighlight">Regístrate gratis</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {vista === 'registro' && (
              <motion.div
                key="registro"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={manejarRegistro} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 mb-1">Crear Cuenta Corporativa</h3>
                    <p className="text-[11px] text-neutral-400 font-semibold mb-4 leading-relaxed">
                      Regístrate gratis en segundos y automatiza la conciliación de tu empresa.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3 text-neutral-300" size={13} />
                      <input 
                        type="text" 
                        required 
                        value={nombreRegistro} 
                        onChange={e => setNombreRegistro(e.target.value)} 
                        className={inputClass} 
                        placeholder="Juan Pérez" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Correo Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3 text-neutral-300" size={13} />
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className={inputClass} 
                        placeholder="juan@miempresa.com" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3 text-neutral-300" size={13} />
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
                        className="absolute right-4 top-3 text-neutral-300 hover:text-neutral-500 transition-colors"
                      >
                        {verPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Confirmar Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3 text-neutral-300" size={13} />
                      <input 
                        type={verPassword ? 'text' : 'password'} 
                        required 
                        value={passwordConfirmRegistro} 
                        onChange={e => setPasswordConfirmRegistro(e.target.value)} 
                        className={inputClass} 
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={cargando}
                    className="w-full py-3 bg-b2bHighlight text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-premium-md flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-50 mt-1"
                  >
                    {cargando ? 'Creando Cuenta...' : <>Registrarse <ArrowRight size={13} /></>}
                  </motion.button>

                  {/* Separador de opciones */}
                  <div className="relative my-3 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200/50"></div>
                    </div>
                    <span className="relative bg-white px-3 text-[9px] font-black text-neutral-400 uppercase tracking-widest">o</span>
                  </div>

                  {/* Botón de Google */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => {
                      if (googleClient && import.meta.env.VITE_GOOGLE_CLIENT_ID && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('xxxxxxxx')) {
                        googleClient.requestAccessToken();
                      } else {
                        setMostrarGoogleModal(true);
                        success('Iniciando en modo simulación (configura VITE_GOOGLE_CLIENT_ID en .env para Google OAuth real).');
                      }
                    }}
                    className="w-full py-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-full transition-all shadow-premium-sm flex items-center justify-center gap-3"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Registrarse con Google
                  </motion.button>

                  <div className="text-center mt-3 pt-2 border-t border-neutral-100/50">
                    <button
                      type="button"
                      onClick={() => {
                        setVista('login');
                        setEmail('');
                        setPassword('');
                      }}
                      className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-widest"
                    >
                      ¿Ya tienes cuenta? <span className="text-b2bHighlight">Inicia Sesión</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}


            {vista === 'recuperar' && (
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

            {vista === 'mfa' && (
              <motion.div
                key="mfa"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={manejarVerificarMfa} className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 mb-1">Verificación de Seguridad</h3>
                    <p className="text-[11px] text-neutral-400 font-semibold mb-5 leading-relaxed">
                      Hemos enviado un código de acceso de doble factor (2FA) a tu correo electrónico. Por favor, ingrésalo para continuar.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Código 2FA (6 dígitos)</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-3.5 text-neutral-300" size={14} />
                      <input 
                        type="text" 
                        required 
                        maxLength={6}
                        value={otpCodigo} 
                        onChange={e => setOtpCodigo(e.target.value.replace(/\D/g, ''))} 
                        className="w-full pl-11 pr-10 py-3 text-xs bg-neutral-50 border border-neutral-200/80 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight transition-all font-semibold placeholder:text-neutral-300 text-neutral-800 text-center tracking-[0.5em] text-lg font-mono" 
                        placeholder="000000" 
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={cargando}
                    className="w-full py-3.5 bg-b2bHighlight text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-premium-md flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {cargando ? 'Verificando...' : <>Verificar Código <Check size={13} /></>}
                  </motion.button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      disabled={timerMfa > 0 || cargando}
                      onClick={reenviarCodigoMfa}
                      className="text-[10px] font-bold text-b2bHighlight hover:underline disabled:text-neutral-300 disabled:no-underline"
                    >
                      {timerMfa > 0 ? `Reenviar código en ${timerMfa}s` : 'Reenviar código por correo'}
                    </button>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => { setVista('login'); setOtpCodigo(''); }}
                    className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-700 transition-colors mt-4"
                  >
                    <ArrowLeft size={12} /> Volver al Login
                  </button>
                </form>
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

      {/* Modal Selector de Cuentas de Google (Simulado pero 100% Funcional con la BD) */}
      <AnimatePresence>
        {mostrarGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={springConfig}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-neutral-200/60 shadow-premium-xl text-center flex flex-col items-center"
            >
              {/* Logotipo de Google */}
              <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              
              <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-widest mb-1">Acceso con Google</h2>
              <p className="text-[11px] text-neutral-400 font-semibold mb-6">
                Elige una cuenta para continuar en CuadraPro
              </p>

              <div className="w-full space-y-2 mb-6">
                {/* Cuenta de SuperAdmin predeterminada */}
                <button
                  onClick={() => loginConCuentaGoogle('admin@tallerlag.com')}
                  className="w-full flex items-center justify-between p-3.5 border border-neutral-100 hover:bg-neutral-50 rounded-2xl text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      ML
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800">Miguel Lagunes</p>
                      <p className="text-[10px] text-neutral-400 font-semibold">admin@tallerlag.com</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-neutral-300 group-hover:text-neutral-500 uppercase tracking-wider">Sesión Guardada</span>
                </button>

                {mostrarInputGmail ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (gmailNuevo.trim().endsWith('@gmail.com') || gmailNuevo.trim().includes('@')) {
                      loginConCuentaGoogle(gmailNuevo.trim().toLowerCase());
                    } else {
                      toastError('Ingresa un correo electrónico válido.');
                    }
                  }} className="space-y-3 pt-2">
                    <input
                      type="email"
                      required
                      value={gmailNuevo}
                      onChange={e => setGmailNuevo(e.target.value)}
                      placeholder="correo@gmail.com"
                      className={inputClass}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMostrarInputGmail(false)}
                        className="flex-1 py-2 border border-neutral-200 text-neutral-500 text-xs font-bold rounded-xl hover:bg-neutral-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                      >
                        Continuar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setMostrarInputGmail(true)}
                    className="w-full py-3.5 border border-dashed border-neutral-200 hover:border-neutral-400 text-neutral-500 hover:text-neutral-800 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    Usar otra cuenta de Gmail
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setMostrarGoogleModal(false);
                  setMostrarInputGmail(false);
                  setGmailNuevo('');
                }}
                className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                Cerrar selector
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
