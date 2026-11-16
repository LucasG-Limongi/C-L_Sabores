const prisma = require('../prisma');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

/**
 * Lista receitas (paginado). Requer autenticação (funcionário).
 * Cada receita vincula um prato (dish) a um ingrediente com uma quantidade.
 */
async function list(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const [recipes, total] = await prisma.$transaction([
      prisma.recipe.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: { ingredient: true, dish: true },
      }),
      prisma.recipe.count(),
    ]);

    return res.json({
      data: recipes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[recipeController.list]', error);
    return res.status(500).json({ error: 'Erro interno ao listar receitas.' });
  }
}

/**
 * Detalha uma receita pelo ID. Requer autenticação.
 */
async function getById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredient: true, dish: true },
    });
    if (!recipe) {
      return res.status(404).json({ error: 'Receita não encontrada.' });
    }

    return res.json(recipe);
  } catch (error) {
    console.error('[recipeController.getById]', error);
    return res.status(500).json({ error: 'Erro interno ao buscar receita.' });
  }
}

/**
 * Lista receitas de um prato específico. Requer autenticação.
 */
async function getByDish(req, res) {
  try {
    const dishId = parseInt(req.params.dishId, 10);
    if (Number.isNaN(dishId)) {
      return res.status(400).json({ error: 'ID do prato inválido.' });
    }

    const dish = await prisma.menu.findUnique({ where: { id: dishId } });
    if (!dish) {
      return res.status(404).json({ error: 'Prato não encontrado.' });
    }

    const recipes = await prisma.recipe.findMany({
      where: { dishId },
      include: { ingredient: true },
      orderBy: { id: 'asc' },
    });

    return res.json(recipes);
  } catch (error) {
    console.error('[recipeController.getByDish]', error);
    return res.status(500).json({ error: 'Erro interno ao buscar receitas do prato.' });
  }
}

/**
 * Cadastra uma receita (vincula ingrediente a prato com quantidade).
 * Restrito a Manager/CEO.
 * Corpo: { ingredientId, dishId, quantity }
 */
async function create(req, res) {
  try {
    const { ingredientId, dishId, quantity } = req.body;

    if (!ingredientId || !dishId) {
      return res.status(400).json({ error: 'ingredientId e dishId são obrigatórios.' });
    }

    const q = parseFloat(quantity);
    if (Number.isNaN(q) || q <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser um número positivo.' });
    }

    const [ingredient, dish] = await prisma.$transaction([
      prisma.ingredient.findUnique({ where: { id: ingredientId } }),
      prisma.menu.findUnique({ where: { id: dishId } }),
    ]);

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingrediente não encontrado.' });
    }
    if (!dish) {
      return res.status(404).json({ error: 'Prato não encontrado.' });
    }

    // Evita duplicata (também protegida por @@unique no schema)
    const existing = await prisma.recipe.findUnique({
      where: { ingredientId_dishId: { ingredientId, dishId } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Este ingrediente já está vinculado a este prato.' });
    }

    const recipe = await prisma.recipe.create({
      data: { ingredientId, dishId, quantity: q },
      include: { ingredient: true, dish: true },
    });

    return res.status(201).json(recipe);
  } catch (error) {
    console.error('[recipeController.create]', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar receita.' });
  }
}

/**
 * Atualiza uma receita (quantidade). Restrito a Manager/CEO.
 */
async function update(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const { quantity } = req.body;

    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Receita não encontrada.' });
    }

    const data = {};
    if (quantity !== undefined) {
      const q = parseFloat(quantity);
      if (Number.isNaN(q) || q <= 0) {
        return res.status(400).json({ error: 'Quantidade deve ser um número positivo.' });
      }
      data.quantity = q;
    }

    const updated = await prisma.recipe.update({
      where: { id },
      data,
      include: { ingredient: true, dish: true },
    });

    return res.json(updated);
  } catch (error) {
    console.error('[recipeController.update]', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar receita.' });
  }
}

/**
 * Remove uma receita. Restrito a Manager/CEO.
 */
async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Receita não encontrada.' });
    }

    await prisma.recipe.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('[recipeController.remove]', error);
    return res.status(500).json({ error: 'Erro interno ao excluir receita.' });
  }
}

module.exports = { list, getById, getByDish, create, update, remove };
