#!/bin/bash
cd C:/Users/cg3037193/Desktop/C-L_Sabores/c-l_sabores-api

SUFIX=$(date +%s)

# Inicia o servidor em background
node src/server.js > /tmp/server_stdout_delete.log 2>&1 &
SRV_PID=$!
sleep 2

get_token() {
  echo "$1" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).token)}catch{process.exit(1)}})"
}

get_id() {
  echo "$1" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).id)}catch{process.exit(1)}})"
}

OUT=C:/Users/cg3037193/Desktop/C-L_Sabores/responses.txt

EMAIL_MGR="delmgr_${SUFIX}@teste.com"
EMAIL_CEO="delceo_${SUFIX}@teste.com"

{
echo ""
echo "=============================================="
echo "  TESTES DE METODOS DELETE"
echo "  C-L Sabores API"
echo "  Data: $(date)"
echo "=============================================="
echo ""

echo "--- Cadastro e login Manager ---"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Del Manager\",\"email\":\"${EMAIL_MGR}\",\"senha\":\"123456\",\"role\":\"Manager\"}" > /dev/null
LOGIN_MGR=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_MGR}\",\"senha\":\"123456\"}")
TOKEN_MGR=$(get_token "$LOGIN_MGR")
echo "TOKEN_MANAGER: $TOKEN_MGR"

echo "--- Cadastro e login CEO ---"
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Del CEO\",\"email\":\"${EMAIL_CEO}\",\"senha\":\"123456\",\"role\":\"CEO\"}" > /dev/null
LOGIN_CEO=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_CEO}\",\"senha\":\"123456\"}")
TOKEN_CEO=$(get_token "$LOGIN_CEO")
echo "TOKEN_CEO: $TOKEN_CEO"
echo ""

echo ""
echo "=============================================="
echo "  DELETE /menu/:id (CEO)"
echo "=============================================="
echo ""

echo "--- Criar prato para deletar ---"
MENU_CREATE=$(curl -s -X POST http://localhost:3000/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_CEO" \
  -d '{"name":"Prato Para Deletar","description":"x","price":10,"available":true}')
echo "$MENU_CREATE"
MENU_ID=$(get_id "$MENU_CREATE")
echo "MENU_ID: $MENU_ID"
echo ""

echo "--- DELETE /menu/$MENU_ID (como CEO) ---"
curl -s -X DELETE http://localhost:3000/menu/$MENU_ID \
  -H "Authorization: Bearer $TOKEN_CEO" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo "--- DELETE /menu/99999 (inexistente - 404) ---"
curl -s -X DELETE http://localhost:3000/menu/99999 \
  -H "Authorization: Bearer $TOKEN_CEO" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo "--- DELETE /menu/abc (ID invalido - 400) ---"
curl -s -X DELETE http://localhost:3000/menu/abc \
  -H "Authorization: Bearer $TOKEN_CEO" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo ""
echo "=============================================="
echo "  DELETE /ingredients/:id (Manager/CEO)"
echo "=============================================="
echo ""

echo "--- Criar ingrediente para deletar ---"
ING_CREATE=$(curl -s -X POST http://localhost:3000/ingredients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"name":"Ingrediente Para Deletar"}')
echo "$ING_CREATE"
ING_ID=$(get_id "$ING_CREATE")
echo "ING_ID: $ING_ID"
echo ""

echo "--- DELETE /ingredients/$ING_ID (como Manager) ---"
curl -s -X DELETE http://localhost:3000/ingredients/$ING_ID \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo "--- DELETE /ingredients/99999 (inexistente - 404) ---"
curl -s -X DELETE http://localhost:3000/ingredients/99999 \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo ""
echo "=============================================="
echo "  DELETE /recipes/:id (Manager/CEO)"
echo "=============================================="
echo ""

echo "--- Criar prato e ingrediente para receita ---"
MENU_REC=$(curl -s -X POST http://localhost:3000/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_CEO" \
  -d '{"name":"Prato Receita","description":"x","price":20,"available":true}')
echo "$MENU_REC"
DISH_REC_ID=$(get_id "$MENU_REC")

ING_REC=$(curl -s -X POST http://localhost:3000/ingredients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"name":"Ingrediente Receita"}')
echo "$ING_REC"
ING_REC_ID=$(get_id "$ING_REC")

echo "--- Criar receita para deletar ---"
REC_CREATE=$(curl -s -X POST http://localhost:3000/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d "{\"ingredientId\":$ING_REC_ID,\"dishId\":$DISH_REC_ID,\"quantity\":0.3}")
echo "$REC_CREATE"
REC_ID=$(get_id "$REC_CREATE")
echo "REC_ID: $REC_ID"
echo ""

echo "--- DELETE /recipes/$REC_ID (como Manager) ---"
curl -s -X DELETE http://localhost:3000/recipes/$REC_ID \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo "--- DELETE /recipes/99999 (inexistente - 404) ---"
curl -s -X DELETE http://localhost:3000/recipes/99999 \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo ""
echo "=============================================="
echo "  DELETE /clients/:id (Manager/CEO)"
echo "=============================================="
echo ""

echo "--- Criar cliente para deletar ---"
CLIENT_CREATE=$(curl -s -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d "{\"name\":\"Cliente Para Deletar\",\"email\":\"delcliente_${SUFIX}@teste.com\",\"tel\":\"11999999999\"}")
echo "$CLIENT_CREATE"
CLIENT_ID=$(get_id "$CLIENT_CREATE")
echo "CLIENT_ID: $CLIENT_ID"
echo ""

echo "--- DELETE /clients/$CLIENT_ID (como Manager) ---"
curl -s -X DELETE http://localhost:3000/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo "--- DELETE /clients/99999 (inexistente - 404) ---"
curl -s -X DELETE http://localhost:3000/clients/99999 \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo ""
echo "=============================================="
echo "  DELETE /orders/:id (Manager/CEO)"
echo "=============================================="
echo ""

echo "--- Criar cliente e pedido para deletar ---"
CLIENT_ORDER=$(curl -s -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d "{\"name\":\"Cliente Order\",\"email\":\"delorder_${SUFIX}@teste.com\",\"tel\":\"11999999998\"}")
echo "$CLIENT_ORDER"
CLIENT_ORDER_ID=$(get_id "$CLIENT_ORDER")

echo "--- POST /orders (como Atendente) ---"
LOGIN_ATT=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"maria_1794222809@teste.com\",\"senha\":\"123456\"}")
TOKEN_ATT=$(get_token "$LOGIN_ATT")

ORDER_CREATE=$(curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ATT" \
  -d "{\"clientId\":$CLIENT_ORDER_ID,\"items\":[{\"itemId\":1,\"quantity\":1}]}")
echo "$ORDER_CREATE"
ORDER_ID=$(get_id "$ORDER_CREATE")
echo "ORDER_ID: $ORDER_ID"
echo ""

echo "--- DELETE /orders/$ORDER_ID (como Manager) ---"
curl -s -X DELETE http://localhost:3000/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo "--- DELETE /orders/99999 (inexistente - 404) ---"
curl -s -X DELETE http://localhost:3000/orders/99999 \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo ""
echo "=============================================="
echo "  DELETE /menu/:id com receitas vinculadas (400)"
echo "=============================================="
echo ""

echo "--- Criar prato com receita vinculada ---"
MENU_LINK=$(curl -s -X POST http://localhost:3000/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_CEO" \
  -d '{"name":"Prato Com Receita","description":"x","price":30,"available":true}')
echo "$MENU_LINK"
DISH_LINK_ID=$(get_id "$MENU_LINK")

ING_LINK=$(curl -s -X POST http://localhost:3000/ingredients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"name":"Ingrediente Link"}')
echo "$ING_LINK"
ING_LINK_ID=$(get_id "$ING_LINK")

curl -s -X POST http://localhost:3000/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d "{\"ingredientId\":$ING_LINK_ID,\"dishId\":$DISH_LINK_ID,\"quantity\":0.2}" > /dev/null

echo "--- DELETE /menu/$DISH_LINK_ID (com receita vinculada - 400) ---"
curl -s -X DELETE http://localhost:3000/menu/$DISH_LINK_ID \
  -H "Authorization: Bearer $TOKEN_CEO" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo ""
echo "=============================================="
echo "  DELETE /ingredients/:id com estoque vinculado (400)"
echo "=============================================="
echo ""

echo "--- Criar ingrediente com estoque ---"
ING_STOCK=$(curl -s -X POST http://localhost:3000/ingredients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"name":"Ingrediente Com Estoque"}')
echo "$ING_STOCK"
ING_STOCK_ID=$(get_id "$ING_STOCK")

curl -s -X PUT http://localhost:3000/stock/$ING_STOCK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_MGR" \
  -d '{"quantity":5,"unit":"kg","minQuantity":1}' > /dev/null

echo "--- DELETE /ingredients/$ING_STOCK_ID (com estoque vinculado - 400) ---"
curl -s -X DELETE http://localhost:3000/ingredients/$ING_STOCK_ID \
  -H "Authorization: Bearer $TOKEN_MGR" -w "\nHTTP_STATUS: %{http_code}\n"
echo ""

echo ""
echo "=============================================="
echo "  FIM DOS TESTES DELETE"
echo "=============================================="

} >> "$OUT" 2>&1

kill $SRV_PID 2>/dev/null
wait $SRV_PID 2>/dev/null
echo "Testes DELETE concluidos. Resultado anexado em $OUT"
