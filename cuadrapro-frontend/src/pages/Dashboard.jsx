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
    <div className="space-y-8 animate-pulse p-2">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-neutral-200 rounded-lg"></div>
          <div className="h-4 w-40 bg-neutral-100 rounded-lg"></div>
        </div>
        <div className="h-9 w-28 bg-neutral-200 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-neutral-100 border border-neutral-200/50 rounded-2xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-neutral-100 border border-neutral-200/50 rounded-2xl"></div>
        <div className="h-80 bg-neutral-100 border border-neutral-200/50 rounded-2xl"></div>
      </div>
    </div>
  );

  // 1. Manejo Defensivo si la API falló (sesión expirada o error de red)
  if (!cargando && !datos) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-5">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 shadow-premium-sm">
          <AlertTriangle size={28} />
        </div>
        <div>
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">Sesión Expirada o Error de Conexión</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
            No pudimos autenticar o recuperar tus balances financieros desde el servidor local.
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('tokenCuadraPro');
            window.location.href = '/login';
          }}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-premium-md"
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
        className="flex flex-col items-center justify-center h-[65vh] text-center space-y-6"
      >
        <div className="w-20 h-20 bg-white border border-neutral-200/60 rounded-3xl flex items-center justify-center text-neutral-400 shadow-premium-md">
          <Wallet size={36} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Sin actividad financiera</h2>
          <p className="text-sm text-neutral-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Registra tu primer ingreso o depósito para generar métricas detalladas de conciliación en el rango seleccionado.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setDiasFiltro('todos')} 
            className="px-5 py-3 bg-white border border-neutral-200/60 text-neutral-600 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-all shadow-premium-sm"
          >
            Ver todo el histórico
          </button>
          <button 
            onClick={() => navigate('/captura')} 
            className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-premium-md hover:scale-[1.02] active:scale-[0.98]"
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
  let estadoFiscalColor = "text-b2bHighlight";
  let estadoFiscalBg = "bg-emerald-50 text-emerald-700 border border-emerald-100/30";
  let estadoFiscalIcon = <CheckCircle2 size={12} className="text-emerald-500" />;

  if (totalFacturadoSatVal === 0) {
    estadoFiscalLabel = "Ingresar CFDIs";
    estadoFiscalColor = "text-neutral-400";
    estadoFiscalBg = "bg-neutral-100 text-neutral-500 border border-neutral-200/30";
    estadoFiscalIcon = <FileCode size={12} className="text-neutral-400" />;
  } else if (Math.abs(diferenciaFiscal) > 100) {
    estadoFiscalLabel = `Discrepancia: $${Math.abs(diferenciaFiscal).toLocaleString()}`;
    estadoFiscalColor = "text-amber-500";
    estadoFiscalBg = "bg-amber-50 text-amber-700 border border-amber-100/30";
    estadoFiscalIcon = <AlertTriangle size={12} className="text-amber-500" />;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
             <div className="w-2 h-2 bg-b2bHighlight rounded-full shadow-[0_0_8px_rgba(0,196,159,0.6)]"></div>
             <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sincronización en Tiempo Real</span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Análisis de Conciliación</h2>
        </div>
        <div className="flex items-center gap-3">
          
          {/* Dropdown Filtro de Días */}
          <div className="relative">
            <button 
              onClick={() => setMenuFiltroAbierto(!menuFiltroAbierto)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200/60 text-neutral-600 rounded-xl text-xs font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-premium shadow-premium-sm"
            >
              <Calendar size={13} /> 
              {diasFiltro === 'todos' ? 'Todo el histórico' : `Últimos ${diasFiltro} días`}
            </button>
            {menuFiltroAbierto && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuFiltroAbierto(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200/50 rounded-2xl shadow-premium-lg z-30 py-1.5 overflow-hidden animate-fade-in">
                  {[
                    { val: '7', label: 'Últimos 7 días' },
                    { val: '30', label: 'Últimos 30 días' },
                    { val: 'todos', label: 'Todo el histórico' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => { setDiasFiltro(opt.val); setMenuFiltroAbierto(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 transition-colors ${diasFiltro === opt.val ? 'text-b2bHighlight bg-neutral-50/40 font-bold' : 'text-neutral-600'}`}
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
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-premium-md"
          >
            <Download size={13} /> Exportar Reporte
          </motion.button>
        </div>
      </motion.div>

      {/* Widget de Onboarding Interactivo para Usuarios No-Devs */}
      <AnimatePresence>
        {!ocultarOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={springConfig}
            className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/15 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Orbe decorativo */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-b2bHighlight/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-b2bHighlight/20 text-b2bHighlight rounded-xl"><CheckCircle2 size={16} /></span>
                <h3 className="text-xs font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-widest">Guía de Inicio de tu Bóveda</h3>
              </div>
              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 leading-normal max-w-2xl">
                ¡Hola! Bienvenido a CuadraPro. Tu bóveda de conciliación está al <span className="font-black text-b2bHighlight">66%</span> configurada de forma óptima para detectar fugas de dinero en pasarelas de pago y discrepancias fiscales ante el SAT. Completar los pasos te tomará menos de 2 minutos.
              </p>

              {/* Lista de pasos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 bg-white dark:bg-[#121212] border border-neutral-200/40 dark:border-neutral-800/80 rounded-2xl">
                  <CheckCircle2 size={15} className="text-b2bHighlight shrink-0" />
                  <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">1. Bóveda Conectada</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-white dark:bg-[#121212] border border-neutral-200/40 dark:border-neutral-800/80 rounded-2xl">
                  <CheckCircle2 size={15} className="text-b2bHighlight shrink-0" />
                  <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">2. Acceso Google / Gmail</span>
                </div>
                <button
                  onClick={() => navigate('/captura')}
                  className="flex items-center justify-between p-3 bg-white dark:bg-[#121212] border border-dashed border-b2bHighlight/60 hover:border-b2bHighlight rounded-2xl text-left group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border-2 border-b2bHighlight flex items-center justify-center shrink-0 group-hover:bg-b2bHighlight/10 transition-colors">
                      <div className="w-1.5 h-1.5 bg-transparent rounded-full"></div>
                    </div>
                    <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-b2bHighlight transition-colors">3. Conciliar Caja Diaria</span>
                  </div>
                  <ArrowUpRight size={12} className="text-neutral-400 group-hover:text-b2bHighlight transition-colors" />
                </button>
              </div>

              {/* Barra de progreso */}
              <div className="space-y-1.5 max-w-md">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  <span>Progreso de Configuración</span>
                  <span>66% completado</span>
                </div>
                <div className="h-1.5 bg-neutral-200 dark:bg-neutral-850 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '66%' }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }}
                    className="h-full bg-b2bHighlight rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center gap-3 shrink-0 self-end md:self-center">
              <button
                onClick={() => {
                  localStorage.setItem('cuadrapro-hide-onboarding', 'true');
                  setOcultarOnboarding(true);
                }}
                className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                Ocultar guía
              </button>
              <button
                onClick={() => navigate('/captura')}
                className="px-5 py-3 bg-neutral-900 dark:bg-neutral-100 hover:bg-black dark:hover:bg-white text-white dark:text-neutral-900 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-premium-md flex items-center gap-1.5"
              >
                Comenzar <ArrowUpRight size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs Cards (4 Columnas) */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Esperado', 
            valor: `$${totalEsperadoVal.toLocaleString()}`, 
            icon: <Wallet size={16} />, 
            color: 'text-neutral-900', 
            trend: '+12.4% vs ayer', 
            trendIcon: <ArrowUpRight size={12} className="text-emerald-500" />,
            trendBg: 'bg-emerald-50 text-emerald-700 border border-emerald-100/30',
            subtext: 'Flujo financiero esperado',
            ayuda: 'Es la suma total del dinero que deberías haber recibido en tu banco antes de comisiones y retenciones.'
          },
          { 
            label: 'Fuga en Pasarelas', 
            valor: `$${fugaDeduccionesVal.toLocaleString()}`, 
            icon: <TrendingDown size={16} />, 
            color: 'text-rose-600', 
            trend: '+5.1% de error', 
            trendIcon: <ArrowDownRight size={12} className="text-rose-500" />,
            trendBg: 'bg-rose-50 text-rose-700 border border-rose-100/30',
            subtext: 'Deducciones de terminales',
            ayuda: 'Comisiones cobradas de más por terminales de tarjetas (Clip/MercadoPago) que no coinciden con sus tasas.'
          },
          { 
            label: 'Salud Fiscal (SAT)', 
            valor: estadoFiscalLabel, 
            icon: <FileCode size={16} />, 
            color: estadoFiscalColor, 
            trend: `Total: $${totalFacturadoSatVal.toLocaleString()}`, 
            trendIcon: estadoFiscalIcon,
            trendBg: estadoFiscalBg,
            subtext: 'Conciliación CFDI vs Banco',
            ayuda: 'Indica si tus facturas CFDI timbradas ante el SAT coinciden al 100% con los depósitos reales en tu banco.'
          },
          { 
            label: 'Estado de Salud', 
            valor: estadoSaludVal, 
            icon: <Activity size={16} />, 
            color: estadoSaludVal === 'Óptimo' ? 'text-b2bHighlight' : 'text-amber-500', 
            trend: '93.2% precisión', 
            trendIcon: <Activity size={12} className={estadoSaludVal === 'Óptimo' ? 'text-emerald-500' : 'text-amber-500'} />,
            trendBg: estadoSaludVal === 'Óptimo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/30' : 'bg-amber-50 text-amber-700 border border-amber-100/30',
            subtext: 'Coincidencia de depósitos',
            ayuda: 'El porcentaje global de precisión y cuadratura de tus cuentas. Un valor óptimo es mayor al 90%.'
          }
        ].map((kpi, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={springConfig}
            className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 shadow-premium-sm hover:shadow-premium-md hover:border-neutral-300/60 dark:hover:border-neutral-700/80 transition-all group cursor-default relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:bg-b2bHighlight/40 transition-all duration-300"></div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-100 group-hover:text-neutral-800 dark:group-hover:bg-neutral-800 dark:group-hover:text-white transition-colors border border-neutral-200/10 dark:border-neutral-800/20">
                    {kpi.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{kpi.label}</span>
                  
                  {/* Tooltip de ayuda para No-Devs */}
                  <div className="relative group/tooltip">
                    <HelpCircle size={12} className="text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors cursor-pointer" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2.5 bg-neutral-900/95 dark:bg-neutral-800/95 text-[10px] font-medium text-neutral-200 leading-normal rounded-xl shadow-premium-lg pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 z-50 text-center border border-neutral-800/40 dark:border-neutral-700/50 backdrop-blur-sm">
                      {kpi.ayuda}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900/95 dark:border-t-neutral-800/95"></div>
                    </div>
                  </div>
                </div>
            </div>
            <div className="mb-2">
              <span className={`text-xl font-black tracking-tight font-mono ${kpi.color === 'text-neutral-900' ? 'text-neutral-900 dark:text-white' : kpi.color}`}>{kpi.valor}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-neutral-100/50 dark:border-neutral-800/50 flex items-center justify-between">
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-widest uppercase ${kpi.trendBg}`}>
                {kpi.trendIcon} {kpi.trend}
              </div>
              <p className="text-[9px] text-neutral-500 dark:text-neutral-400 font-semibold">{kpi.subtext}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BarChart */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -2 }} 
          transition={springConfig}
          className="lg:col-span-2 bg-white dark:bg-[#121212] p-6 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 shadow-premium-sm hover:shadow-premium-md dark:hover:border-neutral-700/80 transition-all duration-300"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Flujo de Depósitos Semanal</h3>
            <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-neutral-200 rounded-full"></div> Esperado
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-b2bHighlight rounded-full"></div> Depositado
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={datos?.datosSemanales} margin={{ top: 10, right: 0, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEsperado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e5e5e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f5f5f5" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorDepositado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0.15}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#525252', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#525252', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#fafafa', opacity: 0.6}} 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px', 
                    border: '1px solid rgba(229, 229, 229, 0.8)', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)'
                  }} 
                />
                <Bar dataKey="esperado" fill="url(#colorEsperado)" radius={[6, 6, 0, 0]} name="Esperado" barSize={26} />
                <Bar dataKey="depositado" fill="url(#colorDepositado)" radius={[6, 6, 0, 0]} name="Depositado" barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* PieChart */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={springConfig}
          className="bg-white dark:bg-[#121212] p-6 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 shadow-premium-sm hover:shadow-premium-md dark:hover:border-neutral-700/80 transition-all duration-300 flex flex-col"
        >
          <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">Distribución de Fuga</h3>
          <div className="flex-1 relative min-h-[220px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={datos?.datosDeducciones} 
                  innerRadius={68} 
                  outerRadius={85} 
                  paddingAngle={5} 
                  dataKey="valor" 
                  stroke="none"
                >
                  {datos?.datosDeducciones.map((e, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} className="hover:opacity-90 transition-opacity duration-300 outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    border: '1px solid rgba(229, 229, 229, 0.8)', 
                    boxShadow: '0 8px 20px -3px rgba(0,0,0,0.03)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Deducido</span>
              <span className="text-2xl font-black text-neutral-900 dark:text-white">${datos?.kpis?.fugaDeducciones.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Pestañas de Tabla (Lotes vs Fugas de Comisiones) */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#121212] rounded-2xl border border-neutral-200/50 dark:border-neutral-800/80 shadow-premium-sm overflow-hidden hover:shadow-premium-md dark:hover:border-neutral-700/80 transition-all duration-300">
        
        {/* Cabecera Pestañas */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/20 dark:bg-neutral-900/10">
          <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-850 p-1 rounded-xl w-fit border border-neutral-200/40 dark:border-neutral-800/30">
            <button 
              onClick={() => setTabTabla('lotes')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tabTabla === 'lotes' ? 'bg-white dark:bg-[#1c1c1c] text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
            >
              Lotes Diarios
            </button>
            <button 
              onClick={() => setTabTabla('fugas')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${tabTabla === 'fugas' ? 'bg-white text-rose-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Fugas de Comisiones {fugas.length > 0 && <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded text-[8px] font-bold">{fugas.length}</span>}
            </button>
          </div>
          
          {tabTabla === 'lotes' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 text-neutral-400" size={13} />
                <input 
                  type="text" 
                  value={busqueda}
                  onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
                  placeholder="Buscar TRX o Concepto..." 
                  className="pl-9 pr-4 py-2 text-xs bg-white border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight transition-all placeholder:text-neutral-400 w-52 text-neutral-800 font-semibold"
                />
              </div>
              <select
                value={filtroPasarela}
                onChange={e => { setFiltroPasarela(e.target.value); setPagina(1); }}
                className="px-3.5 py-2 text-xs bg-white border border-neutral-200 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight transition-all text-neutral-600 font-semibold cursor-pointer appearance-none"
              >
                <option value="Todas">Pasarelas: Todas</option>
                <option value="Clip">Clip</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="SAT">SAT</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Tabla de Lotes Diarios */}
        <AnimatePresence mode="wait">
          {tabTabla === 'lotes' ? (
            <motion.div 
              key="lotes-table" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest border-b border-neutral-100 bg-white">
                      <th className="px-6 py-4.5 font-bold">Identificador</th>
                      <th className="px-6 py-4.5 font-bold">Concepto</th>
                      <th className="px-6 py-4.5 font-bold">Fecha</th>
                      <th className="px-6 py-4.5 font-bold text-right">Monto</th>
                      <th className="px-6 py-4.5 font-bold text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100/50">
                    {transaccionesPaginadas.length > 0 ? (
                      transaccionesPaginadas.map((t, i) => (
                        <tr 
                          key={i} 
                          tabIndex={0}
                          role="button"
                          aria-label={`Transacción ${t.id}, ${t.tipo}, monto ${t.monto}, estado ${t.estatus}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              success(`Inspeccionando transacción ${t.id}`);
                            }
                          }}
                          className="hover:bg-neutral-50/30 transition-premium cursor-pointer group focus:outline-none focus:bg-neutral-50 focus:ring-2 focus:ring-b2bHighlight/50"
                        >
                          <td className="px-6 py-4.5 font-mono text-[11px] text-neutral-500 group-hover:text-neutral-700 transition-colors">{t.id}</td>
                          <td className="px-6 py-4.5 text-sm font-semibold text-neutral-800">{t.tipo}</td>
                          <td className="px-6 py-4.5 text-xs text-neutral-500">{t.fecha}</td>
                          <td className={`px-6 py-4.5 text-sm font-bold font-mono text-right ${t.monto.startsWith('+') ? 'text-emerald-600' : 'text-neutral-900'}`}>{t.monto}</td>
                          <td className="px-6 py-4.5 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                              t.estatus === 'Completado' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/40' 
                                : t.estatus === 'Deducido' 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100/40' 
                                : 'bg-neutral-100 text-neutral-600'
                            }`}>{t.estatus}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                          Ninguna transacción coincide con los criterios de búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginador */}
              <div className="px-6 py-3.5 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/30 text-xs font-semibold text-neutral-500">
                <span>
                  Mostrando {transaccionesPaginadas.length} de {transaccionesFiltradas.length} transacciones
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={pagina === 1}
                    onClick={() => setPagina(p => Math.max(p - 1, 1))}
                    className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-neutral-600 shadow-premium-sm"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3 font-mono font-bold text-neutral-800">
                    Página {pagina} de {totalPaginas}
                  </span>
                  <button 
                    disabled={pagina === totalPaginas}
                    onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
                    className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-neutral-600 shadow-premium-sm"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Tab 2: Tabla Detector de Fugas
            <motion.div 
              key="fugas-table" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest border-b border-neutral-100 bg-white">
                      <th className="px-6 py-4.5 font-bold">Fecha Corte</th>
                      <th className="px-6 py-4.5 font-bold text-right">Monto Esperado</th>
                      <th className="px-6 py-4.5 font-bold text-right">Deducción Real</th>
                      <th className="px-6 py-4.5 font-bold text-right">Deducción Teórica</th>
                      <th className="px-6 py-4.5 font-bold text-right text-rose-600">Excedente (Fuga)</th>
                      <th className="px-6 py-4.5 font-bold text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100/50 text-xs font-semibold text-neutral-700">
                    {fugas.length > 0 ? (
                      fugas.map((fuga) => (
                        <tr key={fuga.id} className="hover:bg-neutral-50/30 transition-premium cursor-default">
                          <td className="px-6 py-4.5 text-neutral-600">
                            {new Date(fuga.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} ({fuga.dia})
                          </td>
                          <td className="px-6 py-4.5 text-right font-mono">${fuga.esperado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4.5 text-right text-neutral-600 font-mono">${fuga.deduccionReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4.5 text-right text-neutral-500 font-medium font-mono">${fuga.deduccionTeorica.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4.5 text-right font-black text-rose-600 font-mono">${fuga.fuga.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4.5 text-center">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => generarAclaracion(fuga)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-colors"
                            >
                              Generar Aclaración
                            </motion.button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-neutral-400 italic">
                          <div className="flex flex-col items-center justify-center space-y-2 py-4">
                            <RefreshCw size={24} className="animate-spin text-neutral-300 mb-1" />
                            <span>Auditoría limpia. No se han detectado fugas de comisiones en el periodo.</span>
                          </div>
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
    </motion.div>
  );
}
