// ==========================================
// CuadraPro - Controlador de Conciliación Multi-Tenant
// Firma: buhonero0
// ==========================================
const db = require('../config/db');

const obtenerDashboard = async (req, res) => {
  const empresaId = req.usuario.empresa_id;

  try {
    const queryFlujos = `
      SELECT dia_semana as dia, monto_esperado as esperado, monto_depositado as depositado,
             comision_clip, comision_mercadopago, retencion_sat
      FROM flujos_financieros
      WHERE empresa_id = $1;
    `;
    const { rows: flujos } = await db.query(queryFlujos, [empresaId]);

    let totalEsperado = 0, totalDepositado = 0, totalClip = 0, totalMercadoPago = 0, totalSat = 0;
    const agrupadoPorDia = {};

    flujos.forEach(flujo => {
      // 1. Sumatoria global para las tarjetas KPI
      totalEsperado += parseFloat(flujo.esperado || 0);
      totalDepositado += parseFloat(flujo.depositado || 0);
      totalClip += parseFloat(flujo.comision_clip || 0);
      totalMercadoPago += parseFloat(flujo.comision_mercadopago || 0);
      totalSat += parseFloat(flujo.retencion_sat || 0);

      // 2. Agrupación estructural para la gráfica de barras
      const dia = flujo.dia;
      if (!agrupadoPorDia[dia]) {
        agrupadoPorDia[dia] = { dia, esperado: 0, depositado: 0 };
      }
      agrupadoPorDia[dia].esperado += parseFloat(flujo.esperado || 0);
      agrupadoPorDia[dia].depositado += parseFloat(flujo.depositado || 0);
    });

    // 3. Ordenar los días cronológicamente para mantener el rigor visual
    const ordenDias = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
    const datosSemanales = Object.values(agrupadoPorDia).sort((a, b) => ordenDias[a.dia] - ordenDias[b.dia]);

    const fugaDeducciones = totalClip + totalMercadoPago + totalSat;
    const estadoSalud = fugaDeducciones > (totalEsperado * 0.08) ? 'Revisión Sugerida' : 'Óptimo';

    res.json({
      datosSemanales,
      datosDeducciones: [
        { nombre: 'Clip', valor: totalClip }, { nombre: 'Mercado Pago', valor: totalMercadoPago }, { nombre: 'SAT', valor: totalSat }
      ],
      kpis: { totalEsperado, totalDepositado, fugaDeducciones, estadoSalud }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error interno en el motor financiero.' });
  }
};

const registrarFlujo = async (req, res) => {
  const empresaId = req.usuario.empresa_id;
  const { fecha_corte, dia_semana, monto_esperado, monto_depositado, comision_clip, comision_mercadopago, retencion_sat } = req.body;
  
  try {
    const query = `
      INSERT INTO flujos_financieros 
      (empresa_id, fecha_corte, dia_semana, monto_esperado, monto_depositado, comision_clip, comision_mercadopago, retencion_sat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const valores = [empresaId, fecha_corte, dia_semana, monto_esperado, monto_depositado, comision_clip, comision_mercadopago, retencion_sat];
    const { rows } = await db.query(query, valores);
    res.status(201).json({ mensaje: 'Flujo registrado con éxito', flujo: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el flujo financiero.' });
  }
};

module.exports = { obtenerDashboard, registrarFlujo };
