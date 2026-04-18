# BRANDING: SOCIOS PREMIUM - FEVER

## Actualización de Diseño

Se aplicó el branding completo de FEVER a la página de selección de socios, unificando colores y agregando efectos visuales premium.

---

## Paleta de Colores Actualizada

### Colores Principales (Branding FEVER)
- **Púrpura**: `purple-500` a `purple-900`
- **Rosa**: `pink-500` a `rose-500`
- **Dorado**: `yellow-400` a `amber-500`

### Asignación por Socio

| Socio | Gradiente | Icono | Significado |
|-------|-----------|-------|-------------|
| **Ashton** | `yellow-400 → yellow-500 → amber-500` | 👑 | Liderazgo dorado |
| **Agus** | `purple-500 → purple-600 → pink-500` | ⭐ | Estrella púrpura-rosa |
| **Canales** | `pink-500 → rose-500 → pink-600` | 💎 | Diamante rosa |
| **Ricardo** | `purple-600 → violet-600 → purple-700` | 🔥 | Fuego púrpura |
| **Sofia** | `rose-400 → pink-500 → rose-500` | ✨ | Brillo rosa |

---

## Elementos Visuales

### 1. Header Premium

#### Corona Animada
```tsx
<div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-full animate-pulse shadow-2xl shadow-yellow-500/60">
  <Crown className="w-12 h-12 text-white drop-shadow-lg" />
</div>
```

**Características:**
- ✨ Tamaño: 24x24 (96px)
- ✨ Animación: `animate-pulse`
- ✨ Sombra: `shadow-2xl shadow-yellow-500/60`
- ✨ Gradiente dorado con 3 paradas

#### Título Impactante
```tsx
<CardTitle className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
  SOCIOS PREMIUM
</CardTitle>
```

**Características:**
- 📱 Responsive: `text-4xl` móvil, `text-5xl` desktop
- 💪 Peso: `font-black` (900)
- 🌈 Gradiente dorado con `bg-clip-text`
- ✨ Efecto de texto transparente

---

### 2. Botones de Socio

#### Diseño Mejorado
```tsx
<Button className="relative h-28 bg-gradient-to-br ${color} hover:opacity-90 shadow-xl shadow-purple-500/30 hover:scale-105 hover:shadow-2xl overflow-hidden group">
  {/* Efecto de brillo */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
  
  {/* Contenido */}
  <div className="relative flex items-center justify-center gap-3">
    <span className="text-4xl">{icon}</span>
    <span className="text-2xl font-extrabold tracking-wide">{nombre}</span>
  </div>
</Button>
```

#### Efectos Interactivos

**1. Efecto de Brillo (Shine Effect)**
- Gradiente blanco semi-transparente
- Se mueve de izquierda a derecha al hover
- Duración: 1 segundo
- Transición suave

**2. Escala al Hover**
- `hover:scale-105` - Crece 5%
- Transición suave con `transition-all`

**3. Sombras Dinámicas**
- Normal: `shadow-xl shadow-purple-500/30`
- Hover: `shadow-2xl shadow-purple-500/50`
- Color: Púrpura con opacidad

**4. Iconos Grandes**
- Tamaño: `text-4xl` (36px)
- Emojis distintivos por socio
- Alineados con el nombre

---

## Comparación Antes vs Después

### Antes
```tsx
// Colores variados sin cohesión
{ nombre: 'Ashton', color: 'from-yellow-500 to-yellow-600' }
{ nombre: 'Agus', color: 'from-blue-500 to-blue-600' }
{ nombre: 'Canales', color: 'from-purple-500 to-purple-600' }
{ nombre: 'Ricardo', color: 'from-green-500 to-green-600' }
{ nombre: 'Sofia', color: 'from-pink-500 to-pink-600' }

// Botones simples
<Button className="h-24 bg-gradient-to-r ${color}">
  <User className="w-6 h-6 mr-3" />
  {nombre}
</Button>
```

### Después
```tsx
// Colores unificados con branding FEVER (púrpura/rosa/dorado)
{ nombre: 'Ashton', color: 'from-yellow-400 via-yellow-500 to-amber-500', icon: '👑' }
{ nombre: 'Agus', color: 'from-purple-500 via-purple-600 to-pink-500', icon: '⭐' }
{ nombre: 'Canales', color: 'from-pink-500 via-rose-500 to-pink-600', icon: '💎' }
{ nombre: 'Ricardo', color: 'from-purple-600 via-violet-600 to-purple-700', icon: '🔥' }
{ nombre: 'Sofia', color: 'from-rose-400 via-pink-500 to-rose-500', icon: '✨' }

// Botones premium con efectos
<Button className="relative h-28 bg-gradient-to-br ${color} hover:scale-105 overflow-hidden group">
  <div className="shine-effect" />
  <div className="flex items-center gap-3">
    <span className="text-4xl">{icon}</span>
    <span className="text-2xl font-extrabold">{nombre}</span>
  </div>
</Button>
```

---

## Jerarquía Visual

### Tamaños
```
Corona:     96px × 96px (w-24 h-24)
Título:     48-60px (text-4xl md:text-5xl)
Subtítulo:  18px (text-lg)
Botones:    112px altura (h-28)
Iconos:     36px (text-4xl)
Nombres:    24px (text-2xl)
```

### Pesos de Fuente
```
Título:     font-black (900)
Nombres:    font-extrabold (800)
Subtítulo:  font-medium (500)
```

---

## Animaciones y Transiciones

### 1. Corona
```css
animate-pulse
/* Pulsa suavemente entre opacidad 1 y 0.75 */
```

### 2. Efecto de Brillo
```css
translate-x-[-100%]                    /* Posición inicial: fuera a la izquierda */
group-hover:translate-x-[100%]         /* Al hover: se mueve a la derecha */
transition-transform duration-1000      /* Duración: 1 segundo */
```

### 3. Escala de Botones
```css
hover:scale-105                        /* Crece 5% al hover */
transition-all                         /* Transición suave de todas las propiedades */
```

### 4. Sombras
```css
shadow-xl shadow-purple-500/30         /* Normal */
hover:shadow-2xl hover:shadow-purple-500/50  /* Hover */
```

---

## Responsive Design

### Mobile (< 768px)
- Título: `text-4xl` (36px)
- Botones: 1 columna
- Espaciado reducido

### Desktop (≥ 768px)
- Título: `text-5xl` (48px)
- Botones: 2 columnas
- Espaciado completo

---

## Código Completo del Componente

```tsx
export default function SociosLogin() {
  const router = useRouter()

  const socios = [
    { nombre: 'Ashton', ruta: '/socios/ashton', color: 'from-yellow-400 via-yellow-500 to-amber-500', icon: '👑' },
    { nombre: 'Agus', ruta: '/socios/agus', color: 'from-purple-500 via-purple-600 to-pink-500', icon: '⭐' },
    { nombre: 'Canales', ruta: '/socios/canales', color: 'from-pink-500 via-rose-500 to-pink-600', icon: '💎' },
    { nombre: 'Ricardo', ruta: '/socios/ricardo', color: 'from-purple-600 via-violet-600 to-purple-700', icon: '🔥' },
    { nombre: 'Sofia', ruta: '/socios/sofia', color: 'from-rose-400 via-pink-500 to-rose-500', icon: '✨' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-full flex items-center justify-center mb-2 shadow-2xl shadow-yellow-500/60 animate-pulse">
            <Crown className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
          <CardTitle className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
            SOCIOS PREMIUM
          </CardTitle>
          <CardDescription className="text-purple-200 text-lg font-medium">
            Selecciona tu acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socios.map((socio) => (
              <Button
                key={socio.nombre}
                onClick={() => router.push(socio.ruta)}
                className={`relative h-28 bg-gradient-to-br ${socio.color} hover:opacity-90 text-white font-bold text-xl shadow-xl shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  <span className="text-4xl">{socio.icon}</span>
                  <span className="text-2xl font-extrabold tracking-wide">{socio.nombre}</span>
                </div>
              </Button>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-purple-500/20">
            <div className="text-center">
              <p className="text-sm text-purple-300">
                Cada socio tiene su propio acceso con contraseña individual
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Mejoras Visuales Implementadas

### ✅ Cohesión de Marca
- Todos los colores siguen la paleta FEVER
- Púrpura, rosa y dorado predominantes
- Eliminados colores ajenos (azul, verde)

### ✅ Efectos Premium
- Animación pulse en corona
- Efecto shine en botones
- Sombras con glow effect
- Escalado suave al hover

### ✅ Jerarquía Clara
- Título grande y bold
- Iconos distintivos por socio
- Nombres en tamaño prominente
- Espaciado generoso

### ✅ Interactividad
- Feedback visual inmediato
- Transiciones suaves
- Estados hover bien definidos
- Animaciones sutiles pero efectivas

---

## Archivo Modificado
```
/app/socios/page.tsx
```

## Fecha de Actualización
31 de Octubre, 2025

## Estado
✅ **COMPLETADO** - Branding FEVER aplicado completamente
