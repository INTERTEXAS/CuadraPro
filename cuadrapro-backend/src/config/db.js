// ===========================================================================
// Micro-SaaS: CuadraPro - Puente PostgreSQL (Preparado para Producción)
// Firma Técnica: Lagunes--INTERTEXAS
// ===========================================================================
const { Pool } = require('pg');
require('dotenv').config();

// 1. Validar si existe una URL de conexión completa (Producción) o credenciales sueltas (Local)
const config = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000, // 10 segundos de espera
      idleTimeoutMillis: 30000,
      max: 10
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool(config);

module.exports = pool;
