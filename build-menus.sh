#!/bin/bash

echo "🔥 Construyendo Menús FEVER para exportación estática..."

# Backup del next.config actual
if [ -f "next.config.mjs" ]; then
    mv next.config.mjs next.config.backup.mjs
    echo "✅ Backup de next.config.mjs creado"
fi

# Usar configuración de exportación
cp next.config.export.mjs next.config.mjs

# Limpiar carpeta out-menus si existe
rm -rf out-menus

echo "📦 Ejecutando build de Next.js..."
npm run build

# Restaurar configuración original
if [ -f "next.config.backup.mjs" ]; then
    mv next.config.backup.mjs next.config.mjs
    echo "✅ Configuración original restaurada"
fi

echo ""
echo "✅ Build completado!"
echo ""
echo "📁 Archivos generados en: ./out-menus"
echo ""
echo "🚀 Para probar localmente:"
echo "   cd out-menus"
echo "   python3 -m http.server 8000"
echo "   # Abre: http://localhost:8000/menu"
echo ""
echo "📤 Para desplegar:"
echo "   - Sube la carpeta 'out-menus' completa a tu hosting"
echo "   - O usa: vercel --prod out-menus"
echo "   - O usa: netlify deploy --prod --dir=out-menus"
echo ""
echo "🔥 Rutas disponibles:"
echo "   /menu/index.html"
echo "   /menu-1/index.html"
echo "   /menu-2/index.html"
echo "   /menu-3/index.html"
