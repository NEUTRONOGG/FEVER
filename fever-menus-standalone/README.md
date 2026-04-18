# 🔥 FEVER - Menús Digitales

Proyecto independiente de los menús digitales de FEVER Club.

## 🚀 Instalación

```bash
npm install
```

## 💻 Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000/menu](http://localhost:3000/menu)

## 📦 Build para Producción

```bash
npm run build
```

Esto generará una carpeta `out/` con el sitio estático listo para desplegar.

## 🎨 Rutas Disponibles

- `/menu` - Selector de versiones
- `/menu-1` - Bold Grid (estilo The Normal Club)
- `/menu-2` - Premium Animated (animaciones avanzadas)
- `/menu-3` - Minimal Elegant (estilo minimalista)

## 📁 Estructura

```
fever-menus-standalone/
├── app/
│   ├── menu/          → Selector
│   ├── menu-1/        → Versión 1
│   ├── menu-2/        → Versión 2
│   ├── menu-3/        → Versión 3
│   ├── layout.tsx     → Layout principal
│   └── globals.css    → Estilos globales
├── components/
│   ├── FeverLoader.tsx    → Loader animado
│   └── MenuSwitcher.tsx   → Selector de versiones
├── public/
│   ├── fever-logo.png
│   ├── fever-bg-1.png
│   ├── fever-bg-2.png
│   └── fever-bg-3.png
└── package.json
```

## 🎯 Características

- ✅ Next.js 14 con App Router
- ✅ TypeScript
- ✅ Tailwind CSS (sin configuración adicional)
- ✅ Glassmorphism avanzado
- ✅ Animaciones CSS premium
- ✅ Loader animado con efectos
- ✅ Selector de versiones en footer
- ✅ Responsive (móvil, tablet, desktop)
- ✅ Exportación estática (sin servidor)

## 📤 Desplegar

### Netlify
```bash
npm run build
netlify deploy --prod --dir=out
```

### Vercel
```bash
vercel --prod
```

### GitHub Pages
1. Build: `npm run build`
2. Sube la carpeta `out/` a tu repositorio
3. Configura GitHub Pages

## 🎨 Personalización

### Cambiar productos
Edita los archivos `app/menu-*/page.tsx` y modifica el objeto `menuData`.

### Cambiar colores
Los colores están en formato `oklch` en los archivos de página. Busca `oklch(0.72 0.16 80)` (dorado) para cambiarlos.

### Cambiar imágenes
Reemplaza los archivos en `public/`:
- `fever-logo.png`
- `fever-bg-1.png`, `fever-bg-2.png`, `fever-bg-3.png`

## 🔧 Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Lucide React** - Iconos
- **CSS Animations** - Animaciones nativas

---

**FEVER Club** · León, Gto · The Golden Age
