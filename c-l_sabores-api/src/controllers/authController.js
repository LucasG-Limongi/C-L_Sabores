const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loadConfig } = require('../config');

const { jwtSecret, jwtExpiresIn, bcryptSaltRounds } = loadConfig();

/**
 * Autentica um funcionário por email e senha.
 * Corpo da requisição: { email, senha }
 * Resposta: { token, employee: { id, name, email, role } }
 */
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { email },
    });

    if (!employee) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, employee.password);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { employeeId: employee.id, email: employee.email, role: employee.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    return res.json({
      token,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error('[authController.login]', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

/**
 * Cadastra um novo funcionário.
 * A senha é hashada antes de ser persistida.
 * O campo password nunca é retornado na resposta.
 */
async function register(req, res) {
  try {
    const { name, email, senha, tel, role } = req.body;

    if (!name || !email || !senha) {
      return res.status(400).json({
        error: 'Nome, email e senha são obrigatórios.',
      });
    }

    const existing = await prisma.employee.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(senha, bcryptSaltRounds);

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        password: passwordHash,
        tel: tel || null,
        role: role || 'Attendant',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tel: true,
        // password intencionalmente omitido
      },
    });

    return res.status(201).json({ employee });
  } catch (error) {
    console.error('[authController.register]', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar funcionário.' });
  }
}

module.exports = { login, register };
