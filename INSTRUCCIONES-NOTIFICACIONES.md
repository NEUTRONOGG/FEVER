# 🔔 Sistema de Notificaciones de Emergencia

## ✅ Componente Creado

Se ha creado el componente `NotificacionesEmergencia.tsx` que incluye:

1. **Botón de campana** con contador de alertas no leídas
2. **Solicitud de permisos** de notificaciones del navegador
3. **Notificaciones push** automáticas cuando hay emergencias
4. **Dialog** con lista de alertas activas
5. **Actualización en tiempo real** cada 3 segundos

---

## 📋 Cómo Agregar a Cada Panel

### 1. **Dashboard Admin** (`/app/dashboard/page.tsx`)

Agregar en el header, junto a los otros botones:

```tsx
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"

// Dentro del return, en el header:
<div className="flex items-center gap-3">
  {/* Otros botones... */}
  <NotificacionesEmergencia />
</div>
```

### 2. **Panel Hostess** (`/app/dashboard/hostess/page.tsx`)

```tsx
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"

// En el header con los botones:
<div className="flex flex-wrap items-center gap-3">
  {/* Botones existentes... */}
  <NotificacionesEmergencia />
</div>
```

### 3. **Panel Mesero** (`/app/dashboard/mesero/page.tsx`)

```tsx
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"

// En el header:
<div className="flex items-center gap-3">
  {/* Botones existentes... */}
  <NotificacionesEmergencia />
</div>
```

### 4. **Panel Cadena** (`/app/dashboard/cadena/page.tsx`)

```tsx
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"

// En el header con el botón de Menú Staff:
<div className="flex items-center gap-3">
  <Button onClick={() => window.location.href = '/dashboard/selector-rol'}>
    Menú Staff
  </Button>
  <NotificacionesEmergencia />
</div>
```

### 5. **Panel RP** (`/app/dashboard/rp/page.tsx`)

```tsx
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"

// En el header:
<div className="flex items-center gap-3">
  {/* Botones existentes... */}
  <NotificacionesEmergencia />
</div>
```

### 6. **Reservaciones** (`/app/dashboard/reservaciones/page.tsx`)

```tsx
import NotificacionesEmergencia from "@/components/NotificacionesEmergencia"

// En el header:
<div className="flex items-center gap-3">
  {/* Botones existentes... */}
  <NotificacionesEmergencia />
</div>
```

---

## 🎯 Características del Sistema

### **Notificaciones Push**
- ✅ Aparecen incluso si la pestaña está en segundo plano
- ✅ Sonido de alerta del sistema
- ✅ Se mantienen hasta que el usuario las cierre
- ✅ Al hacer clic, abre el dialog de alertas

### **Contador de Alertas**
- 🔴 Badge rojo con número de alertas no leídas
- 💓 Animación de pulso cuando hay alertas nuevas
- ✅ Se actualiza en tiempo real

### **Tipos de Alertas**
1. 🚨 **Emergencia** - Rojo
2. ⚠️ **Pelea Interna** - Naranja
3. 🥊 **Pelea Externa** - Rojo oscuro
4. 👮 **Fiscalización** - Azul
5. 📊 **Capacidad** - Ámbar
6. ℹ️ **Info** - Gris

### **Funcionalidades**
- ✅ Marcar todas como leídas
- ✅ Resolver alertas individuales
- ✅ Ver historial de alertas
- ✅ Información de quién reportó

---

## 🔐 Permisos del Navegador

### **Primera Vez**
1. Usuario hace clic en el botón de campana
2. Aparece mensaje: "Activa las Notificaciones"
3. Usuario hace clic en "🔔 Activar Notificaciones"
4. El navegador solicita permiso
5. Usuario acepta
6. Se envía notificación de prueba

### **Navegadores Compatibles**
- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari (iOS 16.4+)
- ✅ Opera
- ✅ Brave

---

## 📱 En Móviles

Las notificaciones funcionan igual que en desktop:
- Aparecen en la barra de notificaciones
- Sonido de alerta
- Vibración (si está habilitada)
- Al tocar, abre la app

---

## 🧪 Cómo Probar

1. **Agregar el componente** a un panel
2. **Abrir el panel** en el navegador
3. **Hacer clic** en la campana
4. **Activar notificaciones** cuando se solicite
5. **Ir al Panel Cadena**
6. **Reportar una emergencia**
7. **Verificar** que aparece la notificación push

---

## 💾 Almacenamiento

Las alertas se guardan en `localStorage` con la key `"alertas"`:

```json
[
  {
    "id": "1234567890",
    "tipo": "emergencia",
    "mensaje": "🚨 EMERGENCIA REPORTADA",
    "hora": "10:30:45 p.m.",
    "resuelta": false,
    "reportado_por": "Cadena",
    "leida": false
  }
]
```

---

## 🎨 Personalización

### **Cambiar Colores**
Edita la función `getColorTipo()` en el componente.

### **Cambiar Iconos**
Edita la función `getIconoTipo()` en el componente.

### **Cambiar Frecuencia de Actualización**
Línea 43: `setInterval(cargarAlertas, 3000)` - Cambiar 3000ms

---

## ⚠️ Notas Importantes

1. **HTTPS Requerido**: Las notificaciones push solo funcionan en HTTPS (o localhost)
2. **Permisos Persistentes**: Una vez concedidos, se mantienen
3. **Bloqueo del Usuario**: Si el usuario bloquea las notificaciones, debe habilitarlas manualmente en la configuración del navegador
4. **Límite de Notificaciones**: Algunos navegadores limitan el número de notificaciones simultáneas

---

## 🚀 Próximos Pasos

1. Agregar el componente a todos los paneles mencionados
2. Probar en diferentes navegadores
3. Verificar en móviles
4. Ajustar estilos según necesidad
