// ==========================================
// CuadraPro - Rutas de Clientes
// Firma: buhonero0
// ==========================================
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/registrar', authMiddleware.verificarToken, clientesController.registrarEmpresa);
router.get('/lista', authMiddleware.verificarToken, clientesController.listarEmpresas);

module.exports = router;
