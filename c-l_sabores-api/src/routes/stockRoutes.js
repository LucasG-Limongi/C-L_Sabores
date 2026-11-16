const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const validarId = require('../middlewares/validarId');
const { validarEstoque } = require('../middlewares/validarDados');

/**
 * Rotas de Estoque.
 *
 * Leitura restrita a funcionários autenticados:
 *   GET    /stock                       - listar todos (paginado, inclui ingrediente)
 *   GET    /stock/:ingredientId         - consultar estoque de um ingrediente
 *   GET    /stock/low                   - alerta de estoque abaixo do mínimo
 *
 * Escrita restrita a Manager/CEO:
 *   PUT    /stock/:ingredientId         - atualizar/criar estoque
 */
router.get('/', authMiddleware, stockController.list);
router.get('/low', authMiddleware, stockController.lowStock);
router.get('/:ingredientId', authMiddleware, validarId, stockController.getByIngredient);
router.put('/:ingredientId', authMiddleware, requireRole(['Manager', 'CEO']), validarId, validarEstoque, stockController.update);

module.exports = router;
