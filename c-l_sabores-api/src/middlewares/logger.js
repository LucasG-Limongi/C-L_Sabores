/**
 * Middleware global de auditoria (logger).
 *
 * Exibe no terminal todas as requisições recebidas em tempo real.
 * Útil para demonstrar o funcionamento do servidor durante a apresentação.
 *
 * Deve ser registrado em src/server.js logo abaixo de app.use(express.json()).
 */
function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

module.exports = logger;
