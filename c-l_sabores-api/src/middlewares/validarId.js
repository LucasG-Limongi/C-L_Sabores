/**
 * Middleware de validação de ID na URL.
 *
 * Protege as rotas GET /:id, PUT /:id, PATCH /:id e DELETE /:id contra
 * parâmetros que não sejam números inteiros positivos.
 *
 * Aceita o parâmetro `id` (padrão do enunciado) e, para rotas do tema
 * restaurante que usam nomes específicos (ingredientId, dishId, etc.),
 * valida o primeiro parâmetro de ID presente na URL.
 *
 * Tema do grupo: C-L Sabores (restaurante).
 */
const ID_PARAMS = ['id', 'ingredientId', 'dishId', 'clientId', 'orderId', 'itemId', 'employeeId'];

function validarId(req, res, next) {
  const paramName = ID_PARAMS.find((p) => req.params[p] !== undefined);

  if (!paramName) {
    return next(); // rota sem parâmetro de ID: nada a validar
  }

  const id = Number(req.params[paramName]);

  if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID inválido na URL. Utilize um número inteiro positivo."
    });
  }

  next();
}

module.exports = validarId;
