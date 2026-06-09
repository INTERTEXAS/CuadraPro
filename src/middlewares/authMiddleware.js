// ===========================================================================
// Micro-SaaS: CuadraPro - Cadenero JWT
// Firma Técnica: Lagunes--INTERTEXAS
// ===========================================================================
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado.' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token expirado o no válido.' });
  }
};

module.exports = { verificarToken };