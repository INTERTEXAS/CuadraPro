// ==========================================
// CuadraPro - Controlador de Autenticación (DB Real)
// Firma: buhonero0
// ==========================================
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[DEBUG LOGIN] Intento para: ${email}`);

  try {
    const emailNormalizado = email ? email.trim().toLowerCase() : '';
    const passTrim = password ? password.trim() : '';

    console.log(`[DEBUG LOGIN] Normalizado: '${emailNormalizado}', Pass: '${passTrim}'`);

    const { rows } = await db.query('SELECT * FROM usuarios_boveda WHERE LOWER(email) = $1', [emailNormalizado]);
    
    if (rows.length === 0) {
      console.log(`[DEBUG LOGIN] Usuario no encontrado: ${emailNormalizado}`);
      return res.status(401).json({ error: 'Credenciales inválidas. Acceso denegado.' });
    }

    const usuario = rows[0];
    console.log(`[DEBUG LOGIN] Comparando DB: '${usuario.password_hash}' con Input: '${passTrim}'`);

    if (usuario.password_hash !== passTrim) {
      console.log(`[DEBUG LOGIN] Password incorrecto para: ${emailNormalizado}`);
      return res.status(401).json({ error: 'Credenciales inválidas. Acceso denegado.' });
    }

    console.log(`[DEBUG LOGIN] ÉXITO para: ${emailNormalizado}`);
    
    // El token ahora guarda a qué empresa pertenece el usuario
    const token = jwt.sign(
      { id: usuario.id, empresa_id: usuario.empresa_id, rol: usuario.rol }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({ mensaje: 'Acceso autorizado', token: token, empresa_id: usuario.empresa_id });
  } catch (error) {
    console.error('ERROR EN LOGIN:', error);
    res.status(500).json({ error: 'Error interno de conexión a la Bóveda.', detalle: error.message });
  }
};

const registrarUsuario = async (req, res) => {
  const { nombre_completo, email, password } = req.body;
  try {
    // Usamos empresa_id = 1 por defecto si no existe, o simplemente lo insertamos
    const query = 'INSERT INTO usuarios_boveda (empresa_id, nombre_completo, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5)';
    await db.query(query, [1, nombre_completo, email.trim().toLowerCase(), password.trim(), 'SuperAdmin']);
    res.status(201).json({ mensaje: 'Credenciales B2B creadas exitosamente.' });
  } catch (error) {
    console.error('ERROR REGISTRO:', error);
    res.status(500).json({ error: 'Error de inyección B2B.', detalle: error.message });
  }
};

const seedDemo = async (req, res) => {
  // ... (código existente)
};

const resetAdmin = async (req, res) => {
  try {
    const email = 'admin@tallerlag.com';
    const nuevaPass = 'hola1234';
    await db.query(
      "UPDATE usuarios_boveda SET password_hash = $1, rol = 'SuperAdmin' WHERE LOWER(email) = LOWER($2)",
      [nuevaPass, email]
    );
    res.json({ mensaje: `Contraseña de ${email} restablecida a ${nuevaPass} exitosamente.` });
  } catch (error) {
    res.status(500).json({ error: 'Error en restablecimiento', detalle: error.message });
  }
};

const seedTransactions = async (req, res) => {
  try {
    // 1. Obtener todas las empresas
    const { rows: empresas } = await db.query('SELECT id FROM empresas_clientes');
    
    console.log(`[SEED] Generando movimientos para ${empresas.length} empresas...`);
    
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    for (const emp of empresas) {
      for (let i = 0; i < 7; i++) {
        const esperado = Math.floor(Math.random() * (50000 - 10000) + 10000);
        const depositado = esperado - (Math.random() * 500); // Pequeña diferencia para conciliación
        const clip = esperado * 0.036;
        const mp = esperado * 0.034;
        const sat = esperado * 0.08;

        await db.query(
          `INSERT INTO flujos_financieros 
          (empresa_id, fecha_corte, dia_semana, monto_esperado, monto_depositado, comision_clip, comision_mercadopago, retencion_sat) 
          VALUES ($1, CURRENT_DATE - $2, $3, $4, $5, $6, $7, $8)`,
          [emp.id, i, dias[i], esperado, depositado, clip, mp, sat]
        );
      }
    }
    
    res.json({ mensaje: 'Movimientos financieros generados para todas las empresas.' });
  } catch (error) {
    console.error('ERROR SEED TRANS:', error);
    res.status(500).json({ error: 'Error generando movimientos', detalle: error.message });
  }
};

module.exports = { login, registrarUsuario, seedDemo, resetAdmin, seedTransactions };
