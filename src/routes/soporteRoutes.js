// ==========================================
// CuadraPro - Rutas de Soporte B2B
// Firma: buhonero0
// ==========================================
const express = require('express');
const router = express.Router();
const soporteController = require('../controllers/soporteController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/crear-ticket', authMiddleware.verificarToken, soporteController.crearTicket);

module.exports = router;
