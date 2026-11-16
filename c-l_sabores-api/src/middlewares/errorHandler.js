/**
 * Error handler global.
 * Deve ser montado ÚLTIMO na cadeia de middlewares, após todas as rotas.
 *
 * Padroniza respostas de erro em JSON e evita vazamento de stack traces
 * em ambiente de produção.
 */
function errorHandler(err, req, res, next) {
  // Evita enviar resposta duas vezes se o cabeçalho já foi commitado
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const response = {
    error: err.message || 'Erro interno do servidor.',
  };

  // Apenas em desenvolvimento expõe detalhes do erro e stack trace
  if (!isProduction) {
    response.stack = err.stack;
    response.details = err.details || null;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
