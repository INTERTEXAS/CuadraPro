// ==========================================
// CuadraPro - Gestor de Clientes B2B
// Firma: buhonero0
// ==========================================
const db = require('../config/db');

const registrarEmpresa = async (req, res) => {
  const { nombre_comercial, rfc, plan_suscripcion } = req.body;
  
  try {
    const query = `
      INSERT INTO empresas_clientes (nombre_comercial, rfc, plan_suscripcion) 
      VALUES ($1, $2, $3) RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre_comercial, rfc, plan_suscripcion]);
    res.status(201).json({ mensaje: 'Empresa registrada con éxito', empresa: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la empresa. Verifica que el RFC no esté duplicado.' });
  }
};

const listarEmpresas = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM empresas_clientes ORDER BY fecha_alta DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar el catálogo de clientes.' });
  }
};

module.exports = { registrarEmpresa, listarEmpresas };
