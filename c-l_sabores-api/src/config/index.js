require('dotenv/config');

/**
 * Configuração centralizada da aplicação.
 * Valida variáveis obrigatórias no bootstrap para falhar rápido (fail-fast)
 * caso o ambiente não esteja devidamente configurado.
 */
const REQUIRED = ['JWT_SECRET'];
const DEFAULT_JWT_SECRET = 'sua_chave_secreta_jwt_aqui_mude_em_producao';

function loadConfig() {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[CONFIG] Variáveis de ambiente obrigatórias não definidas: ${missing.join(', ')}`
    );
  }

  if (process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
    throw new Error(
      '[CONFIG] JWT_SECRET está usando o valor padrão inseguro. Defina um valor forte em .env antes de iniciar.'
    );
  }

  return {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  };
}

module.exports = { loadConfig, DEFAULT_JWT_SECRET };
