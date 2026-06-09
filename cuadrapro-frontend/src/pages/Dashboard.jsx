// ==========================================
// CuadraPro - Dashboard Clean SaaS
// Firma: buhonero0
// ==========================================
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Wallet, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight, Download, Info, PlusCircle, Bell, ChevronDown, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState(false);
  const navigate = useNavigate();
  const COLORES = ['#00C49F', '#0ea5e9', '#f43f5e'];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('tokenCuadraPro');
        const respuesta = await axios.get('${import.meta.env.VITE_API_URL}/api/v1/conciliaciones/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDatos(respuesta.data);
      } catch (error) {
        console.error('Error cargando métricas');
      } finally {
        setTimeout(() => setCargando(false), 600);
      }
    };
    cargarDatos();
  }, []);

  const exportarExcel = () => {
    if (!datos) return;
    const wb = XLSX.utils.book_new();
    const dataResumen = [["CUADRAPRO - REPORTE"], [], ["Métrica", "Valor"], ["Total Esperado", datos.kpis.totalEsperado], ["Fuga", datos.kpis.fugaDeducciones], ["Salud", datos.kpis.estadoSalud]];
    const wsResumen = XLSX.utils.aoa_to_sheet(dataResumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    XLSX.writeFile(wb, `Reporte_CuadraPro.xlsx`);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const transacciones = [
    { id: 'TRX-1092', fecha: 'Hoy, 14:30', tipo: 'Liquidación Clip', monto: '+ $3,450.00', estatus: 'Completado' },
    { id: 'TRX-1091', fecha: 'Hoy, 09:15', tipo: 'Retención SAT', monto: '- $85.50', estatus: 'Deducido' },
    { id: 'TRX-1090', fecha: 'Ayer, 18:45', tipo: 'Cobro Mercado Pago', monto: '+ $1,200.00', estatus: 'Pendiente' },
  ];

  if (cargando) return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-end"><div className="space-y-2"><div className="h-8 w-64 bg-neutral-200 rounded"></div><div className="h-4 w-48 bg-neutral-100 rounded"></div></div><div className="h-10 w-32 bg-neutral-200 rounded-lg"></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-32 bg-neutral-100 border border-neutral-200 rounded-xl"></div>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 h-80 bg-neutral-100 border border-neutral-200 rounded-xl"></div><div className="h-80 bg-neutral-100 border border-neutral-200 rounded-xl"></div></div>
    </div>
  );

  if (datos && datos.kpis.totalEsperado === 0) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400"><Wallet size={40} /></div>
      <div><h2 className="text-xl font-bold text-neutral-900">Sin actividad financiera</h2><p className="text-sm text-neutral-500 mt-1 max-w-sm">Registra tu primer ingreso para generar métricas de conciliación.</p></div>
      <button onClick={() => navigate('/captura')} className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm">Comenzar Captura</button>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-neutral-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 text-sm font-bold border border-neutral-800">
          <Download size={16} className="text-b2bHighlight" /> Reporte generado exitosamente
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 bg-b2bHighlight rounded-full"></div>
             <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">En Vivo • Bóveda Sincronizada</span>
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Análisis de Conciliación</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-xs font-bold hover:bg-neutral-50 transition-all shadow-sm">
            <Calendar size={14} /> Últimos 7 días <ChevronDown size={12} />
          </button>
          <button onClick={exportarExcel} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all shadow-md shadow-neutral-200">
            <Download size={14} /> Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Esperado', valor: `$${datos.kpis.totalEsperado.toLocaleString()}`, icon: <Wallet />, color: 'text-neutral-900', bg: 'bg-white' },
          { label: 'Fuga de Comisiones', valor: `$${datos.kpis.fugaDeducciones.toLocaleString()}`, icon: <ArrowDownRight />, color: 'text-red-600', bg: 'bg-white' },
          { label: 'Estado de Salud', valor: datos.kpis.estadoSalud, icon: <Activity />, color: datos.kpis.estadoSalud === 'Óptimo' ? 'text-b2bHighlight' : 'text-amber-500', bg: 'bg-white' }
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bg} p-6 rounded-xl border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all group`}>
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-neutral-400">
                  <span className="p-1.5 bg-neutral-50 rounded-lg group-hover:text-neutral-600 transition-colors">{kpi.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{kpi.label}</span>
               </div>
               <Info size={14} className="text-neutral-200 cursor-help" />
            </div>
            <span className={`text-3xl font-black tracking-tighter ${kpi.color}`}>{kpi.valor}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-8">Flujo de Depósitos Semanal</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={datos.datosSemanales} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#a3a3a3', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#a3a3a3', fontSize: 11}} />
                <Tooltip cursor={{fill: '#fafafa'}} contentStyle={{borderRadius: '12px', border: '1px solid #f5f5f5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="esperado" fill="#e5e5e5" radius={[4, 4, 0, 0]} name="Esperado" barSize={28} />
                <Bar dataKey="depositado" fill="#00C49F" radius={[4, 4, 0, 0]} name="Depositado" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-8">Distribución de Fuga</h3>
          <div className="flex-1 relative min-h-[200px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={datos.datosDeducciones} innerRadius={65} outerRadius={85} paddingAngle={6} dataKey="valor" stroke="none">
                  {datos.datosDeducciones.map((e, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Total Deducido</span>
              <span className="text-xl font-black text-neutral-900">${datos.kpis.fugaDeducciones.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Movimientos Recientes</h3>
          <button className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-widest">Ver Historial Completo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100">
                <th className="px-6 py-4 font-bold">Identificador</th>
                <th className="px-6 py-4 font-bold">Concepto</th>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold text-right">Monto</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {transacciones.map((t, i) => (
                <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[11px] text-neutral-400">{t.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-neutral-800">{t.tipo}</td>
                  <td className="px-6 py-4 text-xs text-neutral-500">{t.fecha}</td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.monto.startsWith('+') ? 'text-emerald-600' : 'text-neutral-900'}`}>{t.monto}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${t.estatus === 'Completado' ? 'bg-emerald-50 text-emerald-600' : t.estatus === 'Deducido' ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-500'}`}>{t.estatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
