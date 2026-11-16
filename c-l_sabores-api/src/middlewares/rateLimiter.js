const rateLimit = require('express-rate-limit');

/**
 * Rate limiter específico para endpoint de login.
 * Limita tentativas de autenticação para mitigar brute force e enumeração de emails.
 *
 * Configuração padrão:
 *  - 10 requisições por janela de 15 minutos por IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 tentativas por IP na janela
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true, // Retorna RateLimit-* headers
  legacyHeaders: false,
});

module.exports = { loginLimiter };
