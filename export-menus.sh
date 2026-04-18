#!/bin/bash

echo "🔥 Exportando Menús FEVER..."

# Crear carpeta out si no existe
mkdir -p out

# Copiar imágenes necesarias
echo "📸 Copiando imágenes..."
mkdir -p out/public
cp public/fever-logo.png out/public/
cp public/fever-bg-1.png out/public/
cp public/fever-bg-2.png out/public/
cp public/fever-bg-3.png out/public/

# Copiar componentes necesarios
echo "🧩 Copiando componentes..."
mkdir -p out/components
cp components/FeverLoader.tsx out/components/
cp components/MenuSwitcher.tsx out/components/

# Copiar páginas de menú
echo "📄 Copiando páginas de menú..."
mkdir -p out/app/menu
mkdir -p out/app/menu-1
mkdir -p out/app/menu-2
mkdir -p out/app/menu-3

cp app/menu/page.tsx out/app/menu/
cp app/menu-1/page.tsx out/app/menu-1/
cp app/menu-2/page.tsx out/app/menu-2/
cp app/menu-3/page.tsx out/app/menu-3/

# Copiar archivos de configuración necesarios
echo "⚙️ Copiando configuración..."
cp package.json out/
cp tsconfig.json out/
cp next.config.mjs out/
cp tailwind.config.ts out/
cp postcss.config.mjs out/

# Copiar app/layout.tsx y app/globals.css
echo "🎨 Copiando layout y estilos..."
cp app/layout.tsx out/app/
cp app/globals.css out/app/

# Crear README para la carpeta out
cat > out/README.md << 'EOF'
# FEVER Menús - Exportación Estática

## 📁 Contenido

Este paquete contiene los 3 menús digitales de FEVER:
- `/menu` - Selector de versiones
- `/menu-1` - Bold Grid
- `/menu-2` - Premium Animated
- `/menu-3` - Minimal Elegant

## 🚀 Instalación

```bash
npm install
```

## 🔧 Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000/menu](http://localhost:3000/menu)

## 📦 Build para Producción

```bash
npm run build
```

## 🎨 Características

- ✅ 3 diseños diferentes de menú
- ✅ Glassmorphism avanzado
- ✅ Animaciones premium
- ✅ Fondo FEVER con efecto glitch
- ✅ Selector de versiones en footer
- ✅ Responsive (móvil, tablet, desktop)
- ✅ Logo FEVER con loader animado

## 📱 Rutas

- `/menu` - Selector principal
- `/menu-1` - Diseño Bold Grid
- `/menu-2` - Diseño Premium Animated
- `/menu-3` - Diseño Minimal Elegant

## 🎯 Tecnologías

- Next.js 14
- TypeScript
- Tailwind CSS
- Lucide Icons

---

**Creado para:** FEVER Club  
**Inspirado en:** The Normal Club León  
**Paleta:** Dorado (#EAB308) / Negro (#0A0A0A)
EOF

# Crear package.json simplificado
cat > out/package.json << 'EOF'
{
  "name": "fever-menus",
  "version": "1.0.0",
  "description": "Menús digitales FEVER Club",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3"
  }
}
EOF

echo "✅ Exportación completada!"
echo ""
echo "📦 Archivos exportados a: ./out"
echo ""
echo "🚀 Para usar:"
echo "   cd out"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "🔥 Los menús estarán disponibles en:"
echo "   http://localhost:3000/menu"
echo "   http://localhost:3000/menu-1"
echo "   http://localhost:3000/menu-2"
echo "   http://localhost:3000/menu-3"
