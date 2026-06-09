// ===========================================================================
// Micro-SaaS: CuadraPro - Enrutador de Acceso
// Firma Técnica: buhonero0
// ===========================================================================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Usamos POST porque estamos enviando datos sensibles (password) ocultos en el cuerpo de la petición
router.post('/login', authController.login);
router.post('/registro', authController.registrarUsuario);
router.post('/seed', authController.seedDemo); // Ruta temporal para la demo
router.post('/seed-transactions', authController.seedTransactions); // Ruta para movimientos
router.post('/reset-admin', authController.resetAdmin); // Ruta de recuperación

module.exports = router;
