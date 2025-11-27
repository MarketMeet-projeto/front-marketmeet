#!/bin/bash

# Script de Validação de Configuração de Ambiente
# Verifica se todos os URLs hardcoded foram removidos

echo "🔍 Verificando URLs hardcoded no projeto..."
echo "=============================================="
echo ""

# Verificar por padrões de URLs hardcoded
HARDCODED_URLS=$(grep -r "10\.51\.47\.41" src/ 2>/dev/null || echo "Nenhum encontrado")
LOCALHOST_URLS=$(grep -r "http://localhost:3000" src/ 2>/dev/null | grep -v "environment" | grep -v "node_modules" || echo "Nenhum encontrado")

echo "❌ URLs com IP 10.51.47.41:"
if [ "$HARDCODED_URLS" = "Nenhum encontrado" ]; then
  echo "   ✅ Nenhum encontrado (Correto!)"
else
  echo "$HARDCODED_URLS"
fi
echo ""

echo "ℹ️  URLs localhost:3000 (fora de environment):"
if [ "$LOCALHOST_URLS" = "Nenhum encontrado" ]; then
  echo "   ✅ Nenhum encontrado (Correto!)"
else
  echo "$LOCALHOST_URLS"
fi
echo ""

echo "📋 Verificando se environment.ts existe..."
if [ -f "src/environments/environment.ts" ]; then
  echo "   ✅ environment.ts encontrado"
else
  echo "   ❌ environment.ts NÃO encontrado"
fi
echo ""

echo "📋 Verificando se environment.prod.ts existe..."
if [ -f "src/environments/environment.prod.ts" ]; then
  echo "   ✅ environment.prod.ts encontrado"
else
  echo "   ❌ environment.prod.ts NÃO encontrado"
fi
echo ""

echo "✅ Validação concluída!"
echo ""
echo "Para executar:"
echo "  Desenvolvimento: npm start"
echo "  Produção:        npm run build -- --configuration production"
