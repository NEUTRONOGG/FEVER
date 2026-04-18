# 🚀 Inicio Rápido - FEVER Menús

## 📦 Paso 1: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

## 💻 Paso 2: Iniciar Desarrollo

```bash
npm run dev
```

El servidor iniciará en: **http://localhost:3000**

## 🎯 Rutas del Proyecto

- **/** → Redirige automáticamente a `/menu`
- **/menu** → Selector de 3 versiones
- **/menu-1** → Bold Grid
- **/menu-2** → Premium Animated ⭐ (Recomendado)
- **/menu-3** → Minimal Elegant

## 📁 Archivos Importantes

### Páginas del Menú
- `app/menu/page.tsx` - Selector principal
- `app/menu-1/page.tsx` - Versión 1
- `app/menu-2/page.tsx` - Versión 2 (con más animaciones)
- `app/menu-3/page.tsx` - Versión 3

### Componentes
- `components/FeverLoader.tsx` - Loader animado dorado
- `components/MenuSwitcher.tsx` - Botón cambiar versión

### Imágenes
- `public/fever-logo.png` - Logo FEVER
- `public/fever-bg-1.png` - Fondo versión 1
- `public/fever-bg-2.png` - Fondo versión 2
- `public/fever-bg-3.png` - Fondo versión 3

## 🎨 Personalizar Productos

Edita cualquier archivo `app/menu-*/page.tsx`:

```typescript
const menuData = {
  tequila: [
    { nombre: 'Producto', copa: 120, botella: 1890 },
    // Agrega más productos aquí
  ],
  // Más categorías...
}
```

## 📤 Exportar para Producción

```bash
npm run build
```

Esto genera una carpeta `out/` con HTML estático listo para subir a cualquier hosting.

## 🌐 Desplegar

### Opción 1: Netlify (Más fácil)
```bash
npm run build
netlify deploy --prod --dir=out
```

### Opción 2: Vercel
```bash
vercel --prod
```

### Opción 3: Cualquier Hosting
Sube la carpeta `out/` completa a tu servidor.

## 🔧 Comandos Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Servidor producción
npm run lint     # Verificar código
```

## ❓ Problemas Comunes

### No se ven las imágenes
- Verifica que los archivos estén en `public/`
- Reinicia el servidor: `Ctrl+C` y `npm run dev`

### Error de TypeScript
- Ejecuta: `npm install`
- Verifica que tengas Node.js 18+ instalado

### Tailwind no funciona
- Verifica que exista `tailwind.config.js`
- Reinicia el servidor

## 📞 Soporte

Para dudas o modificaciones, contactar al equipo de desarrollo.

---

**FEVER Club** · León, Gto · The Golden Age  
**Versión:** 1.0.0 Standalone
