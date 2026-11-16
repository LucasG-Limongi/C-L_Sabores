/**
 * Middleware de validação e sanitização de dados.
 *
 * Valida os campos obrigatórios antes de salvar no banco via Prisma e
 * sanitiza (remove espaços extras nas pontas) os campos de texto.
 *
 * Adaptado ao tema do grupo: C-L Sabores (restaurante) — entidades:
 * clientes, pratos do cardápio, ingredientes, estoque, receitas e pedidos.
 */

/* ---------- Clientes ---------- */
function validarClientes(req, res, next) {
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({
      erro: "O nome do cliente é obrigatório e deve ter no mínimo 3 caracteres."
    });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      erro: "O email é obrigatório e deve ser um endereço de email válido."
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

/* ---------- Cardápio (Menu) ---------- */
function validarMenu(req, res, next) {
  const { name, description, price } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({
      erro: "O nome do prato é obrigatório e deve ter no mínimo 3 caracteres."
    });
  }

  if (!description || typeof description !== 'string' || description.trim() === "") {
    return res.status(400).json({
      erro: "A descrição do prato não pode ficar em branco."
    });
  }

  if (price === undefined || price === null || Number.isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({
      erro: "O preço é obrigatório e deve ser um número inteiro não negativo."
    });
  }

  req.body.name = name.trim();
  req.body.description = description.trim();
  req.body.price = Number(price);

  next();
}

/* ---------- Ingredientes ---------- */
function validarIngredientes(req, res, next) {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      erro: "O nome do ingrediente é obrigatório e deve ter no mínimo 2 caracteres."
    });
  }

  req.body.name = name.trim();

  next();
}

/* ---------- Estoque ---------- */
function validarEstoque(req, res, next) {
  const { quantity, unit, minQuantity } = req.body;
  const validUnits = ['kg', 'g', 'L', 'mL'];

  if (quantity !== undefined && (isNaN(Number(quantity)) || Number(quantity) < 0)) {
    return res.status(400).json({
      erro: "A quantidade do estoque deve ser um número não negativo."
    });
  }

  if (unit !== undefined && !validUnits.includes(unit)) {
    return res.status(400).json({
      erro: `Unidade inválida. Valores permitidos: ${validUnits.join(', ')}.`
    });
  }

  if (minQuantity !== undefined && (isNaN(Number(minQuantity)) || Number(minQuantity) < 0)) {
    return res.status(400).json({
      erro: "A quantidade mínima deve ser um número não negativo."
    });
  }

  if (quantity !== undefined) req.body.quantity = Number(quantity);
  if (minQuantity !== undefined) req.body.minQuantity = Number(minQuantity);

  next();
}

/* ---------- Receitas ---------- */
function validarReceitas(req, res, next) {
  const { ingredientId, dishId, quantity } = req.body;

  if (!ingredientId || isNaN(Number(ingredientId)) || Number(ingredientId) <= 0) {
    return res.status(400).json({
      erro: "O 'ingredientId' é obrigatório e deve ser um número válido."
    });
  }

  if (!dishId || isNaN(Number(dishId)) || Number(dishId) <= 0) {
    return res.status(400).json({
      erro: "O 'dishId' é obrigatório e deve ser um número válido."
    });
  }

  if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) <= 0) {
    return res.status(400).json({
      erro: "A quantidade é obrigatória e deve ser um número positivo."
    });
  }

  req.body.ingredientId = Number(ingredientId);
  req.body.dishId = Number(dishId);
  req.body.quantity = Number(quantity);

  next();
}

/* ---------- Pedidos ---------- */
function validarPedidos(req, res, next) {
  const { clientId, items } = req.body;

  if (!clientId || isNaN(Number(clientId)) || Number(clientId) <= 0) {
    return res.status(400).json({
      erro: "O 'clientId' é obrigatório e deve ser um número válido."
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      erro: "Os itens do pedido são obrigatórios e devem conter pelo menos um item."
    });
  }

  for (const item of items) {
    if (!item.itemId || isNaN(Number(item.itemId)) || Number(item.itemId) <= 0) {
      return res.status(400).json({
        erro: "Cada item deve conter um 'itemId' válido."
      });
    }
    if (item.quantity !== undefined && (isNaN(Number(item.quantity)) || Number(item.quantity) < 1)) {
      return res.status(400).json({
        erro: "A quantidade de cada item deve ser um número positivo."
      });
    }
  }

  req.body.clientId = Number(clientId);

  next();
}

/* ---------- Autenticação ---------- */
function validarLogin(req, res, next) {
  const { email, senha } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      erro: "O email é obrigatório e deve ser válido."
    });
  }

  if (!senha || typeof senha !== 'string' || senha.length < 4) {
    return res.status(400).json({
      erro: "A senha é obrigatória e deve ter no mínimo 4 caracteres."
    });
  }

  req.body.email = email.trim().toLowerCase();

  next();
}

function validarRegistro(req, res, next) {
  const { name, email, senha } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return res.status(400).json({
      erro: "O nome do funcionário é obrigatório e deve ter no mínimo 3 caracteres."
    });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      erro: "O email é obrigatório e deve ser válido."
    });
  }

  if (!senha || typeof senha !== 'string' || senha.length < 4) {
    return res.status(400).json({
      erro: "A senha é obrigatória e deve ter no mínimo 4 caracteres."
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

module.exports = {
  validarClientes,
  validarMenu,
  validarIngredientes,
  validarEstoque,
  validarReceitas,
  validarPedidos,
  validarLogin,
  validarRegistro
};
