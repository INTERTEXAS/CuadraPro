// ==========================================
// CuadraPro - Archivo Maestro B2B
// Firma: MLagunes
// ==========================================
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Protección de cabeceras HTTP (Helmet de seguridad contable)
app.use(helmet({
  contentSecurityPolicy: false, // Relajado en desarrollo local para no bloquear la comunicación de Vite
}));

// Configuración de CORS Restrictivo (Seguridad Corporativa)
const originsPermitidos = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://cuadra-pro.vercel.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin || 
      originsPermitidos.indexOf(origin) !== -1 || 
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Acceso denegado por políticas de seguridad CORS de CuadraPro.'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiter para mitigar ataques de fuerza bruta y DDoS en endpoints críticos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // Máximo 30 peticiones por IP
  message: { error: 'Demasiadas solicitudes desde esta IP. Por favor reintenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/auth/login', authLimiter);

// Inyección de Rutas
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/conciliaciones', require('./routes/conciliacionRoutes'));
app.use('/api/v1/clientes', require('./routes/clientesRoutes'));
app.use('/api/v1/soporte', require('./routes/soporteRoutes'));

app.get('/', (req, res) => { res.json({ status: 'Activo', mensaje: 'Motor B2B CuadraPro operando al 100%' }); });

// Middleware de Manejo de Errores Global (Clean Architecture)
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado en el servidor contable:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Ocurrió un error interno en el servidor contable.',
    codigo: 'ERROR_INTERNO_SERVIDOR'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Motor CuadraPro encendido en el puerto ${PORT}`));
