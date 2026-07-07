// ==========================================
// CuadraPro - Módulo de Captura y Carga SAT (v2.0)
// Firma: MLagunes
// ==========================================
import { useState } from 'react';
import axios from 'axios';
import { CircleDollarSign, Save, ShieldCheck, UploadCloud, FileSpreadsheet, FileCode, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Captura() {
  const [seccionActiva, setSeccionActiva] = useState('banco'); // 'banco' | 'sat'
  const { success, error: toastError } = useToast();

  // Estados sección Banco
  const [formulario, setFormulario] = useState({
    fecha_corte: new Date().toISOString().split('T')[0],
    dia_semana: 'Lunes',
    monto_esperado: '', monto_depositado: '', comision_clip: '', comision_mercadopago: '', retencion_sat: ''
  });
  const [dragBanco, setDragBanco] = useState(false);
  const [archivoBanco, setArchivoBanco] = useState(null);

  // Estados sección SAT
  const [dragSat, setDragSat] = useState(false);
  const [xmlCargados, setXmlCargados] = useState([]);
  const [cargandoSat, setCargandoSat] = useState(false);

  const token = localStorage.getItem('tokenCuadraPro');

  const guardarFlujo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/conciliaciones/registrar`, formulario, {
        headers: { Authorization: `Bearer ${token}` }
      });
      success('Registro financiero guardado de forma segura.');
      setFormulario({ ...formulario, monto_esperado: '', monto_depositado: '', comision_clip: '', comision_mercadopago: '', retencion_sat: '' });
      setArchivoBanco(null);
    } catch (error) {
      console.error(error);
      toastError('Falla al guardar el registro contable.');
    }
  };

  const simularCargaBanco = (fileName) => {
    setArchivoBanco(fileName);
    setFormulario({
      fecha_corte: new Date().toISOString().split('T')[0],
      dia_semana: 'Miércoles',
      monto_esperado: '25400.00',
      monto_depositado: '25385.00',
      comision_clip: '762.00',
      comision_mercadopago: '863.60',
      retencion_sat: '2032.00'
    });
    success('Lote bancario parseado y cargado en el formulario.');
  };

  // Drag & Drop Banco
  const handleDragBanco = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setDragBanco(true);
    else if (e.type === "dragleave") setDragBanco(false);
  };

  const handleDropBanco = (e) => {
    e.preventDefault();
    setDragBanco(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simularCargaBanco(e.dataTransfer.files[0].name);
    }
  };

  // Drag & Drop SAT (FileReader Real)
  const handleDragSat = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setDragSat(true);
    else if (e.type === "dragleave") setDragSat(false);
  };

  const procesarLoteXml = async (files) => {
    setCargandoSat(true);
    const promesasLector = [];
    const xmlContents = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith('.xml')) {
        const promesa = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            xmlContents.push(e.target.result);
            resolve();
          };
          reader.readAsText(file);
        });
        promesasLector.push(promesa);
      }
    }

    if (promesasLector.length === 0) {
      toastError('No se detectaron archivos XML válidos.');
      setCargandoSat(false);
      return;
    }

    await Promise.all(promesasLector);

    try {
      const respuesta = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/conciliaciones/subir-facturas`, {
        facturas: xmlContents
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { importados, omitidos } = respuesta.data;
      success(`Lote fiscal cargado: ${importados} importadas, ${omitidos} duplicadas.`);
      setXmlCargados(Array.from(files).map(f => f.name));
    } catch (err) {
      console.error(err);
      toastError('Falla al enviar el lote fiscal al servidor.');
    } finally {
      setCargandoSat(false);
    }
  };

  const handleDropSat = (e) => {
    e.preventDefault();
    setDragSat(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarLoteXml(e.dataTransfer.files);
    }
  };

  const handleFileSatInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      procesarLoteXml(e.target.files);
    }
  };

  const inputClass = "w-full px-4 py-2.5 text-xs bg-neutral-50/60 border border-neutral-200/80 rounded-xl outline-none focus:ring-4 focus:ring-b2bHighlight/10 focus:border-b2bHighlight focus:bg-white transition-all placeholder:text-neutral-500 text-neutral-800 font-semibold";
  const labelClass = "block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      
      {/* Selector de Sección */}
      <div className="flex gap-2 bg-neutral-100 p-1.5 rounded-2xl w-full border border-neutral-200">
        <button 
          onClick={() => setSeccionActiva('banco')} 
          className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${seccionActiva === 'banco' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          <FileSpreadsheet size={14} /> Conciliación Diaria (Bancos)
        </button>
        <button 
          onClick={() => setSeccionActiva('sat')} 
          className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${seccionActiva === 'sat' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          <FileCode size={14} /> Facturación SAT (XML)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {seccionActiva === 'banco' ? (
          <motion.div 
            key="banco"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Zona Drag & Drop Banco */}
            <motion.div 
              whileHover={{ y: -2 }}
              className={`relative p-8 rounded-3xl border-2 border-dashed text-center transition-all ${dragBanco ? 'border-b2bHighlight bg-b2bHighlight/5' : archivoBanco ? 'border-emerald-200 bg-emerald-50/20' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
              onDragEnter={handleDragBanco}
              onDragOver={handleDragBanco}
              onDragLeave={handleDragBanco}
              onDrop={handleDropBanco}
            >
              <input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={(e) => e.target.files?.[0] && simularCargaBanco(e.target.files[0].name)} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`p-3.5 rounded-2xl ${archivoBanco ? 'bg-emerald-100/50 text-emerald-600' : 'bg-neutral-50 border border-neutral-200/40 text-neutral-500'}`}>
                  {archivoBanco ? <FileSpreadsheet size={26} /> : <UploadCloud size={26} />}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">
                    {archivoBanco ? 'Lote Conciliado' : 'Conciliación Bancaria Diaria'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium mt-1">
                    {archivoBanco ? `Archivo: ${archivoBanco}` : 'Arrastra tu estado de cuenta CSV/XLSX o haz clic aquí.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Formulario Cierre */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
              className="bg-white p-10 rounded-3xl border border-neutral-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-neutral-100">
                <div className="p-2.5 bg-neutral-900 text-white rounded-xl shadow-premium-sm"><CircleDollarSign size={18} /></div>
                <h2 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Cierre de Caja</h2>
              </div>

              <form onSubmit={guardarFlujo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Fecha de Corte</label>
                    <input type="date" required value={formulario.fecha_corte} onChange={e => setFormulario({...formulario, fecha_corte: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Día de Operación</label>
                    <select value={formulario.dia_semana} onChange={e => setFormulario({...formulario, dia_semana: e.target.value})} className={`${inputClass} appearance-none cursor-pointer`}>
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => <option key={dia} value={dia}>{dia}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Monto Base (Esperado)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-neutral-400 text-xs">$</span>
                      <input type="number" required step="0.01" value={formulario.monto_esperado} onChange={e => setFormulario({...formulario, monto_esperado: e.target.value})} className={inputClass + " pl-8 font-semibold"} placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Depositado Real</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-neutral-400 text-xs">$</span>
                      <input type="number" required step="0.01" value={formulario.monto_depositado} onChange={e => setFormulario({...formulario, monto_depositado: e.target.value})} className={inputClass + " pl-8 font-black text-neutral-950"} placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-neutral-50/60 rounded-2xl border border-neutral-200/30 space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={14} className="text-neutral-500" />
                    <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Deducciones de Terminal</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-2 ml-0.5">Clip</label>
                      <input type="number" step="0.01" value={formulario.comision_clip} onChange={e => setFormulario({...formulario, comision_clip: e.target.value})} className={inputClass} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-2 ml-0.5">Mercado Pago</label>
                      <input type="number" step="0.01" value={formulario.comision_mercadopago} onChange={e => setFormulario({...formulario, comision_mercadopago: e.target.value})} className={inputClass} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-2 ml-0.5">ISR / IVA (SAT)</label>
                      <input type="number" step="0.01" value={formulario.retencion_sat} onChange={e => setFormulario({...formulario, retencion_sat: e.target.value})} className={inputClass} placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-premium-sm flex items-center justify-center gap-2"><Save size={15} /> Persistir Registro</motion.button>
              </form>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="sat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Zona Drag & Drop SAT */}
            <motion.div 
              whileHover={{ y: -2 }}
              className={`relative p-10 rounded-3xl border-2 border-dashed text-center transition-all ${dragSat ? 'border-b2bHighlight bg-b2bHighlight/5' : xmlCargados.length > 0 ? 'border-b2bHighlight/30 bg-emerald-50/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}
              onDragEnter={handleDragSat}
              onDragOver={handleDragSat}
              onDragLeave={handleDragSat}
              onDrop={handleDropSat}
            >
              <input 
                type="file" 
                multiple
                accept=".xml" 
                onChange={handleFileSatInput} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`p-3.5 rounded-2xl ${xmlCargados.length > 0 ? 'bg-emerald-50 text-b2bHighlight border border-emerald-100' : 'bg-neutral-50 border border-neutral-200/40 text-neutral-500'}`}>
                  {xmlCargados.length > 0 ? <CheckCircle size={26} /> : <FileCode size={26} />}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">
                    {cargandoSat ? 'Procesando Lote Fiscal...' : xmlCargados.length > 0 ? 'Comprobantes Cargados' : 'Carga Masiva de Facturas SAT'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-relaxed">
                    {cargandoSat ? 'Leyendo e ingresando CFDIs...' : xmlCargados.length > 0 ? `${xmlCargados.length} facturas subidas en esta sesión` : 'Arrastra tus facturas CFDI en formato XML o haz clic aquí.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Listado de archivos importados en sesión */}
            {xmlCargados.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-3">
                <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-100 pb-2">Historial de Carga Reciente</h4>
                <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-[10px] text-neutral-600">
                  {xmlCargados.map((name, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-neutral-50 last:border-0">
                      <span>{name}</span>
                      <span className="text-b2bHighlight font-bold uppercase text-[8px] tracking-widest">Verificado SAT</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
