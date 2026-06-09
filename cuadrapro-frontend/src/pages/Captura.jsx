// ==========================================
// CuadraPro - Módulo de Captura Clean SaaS
// Firma: buhonero0
// ==========================================
import { useState } from 'react';
import axios from 'axios';
import { CircleDollarSign, Save, ShieldCheck } from 'lucide-react';

export default function Captura() {
  const [formulario, setFormulario] = useState({
    fecha_corte: new Date().toISOString().split('T')[0],
    dia_semana: 'Lunes',
    monto_esperado: '', monto_depositado: '', comision_clip: '', comision_mercadopago: '', retencion_sat: ''
  });
  const [mensaje, setMensaje] = useState(null);

  const guardarFlujo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('tokenCuadraPro');
      await axios.post('${import.meta.env.VITE_API_URL}/api/v1/conciliaciones/registrar', formulario, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje({ tipo: 'exito', texto: 'Registro persistido exitosamente en la bóveda.' });
      setFormulario({ ...formulario, monto_esperado: '', monto_depositado: '', comision_clip: '', comision_mercadopago: '', retencion_sat: '' });
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de integridad al procesar el registro.' });
    }
    setTimeout(() => setMensaje(null), 4000);
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-md outline-none focus:ring-2 focus:ring-b2bHighlight/20 focus:border-b2bHighlight transition-all placeholder:text-neutral-400";
  const labelClass = "block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="bg-white p-10 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-neutral-100">
          <div className="p-3 bg-neutral-900 text-white rounded-xl shadow-lg shadow-neutral-200">
            <CircleDollarSign size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Captura de Flujo</h2>
            <p className="text-xs text-neutral-400 font-medium">Ingresa los datos del cierre de caja diario.</p>
          </div>
        </div>

        <form onSubmit={guardarFlujo} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Fecha de Corte</label>
              <input type="date" required value={formulario.fecha_corte} onChange={e => setFormulario({...formulario, fecha_corte: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Día de Operación</label>
              <select value={formulario.dia_semana} onChange={e => setFormulario({...formulario, dia_semana: e.target.value})} className={inputClass}>
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => <option key={dia} value={dia}>{dia}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Monto Base (Esperado)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-neutral-400 text-sm">$</span>
                <input type="number" required step="0.01" value={formulario.monto_esperado} onChange={e => setFormulario({...formulario, monto_esperado: e.target.value})} className={inputClass + " pl-7"} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Depositado Real</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-neutral-400 text-sm">$</span>
                <input type="number" required step="0.01" value={formulario.monto_depositado} onChange={e => setFormulario({...formulario, monto_depositado: e.target.value})} className={inputClass + " pl-7 font-bold text-neutral-900"} placeholder="0.00" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-neutral-400" />
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Deducciones de Terminal</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">Clip</label>
                <input type="number" step="0.01" value={formulario.comision_clip} onChange={e => setFormulario({...formulario, comision_clip: e.target.value})} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">Mercado Pago</label>
                <input type="number" step="0.01" value={formulario.comision_mercadopago} onChange={e => setFormulario({...formulario, comision_mercadopago: e.target.value})} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">ISR/IVA</label>
                <input type="number" step="0.01" value={formulario.retencion_sat} onChange={e => setFormulario({...formulario, retencion_sat: e.target.value})} className={inputClass} placeholder="0.00" />
              </div>
            </div>
          </div>

          {mensaje && <div className={`p-4 rounded-lg text-xs font-bold text-center animate-bounce ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{mensaje.texto}</div>}

          <button type="submit" className="w-full py-3 bg-neutral-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-neutral-200 flex items-center justify-center gap-2">
            <Save size={18} /> Persistir Registro Diario
          </button>
        </form>
      </div>
    </div>
  );
}
