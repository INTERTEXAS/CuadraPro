// ==========================================
// CuadraPro - Centro de Control de Pasarelas y Comisiones B2B (Premium)
// Firma: MLagunes
// ==========================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, DollarSign, ArrowUpRight, TrendingUp, HelpCircle, 
  Settings, CheckCircle, Smartphone, Calculator, Percent 
} from 'lucide-react';

export default function Pagos() {
  const [montoSimulado, setMontoSimulado] = useState('1000');
  const [pasarelaSeleccionada, setPasarelaSeleccionada] = useState('clip');

  const pasarelas = [
    { id: 'clip', nombre: 'Clip Plus', volumen: 45000, comisionCobrada: 1620, tasaEfectiva: '3.60%', estado: 'Correcto', color: 'text-orange-500' },
    { id: 'mercadopago', nombre: 'Mercado Pago', volumen: 38000, comisionCobrada: 1330, tasaEfectiva: '3.50%', estado: 'Fuga Detectada', color: 'text-sky-500' },
    { id: 'stripe', nombre: 'Stripe Direct', volumen: 62000, comisionCobrada: 2170, tasaEfectiva: '3.50%', estado: 'Correcto', color: 'text-indigo-500' }
  ];

  const liquidaciones = [
    { id: 'LIQ-092', pasarela: 'Stripe Direct', fecha: '06 Jul, 2026', bruto: 12500, comision: 437.5, neto: 12062.5, banco: 'BBVA Bancomer' },
    { id: 'LIQ-091', pasarela: 'Clip Plus', fecha: '04 Jul, 2026', bruto: 8400, comision: 302.4, neto: 8097.6, banco: 'Santander B2B' },
    { id: 'LIQ-090', pasarela: 'Mercado Pago', fecha: '02 Jul, 2026', bruto: 15600, comision: 546.0, neto: 15054.0, banco: 'BBVA Bancomer' },
    { id: 'LIQ-089', pasarela: 'Stripe Direct', fecha: '28 Jun, 2026', bruto: 22000, comision: 770.0, neto: 21230.0, banco: 'BBVA Bancomer' }
  ];

  // Cálculo del simulador
  const calcularSimulacion = () => {
    const bruto = parseFloat(montoSimulado) || 0;
    let tasa = 3.5;
    let fija = 0;
    if (pasarelaSeleccionada === 'clip') {
      tasa = 3.6;
    } else if (pasarelaSeleccionada === 'stripe') {
      tasa = 3.4;
      fija = 3.0;
    }

    const comision = (bruto * (tasa / 100)) + fija;
    const ivaComision = comision * 0.16;
    const satRetencion = bruto * 0.01; // Retención ISR típica 1%
    const neto = bruto - comision - ivaComision - satRetencion;

    return {
      comision: comision.toFixed(2),
      iva: ivaComision.toFixed(2),
      retencion: satRetencion.toFixed(2),
      neto: neto > 0 ? neto.toFixed(2) : '0.00'
    };
  };

  const simulacion = calcularSimulacion();
  const springConfig = { type: "spring", stiffness: 300, damping: 30 };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={springConfig}
      className="space-y-8 pb-12"
    >
      {/* Encabezado Principal */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-title">
          Comisiones y Pagos
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Simulador de tarifas e historial de liquidaciones recibidas en tus cuentas de banco.
        </p>
      </div>

      {/* Grid de Pasarelas de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pasarelas.map((p, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white dark:bg-[#151922]/50 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">{p.nombre}</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.estado === 'Correcto' ? 'bg-[#00C49F]/10 text-[#00C49F]' : 'bg-rose-500/10 text-rose-500 border border-rose-500/15'}`}>
                {p.estado}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-neutral-400 block mb-1">Volumen del Mes</span>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-mono">${p.volumen.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-850/60 flex items-center justify-between text-[10px] text-neutral-500 font-bold">
              <span>Tasa Real</span>
              <span className="text-neutral-850 dark:text-white font-mono">{p.tasaEfectiva}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid Central: Simulador y Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Simulador Interactivo */}
        <div className="bg-white dark:bg-[#151922]/50 p-8 rounded-[32px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-[#00C49F]/10 text-[#00C49F] rounded-xl">
              <Calculator size={18} />
            </div>
            <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-widest font-title">Simulador de Comisión</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 ml-1">Monto de Venta ($ Bruto)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                <input 
                  type="number" 
                  value={montoSimulado}
                  onChange={e => setMontoSimulado(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 text-xs bg-neutral-50 dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none font-semibold text-neutral-800 dark:text-white" 
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 ml-1">Proveedor / Pasarela</label>
              <select 
                value={pasarelaSeleccionada}
                onChange={e => setPasarelaSeleccionada(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-neutral-50 dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none font-semibold text-neutral-800 dark:text-white appearance-none cursor-pointer"
              >
                <option value="clip">Clip Plus (3.6%)</option>
                <option value="mercadopago">Mercado Pago (3.5%)</option>
                <option value="stripe">Stripe Direct (3.4% + $3)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desglose de Comisión en tiempo real */}
        <div className="bg-white dark:bg-[#151922]/50 p-8 rounded-[32px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none lg:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-6 font-title">Resultados de Dispersión</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 bg-neutral-50 dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-850 rounded-2xl">
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block mb-1">Comisión Base</span>
                <span className="text-sm font-bold text-neutral-850 dark:text-white font-mono">${simulacion.comision}</span>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-850 rounded-2xl">
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block mb-1">IVA de Comisión</span>
                <span className="text-sm font-bold text-neutral-850 dark:text-white font-mono">${simulacion.iva}</span>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-850 rounded-2xl">
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block mb-1">Retención SAT</span>
                <span className="text-sm font-bold text-neutral-850 dark:text-white font-mono">${simulacion.retencion}</span>
              </div>
              <div className="p-4 bg-[#00C49F]/5 dark:bg-[#00C49F]/10 border border-[#00C49F]/20 rounded-2xl">
                <span className="text-[9px] font-bold text-[#00C49F] uppercase block mb-1">Monto Neto a Recibir</span>
                <span className="text-sm font-black text-neutral-900 dark:text-white font-mono">${simulacion.neto}</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-6 leading-relaxed flex items-center gap-2">
            <CheckCircle size={12} className="text-[#00C49F]" /> 
            Cifras calculadas bajo las leyes fiscales vigentes (IVA 16% y Retención de Plataformas Tecnológicas del 1%).
          </p>
        </div>
      </div>

      {/* Historial de Liquidaciones Recibidas */}
      <div className="bg-white dark:bg-[#151922]/50 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-850 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-title">Historial de Liquidaciones</h3>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Monitoreo de transferencias de pasarelas a cuentas de bancos verificadas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-850 bg-white dark:bg-[#151922]">
                <th className="px-6 py-4.5">ID Liquidación</th>
                <th className="px-6 py-4.5">Origen</th>
                <th className="px-6 py-4.5">Fecha</th>
                <th className="px-6 py-4.5 text-right">Monto Bruto</th>
                <th className="px-6 py-4.5 text-right">Comisión</th>
                <th className="px-6 py-4.5 text-right">Neto Dispersado</th>
                <th className="px-6 py-4.5">Banco Destino</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850/50 text-xs text-neutral-600 dark:text-neutral-350">
              {liquidaciones.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50 dark:hover:bg-[#1a2030]/20 transition-all">
                  <td className="px-6 py-5 font-bold text-neutral-850 dark:text-white font-mono">#{l.id}</td>
                  <td className="px-6 py-5">{l.pasarela}</td>
                  <td className="px-6 py-5 text-neutral-500 dark:text-neutral-400">{l.fecha}</td>
                  <td className="px-6 py-5 text-right font-mono text-neutral-500 dark:text-neutral-400">${l.bruto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-5 text-right font-mono text-neutral-450 dark:text-neutral-500">${l.comision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-5 text-right font-bold text-neutral-850 dark:text-white font-mono">${l.neto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-5 text-neutral-550 dark:text-neutral-450 font-bold">{l.banco}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
