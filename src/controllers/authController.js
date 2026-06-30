// ==========================================
// CuadraPro - Controlador de Autenticación (DB Real + Seguridad)
// Firma: buhonero0
// ==========================================
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const { registrarAuditoria } = require('../services/auditService');

const login = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  try {
    const emailNormalizado = email ? email.trim().toLowerCase() : '';
    const passTrim = password ? password.trim() : '';

    const { rows } = await db.query('SELECT * FROM usuarios_boveda WHERE LOWER(email) = $1', [emailNormalizado]);
    
    if (rows.length === 0) {
      logger.warn({ mensaje: 'Intento de acceso con usuario inexistente', email: emailNormalizado, ip });
      await registrarAuditoria(null, null, ip, 'LOGIN_FALLIDO_USUARIO_INEXISTENTE', { email: emailNormalizado });
      return res.status(401).json({ error: 'Credenciales inválidas. Acceso denegado.' });
    }

    const usuario = rows[0];

    const coinciden = await bcrypt.compare(passTrim, usuario.password_hash);
    if (!coinciden) {
      logger.warn({ mensaje: 'Intento de acceso con contraseña incorrecta', email: emailNormalizado, ip });
      await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'LOGIN_FALLIDO_PASSWORD_INCORRECTO', { email: emailNormalizado });
      return res.status(401).json({ error: 'Credenciales inválidas. Acceso denegado.' });
    }

    logger.info({ mensaje: 'Inicio de sesión exitoso', usuario_id: usuario.id, email: emailNormalizado, ip });
    await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'LOGIN_EXITOSO', { email: emailNormalizado });
    
    const token = jwt.sign(
      { id: usuario.id, empresa_id: usuario.empresa_id, rol: usuario.rol, nombre: usuario.nombre_completo, email: emailNormalizado }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({ mensaje: 'Acceso autorizado', token: token, empresa_id: usuario.empresa_id });
  } catch (error) {
    logger.error({ mensaje: 'Falla crítica durante autenticación', error: error.message, email, ip });
    res.status(500).json({ error: 'Error interno de conexión a la Bóveda.', detalle: error.message });
  }
};

const registrarUsuario = async (req, res) => {
  const { nombre_completo, email, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const hash = await bcrypt.hash(password.trim(), 10);
    const query = 'INSERT INTO usuarios_boveda (empresa_id, nombre_completo, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const { rows } = await db.query(query, [1, nombre_completo, email.trim().toLowerCase(), hash, 'SuperAdmin']);
    
    logger.info({ mensaje: 'Nuevo usuario administrador registrado', email: email.trim().toLowerCase(), ip });
    await registrarAuditoria(rows[0].id, 1, ip, 'REGISTRO_USUARIO', { email: email.trim().toLowerCase() });
    
    res.status(201).json({ mensaje: 'Credenciales B2B creadas exitosamente.' });
  } catch (error) {
    logger.error({ mensaje: 'Falla al registrar nuevo usuario', error: error.message, email, ip });
    res.status(500).json({ error: 'Error de inyección B2B.', detalle: error.message });
  }
};

const seedDemo = async (req, res) => {
  // Demo data seeding
};

const resetAdmin = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const email = 'admin@tallerlag.com';
    const nuevaPass = 'hola1234';
    const hash = await bcrypt.hash(nuevaPass, 10);
    
    await db.query(
      "UPDATE usuarios_boveda SET password_hash = $1, rol = 'SuperAdmin' WHERE LOWER(email) = LOWER($2)",
      [hash, email]
    );
    
    logger.warn({ mensaje: 'Restablecimiento de credenciales de administrador de red ejecutado', email, ip });
    await registrarAuditoria(1, 1, ip, 'RESTABLECIMIENTO_ADMIN', { email });
    
    res.json({ mensaje: `Contraseña de ${email} restablecida a ${nuevaPass} y cifrada exitosamente.` });
  } catch (error) {
    logger.error({ mensaje: 'Error en restablecimiento de administrador', error: error.message, ip });
    res.status(500).json({ error: 'Error en restablecimiento', detalle: error.message });
  }
};

const seedTransactions = async (req, res) => {
  try {
    const { rows: empresas } = await db.query('SELECT id FROM empresas_clientes');
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    for (const emp of empresas) {
      for (let i = 0; i < 7; i++) {
        const esperado = Math.floor(Math.random() * (50000 - 10000) + 10000);
        const depositado = esperado - (Math.random() * 500);
        const clip = esperado * 0.036;
        const mp = esperado * 0.034;
        const sat = esperado * 0.08;

        await db.query(
          `INSERT INTO flujos_financieros 
          (empresa_id, fecha_corte, dia_semana, monto_esperado, monto_depositado, comision_clip, comision_mercadopago, retencion_sat) 
          VALUES ($1, CURRENT_DATE - ($2 || ' day')::interval, $3, $4, $5, $6, $7, $8)`,
          [emp.id, i, dias[i], esperado, depositado, clip, mp, sat]
        );
      }
    }
    
    res.json({ mensaje: 'Movimientos financieros generados para todas las empresas.' });
  } catch (error) {
    logger.error({ mensaje: 'Error generando movimientos de prueba (seed)', error: error.message });
    res.status(500).json({ error: 'Error generando movimientos', detalle: error.message });
  }
};

const recuperarPassword = async (req, res) => {
  const { email, token, nuevaPassword } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const emailNormalizado = email ? email.trim().toLowerCase() : '';

  try {
    const { rows } = await db.query('SELECT id, empresa_id FROM usuarios_boveda WHERE LOWER(email) = $1', [emailNormalizado]);
    if (rows.length === 0) {
      logger.warn({ mensaje: 'Intento de recuperación para correo inexistente', email: emailNormalizado, ip });
      return res.status(404).json({ error: 'El correo electrónico ingresado no está registrado.' });
    }
    const usuario = rows[0];

    // Fase 1: Solicitar token
    if (!token && !nuevaPassword) {
      logger.info({ mensaje: 'Solicitud de recuperación de contraseña', email: emailNormalizado, ip });
      await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'SOLICITUD_RECUPERACION_PASSWORD', { email: emailNormalizado });
      return res.json({ mensaje: 'Token de recuperación generado con éxito.', token: '123456' });
    }

    // Fase 2: Confirmar restablecimiento
    if (token !== '123456') {
      return res.status(400).json({ error: 'El código de recuperación ingresado no es válido.' });
    }

    const passTrim = nuevaPassword ? nuevaPassword.trim() : '';
    // Validación de fortaleza de contraseña: mínimo 8 caracteres, al menos una mayúscula y un número
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(passTrim)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número.' });
    }

    const hash = await bcrypt.hash(passTrim, 10);
    await db.query('UPDATE usuarios_boveda SET password_hash = $1 WHERE id = $2', [hash, usuario.id]);

    logger.info({ mensaje: 'Restablecimiento de contraseña confirmado con éxito', email: emailNormalizado, ip });
    await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'CONFIRMACION_RECUPERACION_PASSWORD', { email: emailNormalizado });

    res.json({ mensaje: 'Tu contraseña ha sido restablecida de forma segura.' });
  } catch (error) {
    logger.error({ mensaje: 'Error crítico en flujo de recuperación de contraseña', error: error.message, email: emailNormalizado, ip });
    res.status(500).json({ error: 'Error interno en el servidor de autenticación.' });
  }
};

const cambiarPassword = async (req, res) => {
  const { passwordActual, nuevaPassword } = req.body;
  const usuarioId = req.usuario.id;
  const empresaId = req.usuario.empresa_id;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  try {
    if (!passwordActual || !nuevaPassword) {
      return res.status(400).json({ error: 'Debes proporcionar la contraseña actual y la nueva.' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(nuevaPassword.trim())) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número.' });
    }

    const { rows } = await db.query('SELECT password_hash FROM usuarios_boveda WHERE id = $1', [usuarioId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const coinciden = await bcrypt.compare(passwordActual.trim(), rows[0].password_hash);
    if (!coinciden) {
      logger.warn({ mensaje: 'Intento fallido de cambio de contraseña: password actual incorrecta', usuario_id: usuarioId, ip });
      return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
    }

    const hash = await bcrypt.hash(nuevaPassword.trim(), 10);
    await db.query('UPDATE usuarios_boveda SET password_hash = $1 WHERE id = $2', [hash, usuarioId]);

    logger.info({ mensaje: 'Cambio de contraseña exitoso', usuario_id: usuarioId, ip });
    await registrarAuditoria(usuarioId, empresaId, ip, 'CAMBIO_PASSWORD', {});

    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    logger.error({ mensaje: 'Error al cambiar contraseña', error: error.message, usuarioId, ip });
    res.status(500).json({ error: 'Error interno al cambiar la contraseña.' });
  }
};

module.exports = { login, registrarUsuario, seedDemo, resetAdmin, seedTransactions, recuperarPassword, cambiarPassword };
