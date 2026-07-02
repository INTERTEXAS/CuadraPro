// ==========================================
// CuadraPro - Gestor de Clientes B2B (Seguro)
// Firma: MLagunes
// ==========================================
const db = require('../config/db');
const logger = require('../config/logger');
const { registrarAuditoria, obtenerAuditorias } = require('../services/auditService');

const registrarEmpresa = async (req, res) => {
  const { nombre_comercial, rfc, plan_suscripcion } = req.body;
  const usuarioId = req.usuario.id;
  const empresaId = req.usuario.empresa_id;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  
  try {
    const query = `
      INSERT INTO empresas_clientes (nombre_comercial, rfc, plan_suscripcion) 
      VALUES ($1, $2, $3) RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_comercial, rfc, plan_suscripcion]);
    const nuevaEmpresa = rows[0];

    logger.info({ mensaje: 'Nueva empresa cliente registrada', registrado_por: usuarioId, nombre_comercial, rfc });
    await registrarAuditoria(usuarioId, empresaId, ip, 'REGISTRO_EMPRESA_CLIENTE', { nombre_comercial, rfc, plan_suscripcion });

    res.status(201).json({ mensaje: 'Empresa registrada con éxito', empresa: nuevaEmpresa });
  } catch (error) {
    logger.error({ mensaje: 'Error al registrar la empresa', error: error.message, registrado_por: usuarioId });
    res.status(500).json({ error: 'Error al registrar la empresa. Verifica que el RFC no esté duplicado.' });
  }
};

const listarEmpresas = async (req, res) => {
  const usuarioId = req.usuario.id;
  try {
    const { rows } = await db.query('SELECT * FROM empresas_clientes ORDER BY fecha_alta DESC');
    res.json(rows);
  } catch (error) {
    logger.error({ mensaje: 'Error al listar catálogo de empresas', error: error.message, solicitado_por: usuarioId });
    res.status(500).json({ error: 'Error al consultar el catálogo de clientes.' });
  }
};

const actualizarPlan = async (req, res) => {
  const { plan_suscripcion } = req.body;
  const usuarioId = req.usuario.id;
  const empresaId = req.usuario.empresa_id;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  try {
    const query = `
      UPDATE empresas_clientes 
      SET plan_suscripcion = $1 
      WHERE id = $2 RETURNING *;
    `;
    const { rows } = await db.query(query, [plan_suscripcion, empresaId]);

    logger.info({ mensaje: 'Plan de suscripción de empresa actualizado', empresa_id: empresaId, actualizado_por: usuarioId, plan_suscripcion });
    await registrarAuditoria(usuarioId, empresaId, ip, 'SOLICITUD_UPGRADE_MEMBRESIA', { plan_suscripcion });

    res.json({ mensaje: 'Plan actualizado con éxito', empresa: rows[0] });
  } catch (error) {
    logger.error({ mensaje: 'Error al actualizar plan de suscripción', error: error.message, empresaId, usuarioId });
    res.status(500).json({ error: 'Error al actualizar el plan de suscripción.' });
  }
};

const obtenerMiEmpresa = async (req, res) => {
  const empresaId = req.usuario.empresa_id;
  const usuarioId = req.usuario.id;
  try {
    const { rows } = await db.query('SELECT * FROM empresas_clientes WHERE id = $1', [empresaId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    logger.error({ mensaje: 'Error al consultar empresa del usuario', error: error.message, empresaId, usuarioId });
    res.status(500).json({ error: 'Error al consultar datos de la empresa.' });
  }
};

const actualizarBovedaEmpresa = async (req, res) => {
  const { tasa_clip, tasa_mp, tasa_sat } = req.body;
  const usuarioId = req.usuario.id;
  const empresaId = req.usuario.empresa_id;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  try {
    const query = `
      UPDATE empresas_clientes 
      SET tasa_clip = $1, tasa_mp = $2, tasa_sat = $3
      WHERE id = $4 RETURNING *;
    `;
    const { rows } = await db.query(query, [tasa_clip, tasa_mp, tasa_sat, empresaId]);

    logger.info({ mensaje: 'Bóveda de empresa actualizada (Tasas)', empresa_id: empresaId, actualizado_por: usuarioId });
    await registrarAuditoria(usuarioId, empresaId, ip, 'ACTUALIZACION_BOVEDA_TASAS', { tasa_clip, tasa_mp, tasa_sat });

    res.json({ mensaje: 'Bóveda actualizada con éxito', empresa: rows[0] });
  } catch (error) {
    logger.error({ mensaje: 'Error al actualizar bóveda de empresa', error: error.message, empresaId, usuarioId });
    res.status(500).json({ error: 'Error al actualizar configuración de bóveda.' });
  }
};

const listarAuditorias = async (req, res) => {
  const empresaId = req.usuario.empresa_id;
  try {
    const auditorias = await obtenerAuditorias(empresaId, 50);
    res.json(auditorias);
  } catch (error) {
    logger.error({ mensaje: 'Error al listar auditorías', error: error.message, empresaId });
    res.status(500).json({ error: 'Error al consultar el historial de auditoría.' });
  }
};

module.exports = { registrarEmpresa, listarEmpresas, actualizarPlan, obtenerMiEmpresa, actualizarBovedaEmpresa, listarAuditorias };
