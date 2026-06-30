import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 font-sans antialiased relative overflow-hidden">
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] bg-rose-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[45%] h-[45%] bg-b2bHighlight/5 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-white p-10 rounded-[32px] border border-neutral-200/50 shadow-premium-xl text-center relative z-10"
      >
        <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-premium-sm transition-transform hover:scale-105 duration-300">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-5xl font-black text-neutral-900 tracking-tighter mb-3">404</h1>
        <h2 className="text-lg font-bold text-neutral-800 tracking-tight mb-2">Bóveda No Encontrada</h2>
        <p className="text-neutral-400 text-xs font-semibold leading-relaxed mb-8">
          La página que intentas consultar no existe o ha sido reubicada por políticas de seguridad de la red B2B.
        </p>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          className="group w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-premium-md flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Volver a la Bóveda
        </motion.button>
      </motion.div>
    </div>
  );
}
