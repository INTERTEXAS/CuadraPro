// ==========================================
// CuadraPro - Servicio de Auditoría (Audit Trail)
// Firma: MLagunes
// ==========================================
const db = require('../config/db');
const logger = require('../config/logger');

const registrarAuditoria = async (usuarioId, empresaId, ipAddress, accion, payload = {}) => {
  try {
    const query = `
      INSERT INTO auditorias_sistema (usuario_id, empresa_id, ip_address, accion, payload)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const valores = [
      usuarioId || null,
      empresaId || null,
      ipAddress || 'unknown',
      accion,
      JSON.stringify(payload)
    ];
    await db.query(query, valores);
    
    // Log estructurado
    logger.info({
      evento: 'AUDITORIA_SISTEMA',
      usuario_id: usuarioId,
      empresa_id: empresaId,
      ip_address: ipAddress,
      accion: accion,
      datos: payload
    });
  } catch (error) {
    logger.error({
      mensaje: 'Falla al registrar evento de auditoría en la base de datos.',
      error: error.message,
      accion,
      usuarioId
    });
  }
};

const obtenerAuditorias = async (empresaId, limite = 50) => {
  try {
    const query = `
      SELECT a.id, a.accion, a.payload, a.ip_address, a.fecha_evento AS created_at, u.nombre_completo, u.email
      FROM auditorias_sistema a
      LEFT JOIN usuarios_boveda u ON a.usuario_id = u.id
      WHERE a.empresa_id = $1
      ORDER BY a.fecha_evento DESC
      LIMIT $2;
    `;
    const { rows } = await db.query(query, [empresaId, limite]);
    return rows;
  } catch (error) {
    logger.error({ mensaje: 'Error al obtener historial de auditorías', error: error.message, empresaId });
    return [];
  }
};

module.exports = { registrarAuditoria, obtenerAuditorias };
