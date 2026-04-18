# Instrucciones para Agregar el Fondo FEVER

## Paso 1: Guardar la Imagen

Guarda la imagen del fondo FEVER que compartiste como:
```
/Users/mac/Downloads/crm-restaurante/public/fever-bg.jpg
```

## Paso 2: Verificar

La imagen debe tener:
- Efecto de luces doradas con líneas horizontales (glitch/distorsión)
- Fondo oscuro con iluminación dorada
- Logo FEVER visible
- Texto "WHAT'S ETERNAL NEVER FADES"

## Implementación Actual

Los 3 menús ya están configurados para usar este fondo:

### Menu-1 (`/menu-1`)
- Fondo: `url(/fever-bg.jpg)` con `brightness(0.7)`
- Overlay: `bg-black/40` para mejor legibilidad
- Glassmorphism en header y cards

### Menu-2 (`/menu-2`)
- Fondo: `url(/fever-bg.jpg)` con `brightness(0.7)`
- Overlay: `bg-black/40`
- Efecto de cursor brillante adicional

### Menu-3 (`/menu-3`)
- Fondo: `url(/fever-bg.jpg)` con `brightness(0.7)`
- Overlay: `bg-black/40`
- Diseño minimalista

## Características del Fondo

- **Posición**: `fixed inset-0 -z-10` (fondo fijo)
- **Tamaño**: `bg-cover bg-center bg-no-repeat`
- **Filtro**: `brightness(0.7)` para oscurecer un poco
- **Overlay**: Capa negra semi-transparente (40%) para legibilidad

## Alternativa Temporal

Si no tienes la imagen, puedes usar un gradiente similar:

```css
background: linear-gradient(
  135deg,
  #0a0a0a 0%,
  #1a1410 25%,
  #2a1f0f 50%,
  #1a1410 75%,
  #0a0a0a 100%
);
```

O crear un efecto de líneas horizontales con CSS:

```css
background: 
  repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(234, 179, 8, 0.03) 2px,
    rgba(234, 179, 8, 0.03) 4px
  ),
  linear-gradient(135deg, #0a0a0a 0%, #2a1f0f 50%, #0a0a0a 100%);
```

## Resultado Esperado

El fondo debe verse como la imagen de referencia de FEVER con:
- Efecto de luces doradas distorsionadas
- Ambiente oscuro y premium
- Líneas horizontales tipo glitch
- Iluminación dramática

Una vez que guardes la imagen en `/public/fever-bg.jpg`, los 3 menús la mostrarán automáticamente! 🔥
