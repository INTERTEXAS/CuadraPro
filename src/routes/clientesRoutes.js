// ==========================================
// CuadraPro - Rutas de Clientes
// Firma: buhonero0
// ==========================================
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/registrar', authMiddleware.verificarToken, authMiddleware.requerirRol('SuperAdmin'), clientesController.registrarEmpresa);
router.get('/lista', authMiddleware.verificarToken, authMiddleware.requerirRol('SuperAdmin'), clientesController.listarEmpresas);
router.get('/mi-empresa', authMiddleware.verificarToken, clientesController.obtenerMiEmpresa);
router.put('/actualizar-plan', authMiddleware.verificarToken, clientesController.actualizarPlan);
router.put('/actualizar-boveda', authMiddleware.verificarToken, clientesController.actualizarBovedaEmpresa);
router.get('/auditorias', authMiddleware.verificarToken, clientesController.listarAuditorias);

module.exports = router;
