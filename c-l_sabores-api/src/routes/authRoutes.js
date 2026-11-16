const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { validarLogin, validarRegistro } = require('../middlewares/validarDados');

/**
 * Rotas de autenticação.
 * - POST /auth/login  (com rate limiting para mitigar brute force)
 * - POST /auth/register (cadastro de funcionário com senha hash)
 */
router.post('/login', loginLimiter, validarLogin, authController.login);
router.post('/register', validarRegistro, authController.register);

module.exports = router;
