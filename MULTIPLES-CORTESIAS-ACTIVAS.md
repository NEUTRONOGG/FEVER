# SISTEMA DE MÚLTIPLES CORTESÍAS ACTIVAS

## ✅ Funcionalidad Implementada

### **Problema Anterior:**
- Solo podías tener 1 cortesía activa a la vez
- Si autorizabas otra, reemplazaba la anterior
- No podías ver múltiples cortesías en diferentes mesas

### **Solución Nueva:**
- ✅ Múltiples cortesías activas simultáneamente
- ✅ Cada mesa puede tener su propia cortesía
- ✅ Todas las cortesías se muestran minimizadas
- ✅ Click en cualquier badge para expandir
- ✅ Temporizador independiente para cada una

---

## 🎨 Interfaz Visual

### **Badges Minimizados Apilados:**
```
                    ┌──────────────┐
                    │ 🎁 Mesa 5    │
                    │ ⏰ 14:35     │
                    └──────────────┘
                    ┌──────────────┐
                    │ 🎁 Mesa 3    │
                    │ ⏰ 12:20     │
                    └──────────────┘
                    ┌──────────────┐
                    │ 🎁 Mesa 1    │
                    │ ⏰ 08:45     │
                    └──────────────┘
                         ↑
              (Click para expandir)
```

### **Características de los Badges:**
- Apilados verticalmente en la esquina inferior derecha
- Espaciado de 80px entre cada uno
- Animación de rebote
- Hover: escala al 110%
- Click: expande esa cortesía específica

---

## 💻 Estructura de Datos

### **Estado Anterior:**
```typescript
const [mensajeExito, setMensajeExito] = useState<any>(null)
const [tiempoRestante, setTiempoRestante] = useState(0)
const [cortesiaMinimizada, setCortesiaMinimizada] = useState(false)
```

### **Estado Nuevo:**
```typescript
const [cortesiasActivas, setCortesiasActivas] = useState<any[]>([])
const [cortesiaExpandida, setCortesiaExpandida] = useState<string | null>(null)
```

### **Estructura de Cortesía:**
```typescript
{
  id: "mesa_id-timestamp",           // ID único
  tipo: "shots",                      // Tipo de cortesía
  descripcion: "5 Shots de cortesía", // Descripción
  mesa: "1",                          // Número de mesa
  mesaId: 123,                        // ID de mesa
  cliente: "Juan Pérez",              // Nombre del cliente
  cantidad: 5,                        // Cantidad
  timestamp: 1698765432000,           // Timestamp de creación
  tiempoRestante: 900                 // Segundos restantes (15 min)
}
```

---

## 🔄 Flujo de Uso

### 1. **Autorizar Primera Cortesía**
```
RP → Mesa 1 → Cortesía → 5 Shots → Autorizar
→ Pop-up expandido aparece
→ Badge minimizado NO aparece (está expandido)
```

### 2. **Minimizar**
```
Click en "Minimizar"
→ Pop-up se cierra
→ Badge aparece en esquina inferior derecha
→ Muestra: Mesa 1, 14:59
```

### 3. **Autorizar Segunda Cortesía**
```
RP → Mesa 3 → Cortesía → 3 Perlas Negras → Autorizar
→ Pop-up de Mesa 3 aparece expandido
→ Badge de Mesa 1 sigue visible arriba
```

### 4. **Minimizar Segunda**
```
Click en "Minimizar"
→ Ahora hay 2 badges apilados:
  - Mesa 3 (arriba)
  - Mesa 1 (abajo)
```

### 5. **Expandir Cualquiera**
```
Click en badge de Mesa 1
→ Pop-up de Mesa 1 se expande
→ Solo badge de Mesa 3 queda visible
```

### 6. **Cerrar Cortesía**
```
Click en "Cerrar" en pop-up
→ Cortesía se elimina del array
→ Badge desaparece
→ Si hay otras, siguen activas
```

---

## ⏱️ Temporizador

### **Actualización Automática:**
```typescript
useEffect(() => {
  if (cortesiasActivas.length > 0) {
    const timer = setInterval(() => {
      setCortesiasActivas(prev => {
        const actualizadas = prev.map(cortesia => ({
          ...cortesia,
          tiempoRestante: cortesia.tiempoRestante - 1
        })).filter(cortesia => cortesia.tiempoRestante > 0)
        return actualizadas
      })
    }, 1000)
    return () => clearInterval(timer)
  }
}, [cortesiasActivas.length])
```

### **Características:**
- Actualiza cada segundo
- Reduce `tiempoRestante` en 1
- Filtra cortesías con tiempo = 0
- Elimina automáticamente al expirar
- Independiente para cada cortesía

---

## 🎯 Casos de Uso

### **Caso 1: Múltiples Mesas Simultáneas**
```
Mesa 1: 5 Shots (14:30 restantes)
Mesa 3: 3 Perlas Negras (12:15 restantes)
Mesa 5: Descuento Botella (08:45 restantes)

→ 3 badges apilados
→ Click en cualquiera para ver detalles
→ Cada uno expira independientemente
```

### **Caso 2: Misma Mesa, Múltiples Cortesías**
```
Mesa 1: 5 Shots (14:00 restantes)
Mesa 1: 3 Perlas Negras (13:00 restantes)

→ 2 badges para Mesa 1
→ Diferentes temporizadores
→ Diferentes descripciones
```

### **Caso 3: Expiración Automática**
```
Mesa 1: 00:05 restantes
Mesa 3: 10:00 restantes

→ Después de 5 segundos:
  - Badge de Mesa 1 desaparece
  - Badge de Mesa 3 sigue activo
```

---

## 📱 Responsive Design

### **Móvil:**
- Badges más pequeños (compactos)
- Espaciado reducido (60px)
- Touch-friendly (área de click grande)
- Pop-up ocupa 90% del ancho

### **Desktop:**
- Badges tamaño completo
- Espaciado de 80px
- Hover effects
- Pop-up centrado

---

## 🎨 Animaciones

### **Badges:**
- `animate-bounce` - Rebote continuo
- `hover:scale-110` - Crece al pasar mouse
- `transition-transform` - Transición suave

### **Pop-up:**
- `animate-in fade-in` - Aparece con fade
- `animate-in zoom-in` - Zoom al aparecer
- `duration-300` - 300ms de transición

### **Temporizador:**
- Actualización cada segundo
- Sin animación (para no distraer)
- Color ámbar para visibilidad

---

## ✅ Beneficios

1. **Mayor Flexibilidad**
   - Múltiples cortesías activas
   - No se pierden al autorizar nuevas
   - Gestión independiente

2. **Mejor Organización**
   - Vista clara de todas las cortesías
   - Fácil identificación por mesa
   - Temporizadores visibles

3. **Experiencia Mejorada**
   - No hay confusión
   - Todo está visible
   - Control total

4. **Eficiencia**
   - No necesitas memorizar
   - Badges siempre visibles
   - Click rápido para expandir

---

## 🔧 Funciones Clave

### **Agregar Cortesía:**
```typescript
const nuevaCortesia = {
  id: `${mesaSeleccionada.id}-${Date.now()}`,
  // ... datos
  tiempoRestante: 900
}
setCortesiasActivas(prev => [...prev, nuevaCortesia])
setCortesiaExpandida(nuevaCortesia.id)
```

### **Minimizar:**
```typescript
setCortesiaExpandida(null)
// Badge aparece automáticamente
```

### **Expandir:**
```typescript
onClick={() => setCortesiaExpandida(cortesia.id)}
// Pop-up se muestra, badge desaparece
```

### **Cerrar:**
```typescript
setCortesiasActivas(prev => prev.filter(c => c.id !== cortesia.id))
setCortesiaExpandida(null)
```

---

## 📁 Archivo Modificado

```
/app/dashboard/rp/page.tsx
```

**Cambios:**
1. Estados: `cortesiasActivas[]` y `cortesiaExpandida`
2. useEffect: temporizador para array
3. handleAutorizarCortesia: agrega al array
4. Badges: map sobre cortesiasActivas filtradas
5. Pop-up: encuentra cortesía por ID
6. Botones: minimizar/cerrar actualiza estados

---

## Fecha de Implementación
31 de Octubre, 2025

## Estado
✅ **COMPLETADO Y FUNCIONANDO**
