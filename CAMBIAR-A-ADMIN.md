# 🔑 CAMBIAR A ADMINISTRADOR

## OPCIÓN 1: Desde la Consola del Navegador (MÁS RÁPIDO)

1. **Presiona F12** (abrir consola)
2. **Ve a la pestaña "Console"**
3. **Pega esto y presiona Enter**:

```javascript
localStorage.setItem('userRole', 'admin')
localStorage.setItem('userName', 'Administrador')
location.reload()
```

4. **La página se recargará** y ahora serás Administrador ✅

---

## OPCIÓN 2: Logout y Login como Admin

1. **Click en el botón de Logout** (abajo en el sidebar)
2. **Ve a Login**
3. **Ingresa como Administrador**

---

## VERIFICAR QUE ERES ADMIN

Después de cambiar, deberías ver:
- ✅ En el sidebar: **"Administrador"** (no "Usuario RP")
- ✅ Acceso a todas las secciones del CRM

---

## ⚡ DESPUÉS DE SER ADMIN

1. **Ejecuta el SQL** `FIX-FINAL-URGENTE.sql` en Supabase
2. **Recarga la página** (F5)
3. **Intenta crear un cliente**
4. **Debería funcionar** ✅

---

**¡USA LA OPCIÓN 1 (CONSOLA) - ES MÁS RÁPIDO!** 🚀
