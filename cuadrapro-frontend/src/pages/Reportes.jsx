// ==========================================
// CuadraPro - Centro de Reportes B2B (Premium Responsive)
// Firma: MLagunes
// ==========================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, Filter, FileSpreadsheet, FileCheck, 
  TrendingUp, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Reportes() {
  const [periodo, setPeriodo] = useState('julio');
  const [pasarela, setPasarela] = useState('todas');
  const [cargando, setCargando] = useState(false);

  const datosReporte = [
    { mes: 'Ene', conciliado: 45000, facturado: 46000 },
    { mes: 'Feb', conciliado: 52000, facturado: 51800 },
    { mes: 'Mar', conciliado: 49000, facturado: 49500 },
    { mes: 'Abr', conciliado: 63000, facturado: 62500 },
    { mes: 'May', conciliado: 58000, facturado: 58000 },
    { mes: 'Jun', conciliado: 71000, facturado: 70800 },
    { mes: 'Jul', conciliado: 85000, facturado: 84900 }
  ];

  const reportesDisponibles = [
    { id: 'REP-001', titulo: 'Auditoría Mensual de Conciliación', tipo: 'PDF', fecha: '01 Jul, 2026', tamaño: '2.4 MB', desc: 'Resumen completo de depósitos vs. facturación fiscal.' },
    { id: 'REP-002', titulo: 'Detector de Fugas de Comisiones', tipo: 'XLSX', fecha: '28 Jun, 2026', tamaño: '1.1 MB', desc: 'Cálculo de discrepancias de comisiones Clip y MercadoPago.' },
    { id: 'REP-003', titulo: 'Retenciones Fiscales SAT y Pasarelas', tipo: 'PDF', fecha: '15 Jun, 2026', tamaño: '850 KB', desc: 'Desglose de retenciones aplicadas de IVA e ISR.' },
    { id: 'REP-004', titulo: 'Historial de Auditoría de Seguridad', tipo: 'CSV', fecha: '10 Jun, 2026', tamaño: '320 KB', desc: 'Log detallado de accesos de colaboradores y actividades.' }
  ];

  const refrescarReportes = () => {
    setCargando(true);
    setTimeout(() => setCargando(false), 800);
  };

  const springConfig = { type: "spring", stiffness: 300, damping: 30 };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={springConfig}
      className="space-y-8 pb-12"
    >
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-title">
            Reportes y Auditorías
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Exportación masiva de estados de cuenta, conciliación y auditoría de comisiones.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={refrescarReportes}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#151922]/50 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-premium-sm dark:shadow-none"
        >
          <RefreshCw size={13} className={cargando ? "animate-spin text-[#00C49F]" : "text-[#00C49F]"} />
          Actualizar Directorio
        </motion.button>
      </div>

      {/* Barra de Filtros Avanzados */}
      <div className="bg-white dark:bg-[#151922]/50 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 ml-1">Periodo Fiscal</label>
          <select 
            value={periodo} 
            onChange={e => setPeriodo(e.target.value)} 
            className="w-full px-4 py-2.5 text-xs bg-neutral-50 dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none font-semibold text-neutral-800 dark:text-white appearance-none cursor-pointer"
          >
            <option value="julio">Julio 2026 (Actual)</option>
            <option value="junio">Junio 2026</option>
            <option value="historico">Todo el histórico</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 ml-1">Pasarela / Banco</label>
          <select 
            value={pasarela} 
            onChange={e => setPasarela(e.target.value)} 
            className="w-full px-4 py-2.5 text-xs bg-neutral-50 dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none font-semibold text-neutral-800 dark:text-white appearance-none cursor-pointer"
          >
            <option value="todas">Todos los canales</option>
            <option value="clip">Clip</option>
            <option value="mp">Mercado Pago</option>
            <option value="sat">SAT (Conciliación Fiscal)</option>
          </select>
        </div>
        <div className="flex items-end">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-2.5 bg-[#00C49F] hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md border border-[#00C49F]/10 flex items-center justify-center gap-2"
          >
            <Filter size={13} />
            Aplicar Filtros
          </motion.button>
        </div>
      </div>

      {/* Grid del Gráfico y Tarjetas Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Cumplimiento Fiscal */}
        <div className="lg:col-span-2 bg-white dark:bg-[#151922]/50 p-6 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-title">Desviación Contable / SAT</h3>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold mt-1">Comparativa de montos conciliados vs. emitidos en facturación</p>
            </div>
            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#00C49F] bg-[#00C49F]/5 px-3 py-1.5 rounded-lg border border-[#00C49F]/10">
              <TrendingUp size={11} /> Precisión 99.8%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosReporte} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.1} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#8a94a6', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8a94a6', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(21, 25, 34, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid rgba(45, 55, 72, 0.2)',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="conciliado" stroke="#00C49F" strokeWidth={2} fillOpacity={1} fill="url(#glowArea)" name="Conciliado" />
                <Area type="monotone" dataKey="facturado" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="SAT Emitido" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tarjetas Informativas */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#151922]/50 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-450 dark:text-neutral-500">Reportes Listos</span>
              <span className="p-2 bg-emerald-50 dark:bg-[#00C49F]/10 rounded-xl text-b2bHighlight">
                <FileCheck size={16} />
              </span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-title">Conciliación SAT</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Todos tus comprobantes XML de facturas emitidas y recibidas han sido conciliados con éxito contra tu banco de Jalisco.
            </p>
            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-550 dark:text-neutral-400">
              <span>Sincronización SAT</span>
              <span className="text-[#00C49F]">Activa hoy</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#151922]/50 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-450 dark:text-neutral-500">Exportar Todo</span>
              <span className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
                <FileSpreadsheet size={16} />
              </span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-title">Descarga Consolidada</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Obtén el histórico completo de arqueos de caja, comisiones de pasarelas y auditoría de eventos en un solo archivo.
            </p>
            <motion.button 
              whileHover={{ x: 2 }}
              className="mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 self-start hover:text-indigo-600"
            >
              Iniciar Descarga <ArrowRight size={12} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabla de Documentos y Reportes del Periodo */}
      <div className="bg-white dark:bg-[#151922]/50 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-850 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-title">Reportes del Periodo</h3>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Archivos descargables generados automáticamente por CuadraPro</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-neutral-550 dark:text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-850 bg-white dark:bg-[#151922]">
                <th className="px-6 py-4.5">Reporte</th>
                <th className="px-6 py-4.5">Descripción</th>
                <th className="px-6 py-4.5 text-center">Tipo</th>
                <th className="px-6 py-4.5">Fecha de Generación</th>
                <th className="px-6 py-4.5 text-center">Descarga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850/50 text-xs text-neutral-600 dark:text-neutral-350">
              {reportesDisponibles.map((rep) => (
                <tr key={rep.id} className="hover:bg-neutral-50 dark:hover:bg-[#1a2030]/20 transition-all">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-neutral-400 dark:text-neutral-500 border border-neutral-200/50 dark:border-neutral-750">
                        <FileText size={15} />
                      </div>
                      <span className="font-bold text-neutral-850 dark:text-white leading-tight block">{rep.titulo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-neutral-500 dark:text-neutral-400 max-w-xs">{rep.desc}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      rep.tipo === 'PDF' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600' :
                      rep.tipo === 'XLSX' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' :
                      'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {rep.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-neutral-450 dark:text-neutral-500">{rep.fecha} ({rep.tamaño})</td>
                  <td className="px-6 py-5 text-center">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[#00C49F] hover:bg-[#00C49F] hover:text-white rounded-xl transition-all shadow-premium-sm"
                    >
                      <Download size={14} />
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
