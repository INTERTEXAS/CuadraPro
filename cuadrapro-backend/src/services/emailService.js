const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const enviarCodigoMfa = async (email, codigo) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const plantillaHtml = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e5e5; border-radius: 20px; background-color: #fafafa;">
      <div style="text-align: center; border-bottom: 1px solid #e5e5e5; padding-bottom: 15px; margin-bottom: 25px;">
        <h2 style="color: #00c49f; margin: 0; text-transform: uppercase; font-size: 22px; font-weight: 900; letter-spacing: 0.05em;">Cuadra<span style="color: #171717;">Pro</span></h2>
        <p style="color: #737373; font-size: 10px; font-weight: bold; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.15em;">Bóveda Contable B2B</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e8e8e8; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.015);">
        <h3 style="color: #171717; margin-top: 0; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #262626; margin-bottom: 10px;">Verificación de Doble Factor (2FA)</h3>
        <p style="color: #737373; font-size: 13px; font-weight: 500; line-height: 1.5; margin-bottom: 25px;">
          Se ha solicitado un inicio de sesión en tu cuenta. Utiliza la siguiente clave de acceso temporal de un solo uso para verificar tu identidad:
        </p>
        
        <div style="background-color: #f4faf8; border: 1px dashed #00c49f; display: inline-block; padding: 12px 30px; border-radius: 12px; margin-bottom: 25px;">
          <span style="font-family: monospace; font-size: 28px; font-weight: 800; color: #00c49f; letter-spacing: 0.15em;">${codigo}</span>
        </div>
        
        <p style="color: #a3a3a3; font-size: 11px; font-weight: 600; margin: 0;">
          * Este código expirará en 5 minutos y se puede utilizar una sola vez.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 25px; font-size: 10px; color: #a3a3a3; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">
        CuadraPro • Encriptación AES-256 • Conexión Bancaria Segura
      </div>
    </div>
  `;

  // Si no está configurado el SMTP, simulamos el envío de forma segura
  if (!host || !port || !user || !pass) {
    logger.warn({
      mensaje: 'SMTP no configurado en el archivo .env. Simulando envío de código 2FA por consola.',
      destinatario: email,
      codigo_generado: codigo
    });
    return { simulado: true, codigo };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port, 10),
      secure: false, // false para STARTTLS
      auth: {
        user: user,
        pass: pass
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"CuadraPro Seguridad" <${user}>`,
      to: email,
      subject: `[SEGURIDAD] Código de Acceso 2FA: ${codigo}`,
      html: plantillaHtml
    });

    logger.info({ mensaje: 'Correo de código 2FA enviado exitosamente por SMTP', destinatario: email });
    return { exitoso: true };
  } catch (error) {
    logger.error({ mensaje: 'Error enviando correo de 2FA por SMTP. Activando contingencia de consola.', error: error.message, destinatario: email });
    // Guardamos el log para que el desarrollador/usuario local pueda ver el código en la consola si falla el SMTP corporativo
    console.log(`\n🔑 [2FA CONTINGENCIA] Código para ${email} es: ${codigo}\n`);
    return { contingencia: true, error: error.message };
  }
};

module.exports = { enviarCodigoMfa };
