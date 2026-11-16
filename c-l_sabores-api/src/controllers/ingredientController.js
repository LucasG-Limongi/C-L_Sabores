const prisma = require('../prisma');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Lista ingredientes (paginado). Requer autenticação (funcionário).
 */
async function list(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const [ingredients, total] = await prisma.$transaction([
      prisma.ingredient.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { quantity: true },
      }),
      prisma.ingredient.count(),
    ]);

    return res.json({
      data: ingredients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[ingredientController.list]', error);
    return res.status(500).json({ error: 'Erro interno ao listar ingredientes.' });
  }
}

/**
 * Detalha um ingrediente pelo ID. Requer autenticação.
 */
async function getById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: { quantity: true },
    });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingrediente não encontrado.' });
    }

    return res.json(ingredient);
  } catch (error) {
    console.error('[ingredientController.getById]', error);
    return res.status(500).json({ error: 'Erro interno ao buscar ingrediente.' });
  }
}

/**
 * Cadastra um ingrediente. Restrito a Manager/CEO.
 */
async function create(req, res) {
  try {
    const { name } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }

    const trimmed = String(name).trim();

    const existing = await prisma.ingredient.findFirst({ where: { name: trimmed } });
    if (existing) {
      return res.status(409).json({ error: 'Ingrediente já cadastrado.' });
    }

    const ingredient = await prisma.ingredient.create({
      data: { name: trimmed },
    });

    return res.status(201).json(ingredient);
  } catch (error) {
    console.error('[ingredientController.create]', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar ingrediente.' });
  }
}

/**
 * Atualiza um ingrediente. Restrito a Manager/CEO.
 */
async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const { name } = req.body;

    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Ingrediente não encontrado.' });
    }

    const data = {};
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ error: 'Nome não pode ser vazio.' });
      }
      const nomeDuplicado = await prisma.ingredient.findFirst({ where: { name: trimmed } });
      if (nomeDuplicado && nomeDuplicado.id !== id) {
        return res.status(409).json({ error: 'Já existe outro ingrediente com este nome.' });
      }
      data.name = trimmed;
    }

    const updated = await prisma.ingredient.update({ where: { id }, data });
    return res.json(updated);
  } catch (error) {
    console.error('[ingredientController.update]', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar ingrediente.' });
  }
}

/**
 * Remove um ingrediente. Restrito a Manager/CEO.
 * Recusa se houver estoque ou receitas vinculados.
 */
async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Ingrediente não encontrado.' });
    }

    const [stockCount, recipeCount] = await prisma.$transaction([
      prisma.stock.count({ where: { ingredientId: id } }),
      prisma.recipe.count({ where: { ingredientId: id } }),
    ]);

    if (stockCount > 0 || recipeCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir ingrediente com estoque ou receitas vinculados.',
      });
    }

    await prisma.ingredient.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('[ingredientController.remove]', error);
    return res.status(500).json({ error: 'Erro interno ao excluir ingrediente.' });
  }
}

module.exports = { list, getById, create, update, remove };
