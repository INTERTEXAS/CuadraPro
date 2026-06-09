// ==========================================
// CuadraPro - Controlador de Autenticación (DB Real)
// Firma: buhonero0
// ==========================================
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await db.query('SELECT * FROM usuarios_boveda WHERE email = $1', [email]);
    
    // Validación de usuario y contraseña (sin encriptar por ahora para el MVP)
    if (rows.length === 0 || rows[0].password_hash !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas. Acceso denegado.' });
    }

    const usuario = rows[0];
    
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
  const { empresa_id, nombre_completo, email, password } = req.body;
  try {
    const query = 'INSERT INTO usuarios_boveda (empresa_id, nombre_completo, email, password_hash) VALUES ($1, $2, $3, $4)';
    await db.query(query, [empresa_id, nombre_completo, email, password]);
    res.status(201).json({ mensaje: 'Credenciales B2B creadas exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error de inyección B2B. Verifica la BD.' });
  }
};

module.exports = { login, registrarUsuario };
