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

module.exports = { login, registrarUsuario, seedDemo, resetAdmin };
