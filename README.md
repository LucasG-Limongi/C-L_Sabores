# C-L Sabores API

API de gestão para um restaurante, focada no controle de estoque, manutenção do cardápio e leitura/cadastro de pedidos. Permite cadastrar clientes, funcionários, pratos do cardápio, ingredientes, estoque, receitas (vinculação ingrediente → prato) e pedidos com itens, tudo com persistência via Prisma ORM + SQLite.

## Integrantes do Grupo
- Camilla Marina
- Lucas Gabriel Limongi Ferreira dos Santos

## Tecnologias Utilizadas
- Node.js + Express
- Prisma ORM + SQLite
- Postman (Testes de API)

## Como Rodar o Projeto
1. Clone o repositório:
   `git clone <URL_DO_REPOSITORIO>`
2. Entre na pasta da api:
   `cd c-l_sabores-api`
3. Instale as dependências:
   `npm install` ou `npm i`
4. Configure as variáveis de ambiente (copie `.env.example` para `.env` e defina `JWT_SECRET`):
   `DATABASE_URL="file:./dev.db"`
   `JWT_SECRET="sua_chave_secreta_forte"`
5. Crie as tabelas do banco de dados:
   `npx prisma migrate dev`
6. Inicie o servidor:
   `node src/server.js`

O servidor ficará disponível em `http://localhost:3000`.

## Rotas Principais da API
Todas as rotas de escrita exigem autenticação (token JWT) e passam pelos middlewares de validação (`validarDados`), validação de `:id` (`validarId`) e auditoria (`logger`).

- `GET    /status`                        - status da API (público)
- `POST   /auth/login`                    - autentica funcionário (retorna token)
- `POST   /auth/register`                 - cadastra funcionário

### Cardápio (Menu)
- `GET    /menu`                          - lista pratos (paginado)
- `GET    /menu/:id`                      - detalha um prato
- `GET    /menu/public`                   - lista pratos disponíveis (público)
- `POST   /menu`                          - cadastra prato (CEO)
- `PUT    /menu/:id`                      - atualiza prato (CEO)
- `DELETE /menu/:id`                      - remove prato (CEO)

### Clientes
- `GET    /clients`                       - lista clientes (inclui pedidos)
- `GET    /clients/:id`                   - detalha cliente
- `POST   /clients`                       - cadastra cliente (Manager/CEO)
- `PUT    /clients/:id`                   - atualiza cliente (Manager/CEO)
- `DELETE /clients/:id`                   - remove cliente (Manager/CEO)

### Ingredientes
- `GET    /ingredients`                   - lista ingredientes (inclui estoque)
- `GET    /ingredients/:id`               - detalha ingrediente
- `POST   /ingredients`                   - cadastra ingrediente (Manager/CEO)
- `PUT    /ingredients/:id`               - atualiza ingrediente (Manager/CEO)
- `DELETE /ingredients/:id`               - remove ingrediente (Manager/CEO)

### Estoque
- `GET    /stock`                         - lista estoque
- `GET    /stock/:ingredientId`           - estoque de um ingrediente
- `GET    /stock/low`                     - alerta de estoque abaixo do mínimo
- `PUT    /stock/:ingredientId`           - atualiza/cria estoque (Manager/CEO)

### Receitas
- `GET    /recipes`                       - lista receitas (ingrediente → prato)
- `GET    /recipes/:id`                   - detalha receita
- `GET    /recipes/dish/:dishId`          - receitas de um prato
- `POST   /recipes`                       - cadastra receita (Manager/CEO)
- `PUT    /recipes/:id`                   - atualiza receita (Manager/CEO)
- `DELETE /recipes/:id`                   - remove receita (Manager/CEO)

### Pedidos
- `GET    /orders`                        - lista pedidos (cliente e itens)
- `GET    /orders/:id`                    - detalha pedido
- `POST   /orders`                        - cadastra pedido
- `PATCH  /orders/:id/status`             - atualiza status (Manager/CEO)
- `PATCH  /orders/:id/cancel`             - cancela pedido (Manager/CEO)
- `DELETE /orders/:id`                    - remove pedido (Manager/CEO)

## Middlewares Implementados
- `src/middlewares/logger.js` - exibe todas as requisições no terminal (auditoria).
- `src/middlewares/validarId.js` - valida que o `:id` da URL seja um inteiro positivo.
- `src/middlewares/validarDados.js` - valida e sanifica os campos obrigatórios antes de salvar via Prisma.

## Testes (Postman)
A collection exportada está na raiz do projeto em `collection-postman.json`, contendo requisições de sucesso (POST, GET, PUT, DELETE) e testes de erro (dados inválidos e ID inválido) que retornam `400 Bad Request`.
