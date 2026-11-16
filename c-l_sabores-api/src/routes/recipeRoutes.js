const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const validarId = require('../middlewares/validarId');
const { validarReceitas } = require('../middlewares/validarDados');

/**
 * Rotas de Receitas.
 *
 * Leitura restrita a funcionários autenticados:
 *   GET    /recipes                       - listar todas (paginado, inclui ingrediente e prato)
 *   GET    /recipes/:id                   - detalhar uma receita
 *   GET    /recipes/dish/:dishId          - listar receitas de um prato específico
 *
 * Escrita restrita a Manager/CEO:
 *   POST   /recipes                       - cadastrar (vincula ingrediente a prato)
 *   PUT    /recipes/:id                   - atualizar quantidade
 *   DELETE /recipes/:id                   - remover vinculo
 */
router.get('/', authMiddleware, recipeController.list);
router.get('/:id', authMiddleware, validarId, recipeController.getById);
router.get('/dish/:dishId', authMiddleware, validarId, recipeController.getByDish);
router.post('/', authMiddleware, requireRole(['Manager', 'CEO']), validarReceitas, recipeController.create);
router.put('/:id', authMiddleware, requireRole(['Manager', 'CEO']), validarId, validarReceitas, recipeController.update);
router.delete('/:id', authMiddleware, requireRole(['Manager', 'CEO']), validarId, recipeController.remove);

module.exports = router;
