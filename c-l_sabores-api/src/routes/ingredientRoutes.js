const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const validarId = require('../middlewares/validarId');
const { validarIngredientes } = require('../middlewares/validarDados');

/**
 * Rotas de Ingredientes.
 *
 * Leitura restrita a funcionários autenticados:
 *   GET    /ingredients           - listar (paginado, inclui estoque)
 *   GET    /ingredients/:id       - detalhar (inclui estoque)
 *
 * Escrita restrita a Manager/CEO:
 *   POST   /ingredients           - cadastrar
 *   PUT    /ingredients/:id       - atualizar
 *   DELETE /ingredients/:id       - remover (recusa se houver estoque/receitas)
 */
router.get('/', authMiddleware, ingredientController.list);
router.get('/:id', authMiddleware, validarId, ingredientController.getById);
router.post('/', authMiddleware, requireRole(['Manager', 'CEO']), validarIngredientes, ingredientController.create);
router.put('/:id', authMiddleware, requireRole(['Manager', 'CEO']), validarId, validarIngredientes, ingredientController.update);
router.delete('/:id', authMiddleware, requireRole(['Manager', 'CEO']), validarId, ingredientController.remove);

module.exports = router;
