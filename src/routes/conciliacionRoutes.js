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

module.exports = router;