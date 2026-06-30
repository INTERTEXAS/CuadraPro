// ===========================================================================
// Micro-SaaS: CuadraPro - Enrutador de Acceso
// Firma Técnica: buhonero0
// ===========================================================================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Usamos POST porque estamos enviando datos sensibles (password) ocultos en el cuerpo de la petición
router.post('/login', authController.login);
router.post('/registro', authController.registrarUsuario);
router.post('/seed', authController.seedDemo); 
router.post('/seed-transactions', authController.seedTransactions); 
router.post('/reset-admin', authController.resetAdmin); 
router.post('/recuperar-password', authController.recuperarPassword); 
router.put('/cambiar-password', authMiddleware.verificarToken, authController.cambiarPassword);

module.exports = router;
