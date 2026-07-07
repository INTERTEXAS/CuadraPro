const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Error de validación de datos de entrada.',
      detalles: error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensaje: err.message
      })),
      codigo: 'ERROR_VALIDACION_ESQUEMA'
    });
  }
};

module.exports = validateSchema;
