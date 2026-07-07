const crypto = require('crypto');

const ALGORITMO = 'aes-256-gcm';
// Derivamos una llave criptográfica segura de 32 bytes usando scrypt
const KEY_SECRET = crypto.scryptSync(process.env.JWT_SECRET || 'boveda_cuadrapro_default_key', 'salt_cuadrapro', 32);

const cifrar = (texto) => {
  if (!texto) return '';
  const iv = crypto.randomBytes(12); // Vector de inicialización único para GCM
  const cipher = crypto.createCipheriv(ALGORITMO, KEY_SECRET, iv);
  
  let encriptado = cipher.update(texto, 'utf8', 'hex');
  encriptado += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex'); // Firma de autenticación
  
  // Retornamos la triada en formato seguro
  return `${iv.toString('hex')}:${authTag}:${encriptado}`;
};

const descifrar = (textoCifrado) => {
  if (!textoCifrado) return '';
  try {
    const partes = textoCifrado.split(':');
    if (partes.length !== 3) return textoCifrado; // Fallback en caso de que no esté cifrado
    
    const iv = Buffer.from(partes[0], 'hex');
    const authTag = Buffer.from(partes[1], 'hex');
    const encriptado = partes[2];
    
    const decipher = crypto.createDecipheriv(ALGORITMO, KEY_SECRET, iv);
    decipher.setAuthTag(authTag);
    
    let desencriptado = decipher.update(encriptado, 'hex', 'utf8');
    desencriptado += decipher.final('utf8');
    
    return desencriptado;
  } catch (error) {
    console.error('❌ Error al descifrar dato contable:', error.message);
    return textoCifrado; // Fallback al texto original si hay corrupción
  }
};

module.exports = { cifrar, descifrar };
