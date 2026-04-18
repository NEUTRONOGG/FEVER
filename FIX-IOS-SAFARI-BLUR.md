# Fix: Barra Transparente en Safari iOS

## Problema Identificado
En dispositivos iPhone con Safari, aparecía un efecto blur/blanco en la parte superior del navegador cuando se hacía scroll. La solución es hacer que la barra sea **transparente** para que se vea el fondo de la aplicación.

## Soluciones Implementadas

### 1. Meta Tags en Layout (app/layout.tsx)
```tsx
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="transparent" />
<meta name="apple-mobile-web-app-title" content="FEVER" />
```

**Propósito:**
- `viewport-fit=cover`: Extiende el contenido hasta los bordes de la pantalla
- `apple-mobile-web-app-capable`: Habilita modo standalone
- `apple-mobile-web-app-status-bar-style="black-translucent"`: Barra **transparente** que muestra el fondo
- `user-scalable=no`: Previene zoom accidental
- `theme-color="transparent"`: Barra de navegación transparente

### 2. Estilos Globales CSS (app/globals.css)

#### HTML Fixed
```css
html {
  height: 100%;
  width: 100%;
  position: fixed;
  overflow: hidden;
}
```

#### Body con Dynamic Viewport Height y Safe Area
```css
body {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height para iOS */
  width: 100vw;
  position: fixed;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none; /* Prevenir bounce en iOS */
  -webkit-tap-highlight-color: transparent;
  padding-top: env(safe-area-inset-top); /* Espacio para barra transparente */
}
```

#### Soporte Específico iOS
```css
@supports (-webkit-touch-callout: none) {
  body {
    min-height: -webkit-fill-available;
  }
}
```

### 3. Estilos Inline en Componentes
Para páginas específicas como `/dashboard/rp-login/page.tsx`:

```tsx
style={{
  minHeight: 'max(100vh, 100dvh)',
  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'none'
}}
```

## Características Técnicas

### Dynamic Viewport Height (dvh)
- `100dvh` es una unidad CSS moderna que se ajusta dinámicamente
- Considera la barra de navegación de Safari que aparece/desaparece
- Fallback a `100vh` para navegadores que no lo soportan

### Overscroll Behavior
- `overscroll-behavior: none` previene el "bounce" característico de iOS
- Elimina el efecto de scroll más allá del contenido

### Position Fixed
- Fija el body para prevenir que Safari muestre su UI nativa
- Permite scroll interno controlado con `overflow-y: auto`

### -webkit-overflow-scrolling
- `touch` habilita scroll suave nativo de iOS
- Mejora la experiencia de usuario en dispositivos táctiles

## Beneficios

✅ **Elimina el blur/blanco superior** en Safari iOS
✅ **Previene el bounce** al hacer scroll
✅ **Mejora la experiencia** en modo standalone (PWA)
✅ **Mantiene el diseño** consistente en todos los dispositivos
✅ **Compatible** con todos los navegadores modernos

## Archivos Modificados

### Configuración Global
1. `/app/layout.tsx` - Meta tags para iOS Safari
2. `/app/globals.css` - Estilos base CSS

### Páginas de Login
3. `/app/login/page.tsx` - Login principal (Admin/POS/Socios)
4. `/app/socios/page.tsx` - Selector de socios
5. `/app/dashboard/rp-login/page.tsx` - Login de RPs

### Login Individual de Socios
6. `/app/socios/ashton/page.tsx` - Login Ashton
7. `/app/socios/agus/page.tsx` - Login Agus
8. `/app/socios/canales/page.tsx` - Login Canales
9. `/app/socios/ricardo/page.tsx` - Login Ricardo
10. `/app/socios/sofia/page.tsx` - Login Sofia

## Notas sobre Lints CSS

Los warnings de CSS sobre `@custom-variant`, `@theme` y `@apply` son normales en proyectos con Tailwind CSS v4. Estos son at-rules específicos de Tailwind y no afectan el funcionamiento:

- `@custom-variant` - Define variantes personalizadas
- `@theme` - Define tokens de diseño
- `@apply` - Aplica clases de utilidad

Estos warnings pueden ignorarse de forma segura.

## Testing

Para probar en iPhone:
1. Abre Safari en iPhone
2. Navega a la aplicación
3. Haz scroll hacia abajo y arriba
4. Verifica que NO aparezca el blur/blanco superior
5. Verifica que el bounce esté deshabilitado

## Compatibilidad

- ✅ iOS Safari 15+
- ✅ Chrome iOS
- ✅ Firefox iOS
- ✅ Android Chrome
- ✅ Desktop browsers (sin efectos negativos)
