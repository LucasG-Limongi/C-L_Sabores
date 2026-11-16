const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const validarId = require('../middlewares/validarId');
const { validarMenu } = require('../middlewares/validarDados');

/**
 * Rotas do cardápio (Menu).
 *
 * Leitura restrita a funcionários autenticados:
 *   GET    /menu           - listar (paginado)
 *   GET    /menu/:id       - detalhar
 *
 * Escrita restrita ao CEO:
 *   POST   /menu           - cadastrar
 *   PUT    /menu/:id       - atualizar
 *   DELETE /menu/:id       - remover
 *
 * Rota pública para clientes (consulta apenas disponíveis):
 *   GET    /menu/public
 */
router.get('/', authMiddleware, menuController.list);
router.get('/public', menuController.listPublic);
router.get('/:id', authMiddleware, validarId, menuController.getById);
router.post('/', authMiddleware, requireRole(['CEO']), validarMenu, menuController.create);
router.put('/:id', authMiddleware, requireRole(['CEO']), validarId, validarMenu, menuController.update);
router.delete('/:id', authMiddleware, requireRole(['CEO']), validarId, menuController.remove);

module.exports = router;
