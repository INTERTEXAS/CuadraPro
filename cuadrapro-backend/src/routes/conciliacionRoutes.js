// ===========================================================================
// Micro-SaaS: CuadraPro - Enrutador B2B
// Firma Técnica: Lagunes--INTERTEXAS
// ===========================================================================
const express = require('express');
const router = express.Router();
const conciliacionController = require('../controllers/conciliacionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/dashboard', authMiddleware.verificarToken, conciliacionController.obtenerDashboard);
router.post('/registrar', authMiddleware.verificarToken, conciliacionController.registrarFlujo);
router.post('/subir-facturas', authMiddleware.verificarToken, conciliacionController.subirFacturas);
router.get('/alertas-fugas', authMiddleware.verificarToken, conciliacionController.obtenerFugasComisiones);
router.post('/seed-mes', authMiddleware.verificarToken, conciliacionController.seedMesActual);

module.exports = router;