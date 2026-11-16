const prisma = require('../prisma');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const VALID_UNITS = ['kg', 'g', 'L', 'mL'];

/**
 * Lista itens de estoque (paginado). Requer autenticação (funcionário).
 */
async function list(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const [stocks, total] = await prisma.$transaction([
      prisma.stock.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: { ingredient: true },
      }),
      prisma.stock.count(),
    ]);

    return res.json({
      data: stocks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[stockController.list]', error);
    return res.status(500).json({ error: 'Erro interno ao listar estoque.' });
  }
}

/**
 * Consulta estoque de um ingrediente específico. Requer autenticação.
 */
async function getByIngredient(req, res) {
  try {
    const ingredientId = parseInt(req.params.ingredientId, 10);
    if (Number.isNaN(ingredientId)) {
      return res.status(400).json({ error: 'ID do ingrediente inválido.' });
    }

    const stock = await prisma.stock.findUnique({
      where: { ingredientId },
      include: { ingredient: true },
    });
    if (!stock) {
      return res.status(404).json({ error: 'Estoque não encontrado para este ingrediente.' });
    }

    return res.json(stock);
  } catch (error) {
    console.error('[stockController.getByIngredient]', error);
    return res.status(500).json({ error: 'Erro interno ao buscar estoque.' });
  }
}

/**
 * Atualiza estoque de um ingrediente. Restrito a Manager/CEO.
 * Corpo: { quantity, unit, minQuantity }
 */
async function update(req, res) {
  try {
    const ingredientId = parseInt(req.params.ingredientId, 10);
    if (Number.isNaN(ingredientId)) {
      return res.status(400).json({ error: 'ID do ingrediente inválido.' });
    }

    const { quantity, unit, minQuantity } = req.body;

    const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingrediente não encontrado.' });
    }

    const data = {};

    if (quantity !== undefined) {
      const q = parseFloat(quantity);
      if (Number.isNaN(q) || q < 0) {
        return res.status(400).json({ error: 'Quantidade deve ser um número não negativo.' });
      }
      data.quantity = q;
    }

    if (unit !== undefined) {
      if (!VALID_UNITS.includes(unit)) {
        return res.status(400).json({
          error: `Unidade inválida. Valores permitidos: ${VALID_UNITS.join(', ')}.`,
        });
      }
      data.unit = unit;
    }

    if (minQuantity !== undefined) {
      const mq = parseFloat(minQuantity);
      if (Number.isNaN(mq) || mq < 0) {
        return res.status(400).json({ error: 'Quantidade mínima deve ser um número não negativo.' });
      }
      data.minQuantity = mq;
    }

    let stock = await prisma.stock.findUnique({ where: { ingredientId } });

    if (!stock) {
      // Cria estoque se ainda não existir para este ingrediente
      stock = await prisma.stock.create({
        data: { ingredientId, ...data },
      });
    } else {
      stock = await prisma.stock.update({ where: { ingredientId }, data });
    }

    return res.json(stock);
  } catch (error) {
    console.error('[stockController.update]', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar estoque.' });
  }
}

/**
 * Lista ingredientes com estoque abaixo do mínimo (alerta).
 * Requer autenticação (funcionário).
 */
async function lowStock(req, res) {
  try {
    // Nota: Prisma/SQLite não suporta comparação de campos (quantity < minQuantity)
    // diretamente no where. Buscamos todos e filtramos em memória.
    const low = await prisma.stock.findMany({
      include: { ingredient: true },
    });

    // Prisma não suporta comparação de campos diretamente no where de forma simples;
    // filtramos em memória para manter compatibilidade com SQLite.
    const alerta = low.filter((s) => s.quantity < s.minQuantity);

    return res.json(alerta);
  } catch (error) {
    console.error('[stockController.lowStock]', error);
    return res.status(500).json({ error: 'Erro interno ao consultar estoque baixo.' });
  }
}

module.exports = { list, getByIngredient, update, lowStock };
