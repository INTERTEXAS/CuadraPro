// ==========================================
// CuadraPro - Login Clean SaaS
// Firma: buhonero0
// ==========================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarAcceso = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const respuesta = await axios.post('${import.meta.env.VITE_API_URL}/api/v1/auth/login', { email, password });
      localStorage.setItem('tokenCuadraPro', respuesta.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Las credenciales ingresadas no coinciden con nuestros registros.');
    }
  };

  const inputClass = "w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight transition-all placeholder:text-neutral-300";
  const labelClass = "block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 font-sans antialiased">
      
      {/* Elemento Decorativo de Fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-b2bHighlight/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Branding Central */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-white rounded-3xl shadow-xl shadow-neutral-200 border border-neutral-100 mb-6">
            <ShieldCheck size={40} className="text-b2bHighlight" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Cuadra<span className="text-b2bHighlight">Pro</span></h1>
          <p className="text-neutral-400 text-sm font-medium mt-2">Bóveda de Conciliación Bancaria B2B</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white p-10 rounded-[32px] border border-neutral-200 shadow-2xl shadow-neutral-200/50">
          <form onSubmit={manejarAcceso} className="space-y-6">
            <div>
              <label className={labelClass}>Correo Corporativo</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass} placeholder="ejemplo@empresa.com" />
            </div>
            <div>
              <label className={labelClass}>Contraseña de Acceso</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputClass} placeholder="••••••••••••" />
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold leading-relaxed animate-shake">
                {error}
              </div>
            )}
            
            <button type="submit" className="group w-full py-4 bg-neutral-900 hover:bg-black text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-neutral-300 flex items-center justify-center gap-3">
              Autorizar Entrada <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer Login */}
        <div className="mt-10 text-center space-y-4">
           <p className="text-neutral-400 text-xs font-medium">¿Problemas para acceder? <span className="text-neutral-900 font-bold cursor-pointer hover:underline">Contactar a Soporte</span></p>
           <div className="flex items-center justify-center gap-2 opacity-30">
              <div className="h-px w-8 bg-neutral-400"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Certificación B2B</span>
              <div className="h-px w-8 bg-neutral-400"></div>
           </div>
        </div>

      </div>
    </div>
  );
}
