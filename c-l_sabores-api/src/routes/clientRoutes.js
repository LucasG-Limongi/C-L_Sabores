const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const validarId = require('../middlewares/validarId');
const { validarClientes } = require('../middlewares/validarDados');

/**
 * Rotas de Clientes.
 *
 * Leitura restrita a funcionários autenticados:
 *   GET    /clients           - listar (paginado, inclui pedidos)
 *   GET    /clients/:id       - detalhar (inclui pedidos)
 *
 * Escrita restrita a Manager/CEO:
 *   POST   /clients           - cadastrar
 *   PUT    /clients/:id       - atualizar
 *   DELETE /clients/:id       - remover (recusa se houver pedidos vinculados)
 */
router.get('/', authMiddleware, clientController.list);
router.get('/:id', authMiddleware, validarId, clientController.getById);
router.post('/', authMiddleware, requireRole(['Manager', 'CEO']), validarClientes, clientController.create);
router.put('/:id', authMiddleware, requireRole(['Manager', 'CEO']), validarId, validarClientes, clientController.update);
router.delete('/:id', authMiddleware, requireRole(['Manager', 'CEO']), validarId, clientController.remove);

module.exports = router;
