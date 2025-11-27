#!/bin/bash

# Script para testar a rota DELETE de posts
# Uso: ./test-delete.sh <token> <post-id>

if [ "$#" -lt 2 ]; then
  echo "❌ Uso: $0 <token> <post-id>"
  echo ""
  echo "Exemplo:"
  echo "  $0 'seu_token_aqui' '123'"
  exit 1
fi

TOKEN="$1"
POST_ID="$2"
API_URL="http://localhost:3000/api"

echo "🧪 Testando rota DELETE para deletar post"
echo "=========================================="
echo ""
echo "Token: ${TOKEN:0:20}..."
echo "Post ID: $POST_ID"
echo "URL: $API_URL/posts/$POST_ID"
echo ""

# Fazer requisição DELETE
echo "📤 Enviando requisição DELETE..."
RESPONSE=$(curl -s -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$API_URL/posts/$POST_ID" \
  -w "\n%{http_code}")

# Extrair status HTTP (última linha)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
echo "📥 Resposta do servidor:"
echo "Status HTTP: $HTTP_CODE"
echo ""
echo "Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Interpretar resultado
case $HTTP_CODE in
  200)
    echo "✅ Sucesso! Post deletado com sucesso"
    ;;
  204)
    echo "✅ Sucesso! Post deletado (sem resposta)"
    ;;
  400)
    echo "❌ Erro 400: Requisição inválida"
    ;;
  401)
    echo "❌ Erro 401: Não autenticado (token inválido ou expirado)"
    ;;
  403)
    echo "❌ Erro 403: Sem permissão para deletar este post"
    ;;
  404)
    echo "❌ Erro 404: Post não encontrado"
    ;;
  500)
    echo "❌ Erro 500: Erro no servidor"
    ;;
  *)
    echo "⚠️ Status desconhecido: $HTTP_CODE"
    ;;
esac

echo ""
echo "💡 Dica: Verifique os logs do servidor para mais detalhes"
