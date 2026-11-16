const jwt = require('jsonwebtoken');
const { loadConfig } = require('../config');

const { jwtSecret } = loadConfig();

/**
 * Middleware de autenticação via JWT.
 * Espera o token no header: Authorization: Bearer <token>
 * Em caso de sucesso, anexa o funcionário autenticado em req.employee.
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, jwtSecret);

    req.employee = {
      id: decoded.employeeId,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    return res.status(500).json({ error: 'Erro interno ao validar token.' });
  }
}

/**
 * Middleware de autorização por role.
 * Exige que o usuário autenticado possua uma das roles permitidas.
 * Uso: app.get('/admin', authMiddleware, requireRole(['Manager', 'CEO']), handler)
 */
function requireRole(allowedRoles = []) {
  return function roleMiddleware(req, res, next) {
    if (!req.employee) {
      return res.status(401).json({ error: 'Autenticação necessária.' });
    }

    if (!allowedRoles.includes(req.employee.role)) {
      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente.' });
    }

    return next();
  };
}

module.exports = { authMiddleware, requireRole };
