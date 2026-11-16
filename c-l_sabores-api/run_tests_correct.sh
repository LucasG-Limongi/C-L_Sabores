#!/bin/bash
cd C:/Users/cg3037193/Desktop/C-L_Sabores/c-l_sabores-api

# Usa sufixo unico para evitar e-mails duplicados no banco existente
SUFIX=$(date +%s)

# Inicia o servidor em background
node src/server.js > /tmp/server_stdout.log 2>&1 &
SRV_PID=$!
sleep 2

# Funcao para extrair token
get_token() {
  echo "$1" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).token)}catch{process.exit(1)}})"
}

# Funcao para extrair id
get_id() {
  echo "$1" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).id)}catch{process.exit(1)}})"
}

OUT=C:/Users/cg3037193/Desktop/C-L_Sabores/responses.txt

{
echo "=============================================="
echo "  TESTES DE ROTAS - VALORES CORRETOS"
echo "  C-L Sabores API"
echo "  Data: $(date)"
echo "=============================================="
echo ""

echo "=============================================="
echo "  1. AUTENTICACAO (authRoutes)"
echo "=============================================="
echo ""

EMAIL_MGR="carlos_${SUFIX}@teste.com"
EMAIL_ATT="maria_${SUFIX}@teste.com"
EMAIL_CEO="ceo_${SUFIX}@teste.com"

echo "--- POST /auth/register (Manager) ---"
REG_MGR=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Carlos Manager\",\"email\":\"${EMAIL_MGR}\",\"senha\":\"123456\",\"role\":\"Manager\"}")
echo "$REG_MGR"
echo ""

echo "--- POST /auth/register (Attendant) ---"
REG_ATT=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Maria Atendente\",\"email\":\"${EMAIL_ATT}\",\"senha\":\"123456\",\"role\":\"Attendant\"}")
echo "$REG_ATT"
echo ""

echo "--- POST /auth/login (Manager) ---"
LOGIN_MGR=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_MGR}\",\"senha\":\"123456\"}")
echo "$LOGIN_MGR"
TOKEN_MGR=$(get_token "$LOGIN_MGR")
echo "TOKEN_MANAGER: $TOKEN_MGR"
echo ""

echo "--- POST /auth/login (Attendant) ---"
LOGIN_ATT=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_ATT}\",\"senha\":\"123456\"}")
echo "$LOGIN_ATT"
TOKEN_ATT=$(get_token "$LOGIN_ATT")
echo "TOKEN_ATTENDANT: $TOKEN_ATT"
echo ""

echo "--- POST /auth/login (senha errada - deve falhar) ---"
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_MGR}\",\"senha\":\"senha_errada\"}"
echo ""

echo "--- POST /auth/register (email duplicado - deve falhar) ---"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Dup\",\"email\":\"${EMAIL_MGR}\",\"senha\":\"123456\",\"role\":\"Manager\"}"
echo ""

echo ""
echo "=============================================="
echo "  2. MENU (menuRoutes) - escrita apenas CEO"
echo "=============================================="
echo ""

echo "--- POST /menu (como Manager - deve falhar 403) ---"
curl -s -X POST http://localhost:3000/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"name":"Teste","description":"x","price":10}'
echo ""

echo "--- POST /menu (sem token - deve falhar 401) ---"
curl -s -X POST http://localhost:3000/menu \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","description":"x","price":10}'
echo ""

echo "--- POST /auth/register (CEO) ---"
REG_CEO=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"CEO Teste\",\"email\":\"${EMAIL_CEO}\",\"senha\":\"123456\",\"role\":\"CEO\"}")
echo "$REG_CEO"
echo "--- POST /auth/login (CEO) ---"
LOGIN_CEO=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_CEO}\",\"senha\":\"123456\"}")
echo "$LOGIN_CEO"
TOKEN_CEO=$(get_token "$LOGIN_CEO")
echo "TOKEN_CEO: $TOKEN_CEO"
echo ""

echo "--- POST /menu (como CEO) ---"
MENU_CREATE=$(curl -s -X POST http://localhost:3000/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_CEO" \
  -d '{"name":"Feijoada","description":"Prato tradicional brasileiro","price":45,"available":true}')
echo "$MENU_CREATE"
DISH_ID=$(get_id "$MENU_CREATE")
echo "DISH_ID: $DISH_ID"
echo ""

echo "--- GET /menu (listar) ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/menu
echo ""

echo "--- GET /menu/public (sem autenticacao) ---"
curl -s http://localhost:3000/menu/public
echo ""

echo "--- GET /menu/:id ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/menu/$DISH_ID
echo ""

echo "--- PUT /menu/:id (como CEO) ---"
curl -s -X PUT http://localhost:3000/menu/$DISH_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_CEO" \
  -d '{"name":"Feijoada Completa","price":50}'
echo ""

echo ""
echo "=============================================="
echo "  3. INGREDIENTES (ingredientRoutes)"
echo "=============================================="
echo ""

echo "--- POST /ingredients (como Manager) ---"
ING_CREATE=$(curl -s -X POST http://localhost:3000/ingredients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"name":"Feijao preto"}')
echo "$ING_CREATE"
ING_ID=$(get_id "$ING_CREATE")
echo "ING_ID: $ING_ID"
echo ""

echo "--- GET /ingredients (listar) ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/ingredients
echo ""

echo "--- GET /ingredients/:id ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/ingredients/$ING_ID
echo ""

echo "--- PUT /ingredients/:id (como Manager) ---"
curl -s -X PUT http://localhost:3000/ingredients/$ING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"name":"Feijao preto tipo 1"}'
echo ""

echo ""
echo "=============================================="
echo "  4. STOCK (stockRoutes)"
echo "=============================================="
echo ""

echo "--- PUT /stock/:ingredientId (como Manager) ---"
curl -s -X PUT http://localhost:3000/stock/$ING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"quantity":10,"unit":"kg","minQuantity":2}'
echo ""

echo "--- GET /stock/:ingredientId ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/stock/$ING_ID
echo ""

echo "--- GET /stock (listar) ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/stock
echo ""

echo "--- GET /stock/low (alerta estoque baixo) ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/stock/low
echo ""

echo ""
echo "=============================================="
echo "  5. RECEITAS (recipeRoutes)"
echo "=============================================="
echo ""

echo "--- POST /recipes (como Manager) ---"
REC_CREATE=$(curl -s -X POST http://localhost:3000/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d "{\"ingredientId\":$ING_ID,\"dishId\":$DISH_ID,\"quantity\":0.5}")
echo "$REC_CREATE"
REC_ID=$(get_id "$REC_CREATE")
echo "REC_ID: $REC_ID"
echo ""

echo "--- GET /recipes (listar) ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/recipes
echo ""

echo "--- GET /recipes/:id ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/recipes/$REC_ID
echo ""

echo "--- GET /recipes/dish/:dishId ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/recipes/dish/$DISH_ID
echo ""

echo "--- PUT /recipes/:id (como Manager) ---"
curl -s -X PUT http://localhost:3000/recipes/$REC_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"quantity":0.7}'
echo ""

echo ""
echo "=============================================="
echo "  6. CLIENTES (clientRoutes)"
echo "=============================================="
echo ""

echo "--- POST /clients (como Manager) ---"
CLIENT_CREATE=$(curl -s -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d "{\"name\":\"Joao Cliente\",\"email\":\"cliente_${SUFIX}@teste.com\",\"tel\":\"11999999999\"}")
echo "$CLIENT_CREATE"
CLIENT_ID=$(get_id "$CLIENT_CREATE")
echo "CLIENT_ID: $CLIENT_ID"
echo ""

echo "--- GET /clients (listar) ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/clients
echo ""

echo "--- GET /clients/:id ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/clients/$CLIENT_ID
echo ""

echo "--- PUT /clients/:id (como Manager) ---"
curl -s -X PUT http://localhost:3000/clients/$CLIENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"name":"Joao da Silva","tel":"11888888888"}'
echo ""

echo ""
echo "=============================================="
echo "  7. PEDIDOS (orderRoutes)"
echo "=============================================="
echo ""

echo "--- POST /orders (como Atendente) ---"
ORDER_CREATE=$(curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ATT" \
  -d "{\"clientId\":$CLIENT_ID,\"items\":[{\"itemId\":$DISH_ID,\"quantity\":2}]}")
echo "$ORDER_CREATE"
ORDER_ID=$(get_id "$ORDER_CREATE")
echo "ORDER_ID: $ORDER_ID"
echo ""

echo "--- GET /orders (listar) ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/orders
echo ""

echo "--- GET /orders/:id ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/orders/$ORDER_ID
echo ""

echo "--- PATCH /orders/:id/status (como Manager) ---"
curl -s -X PATCH http://localhost:3000/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"status":"Preparing"}'
echo ""

echo "--- POST /orders (segundo pedido para cancelar) ---"
ORDER_CREATE2=$(curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ATT" \
  -d "{\"clientId\":$CLIENT_ID,\"items\":[{\"itemId\":$DISH_ID,\"quantity\":1}]}")
ORDER_ID2=$(get_id "$ORDER_CREATE2")
echo "Criado pedido $ORDER_ID2 para cancelar"
echo "--- PATCH /orders/:id/cancel (como Manager) ---"
curl -s -X PATCH http://localhost:3000/orders/$ORDER_ID2/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR"
echo ""

echo ""
echo "=============================================="
echo "  8. TESTES DE ERRO / VALIDACAO"
echo "=============================================="
echo ""

echo "--- GET /menu/99999 (inexistente - 404) ---"
curl -s -H "Authorization: Bearer $TOKEN_ATT" http://localhost:3000/menu/99999
echo ""

echo "--- POST /orders (cliente inexistente - 404) ---"
curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ATT" \
  -d '{"clientId":99999,"items":[{"itemId":1,"quantity":1}]}'
echo ""

echo "--- POST /orders (items vazios - 400) ---"
curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ATT" \
  -d '{"clientId":1,"items":[]}'
echo ""

echo "--- PATCH /orders/:id/status (status invalido - 400) ---"
curl -s -X PATCH http://localhost:3000/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"status":"Invalido"}'
echo ""

echo ""
echo "=============================================="
echo "  9. ROTA DE STATUS"
echo "=============================================="
echo ""

echo "--- GET /status ---"
curl -s http://localhost:3000/status
echo ""

echo ""
echo "=============================================="
echo "  FIM DOS TESTES"
echo "=============================================="

} > "$OUT" 2>&1

kill $SRV_PID 2>/dev/null
wait $SRV_PID 2>/dev/null
echo "Testes concluidos. Resultado salvo em $OUT"
