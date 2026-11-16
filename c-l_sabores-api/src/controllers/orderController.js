const prisma = require('../prisma');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const VALID_STATUSES = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

/**
 * Lista pedidos (paginado). Requer autenticação (funcionário).
 */
async function list(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1);
    const skip = (page - 1) * limit;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: true, items: { include: { item: true } } },
      }),
      prisma.order.count(),
    ]);

    return res.json({
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[orderController.list]', error);
    return res.status(500).json({ error: 'Erro interno ao listar pedidos.' });
  }
}

/**
 * Detalha um pedido pelo ID. Requer autenticação.
 */
async function getById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { client: true, items: { include: { item: true } } },
    });
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    return res.json(order);
  } catch (error) {
    console.error('[orderController.getById]', error);
    return res.status(500).json({ error: 'Erro interno ao buscar pedido.' });
  }
}

/**
 * Cadastra um novo pedido. Requer autenticação (funcionário).
 * Corpo: { clientId, items: [{ itemId, quantity, unitPrice? }] }
 */
async function create(req, res) {
  try {
    const { clientId, items } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId é obrigatório.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Items é obrigatório e deve conter pelo menos um item.',
      });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Valida e normaliza cada item, verificando existência no cardápio
    const normalizedItems = [];
    for (const item of items) {
      if (!item.itemId) {
        return res.status(400).json({ error: 'itemId é obrigatório em cada item.' });
      }

      const quantity = parseInt(item.quantity, 10) || 1;
      if (Number.isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Quantidade deve ser um número positivo.' });
      }

      const menuItem = await prisma.menu.findUnique({ where: { id: item.itemId } });
      if (!menuItem) {
        return res.status(404).json({ error: `Item do cardápio (id ${item.itemId}) não encontrado.` });
      }

      const unitPrice = item.unitPrice !== undefined
        ? parseInt(item.unitPrice, 10)
        : menuItem.price;

      if (Number.isNaN(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ error: 'unitPrice deve ser um número inteiro não negativo.' });
      }

      normalizedItems.push({
        itemId: item.itemId,
        quantity,
        unitPrice,
      });
    }

    const order = await prisma.order.create({
      data: {
        clientId,
        status: 'Pending',
        items: {
          create: normalizedItems,
        },
      },
      include: { client: true, items: { include: { item: true } } },
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('[orderController.create]', error);
    return res.status(500).json({ error: 'Erro interno ao criar pedido.' });
  }
}

/**
 * Atualiza o status de um pedido. Restrito a Manager/CEO.
 */
async function updateStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}.`,
      });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { client: true, items: { include: { item: true } } },
    });

    return res.json(updated);
  } catch (error) {
    console.error('[orderController.updateStatus]', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar status do pedido.' });
  }
}

/**
 * Cancela um pedido (altera status para Cancelled). Restrito a Manager/CEO.
 */
async function cancel(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (existing.status === 'Cancelled') {
      return res.status(400).json({ error: 'Pedido já está cancelado.' });
    }

    if (existing.status === 'Delivered') {
      return res.status(400).json({ error: 'Não é possível cancelar um pedido já entregue.' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'Cancelled' },
      include: { client: true, items: { include: { item: true } } },
    });

    return res.json(updated);
  } catch (error) {
    console.error('[orderController.cancel]', error);
    return res.status(500).json({ error: 'Erro interno ao cancelar pedido.' });
  }
}

/**
 * Remove um pedido definitivamente. Restrito a Manager/CEO.
 */
async function remove(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    await prisma.order.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('[orderController.remove]', error);
    return res.status(500).json({ error: 'Erro interno ao excluir pedido.' });
  }
}

module.exports = { list, getById, create, updateStatus, cancel, remove };
