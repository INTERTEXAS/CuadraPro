const request = require('supertest');
const express = require('express');
const db = require('../src/config/db');

// Creamos una app Express mínima para pruebas
const app = express();
app.use(express.json());
app.use('/api/v1/auth', require('../src/routes/authRoutes'));

describe('Integración Google OAuth Endpoint POST /api/v1/auth/google', () => {
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(async () => {
    global.fetch = originalFetch;
    // Limpiamos los usuarios de prueba creados
    await db.query("DELETE FROM usuarios_boveda WHERE email = 'test_google_nuevo@example.com'");
    // Cerramos el pool de base de datos
    await db.end();
  });

  test('Debería retornar 400 si no se proporciona access_token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Falta el access_token de Google.');
  });

  test('Debería retornar 401 si el token es rechazado por Google', async () => {
    // Mock de fetch fallido
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Invalid Credentials')
    });

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ access_token: 'token_falso_invalido' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Token de Google inválido o vencido.');
  });

  test('Debería registrar e iniciar sesión si el usuario es nuevo y el token es válido', async () => {
    // Mock de fetch exitoso para un usuario nuevo
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        email: 'test_google_nuevo@example.com',
        name: 'Usuario Google Nuevo',
        email_verified: true
      })
    });

    // Validamos que no exista antes de correr el test
    await db.query("DELETE FROM usuarios_boveda WHERE email = 'test_google_nuevo@example.com'");

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ access_token: 'token_valido_nuevo' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Acceso autorizado vía Google');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('empresa_id', 1);

    // Verificar que efectivamente se haya insertado en la base de datos
    const dbCheck = await db.query("SELECT * FROM usuarios_boveda WHERE email = 'test_google_nuevo@example.com'");
    expect(dbCheck.rows.length).toBe(1);
    expect(dbCheck.rows[0].nombre_completo).toBe('Usuario Google Nuevo');
  });

  test('Debería iniciar sesión directamente si el usuario ya existe', async () => {
    // Mock de fetch exitoso para el mismo usuario
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        email: 'test_google_nuevo@example.com',
        name: 'Usuario Google Nuevo',
        email_verified: true
      })
    });

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ access_token: 'token_valido_existente' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('empresa_id', 1);
  });
});
