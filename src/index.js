// ==========================================
// CuadraPro - Archivo Maestro B2B
// Firma: buhonero0
// ==========================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Inyección de Rutas
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/conciliaciones', require('./routes/conciliacionRoutes'));
app.use('/api/v1/clientes', require('./routes/clientesRoutes')); // Nueva tubería

app.get('/', (req, res) => { res.json({ status: 'Activo', mensaje: 'Motor B2B CuadraPro operando al 100%' }); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Motor CuadraPro encendido en el puerto ${PORT}`));
