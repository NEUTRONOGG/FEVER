# 🔐 Contraseñas del Sistema CRM FEVER

## 📋 Contraseñas de Acceso

### **Panel de Administración**
- **Usuario**: Administrador
- **Contraseña**: `4DM1N2025!`
- **Acceso**: Dashboard completo con todas las funcionalidades

---

### **Panel de Hostess** 👥
- **Usuario**: Hostess
- **Contraseña**: `H0ST3SS2025`
- **Funciones**:
  - Registrar nuevos clientes
  - Asignar mesas disponibles
  - Gestionar fila de espera
  - Calificar servicio al finalizar

---

### **Panel de Mesero** 🍽️
- **Usuario**: Mesero
- **Contraseña**: `M3S3R02025`
- **Funciones**:
  - Ver mesas asignadas
  - Tomar órdenes (POS)
  - Agregar productos
  - Cerrar cuentas

---

### **Panel de Cadena** 🛡️
- **Usuario**: Cadena
- **Contraseña**: `C4D3N42025`
- **Funciones**:
  - Conteo de personas
  - Flujo de entrada/salida
  - Botón de emergencia
  - Reportes de seguridad

---

### **Panel de Relaciones Públicas (RP)** ✨
- **Sistema**: Login individual por RP
- **Contraseña**: Cada RP tiene su propia contraseña configurada
- **Funciones**:
  - Ver mesas atendidas
  - Autorizar cortesías limitadas
  - Ver historial de cortesías
  - Gestión de clientes VIP

---

## 🔒 Seguridad

### **Características de Seguridad:**
- ✅ Contraseñas únicas por rol
- ✅ Validación en tiempo real
- ✅ Mensajes de error claros
- ✅ Acceso restringido por rol
- ✅ Sesión guardada en localStorage

### **Recomendaciones:**
1. **No compartir contraseñas** entre diferentes roles
2. **Cambiar contraseñas** periódicamente (cada 3 meses)
3. **Mantener este archivo seguro** y no compartirlo públicamente
4. **Cerrar sesión** al terminar el turno

---

## 🔄 Cómo Cambiar las Contraseñas

Si necesitas cambiar las contraseñas, edita el archivo:
`/app/dashboard/selector-rol/page.tsx`

Busca la sección:
```typescript
const passwords = {
  hostess: "H0ST3SS2025",
  mesero: "M3S3R02025",
  cadena: "C4D3N42025"
}
```

Y actualiza las contraseñas según sea necesario.

Para la contraseña de Admin, busca:
```typescript
if (passwordAdmin === "4DM1N2025!") {
```

---

## 📱 Flujo de Acceso

### **1. Inicio de Sesión Principal**
- Usuario ingresa con credenciales de administrador
- Se valida contra la base de datos

### **2. Selector de Rol**
- Usuario ve las 4 opciones de rol
- Al hacer clic en Hostess, Mesero o Cadena, se solicita contraseña
- RP tiene su propio sistema de login

### **3. Acceso al Panel**
- Una vez validada la contraseña, se accede al panel correspondiente
- La sesión se mantiene hasta que el usuario cierre sesión

---

## ⚠️ IMPORTANTE

**Este archivo contiene información sensible. Mantenerlo seguro y NO subirlo a repositorios públicos.**

Agregar al `.gitignore`:
```
CONTRASEÑAS-SISTEMA.md
```

---

## 📞 Soporte

Si olvidas alguna contraseña o necesitas resetearla, contacta al administrador del sistema.

**Última actualización**: Octubre 2025
