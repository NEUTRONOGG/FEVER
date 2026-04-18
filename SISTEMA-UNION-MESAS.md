# ✅ SISTEMA DE UNIÓN DE MESAS

## 🎯 FUNCIONALIDAD IMPLEMENTADA

La Hostess ahora puede **unir mesas** cuando hay grupos de más de 10 personas.

---

## 📋 **CÓMO FUNCIONA:**

### **1. Capacidad Máxima por Mesa: 10 personas**

### **2. Flujo Automático:**

```
Cliente con ≤ 10 personas:
├─ Click en mesa disponible
└─ Abre dialog de registro normal

Cliente con > 10 personas:
├─ Click en mesa disponible
├─ Abre dialog "Unir Mesas"
├─ Selecciona múltiples mesas
├─ Verifica capacidad total
└─ Continúa con registro
```

---

## 🔄 **PROCESO PASO A PASO:**

### **Ejemplo: Grupo de 18 personas**

**1. Hostess ingresa número de personas:**
```
Número de personas: 18
```

**2. Click en cualquier mesa disponible:**
```
→ Sistema detecta: 18 > 10
→ Abre dialog "Unir Mesas"
```

**3. Dialog muestra:**
```
┌─────────────────────────────────────┐
│  Unir Mesas - 18 personas           │
├─────────────────────────────────────┤
│  Mesas seleccionadas: 0 mesas       │
│  Capacidad total: 0 personas        │
│  Necesitas: 18 personas             │
│                                     │
│  ⚠️ Necesitas seleccionar más mesas │
└─────────────────────────────────────┘
```

**4. Hostess selecciona mesas:**
```
Click en Mesa 1 (Cap: 8)
→ Capacidad total: 8 personas ❌

Click en Mesa 2 (Cap: 6)
→ Capacidad total: 14 personas ❌

Click en Mesa 3 (Cap: 4)
→ Capacidad total: 18 personas ✅
```

**5. Continuar con registro:**
```
→ Botón "Continuar con Registro" se activa
→ Abre dialog de registro
→ Título: "Registrar Cliente - Mesas 1 + 2 + 3"
→ Capacidad total: 18 personas
```

**6. Asignar cliente:**
```
→ Registra datos del cliente
→ Click "Asignar 3 Mesas"
→ Sistema asigna el mismo cliente a las 3 mesas
→ Todas las mesas quedan ocupadas
→ Alerta: "Mesas 1+2+3 unidas y asignadas exitosamente"
```

---

## 🎨 **INTERFAZ:**

### **Dialog "Unir Mesas":**

**Información en tiempo real:**
- 📊 **Mesas seleccionadas:** Contador
- 👥 **Capacidad total:** Verde si suficiente, rojo si falta
- 🎯 **Necesitas:** Personas requeridas

**Grid de mesas:**
- Todas las mesas disponibles
- Click para seleccionar/deseleccionar
- Visual: Verde con ✓ cuando está seleccionada
- Muestra capacidad de cada mesa

**Validación:**
- ⚠️ Alerta si falta capacidad
- ✅ Botón habilitado solo si hay suficiente capacidad

---

## ✅ **CARACTERÍSTICAS:**

### **1. Detección Automática:**
- Si personas ≤ 10 → Flujo normal (1 mesa)
- Si personas > 10 → Flujo de unión (múltiples mesas)

### **2. Selección Visual:**
- Click para seleccionar/deseleccionar
- Mesas seleccionadas en verde con ✓
- Capacidad total en tiempo real

### **3. Validación Inteligente:**
- No permite continuar si falta capacidad
- Muestra cuántas personas faltan
- Actualización en tiempo real

### **4. Asignación Múltiple:**
- Mismo cliente en todas las mesas
- Mismo número de personas
- Misma hostess
- Todas las mesas quedan ocupadas

---

## 📊 **EJEMPLO VISUAL:**

```
Grupo de 25 personas:

Mesas disponibles:
┌────┬────┬────┬────┐
│ 1  │ 2  │ 3  │ 4  │
│ 8  │ 6  │ 8  │ 4  │
└────┴────┴────┴────┘

Selección:
┌────┬────┬────┬────┐
│ 1✓ │ 2✓ │ 3✓ │ 4  │
│ 8  │ 6  │ 8  │ 4  │
└────┴────┴────┴────┘

Capacidad: 8 + 6 + 8 = 22 ❌ (Falta 3)

Agregar Mesa 4:
┌────┬────┬────┬────┐
│ 1✓ │ 2✓ │ 3✓ │ 4✓ │
│ 8  │ 6  │ 8  │ 4  │
└────┴────┴────┴────┘

Capacidad: 8 + 6 + 8 + 4 = 26 ✅

→ Continuar con registro
→ Asignar cliente a Mesas 1+2+3+4
```

---

## 🔧 **FUNCIONES IMPLEMENTADAS:**

### **1. `handleSeleccionarMesa(mesa)`**
```typescript
// Detecta si necesita unión de mesas
if (numeroPersonas > 10) {
  setDialogUnirMesas(true)
  setMesasSeleccionadas([mesa])
} else {
  setMesaSeleccionada(mesa)
  setDialogRegistro(true)
}
```

### **2. `toggleMesaUnion(mesa)`**
```typescript
// Agrega/quita mesa de la selección
if (mesasSeleccionadas.find(m => m.id === mesa.id)) {
  // Quitar
  setMesasSeleccionadas(mesasSeleccionadas.filter(m => m.id !== mesa.id))
} else {
  // Agregar
  setMesasSeleccionadas([...mesasSeleccionadas, mesa])
}
```

### **3. `handleAsignarMesasUnidas()`**
```typescript
// Asigna el mismo cliente a todas las mesas
for (const mesa of mesasSeleccionadas) {
  await asignarMesaCliente(mesa.id, {
    cliente_id: clienteId,
    cliente_nombre: nombre,
    numero_personas: numeroPersonas,
    hostess: hostessNombre
  })
}
```

---

## 💡 **VENTAJAS:**

✅ **Automático:** Detecta cuando se necesita unir mesas
✅ **Visual:** Interfaz clara y fácil de usar
✅ **Validación:** No permite errores
✅ **Flexible:** Selecciona las mesas que quieras
✅ **Eficiente:** Un solo cliente para todas las mesas
✅ **Trazable:** Sabe qué mesas están unidas

---

## 🎯 **CASOS DE USO:**

### **Caso 1: Grupo pequeño (5 personas)**
```
→ Click en mesa
→ Dialog de registro directo
→ Asigna 1 mesa
```

### **Caso 2: Grupo mediano (10 personas)**
```
→ Click en mesa
→ Dialog de registro directo
→ Asigna 1 mesa (capacidad máxima)
```

### **Caso 3: Grupo grande (15 personas)**
```
→ Click en mesa
→ Dialog "Unir Mesas"
→ Selecciona 2-3 mesas
→ Dialog de registro
→ Asigna múltiples mesas
```

### **Caso 4: Evento (50 personas)**
```
→ Click en mesa
→ Dialog "Unir Mesas"
→ Selecciona 5-6 mesas
→ Dialog de registro
→ Asigna todas las mesas
```

---

## 📱 **INTERFAZ RESPONSIVE:**

- **Desktop:** Grid de 4 columnas
- **Tablet:** Grid de 3 columnas
- **Mobile:** Grid de 2 columnas

---

## ✅ **ESTADO:**

```
╔════════════════════════════════════════════════════╗
║   ✅ SISTEMA DE UNIÓN DE MESAS IMPLEMENTADO        ║
║                                                    ║
║   • Detección automática (> 10 personas)          ║
║   • Selección múltiple de mesas                   ║
║   • Validación de capacidad en tiempo real        ║
║   • Asignación múltiple del mismo cliente         ║
║   • Interfaz visual clara                         ║
║                                                    ║
║        🚀 LISTO PARA USAR 🚀                       ║
╚════════════════════════════════════════════════════╝
```

---

## 🔄 **PRUEBA:**

1. **Hostess:** Ingresa 15 personas
2. **Click** en cualquier mesa disponible
3. **Dialog "Unir Mesas"** se abre
4. **Selecciona** 2-3 mesas hasta tener capacidad
5. **Continuar** con registro
6. **Registra** datos del cliente
7. **Asignar** → Todas las mesas quedan ocupadas

---

**¡Sistema de unión de mesas completamente funcional!** 🎉
