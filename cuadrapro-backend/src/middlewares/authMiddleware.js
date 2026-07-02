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

const requerirRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes para esta operación.' });
    }
    next();
  };
};

module.exports = { verificarToken, requerirRol };