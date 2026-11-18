const prisma = require('../prisma');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Lista todos os pratos do cardápio.
 * Requer autenticação (funcionário).
 * Suporta paginação via query params ?page=&limit=
 */
async function list(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const [menus, total] = await prisma.$transaction([
      prisma.menu.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.menu.count(),
    ]);

    return res.json({
      data: menus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[menuController.list]', error);
    return res.status(500).json({ error: 'Erro interno ao listar cardápio.' });
  }
}

/**
 * Detalha um prato pelo ID.
 * Requer autenticação (funcionário).
 */
async function getById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const menu = await prisma.menu.findUnique({ where: { id } });
    if (!menu) {
      return res.status(404).json({ error: 'Prato não encontrado.' });
    }

    return res.json(menu);
  } catch (error) {
    console.error('[menuController.getById]', error);
    return res.status(500).json({ error: 'Erro interno ao buscar prato.' });
  }
}

/**
 * Cadastra um novo prato no cardápio.
 * Restrito ao CEO.
 */
async function create(req, res) {
  try {
    const { name, description, category, price, available } = req.body;

    if (!name || !description || price === undefined || price === null) {
      return res.status(400).json({
        error: 'Nome, descrição e preço são obrigatórios.',
      });
    }

    const priceInt = parseInt(price, 10);
    if (Number.isNaN(priceInt) || priceInt < 0) {
      return res.status(400).json({ error: 'Preço deve ser um número inteiro não negativo.' });
    }

    const menu = await prisma.menu.create({
      data: {
        name: String(name).trim(),
        description: String(description).trim(),
        category: String(category || 'Prato Principal').trim(),
        price: priceInt,
        available: available !== false, // default true
      },
    });

    return res.status(201).json(menu);
  } catch (error) {
    console.error('[menuController.create]', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar prato.' });
  }
}

/**
 * Atualiza um prato existente.
 * Restrito ao CEO.
 */
async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Prato não encontrado.' });
    }

    const { name, description, category, price, available } = req.body;
    const data = {};

    if (name !== undefined) {
      const nameTrim = String(name).trim();
      if (!nameTrim) {
        return res.status(400).json({ error: 'Nome não pode ser vazio.' });
      }
      data.name = nameTrim;
    }

    if (description !== undefined) {
      const descTrim = String(description).trim();
      if (!descTrim) {
        return res.status(400).json({ error: 'Descrição não pode ser vazia.' });
      }
      data.description = descTrim;
    }

    if (category !== undefined) {
      data.category = String(category).trim() || 'Prato Principal';
    }

    if (price !== undefined) {
      const priceInt = parseInt(price, 10);
      if (Number.isNaN(priceInt) || priceInt < 0) {
        return res.status(400).json({ error: 'Preço deve ser um número inteiro não negativo.' });
      }
      data.price = priceInt;
    }

    if (available !== undefined) {
      data.available = Boolean(available);
    }

    const updated = await prisma.menu.update({ where: { id }, data });
    return res.json(updated);
  } catch (error) {
    console.error('[menuController.update]', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar prato.' });
  }
}

/**
 * Remove um prato do cardápio.
 * Restrito ao CEO. Recusa se houver receitas ou pedidos vinculados.
 */
async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Prato não encontrado.' });
    }

    const [recipesCount, orderItemsCount] = await prisma.$transaction([
      prisma.recipe.count({ where: { dishId: id } }),
      prisma.orderItem.count({ where: { itemId: id } }),
    ]);

    if (recipesCount > 0 || orderItemsCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir prato com receitas ou pedidos vinculados.',
      });
    }

    await prisma.menu.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('[menuController.remove]', error);
    return res.status(500).json({ error: 'Erro interno ao excluir prato.' });
  }
}

/**
 * Lista pratos disponíveis para clientes (sem autenticação).
 * Rota pública de consulta ao cardápio.
 */
async function listPublic(req, res) {
  try {
    const menus = await prisma.menu.findMany({
      where: { available: true },
      orderBy: { id: 'asc' },
    });
    return res.json(menus);
  } catch (error) {
    console.error('[menuController.listPublic]', error);
    return res.status(500).json({ error: 'Erro interno ao consultar cardápio público.' });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  listPublic,
};
