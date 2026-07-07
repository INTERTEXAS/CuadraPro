/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, removeToast }}>
      {children}
      
      {/* Contenedor flotante de notificaciones */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, y: -10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="pointer-events-auto bg-white/90 backdrop-blur-md border border-neutral-200/50 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-start gap-3.5 w-full relative overflow-hidden"
            >
              {/* Barra de acento lateral */}
              <div className={`absolute left-0 inset-y-0 w-1 ${toast.type === 'success' ? 'bg-b2bHighlight' : 'bg-rose-500'}`}></div>
              
              {/* Contenedor del icono estilizado */}
              <div className={`p-2 rounded-xl shrink-0 border ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              }`}>
                {toast.type === 'success' ? (
                  <CheckCircle size={15} />
                ) : (
                  <XCircle size={15} />
                )}
              </div>
              
              <div className="flex-1 min-w-0 pr-2">
                <span className={`block text-[9px] font-black uppercase tracking-widest mb-1 ${
                  toast.type === 'success' ? 'text-b2bHighlight' : 'text-rose-500'
                }`}>
                  {toast.type === 'success' ? 'Confirmación Bóveda' : 'Alerta de Conciliación'}
                </span>
                <p className="text-xs font-semibold text-neutral-800 leading-normal">
                  {toast.message}
                </p>
              </div>

              <button 
                onClick={() => removeToast(toast.id)} 
                className="text-neutral-400 hover:text-neutral-800 transition-colors shrink-0 p-1 hover:bg-neutral-100/80 rounded-lg"
                aria-label="Cerrar notificación"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
}
