// ===========================================================================
// Micro-SaaS: CuadraPro - Enrutador de Acceso
// Firma Técnica: MLagunes
// ===========================================================================
const express = require('express');
const router = express.Router();
const { z } = require('zod');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateSchema = require('../middlewares/validateSchema');

// Esquemas de validación de datos con Zod
const loginSchema = z.object({
  email: z.string().trim().email({ message: 'El correo electrónico ingresado no es válido.' }),
  password: z.string().min(4, { message: 'La contraseña debe tener al menos 4 caracteres.' })
});

const registroSchema = z.object({
  nombre_completo: z.string().trim().min(3, { message: 'El nombre completo debe tener al menos 3 caracteres.' }).max(100),
  email: z.string().trim().email({ message: 'El correo electrónico ingresado no es válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
});

const recuperarPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'El correo electrónico ingresado no es válido.' })
});

const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(4, { message: 'La contraseña actual debe tener al menos 4 caracteres.' }),
  nuevaPassword: z.string().min(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres.' })
});

// Rutas con validación automatizada de esquemas
router.post('/login', validateSchema(loginSchema), authController.login);
router.post('/registro', validateSchema(registroSchema), authController.registrarUsuario);
router.post('/google', authController.loginGoogle);
router.post('/verificar-mfa', authController.verificarMfa);
router.post('/reenviar-mfa', authController.reenviarMfa);
router.post('/seed', authController.seedDemo); 
router.post('/seed-transactions', authController.seedTransactions); 
router.post('/reset-admin', authController.resetAdmin); 
router.post('/recuperar-password', validateSchema(recuperarPasswordSchema), authController.recuperarPassword); 
router.put('/cambiar-password', authMiddleware.verificarToken, validateSchema(cambiarPasswordSchema), authController.cambiarPassword);

module.exports = router;
