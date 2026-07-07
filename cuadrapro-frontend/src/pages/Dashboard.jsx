// ==========================================
// CuadraPro - Dashboard Auditoría Premium (v2.0 + SAT + Detector de Fugas)
// Firma: MLagunes
// ==========================================
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Wallet, TrendingDown, ArrowDownRight, Download, Calendar, Activity, ArrowUpRight, Search, ChevronLeft, ChevronRight, FileCode, CheckCircle2, AlertTriangle, RefreshCw, HelpCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [diasFiltro, setDiasFiltro] = useState('7');
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState(false);
  
  // Pestaña de la tabla de auditoría: 'lotes' | 'fugas'
  const [tabTabla, setTabTabla] = useState('lotes');

  // Estados para búsqueda, filtro de pasarela y paginación en lotes
  const [busqueda, setBusqueda] = useState('');
  const [filtroPasarela, setFiltroPasarela] = useState('Todas');
  const [pagina, setPagina] = useState(1);

  // Estado de alertas de fugas calculadas por el backend
  const [fugas, setFugas] = useState([]);
  const [ocultarOnboarding, setOcultarOnboarding] = useState(localStorage.getItem('cuadrapro-hide-onboarding') === 'true');

  const { success, error: toastError } = useToast();
  const COLORES = ['#00C49F', '#3b82f6', '#f43f5e'];

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const token = localStorage.getItem('tokenCuadraPro');
        const url = diasFiltro === 'todos'
          ? `${import.meta.env.VITE_API_URL}/api/v1/conciliaciones/dashboard`
          : `${import.meta.env.VITE_API_URL}/api/v1/conciliaciones/dashboard?dias=${diasFiltro}`;
          
        const [respuestaDash, respuestaFugas] = await Promise.all([
          axios.get(url, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/conciliaciones/alertas-fugas`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setDatos(respuestaDash.data);
        setFugas(respuestaFugas.data);
      } catch (error) {
        console.error('Error cargando métricas de auditoría', error);
        toastError('Falla al conectar con la bóveda contable.');
      } finally {
        setTimeout(() => setCargando(false), 300);
      }
    };

    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diasFiltro]);

  const exportarExcel = () => {
    if (!datos) return;
    try {
      const wb = XLSX.utils.book_new();

      // === HOJA 1: Resumen Ejecutivo Contable ===
      const dataResumen = [
        ["CUADRAPRO — REPORTE DE CONCILIACIÓN Y AUDITORÍA FISCAL"],
        [`Generado: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`],
        [`Periodo: Últimos ${diasFiltro === 'todos' ? 'todos los' : diasFiltro} días`],
        [],
        ["Métrica", "Valor ($MXN)", "Observación"],
        ["Total Esperado (Ventas)", totalEsperadoVal.toFixed(2), "Suma de ingresos proyectados por pasarelas"],
        ["Depositado en Banco", totalDepositadoVal.toFixed(2), "Montos realmente acreditados"],
        ["Facturado al SAT (CFDI)", totalFacturadoSatVal.toFixed(2), "Sumatoria de CFDIs cargados en el periodo"],
        ["Fuga Total de Deducciones", fugaDeduccionesVal.toFixed(2), "Clip + Mercado Pago + SAT"],
        ["Brecha Fiscal (Depósito vs SAT)", diferenciaFiscal.toFixed(2), Math.abs(diferenciaFiscal) > 100 ? "⚠️ DISCREPANCIA" : "✅ Cuadrado"],
        ["Estado de Salud", datos.kpis.estadoSalud, ""],
        [],
        ["Desglose de Deducciones por Pasarela:"],
        ["Pasarela", "Monto Deducido"],
        ...(datos.datosDeducciones || []).map(d => [d.nombre, d.valor.toFixed(2)])
      ];
      const wsResumen = XLSX.utils.aoa_to_sheet(dataResumen);
      wsResumen['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 45 }];
      XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Ejecutivo");

      // === HOJA 2: Desglose Semanal ===
      if (datos.datosSemanales && datos.datosSemanales.length > 0) {
        const headerSemanal = [["Día", "Esperado ($)", "Depositado ($)", "Diferencia ($)", "% Retención"]];
        const filasSemanal = datos.datosSemanales.map(d => {
          const dif = d.esperado - d.depositado;
          const pct = d.esperado > 0 ? ((dif / d.esperado) * 100).toFixed(2) + '%' : '0%';
          return [d.dia, d.esperado.toFixed(2), d.depositado.toFixed(2), dif.toFixed(2), pct];
        });
        const wsSemanal = XLSX.utils.aoa_to_sheet([...headerSemanal, ...filasSemanal]);
        wsSemanal['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsSemanal, "Desglose Semanal");
      }

      // === HOJA 3: Fugas de Comisiones ===
      if (fugas && fugas.length > 0) {
        const headerFugas = [["Fecha", "Día", "Esperado ($)", "Depositado ($)", "Deducción Real ($)", "Deducción Teórica ($)", "Fuga ($)", "Pasarela"]];
        const filasFugas = fugas.map(f => [
          new Date(f.fecha).toLocaleDateString('es-MX'), f.dia, f.esperado.toFixed(2), 
          f.depositado.toFixed(2), f.deduccionReal.toFixed(2), f.deduccionTeorica.toFixed(2), 
          f.fuga.toFixed(2), f.pasarelaAfectada
        ]);
        const wsFugas = XLSX.utils.aoa_to_sheet([...headerFugas, ...filasFugas]);
        wsFugas['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 16 }];
        XLSX.utils.book_append_sheet(wb, wsFugas, "Fugas de Comisiones");
      }

      XLSX.writeFile(wb, `Auditoria_CuadraPro_${diasFiltro}_dias_${new Date().toISOString().slice(0,10)}.xlsx`);
      success('Reporte CFO multi-hoja exportado con éxito.');
    } catch (error) {
      console.error(error);
      toastError('No se pudo generar el archivo Excel.');
    }
  };

  const generarAclaracion = (fuga) => {
    success(`Generando reporte de aclaración para ${fuga.pasarelaAfectada} por $${fuga.fuga.toFixed(2)} MXN.`);
  };

  // Movimientos financieros reales de la base de datos (con fallback a simulación si está vacía)
  const flujosDeLaBoveda = datos?.flujosReal || [];
  const transacciones = flujosDeLaBoveda.length > 0
    ? flujosDeLaBoveda.flatMap(f => {
        const registros = [];
        const fechaFormateada = f.fecha_corte 
          ? new Date(f.fecha_corte).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) 
          : f.dia;
        
        // Fila 1: Depósito Conciliado
        registros.push({
          id: `DEP-${f.id}`,
          fecha: fechaFormateada,
          tipo: 'Depósito Conciliado',
          pasarela: parseFloat(f.comision_clip) > 0 ? 'Clip' : parseFloat(f.comision_mercadopago) > 0 ? 'Mercado Pago' : 'Banco',
          monto: `+ $${parseFloat(f.esperado || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          estatus: 'Completado'
        });

        // Fila 2: Si hubo comisión Clip
        if (parseFloat(f.comision_clip) > 0) {
          registros.push({
            id: `COM-${f.id}-CL`,
            fecha: fechaFormateada,
            tipo: 'Deducción Clip',
            pasarela: 'Clip',
            monto: `- $${parseFloat(f.comision_clip).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            estatus: 'Deducido'
          });
        }

        // Fila 3: Si hubo comisión MercadoPago
        if (parseFloat(f.comision_mercadopago) > 0) {
          registros.push({
            id: `COM-${f.id}-MP`,
            fecha: fechaFormateada,
            tipo: 'Deducción Mercado Pago',
            pasarela: 'Mercado Pago',
            monto: `- $${parseFloat(f.comision_mercadopago).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            estatus: 'Deducido'
          });
        }

        // Fila 4: Si hubo retención SAT
        if (parseFloat(f.retencion_sat) > 0) {
          registros.push({
            id: `RET-${f.id}-SAT`,
            fecha: fechaFormateada,
            tipo: 'Retención SAT',
            pasarela: 'SAT',
            monto: `- $${parseFloat(f.retencion_sat).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            estatus: 'Deducido'
          });
        }

        return registros;
      })
    : [
        { id: 'TRX-1092', fecha: 'Hoy, 14:30', tipo: 'Liquidación Clip', pasarela: 'Clip', monto: '+ $3,450.00', estatus: 'Completado' },
        { id: 'TRX-1091', fecha: 'Hoy, 09:15', tipo: 'Retención SAT', pasarela: 'SAT', monto: '- $85.50', estatus: 'Deducido' },
        { id: 'TRX-1090', fecha: 'Ayer, 18:45', tipo: 'Cobro Mercado Pago', pasarela: 'Mercado Pago', monto: '+ $1,200.00', estatus: 'Pendiente' },
        { id: 'TRX-1089', fecha: '28 Jun, 12:10', tipo: 'Liquidación Clip', pasarela: 'Clip', monto: '+ $4,890.00', estatus: 'Completado' },
        { id: 'TRX-1088', fecha: '27 Jun, 15:30', tipo: 'Retención SAT', pasarela: 'SAT', monto: '- $120.00', estatus: 'Deducido' },
        { id: 'TRX-1087', fecha: '27 Jun, 10:20', tipo: 'Cobro Mercado Pago', pasarela: 'Mercado Pago', monto: '+ $2,100.00', estatus: 'Completado' },
        { id: 'TRX-1086', fecha: '26 Jun, 11:45', tipo: 'Liquidación Clip', pasarela: 'Clip', monto: '+ $1,750.00', estatus: 'Completado' },
        { id: 'TRX-1085', fecha: '25 Jun, 09:00', tipo: 'Cobro Mercado Pago', pasarela: 'Mercado Pago', monto: '+ $950.00', estatus: 'Completado' }
      ];

  // Lógica de filtrado de transacciones
  const transaccionesFiltradas = transacciones.filter(t => {
    const cumpleBusqueda = t.id.toLowerCase().includes(busqueda.toLowerCase()) || 
                           t.tipo.toLowerCase().includes(busqueda.toLowerCase());
    const cumplePasarela = filtroPasarela === 'Todas' || t.pasarela === filtroPasarela;
    return cumpleBusqueda && cumplePasarela;
  });

  const elementosPorPagina = 4;
  const totalPaginas = Math.ceil(transaccionesFiltradas.length / elementosPorPagina) || 1;
  const transaccionesPaginadas = transaccionesFiltradas.slice(
    (pagina - 1) * elementosPorPagina,
    pagina * elementosPorPagina
  );

  const springConfig = { type: "spring", stiffness: 300, damping: 30 };
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: springConfig }
  };

  if (cargando) return (
    <div className="space-y-8 animate-pulse p-2 bg-neutral-50 dark:bg-[#0B0F19] text-neutral-400 dark:text-neutral-500 min-h-screen">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-850 rounded-lg"></div>
          <div className="h-4 w-48 bg-neutral-300 dark:bg-neutral-900 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-850 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-neutral-800 rounded-2xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-neutral-800 rounded-2xl"></div>
        <div className="h-80 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-neutral-800 rounded-2xl"></div>
      </div>
    </div>
  );

  // 1. Manejo Defensivo si la API falló (sesión expirada o error de red)
  if (!cargando && !datos) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-5 bg-white dark:bg-[#151922]/50 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none transition-colors duration-300 p-8">
        <div className="w-16 h-16 bg-rose-50 dark:bg-[#ff4b4b]/10 text-rose-550 dark:text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 dark:border-rose-500/20 shadow-premium-sm dark:shadow-none">
          <AlertTriangle size={28} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest font-title">Sesión Expirada o Error de Conexión</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-405 mt-1 max-w-xs leading-relaxed">
            No pudimos autenticar o recuperar tus balances financieros desde el servidor local.
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('tokenCuadraPro');
            window.location.href = '/login';
          }}
          className="px-6 py-2.5 bg-b2bHighlight text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all shadow-md"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // 2. Pantalla amigable si la base de datos está vacía (0 transacciones)
  if (datos && datos.kpis.totalEsperado === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={springConfig} 
        className="flex flex-col items-center justify-center h-[65vh] text-center space-y-6 bg-white dark:bg-[#151922]/50 rounded-[32px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none transition-colors duration-300 p-8"
      >
        <div className="w-20 h-20 bg-neutral-50 dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-850 rounded-3xl flex items-center justify-center text-neutral-400 dark:text-neutral-500 shadow-premium-sm dark:shadow-none">
          <Wallet size={36} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight font-title">Sin actividad financiera</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Registra tu primer ingreso o depósito para generar métricas detalladas de conciliación en el rango seleccionado.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setDiasFiltro('todos')} 
            className="px-5 py-3 bg-white dark:bg-[#1b2230] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-50 dark:hover:bg-[#202738] transition-all shadow-premium-sm dark:shadow-none"
          >
            Ver todo el histórico
          </button>
          <button 
            onClick={() => navigate('/captura')} 
            className="px-6 py-3 bg-[#00C49F] hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md border border-[#00C49F]/10"
          >
            Comenzar Captura
          </button>
        </div>
      </motion.div>
    );
  }

  // 3. Inicialización segura de KPIs y Cálculos Fiscales
  const totalEsperadoVal = datos?.kpis?.totalEsperado || 0;
  const fugaDeduccionesVal = datos?.kpis?.fugaDeducciones || 0;
  const estadoSaludVal = datos?.kpis?.estadoSalud || 'Revisión';
  const totalDepositadoVal = datos?.kpis?.totalDepositado || 0;
  const totalFacturadoSatVal = datos?.kpis?.totalFacturadoSat || 0;
  const diferenciaFiscal = totalDepositadoVal - totalFacturadoSatVal;
  
  let estadoFiscalLabel = "Excelente (Cuadrado)";
  let estadoFiscalColor = "text-[#00C49F]";
  let estadoFiscalBg = "bg-[#00C49F]/10 text-[#00C49F] border border-[#00C49F]/20";
  let estadoFiscalIcon = <CheckCircle2 size={12} className="text-[#00C49F]" />;

  if (totalFacturadoSatVal === 0) {
    estadoFiscalLabel = "Ingresar CFDIs";
    estadoFiscalColor = "text-neutral-400";
    estadoFiscalBg = "bg-neutral-850 text-neutral-500 border border-neutral-800/40";
    estadoFiscalIcon = <FileCode size={12} className="text-neutral-400" />;
  } else if (Math.abs(diferenciaFiscal) > 100) {
    estadoFiscalLabel = `Discrepancia: $${Math.abs(diferenciaFiscal).toLocaleString()}`;
    estadoFiscalColor = "text-amber-500";
    estadoFiscalBg = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    estadoFiscalIcon = <AlertTriangle size={12} className="text-amber-500" />;
  }

  // Colores de la dona tipo Figma
  const DONUT_COLORS = ['#00C49F', '#00e5bc', '#009d7f', '#00765f'];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      
      {/* Controles del Periodo e Histórico (Header Interno) */}
      <motion.div variants={itemVariants} className="flex flex-row items-center justify-between gap-4 bg-white dark:bg-[#151922]/50 border border-neutral-200 dark:border-neutral-800/60 p-4 rounded-2xl shadow-premium-sm dark:shadow-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00C49F] rounded-full shadow-[0_0_8px_rgba(0,196,159,0.6)]"></div>
          <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Auditoría Financiera Activa</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Dropdown Filtro de Días */}
          <div className="relative">
            <button 
              onClick={() => setMenuFiltroAbierto(!menuFiltroAbierto)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-50 dark:hover:bg-[#202738] transition-colors shadow-premium-sm dark:shadow-none"
            >
              <Calendar size={13} className="text-[#00C49F]" /> 
              {diasFiltro === 'todos' ? 'Todo el histórico' : `Últimos ${diasFiltro} días`}
            </button>
            {menuFiltroAbierto && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuFiltroAbierto(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-neutral-850 rounded-2xl shadow-premium-lg dark:shadow-lg z-30 py-1.5 overflow-hidden animate-fade-in">
                  {[
                    { val: '7', label: 'Últimos 7 días' },
                    { val: '30', label: 'Últimos 30 días' },
                    { val: 'todos', label: 'Todo el histórico' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => { setDiasFiltro(opt.val); setMenuFiltroAbierto(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${diasFiltro === opt.val ? 'text-[#00C49F] font-bold' : 'text-neutral-600 dark:text-neutral-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportarExcel} 
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-[#202738] text-neutral-700 dark:text-white rounded-xl text-xs font-bold transition-all shadow-premium-sm dark:shadow-none"
          >
            <Download size={13} className="text-[#00C49F]" /> Exportar Reporte
          </motion.button>
        </div>
      </motion.div>

      {/* 4 Tarjetas de Métricas horizontales con resplandor neón cian */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Balance Total', 
            valor: `$${totalEsperadoVal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
            icon: <Wallet size={16} />, 
            trend: '+4.8%', 
            trendColor: 'text-[#00C49F]',
            subtext: 'este mes',
            glow: 'shadow-[0_4px_30px_rgba(0,196,159,0.08)] border-[#00C49F]/20 dark:border-[#00C49F]/20'
          },
          { 
            label: 'Efectivo Disponible', 
            valor: `$${totalDepositadoVal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
            icon: <Wallet size={16} />, 
            trend: 'Estable', 
            trendColor: 'text-[#00C49F]',
            subtext: 'este mes',
            glow: 'border-neutral-200 dark:border-neutral-800 shadow-premium-sm dark:shadow-none'
          },
          { 
            label: 'Utilidad Neta', 
            valor: `$${(totalEsperadoVal - fugaDeduccionesVal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
            icon: <Activity size={16} />, 
            trend: 'Precisión 93.2%', 
            trendColor: 'text-[#00C49F]',
            subtext: 'este mes',
            glow: 'border-neutral-200 dark:border-neutral-800 shadow-premium-sm dark:shadow-none'
          },
          { 
            label: 'Gastos Totales', 
            valor: `$${fugaDeduccionesVal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 
            icon: <TrendingDown size={16} />, 
            trend: '+5.1% de error', 
            trendColor: 'text-rose-500',
            subtext: 'este mes',
            glow: 'border-neutral-200 dark:border-neutral-800 shadow-premium-sm dark:shadow-none'
          }
        ].map((kpi, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.015 }}
            className={`bg-white dark:bg-[#151922]/50 p-6 rounded-3xl border ${kpi.glow} transition-all group flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{kpi.label}</span>
              <span className="p-2 bg-neutral-105 dark:bg-[#1b2230] rounded-xl text-[#00C49F] border border-neutral-200/40 dark:border-neutral-800/10">
                {kpi.icon}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-mono">{kpi.valor}</h3>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500 font-bold">
              <span className={kpi.trendColor}>{kpi.trend}</span>
              <span>{kpi.subtext}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Grid Principal de 2 Columnas (Estilo Figma) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico Mix grande: Financial Performance */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#151922]/50 p-6 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-title">Rendimiento Financiero</h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold mt-1">Ingresos Mensuales vs. Gastos</p>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C49F]"></span> Ingresos
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-350 dark:bg-white"></span> Gastos
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer>
                <BarChart data={datos?.datosSemanales} margin={{ top: 10, right: 0, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFirmaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.1} />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#8a94a6', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#8a94a6', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: 'currentColor', className: 'text-neutral-100/30 dark:text-neutral-800/10', opacity: 0.3}} 
                    contentStyle={{
                      backgroundColor: 'rgba(var(--bg-tooltip, 21, 25, 34), 0.95)',
                      borderRadius: '16px',
                      border: '1px solid rgba(var(--border-tooltip, 45, 55, 72), 0.2)',
                      color: '#fff',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Bar dataKey="esperado" fill="#00C49F" radius={[4, 4, 0, 0]} name="Ingresos" barSize={22} />
                  <Bar dataKey="depositado" fill="url(#colorFirmaGlow)" opacity={0.25} radius={[4, 4, 0, 0]} name="Gastos" barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Tabla: Transacciones Recientes */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#151922]/50 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-title">Transacciones Recientes</h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Historial del periodo actual</p>
              </div>
              
              <div className="flex gap-2 bg-neutral-55 dark:bg-[#151922] p-1 rounded-xl w-fit border border-neutral-200 dark:border-neutral-800">
                <button 
                  onClick={() => setTabTabla('lotes')}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${tabTabla === 'lotes' ? 'bg-white dark:bg-[#00C49F]/10 text-[#00C49F] shadow-premium-sm dark:shadow-none' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-[#00C49F]'}`}
                >
                  Lotes Diarios
                </button>
                <button 
                  onClick={() => setTabTabla('fugas')}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${tabTabla === 'fugas' ? 'bg-white dark:bg-[#00C49F]/10 text-[#00C49F] shadow-premium-sm dark:shadow-none' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-[#00C49F]'}`}
                >
                  Fugas de Comisiones
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {tabTabla === 'lotes' ? (
                <motion.div key="lotes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-850">
                          <th className="px-6 py-4">Fecha</th>
                          <th className="px-6 py-4">Descripción</th>
                          <th className="px-6 py-4">Categoría</th>
                          <th className="px-6 py-4 text-right">Monto</th>
                          <th className="px-6 py-4 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850/50 text-xs text-neutral-600 dark:text-neutral-300">
                        {transaccionesPaginadas.length > 0 ? (
                          transaccionesPaginadas.map((t, i) => (
                            <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-[#1a2030]/20 transition-all cursor-pointer">
                              <td className="px-6 py-4 text-[11px] text-neutral-450 dark:text-neutral-500">{t.fecha}</td>
                              <td className="px-6 py-4 font-bold text-neutral-850 dark:text-white">{t.tipo}</td>
                              <td className="px-6 py-4 font-mono text-[11px] text-neutral-500">{t.id}</td>
                              <td className="px-6 py-4 text-right font-bold text-neutral-850 dark:text-white font-mono">{t.monto}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                  t.estatus === 'Completado' 
                                    ? 'bg-[#00C49F]/10 text-[#00C49F] border border-[#00C49F]/20' 
                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}>{t.estatus === 'Completado' ? 'Pagado' : 'Deducido'}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-xs text-neutral-450 dark:text-neutral-500 uppercase tracking-widest">
                              Ninguna transacción coincide con los criterios.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginador */}
                  <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between text-xs font-semibold text-neutral-500">
                    <span>Mostrando {transaccionesPaginadas.length} de {transaccionesFiltradas.length} registros</span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        disabled={pagina === 1}
                        onClick={() => setPagina(p => Math.max(p - 1, 1))}
                        className="p-2 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-55 dark:hover:bg-[#202738] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-neutral-600 dark:text-white shadow-premium-sm dark:shadow-none"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="px-3 font-mono font-bold text-neutral-700 dark:text-neutral-300">Página {pagina} de {totalPaginas}</span>
                      <button 
                        disabled={pagina === totalPaginas}
                        onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
                        className="p-2 bg-white dark:bg-[#151922] border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-55 dark:hover:bg-[#202738] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-neutral-600 dark:text-white shadow-premium-sm dark:shadow-none"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="fugas" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-850">
                          <th className="px-6 py-4">Fecha Corte</th>
                          <th className="px-6 py-4 text-right">Monto Esperado</th>
                          <th className="px-6 py-4 text-right">Deducción Real</th>
                          <th className="px-6 py-4 text-right">Deducción Teórica</th>
                          <th className="px-6 py-4 text-right text-rose-500 font-bold">Fuga</th>
                          <th className="px-6 py-4 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850/50 text-xs text-neutral-600 dark:text-neutral-300">
                        {fugas.length > 0 ? (
                          fugas.map((fuga) => (
                            <tr key={fuga.id} className="hover:bg-neutral-50 dark:hover:bg-[#1a2030]/20 transition-all cursor-default">
                              <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                                {new Date(fuga.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-neutral-800 dark:text-white font-semibold">${fuga.esperado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-4 text-right font-mono text-neutral-500 dark:text-neutral-400">${fuga.deduccionReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-4 text-right text-neutral-450 dark:text-neutral-500 font-mono">${fuga.deduccionTeorica.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-4 text-right font-black text-rose-550 dark:text-rose-500 font-mono">${fuga.fuga.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-4 text-center">
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => generarAclaracion(fuga)}
                                  className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-colors"
                                >
                                  Aclarar
                                </motion.button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-neutral-450 dark:text-neutral-500 italic">
                              No se han detectado fugas de comisiones en el periodo.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

        {/* Columna Derecha (1/3) */}
        <div className="space-y-6">
          
          {/* Cash Flow Forecast (Histograma pequeño) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#151922]/50 p-6 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none"
          >
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-4 font-title">Flujo de Efectivo</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer>
                <BarChart data={datos?.datosSemanales} margin={{ top: 5, right: 0, left: -32, bottom: 0 }}>
                  <Bar dataKey="depositado" fill="#00C49F" opacity={0.85} radius={[3, 3, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Expense Breakdown (Pie Chart Dona) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#151922]/50 p-6 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none flex flex-col justify-between"
          >
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-6 font-title">Desglose de Gastos</h3>
            <div className="relative min-h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie 
                    data={datos?.datosDeducciones} 
                    innerRadius={58} 
                    outerRadius={75} 
                    paddingAngle={4} 
                    dataKey="valor" 
                    stroke="none"
                  >
                    {datos?.datosDeducciones.map((e, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} className="hover:opacity-90 transition-opacity duration-300 outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(var(--bg-tooltip, 21, 25, 34), 0.95)',
                      borderRadius: '12px', 
                      border: '1px solid rgba(var(--border-tooltip, 45, 55, 72), 0.2)',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-[8px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Deducciones</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white font-mono">${fugaDeduccionesVal.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Activity */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-[#151922]/50 p-6 rounded-[28px] border border-neutral-200/60 dark:border-neutral-800/80 shadow-premium-sm dark:shadow-none text-left"
          >
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-4 font-title">Resumen de Actividad</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-bold">Total Conciliado</span>
                <span className="text-neutral-800 dark:text-white font-bold font-mono">${totalEsperadoVal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-bold">Comisiones y Gastos</span>
                <span className="text-neutral-800 dark:text-white font-bold font-mono">${fugaDeduccionesVal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 font-bold">Publicidad y Mercadotecnia</span>
                <span className="text-neutral-800 dark:text-white font-bold font-mono">$10,300</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>

    </motion.div>
  );
}
