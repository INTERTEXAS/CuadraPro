const request = require('supertest');
const express = require('express');
const db = require('../src/config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mockear emailService para evitar retardos por conexión SMTP externa
jest.mock('../src/services/emailService', () => ({
  enviarCodigoMfa: jest.fn().mockResolvedValue({ exitoso: true })
}));

const app = express();
app.use(express.json());
app.use('/api/v1/auth', require('../src/routes/authRoutes'));

describe('Integración MFA (2FA) y Remember Me Endpoint POST', () => {
  let originalFetch;
  let usuarioDemoId;

  beforeAll(async () => {
    originalFetch = global.fetch;

    // Crear un usuario de prueba en la base de datos
    const hash = await bcrypt.hash('password123', 10);
    const { rows } = await db.query(`
      INSERT INTO usuarios_boveda (empresa_id, nombre_completo, email, password_hash, rol)
      VALUES (1, 'Test MFA User', 'test_mfa_user@example.com', $1, 'SuperAdmin')
      RETURNING id
    `, [hash]);
    usuarioDemoId = rows[0].id;
  });

  afterAll(async () => {
    global.fetch = originalFetch;
    // Limpiar base de datos
    await db.query('DELETE FROM usuarios_boveda WHERE email = $1', ['test_mfa_user@example.com']);
    await db.end();
  });

  test('Paso 1: Login correcto debería requerir MFA y retornar tempToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test_mfa_user@example.com',
        password: 'password123',
        rememberMe: true
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mfaRequerido', true);
    expect(res.body).toHaveProperty('tempToken');

    // Comprobar que en la base de datos se guardó un código OTP
    const { rows } = await db.query('SELECT mfa_codigo, mfa_expiracion FROM usuarios_boveda WHERE id = $1', [usuarioDemoId]);
    expect(rows[0].mfa_codigo).not.toBeNull();
    expect(rows[0].mfa_expiracion).not.toBeNull();
  });

  test('Paso 2: Verificar MFA con código incorrecto debería fallar', async () => {
    // Primero hacemos login para obtener el tempToken
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test_mfa_user@example.com',
        password: 'password123'
      });

    const tempToken = loginRes.body.tempToken;

    const res = await request(app)
      .post('/api/v1/auth/verificar-mfa')
      .send({
        tempToken,
        codigo: '000000' // incorrecto
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'El código ingresado es incorrecto.');
  });

  test('Paso 3: Verificar MFA con código correcto debería autorizar sesión y firmar JWT definitivo', async () => {
    // 1. Login para obtener el tempToken
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test_mfa_user@example.com',
        password: 'password123',
        rememberMe: true
      });

    const tempToken = loginRes.body.tempToken;

    // 2. Consultar el código OTP generado en la base de datos
    const { rows } = await db.query('SELECT mfa_codigo FROM usuarios_boveda WHERE id = $1', [usuarioDemoId]);
    const codigoOtp = rows[0].mfa_codigo;

    // 3. Verificar MFA enviando el código correcto
    const res = await request(app)
      .post('/api/v1/auth/verificar-mfa')
      .send({
        tempToken,
        codigo: codigoOtp
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Acceso autorizado');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('empresa_id', 1);

    // 4. Decodificar el token para comprobar la expiración del Remember Me
    const tokenDecodificado = jwt.decode(res.body.token);
    // Como rememberMe es true, la expiración debe ser larga (~7 días)
    const duracionSegundos = tokenDecodificado.exp - tokenDecodificado.iat;
    expect(duracionSegundos).toBeGreaterThan(6 * 24 * 60 * 60); // Mayor a 6 días
  });

  test('Paso 4: Reenviar código OTP debería funcionar y actualizar la base de datos', async () => {
    // 1. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test_mfa_user@example.com',
        password: 'password123'
      });

    const tempToken = loginRes.body.tempToken;
    const { rows: rowsAntes } = await db.query('SELECT mfa_codigo FROM usuarios_boveda WHERE id = $1', [usuarioDemoId]);
    const codigoAntes = rowsAntes[0].mfa_codigo;

    // 2. Reenviar
    const reenviarRes = await request(app)
      .post('/api/v1/auth/reenviar-mfa')
      .send({ tempToken });

    expect(reenviarRes.status).toBe(200);
    expect(reenviarRes.body).toHaveProperty('mensaje', 'Se ha reenviado un nuevo código a tu correo.');

    // 3. Validar que el código haya cambiado en la base de datos
    const { rows: rowsDespues } = await db.query('SELECT mfa_codigo FROM usuarios_boveda WHERE id = $1', [usuarioDemoId]);
    expect(rowsDespues[0].mfa_codigo).not.toBe(codigoAntes);
  });
});
