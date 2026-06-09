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
  const empresas = [
    { nombre: 'InnovaTech Solutions', rfc: 'ITS230101ABC', plan: 'Enterprise' },
    { nombre: 'Logística Global MX', rfc: 'LGM230202DEF', plan: 'Business' },
    { nombre: 'Constructora del Norte', rfc: 'CDN230303GHI', plan: 'Pro' },
    { nombre: 'Servicios Médicos Alfa', rfc: 'SMA230404JKL', plan: 'Business' },
    { nombre: 'Alimentos y Bebidas Real', rfc: 'ABR230505MNO', plan: 'Pro' },
    { nombre: 'Consultoría Integral B2B', rfc: 'CIB230606PQR', plan: 'Enterprise' },
    { nombre: 'Textiles del Sur', rfc: 'TDS230707STU', plan: 'Business' },
    { nombre: 'Energía Limpia SA', rfc: 'ELS230808VWX', plan: 'Enterprise' },
    { nombre: 'Moda y Estilo Digital', rfc: 'MED230909YZA', plan: 'Pro' },
    { nombre: 'Transportes Rápidos S.A.', rfc: 'TRA231010BCD', plan: 'Business' }
  ];

  try {
    for (const e of empresas) {
      const resEmpresa = await db.query(
        'INSERT INTO empresas_clientes (nombre_comercial, rfc, plan_suscripcion) VALUES ($1, $2, $3) RETURNING id',
        [e.nombre, e.rfc, e.plan]
      );
      const empresaId = resEmpresa.rows[0].id;
      const email = `admin@${e.nombre.toLowerCase().replace(/ /g, '').replace(/[^a-z0-9]/g, '')}.com`;
      await db.query(
        'INSERT INTO usuarios_boveda (empresa_id, nombre_completo, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5)',
        [empresaId, `Admin ${e.nombre}`, email, 'hola1234', 'Administrador']
      );
    }
    res.json({ mensaje: 'Demo poblada con 10 empresas y 10 usuarios exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error en sembrado', detalle: error.message });
  }
};

module.exports = { login, registrarUsuario, seedDemo };
