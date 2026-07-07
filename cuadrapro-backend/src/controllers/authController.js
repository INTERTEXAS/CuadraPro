// ==========================================
// CuadraPro - Controlador de Autenticación (DB Real + Seguridad)
// Firma: MLagunes
// ==========================================
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const { registrarAuditoria } = require('../services/auditService');
const { enviarCodigoMfa } = require('../services/emailService');

// Interruptor para activar/desactivar el MFA de forma global (desactivado temporalmente por correo inaccesible)
const MFA_ACTIVADO = false;

const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
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

    if (MFA_ACTIVADO) {
      // Flujo 2FA: Generar OTP y Guardar en BD
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const mfaExp = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos de validez

      await db.query(
        'UPDATE usuarios_boveda SET mfa_codigo = $1, mfa_expiracion = $2 WHERE id = $3',
        [otp, mfaExp, usuario.id]
      );

      // Enviar código por email
      await enviarCodigoMfa(usuario.email, otp);

      logger.info({ mensaje: 'Solicitud de autenticación 2FA iniciada', usuario_id: usuario.id, email: emailNormalizado, ip });
      await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'SOLICITUD_2FA', { email: emailNormalizado });

      // Generar Token Temporal de Pre-Autenticación
      const tempToken = jwt.sign(
        { id: usuario.id, email: usuario.email, preAuth: true, rememberMe: !!rememberMe, tipoLogin: 'clasico' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      res.json({ mfaRequerido: true, tempToken });
    } else {
      // Flujo directo sin 2FA (Remember Me activo)
      logger.info({ mensaje: 'Inicio de sesión exitoso (MFA bypass)', usuario_id: usuario.id, email: emailNormalizado, ip });
      await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'LOGIN_EXITOSO', { email: emailNormalizado });
      
      const duracion = rememberMe ? '7d' : '8h';
      const token = jwt.sign(
        { id: usuario.id, empresa_id: usuario.empresa_id, rol: usuario.rol, nombre: usuario.nombre_completo, email: emailNormalizado }, 
        process.env.JWT_SECRET, 
        { expiresIn: duracion }
      );

      res.json({ mensaje: 'Acceso autorizado', token: token, mfaRequerido: false, empresa_id: usuario.empresa_id });
    }
  } catch (error) {
    logger.error({ mensaje: 'Falla crítica durante autenticación', error: error.message, email, ip });
    res.status(500).json({ error: 'Error interno de conexión a la Bóveda.', detalle: error.message });
  }
};

const registrarUsuario = async (req, res) => {
  const { nombre_completo, email, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const emailNormalizado = email.trim().toLowerCase();
    // Asignar SuperAdmin solo al administrador maestro de la red, los demás serán Administradores estándar
    const rolAsignado = emailNormalizado === 'admin@tallerlag.com' ? 'SuperAdmin' : 'Administrador';
    
    const hash = await bcrypt.hash(password.trim(), 10);
    const query = 'INSERT INTO usuarios_boveda (empresa_id, nombre_completo, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const { rows } = await db.query(query, [1, nombre_completo, emailNormalizado, hash, rolAsignado]);
    
    logger.info({ mensaje: `Nuevo usuario registrado (${rolAsignado})`, email: emailNormalizado, ip });
    await registrarAuditoria(rows[0].id, 1, ip, 'REGISTRO_USUARIO', { email: emailNormalizado });
    
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

const loginGoogle = async (req, res) => {
  const { access_token, rememberMe } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  if (!access_token) {
    return res.status(400).json({ error: 'Falta el access_token de Google.' });
  }

  try {
    // 1. Validar el access_token contra la API oficial de Google
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    if (!googleResponse.ok) {
      const errText = await googleResponse.text();
      logger.warn({ mensaje: 'Intento de login con Google inválido', error: errText, ip });
      return res.status(401).json({ error: 'Token de Google inválido o vencido.' });
    }

    const perfilGoogle = await googleResponse.json();
    const { email, name, email_verified } = perfilGoogle;

    if (!email_verified) {
      return res.status(401).json({ error: 'El correo de Google no está verificado.' });
    }

    const emailNormalizado = email.trim().toLowerCase();

    // 2. Buscar al usuario en la base de datos de CuadraPro
    let { rows } = await db.query('SELECT * FROM usuarios_boveda WHERE LOWER(email) = $1', [emailNormalizado]);
    let usuario;

    if (rows.length === 0) {
      // 3. Registrar al usuario si no existe (con empresa por defecto id 1 y contraseña aleatoria segura)
      const contrasenaAleatoria = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      const hash = await bcrypt.hash(contrasenaAleatoria, 10);
      
      // Asignar SuperAdmin solo al correo del dueño de pruebas, todos los demás serán Administradores
      const rolAsignado = emailNormalizado === 'intertexas98@gmail.com' ? 'SuperAdmin' : 'Administrador';
      
      const insertQuery = `
        INSERT INTO usuarios_boveda (empresa_id, nombre_completo, email, password_hash, rol)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `;
      const insertRes = await db.query(insertQuery, [1, name || `Usuario Google (${emailNormalizado.split('@')[0]})`, emailNormalizado, hash, rolAsignado]);
      usuario = insertRes.rows[0];

      logger.info({ mensaje: `Nuevo usuario registrado vía Google OAuth (${rolAsignado})`, email: emailNormalizado, ip });
      await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'REGISTRO_GOOGLE_EXITOSO', { email: emailNormalizado });
    } else {
      usuario = rows[0];
      logger.info({ mensaje: 'Inicio de sesión exitoso vía Google OAuth', usuario_id: usuario.id, email: emailNormalizado, ip });
      await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'LOGIN_GOOGLE_EXITOSO', { email: emailNormalizado });
    }

    if (MFA_ACTIVADO) {
      // Flujo 2FA: Generar OTP y Guardar en BD
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const mfaExp = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      await db.query(
        'UPDATE usuarios_boveda SET mfa_codigo = $1, mfa_expiracion = $2 WHERE id = $3',
        [otp, mfaExp, usuario.id]
      );

      // Enviar código por email
      await enviarCodigoMfa(usuario.email, otp);

      logger.info({ mensaje: 'Solicitud de autenticación 2FA iniciada vía Google', usuario_id: usuario.id, email: emailNormalizado, ip });

      // Generar Token Temporal de Pre-Autenticación
      const tempToken = jwt.sign(
        { id: usuario.id, email: usuario.email, preAuth: true, rememberMe: !!rememberMe, tipoLogin: 'google' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      res.json({ mfaRequerido: true, tempToken });
    } else {
      // Flujo directo sin 2FA (Remember Me activo)
      logger.info({ mensaje: 'Inicio de sesión Google exitoso (MFA bypass)', usuario_id: usuario.id, email: emailNormalizado, ip });
      await registrarAuditoria(usuario.id, usuario.empresa_id, ip, 'LOGIN_GOOGLE_EXITOSO', { email: emailNormalizado });

      const duracion = rememberMe ? '7d' : '8h';
      const token = jwt.sign(
        { id: usuario.id, empresa_id: usuario.empresa_id, rol: usuario.rol, nombre: usuario.nombre_completo, email: emailNormalizado }, 
        process.env.JWT_SECRET, 
        { expiresIn: duracion }
      );

      res.json({ mensaje: 'Acceso autorizado vía Google', token: token, mfaRequerido: false, empresa_id: usuario.empresa_id });
    }
  } catch (error) {
    logger.error({ mensaje: 'Falla crítica durante autenticación Google OAuth', error: error.message, ip });
    res.status(500).json({ error: 'Error interno al procesar Google OAuth.', detalle: error.message });
  }
};

const verificarMfa = async (req, res) => {
  const { tempToken, codigo } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  if (!tempToken || !codigo) {
    return res.status(400).json({ error: 'Falta el token temporal o el código 2FA.' });
  }

  try {
    // 1. Verificar firma y expiración del Token Temporal
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (errToken) {
      return res.status(401).json({ error: 'La sesión temporal de verificación ha expirado o es inválida.' });
    }

    if (!decoded.preAuth) {
      return res.status(401).json({ error: 'Token inválido para verificación de seguridad.' });
    }

    const usuarioId = decoded.id;
    const rememberMe = !!decoded.rememberMe;
    const tipoLogin = decoded.tipoLogin || 'clasico';

    // 2. Buscar al usuario y validar el código OTP en la base de datos
    const { rows } = await db.query('SELECT * FROM usuarios_boveda WHERE id = $1', [usuarioId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado en la Bóveda.' });
    }

    const usuario = rows[0];

    // Validar coincidencia y expiración
    if (!usuario.mfa_codigo || usuario.mfa_codigo !== codigo.trim()) {
      logger.warn({ mensaje: 'Código 2FA incorrecto', usuario_id: usuario.id, ip });
      return res.status(401).json({ error: 'El código ingresado es incorrecto.' });
    }

    if (new Date() > new Date(usuario.mfa_expiracion)) {
      logger.warn({ mensaje: 'Código 2FA expirado', usuario_id: usuario.id, ip });
      return res.status(401).json({ error: 'El código ha expirado. Por favor, solicita uno nuevo.' });
    }

    // 3. Código válido: Limpiar campos de seguridad en la BD (un solo uso)
    await db.query(
      'UPDATE usuarios_boveda SET mfa_codigo = NULL, mfa_expiracion = NULL WHERE id = $1',
      [usuario.id]
    );

    // 4. Firmar el token JWT definitivo (Duración según "Remember Me")
    const duracion = rememberMe ? '7d' : '8h';
    const token = jwt.sign(
      { id: usuario.id, empresa_id: usuario.empresa_id, rol: usuario.rol, nombre: usuario.nombre_completo, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: duracion }
    );

    logger.info({ mensaje: 'Autenticación de doble factor completada con éxito', usuario_id: usuario.id, tipoLogin, ip });
    
    // Registrar auditoría final
    const accionAuditoria = tipoLogin === 'google' ? 'LOGIN_GOOGLE_EXITOSO' : 'LOGIN_EXITOSO';
    await registrarAuditoria(usuario.id, usuario.empresa_id, ip, accionAuditoria, { email: usuario.email });

    res.json({
      mensaje: 'Acceso autorizado',
      token: token,
      empresa_id: usuario.empresa_id
    });
  } catch (error) {
    logger.error({ mensaje: 'Error crítico durante la verificación de 2FA', error: error.message, ip });
    res.status(500).json({ error: 'Error interno de seguridad en la Bóveda.', detalle: error.message });
  }
};

const reenviarMfa = async (req, res) => {
  const { tempToken } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  if (!tempToken) {
    return res.status(400).json({ error: 'Falta el token temporal de verificación.' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (errToken) {
      return res.status(401).json({ error: 'La sesión temporal de verificación ha expirado.' });
    }

    const usuarioId = decoded.id;
    const email = decoded.email;

    // Generar un nuevo código OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const mfaExp = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      'UPDATE usuarios_boveda SET mfa_codigo = $1, mfa_expiracion = $2 WHERE id = $3',
      [otp, mfaExp, usuarioId]
    );

    await enviarCodigoMfa(email, otp);

    logger.info({ mensaje: 'Código 2FA reenviado con éxito', usuario_id: usuarioId, email, ip });
    res.json({ mensaje: 'Se ha reenviado un nuevo código a tu correo.' });
  } catch (error) {
    logger.error({ mensaje: 'Error al reenviar código 2FA', error: error.message, ip });
    res.status(500).json({ error: 'Error al reenviar el código de verificación.' });
  }
};

module.exports = { login, registrarUsuario, seedDemo, resetAdmin, seedTransactions, recuperarPassword, cambiarPassword, loginGoogle, verificarMfa, reenviarMfa };
