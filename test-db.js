const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: 'Lagunes98',
  port: process.env.DB_PORT,
});

async function testConnection() {
  console.log('--- Iniciando prueba de conexión ---');
  console.log(`Intentando conectar a: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`Usuario: ${process.env.DB_USER}`);
  
  try {
    const start = Date.now();
    const res = await pool.query('SELECT NOW() as hora_servidor');
    const duration = Date.now() - start;
    console.log('✅ Conexión EXITOSA');
    console.log('Hora del servidor DB:', res.rows[0].hora_servidor);
    console.log(`Tiempo de respuesta: ${duration}ms`);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    if (err.code) console.error('Código de error PG:', err.code);
  } finally {
    await pool.end();
  }
}

testConnection();
