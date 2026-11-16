const prisma = require('../prisma');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Lista clientes (paginado). Requer autenticação (funcionário).
 */
async function list(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const [clients, total] = await prisma.$transaction([
      prisma.client.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { orders: true },
      }),
      prisma.client.count(),
    ]);

    return res.json({
      data: clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[clientController.list]', error);
    return res.status(500).json({ error: 'Erro interno ao listar clientes.' });
  }
}

/**
 * Detalha um cliente pelo ID. Requer autenticação.
 */
async function getById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const client = await prisma.client.findUnique({
      where: { id },
      include: { orders: true },
    });
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    return res.json(client);
  } catch (error) {
    console.error('[clientController.getById]', error);
    return res.status(500).json({ error: 'Erro interno ao buscar cliente.' });
  }
}

/**
 * Cadastra um novo cliente. Restrito a Manager/CEO.
 */
async function create(req, res) {
  try {
    const { name, email, tel } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios.',
      });
    }

    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }

    const client = await prisma.client.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        tel: tel || null,
      },
    });

    return res.status(201).json(client);
  } catch (error) {
    console.error('[clientController.create]', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar cliente.' });
  }
}

/**
 * Atualiza um cliente existente. Restrito a Manager/CEO.
 */
async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const { name, email, tel } = req.body;
    const data = {};

    if (name !== undefined) {
      const nameTrim = String(name).trim();
      if (!nameTrim) {
        return res.status(400).json({ error: 'Nome não pode ser vazio.' });
      }
      data.name = nameTrim;
    }

    if (email !== undefined) {
      const emailTrim = String(email).trim().toLowerCase();
      if (!emailTrim) {
        return res.status(400).json({ error: 'Email não pode ser vazio.' });
      }
      const emailDuplicado = await prisma.client.findUnique({ where: { email: emailTrim } });
      if (emailDuplicado && emailDuplicado.id !== id) {
        return res.status(409).json({ error: 'Já existe outro cliente com este email.' });
      }
      data.email = emailTrim;
    }

    if (tel !== undefined) {
      data.tel = tel || null;
    }

    const updated = await prisma.client.update({ where: { id }, data });
    return res.json(updated);
  } catch (error) {
    console.error('[clientController.update]', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar cliente.' });
  }
}

/**
 * Remove um cliente. Restrito a Manager/CEO.
 * Recusa se houver pedidos vinculados.
 */
async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const ordersCount = await prisma.order.count({ where: { clientId: id } });

    if (ordersCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir cliente com pedidos vinculados.',
      });
    }

    await prisma.client.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('[clientController.remove]', error);
    return res.status(500).json({ error: 'Erro interno ao excluir cliente.' });
  }
}

module.exports = { list, getById, create, update, remove };
