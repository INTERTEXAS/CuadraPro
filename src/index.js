// ==========================================
// CuadraPro - Archivo Maestro B2B
// Firma: buhonero0
// ==========================================
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Configuración de CORS Restrictivo (Seguridad Corporativa)
const originsPermitidos = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || originsPermitidos.indexOf(origin) !== -1) {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Motor CuadraPro encendido en el puerto ${PORT}`));
