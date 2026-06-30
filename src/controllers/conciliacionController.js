// ==========================================
// CuadraPro - Controlador de Conciliación y Auditoría Fiscal (SAT)
// Firma: buhonero0
// ==========================================
const xml2js = require('xml2js');
const db = require('../config/db');
const logger = require('../config/logger');
const { registrarAuditoria } = require('../services/auditService');

const obtenerDashboard = async (req, res) => {
  const empresaId = req.usuario.empresa_id;
  const { dias } = req.query;

  try {
    // 1. Obtener flujos del banco/pasarela
    let queryFlujos = `
      SELECT dia_semana as dia, monto_esperado as esperado, monto_depositado as depositado,
             comision_clip, comision_mercadopago, retencion_sat
      FROM flujos_financieros
      WHERE empresa_id = $1
    `;
    const params = [empresaId];

    if (dias && !isNaN(dias)) {
      queryFlujos += ` AND fecha_corte >= CURRENT_DATE - ($2 || ' day')::interval`;
      params.push(parseInt(dias, 10));
    }

    queryFlujos += ';';
    const { rows: flujos } = await db.query(queryFlujos, params);

    let totalEsperado = 0, totalDepositado = 0, totalClip = 0, totalMercadoPago = 0, totalSat = 0;
    const agrupadoPorDia = {};

    flujos.forEach(flujo => {
      totalEsperado += parseFloat(flujo.esperado || 0);
      totalDepositado += parseFloat(flujo.depositado || 0);
      totalClip += parseFloat(flujo.comision_clip || 0);
      totalMercadoPago += parseFloat(flujo.comision_mercadopago || 0);
      totalSat += parseFloat(flujo.retencion_sat || 0);

      const dia = flujo.dia;
      if (!agrupadoPorDia[dia]) {
        agrupadoPorDia[dia] = { dia, esperado: 0, depositado: 0 };
      }
      agrupadoPorDia[dia].esperado += parseFloat(flujo.esperado || 0);
      agrupadoPorDia[dia].depositado += parseFloat(flujo.depositado || 0);
    });

    const ordenDias = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
    const datosSemanales = Object.values(agrupadoPorDia).sort((a, b) => ordenDias[a.dia] - ordenDias[b.dia]);

    const fugaDeducciones = totalClip + totalMercadoPago + totalSat;
    const estadoSalud = fugaDeducciones > (totalEsperado * 0.08) ? 'Revisión Sugerida' : 'Óptimo';

    // 2. Obtener sumatoria de Facturación SAT CFDI del periodo (Cruce Fiscal 3 Vías)
    let queryFacturas = 'SELECT SUM(monto_total) as total_sat FROM facturas_sat WHERE empresa_id = $1';
    const paramsFacturas = [empresaId];

    if (dias && !isNaN(dias)) {
      queryFacturas += ` AND fecha_emision >= CURRENT_DATE - ($2 || ' day')::interval`;
      paramsFacturas.push(parseInt(dias, 10));
    }

    const { rows: rowsFacturas } = await db.query(queryFacturas, paramsFacturas);
    const totalFacturadoSat = parseFloat(rowsFacturas[0]?.total_sat || 0);

    res.json({
      datosSemanales,
      datosDeducciones: [
        { nombre: 'Clip', valor: totalClip }, { nombre: 'Mercado Pago', valor: totalMercadoPago }, { nombre: 'SAT', valor: totalSat }
      ],
      kpis: { totalEsperado, totalDepositado, fugaDeducciones, estadoSalud, totalFacturadoSat }
    });

  } catch (error) {
    logger.error({ mensaje: 'Error al consultar flujos en el motor financiero', error: error.message, empresaId });
    res.status(500).json({ error: 'Error interno en el motor financiero.' });
  }
};

const registrarFlujo = async (req, res) => {
  const empresaId = req.usuario.empresa_id;
  const usuarioId = req.usuario.id;
  const { fecha_corte, dia_semana, monto_esperado, monto_depositado, comision_clip, comision_mercadopago, retencion_sat } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  // Validación de campos obligatorios
  if (!fecha_corte || !dia_semana) {
    return res.status(400).json({ error: 'Los campos fecha_corte y dia_semana son obligatorios.' });
  }

  // Sanitización numérica: prevenir crashes por datos no numéricos
  const montoEsperadoSafe = parseFloat(monto_esperado);
  const montoDepositadoSafe = parseFloat(monto_depositado);
  const clipSafe = parseFloat(comision_clip) || 0;
  const mpSafe = parseFloat(comision_mercadopago) || 0;
  const satSafe = parseFloat(retencion_sat) || 0;

  if (isNaN(montoEsperadoSafe) || isNaN(montoDepositadoSafe)) {
    return res.status(400).json({ error: 'Los montos deben ser valores numéricos válidos.' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN'); // Iniciar la transacción SQL

    const query = `
      INSERT INTO flujos_financieros 
      (empresa_id, fecha_corte, dia_semana, monto_esperado, monto_depositado, comision_clip, comision_mercadopago, retencion_sat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const valores = [empresaId, fecha_corte, dia_semana, montoEsperadoSafe, montoDepositadoSafe, clipSafe, mpSafe, satSafe];
    const { rows } = await client.query(query, valores);

    await client.query('COMMIT'); // Confirmar transacción

    logger.info({ mensaje: 'Flujo financiero registrado atómicamente', empresa_id: empresaId, usuario_id: usuarioId, fecha_corte });
    await registrarAuditoria(usuarioId, empresaId, ip, 'REGISTRO_FLUJO_FINANCIERO', { fecha_corte, monto_esperado });

    res.status(201).json({ mensaje: 'Flujo registrado con éxito', flujo: rows[0] });
  } catch (error) {
    await client.query('ROLLBACK'); // Deshacer cambios en caso de error
    logger.error({ mensaje: 'Error al persistir flujo financiero (rollback ejecutado)', error: error.message, empresaId, usuarioId });
    res.status(500).json({ error: 'Error al registrar el flujo financiero. Integridad resguardada.' });
  } finally {
    client.release(); // Liberar cliente al pool
  }
};

const subirFacturas = async (req, res) => {
  const empresaId = req.usuario.empresa_id;
  const usuarioId = req.usuario.id;
  const { facturas } = req.body; // Array de strings con el contenido XML de las facturas
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  if (!facturas || !Array.isArray(facturas)) {
    return res.status(400).json({ error: 'Lote de facturas inválido o no suministrado.' });
  }

  const client = await db.connect();
  let importados = 0;
  let omitidos = 0;

  try {
    await client.query('BEGIN');

    for (const xmlContent of facturas) {
      try {
        const result = await xml2js.parseStringPromise(xmlContent);
        
        // Estructura CFDI 4.0 tolerante a namespaces/prefijos
        const comprobante = result['cfdi:Comprobante'] || result['Comprobante'];
        if (!comprobante) continue;

        const total = parseFloat(comprobante.$.Total || comprobante.$.total || 0);
        const fechaRaw = comprobante.$.Fecha || comprobante.$.fecha || new Date().toISOString();
        const fecha = new Date(fechaRaw);

        const emisor = comprobante['cfdi:Emisor'] || comprobante['Emisor'];
        const rfcEmisor = emisor?.[0]?.$.Rfc || emisor?.[0]?.$.rfc || 'DESCONOCIDO';

        const receptor = comprobante['cfdi:Receptor'] || comprobante['Receptor'];
        const rfcReceptor = receptor?.[0]?.$.Rfc || receptor?.[0]?.$.rfc || 'DESCONOCIDO';

        const complemento = comprobante['cfdi:Complemento'] || comprobante['Complemento'];
        const timbre = complemento?.[0]?.['tfd:TimbreFiscalDigital'] || complemento?.[0]?.['TimbreFiscalDigital'];
        const uuid = timbre?.[0]?.$.UUID || timbre?.[0]?.$.uuid || Math.random().toString();

        const query = `
          INSERT INTO facturas_sat (empresa_id, uuid, rfc_emisor, rfc_receptor, fecha_emision, monto_total)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (uuid) DO NOTHING RETURNING id;
        `;
        const { rows } = await client.query(query, [empresaId, uuid, rfcEmisor, rfcReceptor, fecha, total]);
        
        if (rows.length > 0) {
          importados++;
        } else {
          omitidos++;
        }
      } catch (xmlError) {
        logger.warn({ mensaje: 'Error al parsear un CFDI XML individual', error: xmlError.message, empresaId });
      }
    }

    await client.query('COMMIT');
    logger.info({ mensaje: 'Lote de facturas procesado', empresa_id: empresaId, usuario_id: usuarioId, importados, omitidos });
    await registrarAuditoria(usuarioId, empresaId, ip, 'INGESTA_FACTURAS_SAT', { importados, omitidos });

    res.json({ mensaje: 'Procesamiento de facturas SAT completado.', importados, omitidos });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ mensaje: 'Error masivo al procesar facturas SAT', error: error.message, empresaId });
    res.status(500).json({ error: 'Error interno al procesar lote de facturas SAT.' });
  } finally {
    client.release();
  }
};

const obtenerFugasComisiones = async (req, res) => {
  const empresaId = req.usuario.empresa_id;

  try {
    // Obtener tasas configuradas en la bóveda
    const { rows: rowsEmpresa } = await db.query('SELECT tasa_clip, tasa_mp, tasa_sat FROM empresas_clientes WHERE id = $1', [empresaId]);
    const miBoveda = rowsEmpresa[0] || {};
    const tasaClipConfig = parseFloat(miBoveda.tasa_clip || 0.036);
    const tasaMpConfig = parseFloat(miBoveda.tasa_mp || 0.034);
    const tasaSatConfig = parseFloat(miBoveda.tasa_sat || 0.08);

    const query = `
      SELECT id, fecha_corte, dia_semana, monto_esperado, monto_depositado,
             comision_clip, comision_mercadopago, retencion_sat
      FROM flujos_financieros
      WHERE empresa_id = $1
      ORDER BY fecha_corte DESC;
    `;
    const { rows: flujos } = await db.query(query, [empresaId]);
    const fugas = [];

    flujos.forEach(flujo => {
      const esperado = parseFloat(flujo.monto_esperado || 0);
      const clipReal = parseFloat(flujo.comision_clip || 0);
      const mpReal = parseFloat(flujo.comision_mercadopago || 0);
      const satReal = parseFloat(flujo.retencion_sat || 0);

      // Tasas Dinámicas de la Bóveda del Cliente
      const clipTeorico = esperado * tasaClipConfig;
      const mpTeorico = esperado * tasaMpConfig;
      const satTeorico = esperado * tasaSatConfig;

      const deduccionReal = clipReal + mpReal + satReal;
      const deduccionTeorica = clipTeorico + mpTeorico + satTeorico;

      // Si la comisión real cargada excede la teórica por más de $15 pesos, reportamos fuga
      const excedente = deduccionReal - deduccionTeorica;
      if (excedente > 15) {
        fugas.push({
          id: flujo.id,
          fecha: flujo.fecha_corte,
          dia: flujo.dia_semana,
          esperado,
          depositado: parseFloat(flujo.monto_depositado || 0),
          deduccionReal,
          deduccionTeorica,
          fuga: excedente,
          pasarelaAfectada: clipReal > clipTeorico ? 'Clip' : 'Mercado Pago'
        });
      }
    });

    res.json(fugas);
  } catch (error) {
    logger.error({ mensaje: 'Error al consultar fugas de comisiones', error: error.message, empresaId });
    res.status(500).json({ error: 'Error al calcular discrepancias contables.' });
  }
};

module.exports = { obtenerDashboard, registrarFlujo, subirFacturas, obtenerFugasComisiones };
