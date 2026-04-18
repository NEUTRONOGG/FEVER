# 🔄 ACTUALIZAR PANEL DE RESERVACIONES

## 📋 TAREA

Hacer que el panel de reservaciones (`/dashboard/reservaciones`) se vea **idéntico** al panel de hostess con:

✅ Vista de mesas visuales (grid de mesas)
✅ Mesas disponibles en verde
✅ Mesas ocupadas en azul
✅ Mesas reservadas en naranja
✅ Stats arriba (Total, Disponibles, Ocupadas, Reservadas)
✅ Click en mesa para ver detalles/reservar

---

## 🎯 ESTRUCTURA DESEADA

```
┌─────────────────────────────────────────────────────┐
│ Panel de Reservaciones                              │
│ [Ver Mesas] [Nueva Reservación]  [Stats badges]    │
├─────────────────────────────────────────────────────┤
│ [Total: 30] [Disponibles: 29] [Ocupadas: 1] [Res: 0]│
├─────────────────────────────────────────────────────┤
│ Mesas Disponibles:                                  │
│ [1] [2] [3] [4] [5] [6] ...                        │
│                                                     │
│ Mesas Ocupadas:                                     │
│ [18] Agus Pinaya - 6 personas                      │
│                                                     │
│ Mesas Reservadas:                                   │
│ (vacío)                                             │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 CAMBIOS NECESARIOS

### **Archivo:** `/app/dashboard/reservaciones/page.tsx`

**Cambiar de:**
- Lista de reservaciones en tabla
- Formularios complejos

**A:**
- Grid visual de mesas (como hostess)
- Click en mesa para reservar
- Mismo diseño y colores

---

## 📝 CÓDIGO A REEMPLAZAR

El archivo actual tiene ~650 líneas. Necesita ser reescrito para:

1. **Cargar mesas** (igual que hostess)
2. **Mostrar grid de mesas** (igual que hostess)
3. **Filtrar por estado** (disponible, ocupada, reservada)
4. **Dialog para reservar** al hacer click en mesa disponible
5. **Dialog para confirmar** al hacer click en mesa reservada

---

## ✅ FUNCIONALIDADES A MANTENER

```
✅ Ver todas las mesas
✅ Crear nueva reservación
✅ Asignar mesa a reservación
✅ Confirmar asistencia
✅ Cancelar reservación
✅ Ver detalles de reservación
```

---

## 🎨 DISEÑO VISUAL

### **Mesas Disponibles (Verde):**
```
┌─────────┐
│    1    │
│ Cap: 10 │
└─────────┘
```

### **Mesas Ocupadas (Azul):**
```
┌─────────────────┐
│    Mesa 18      │
│ Agus Pinaya     │
│ 6 personas      │
│ $0.00           │
└─────────────────┘
```

### **Mesas Reservadas (Naranja):**
```
┌─────────────────┐
│    Mesa 5       │
│ Juan Pérez      │
│ 4 personas      │
│ 21:00           │
└─────────────────┘
```

---

## 🚀 IMPLEMENTACIÓN

Debido a que el archivo es muy largo (~650 líneas), la mejor opción es:

### **Opción A: Copiar estructura de hostess**

1. Copiar `/app/dashboard/hostess/page.tsx`
2. Renombrar a `/app/dashboard/reservaciones/page.tsx`
3. Ajustar título y funcionalidades específicas

### **Opción B: Reescribir desde cero**

1. Usar mismo layout que hostess
2. Cargar mesas con `obtenerMesas()`
3. Mostrar grid visual
4. Agregar dialogs para reservar

---

## 📊 FLUJO DE USUARIO

### **1. Ver panel:**
```
/dashboard/reservaciones
→ Ver todas las mesas en grid
→ Ver cuáles están disponibles/ocupadas/reservadas
```

### **2. Crear reservación:**
```
Click en mesa disponible (verde)
→ Dialog: "Reservar Mesa X"
→ Llenar: nombre, teléfono, personas, hora
→ Guardar
→ Mesa cambia a naranja (reservada)
```

### **3. Confirmar asistencia:**
```
Click en mesa reservada (naranja)
→ Dialog: "Confirmar Asistencia"
→ Click "Confirmar"
→ Mesa cambia a azul (ocupada)
→ Cliente puede consumir
```

### **4. Cancelar reservación:**
```
Click en mesa reservada (naranja)
→ Dialog: "Detalles de Reservación"
→ Click "Cancelar"
→ Mesa vuelve a verde (disponible)
```

---

## ✅ RESULTADO ESPERADO

```
Panel de Reservaciones = Panel de Hostess

Mismas mesas
Mismo diseño
Mismos colores
Misma interacción

Diferencia:
- Hostess: Asigna mesas directamente
- Reservaciones: Crea reservas para después
```

---

## 🔄 PRÓXIMOS PASOS

1. ¿Quieres que reescriba el archivo completo?
2. ¿O prefieres que copie la estructura de hostess?
3. ¿Hay alguna funcionalidad específica que quieras mantener?

---

**Confirma y procedo a actualizar el panel.** 🔄✅🚀
