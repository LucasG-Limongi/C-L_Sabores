const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const validarId = require('../middlewares/validarId');
const { validarPedidos } = require('../middlewares/validarDados');

/**
 * Rotas de Pedidos.
 *
 * Leitura restrita a funcionários autenticados:
 *   GET    /orders                    - listar (paginado, inclui cliente e itens)
 *   GET    /orders/:id                - detalhar um pedido
 *
 * Criação restrita a funcionários autenticados:
 *   POST   /orders                    - cadastrar pedido (vincula cliente e itens)
 *
 * Alteração de status / cancelamento restrito a Manager/CEO:
 *   PATCH  /orders/:id/status         - atualizar status
 *   PATCH  /orders/:id/cancel         - cancelar pedido
 *
 * Exclusão definitiva restrita a Manager/CEO:
 *   DELETE /orders/:id                - remover pedido
 */
router.get('/', authMiddleware, orderController.list);
router.get('/:id', authMiddleware, validarId, orderController.getById);
router.post('/', authMiddleware, validarPedidos, orderController.create);
router.patch('/:id/status', authMiddleware, requireRole(['Manager', 'CEO']), validarId, orderController.updateStatus);
router.patch('/:id/cancel', authMiddleware, requireRole(['Manager', 'CEO']), validarId, orderController.cancel);
router.delete('/:id', authMiddleware, requireRole(['Manager', 'CEO']), validarId, orderController.remove);

module.exports = router;
