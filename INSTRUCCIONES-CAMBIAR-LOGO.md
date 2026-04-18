# 🎨 CAMBIAR LOGO DE FEVER

## 📝 PASO 1: GUARDAR LA IMAGEN

1. **Guarda la imagen del logo en:**
   ```
   /Users/mac/Downloads/crm-restaurante/public/images/fever-logo.png
   ```

2. **O si prefieres formato SVG (mejor calidad):**
   ```
   /Users/mac/Downloads/crm-restaurante/public/images/fever-logo.svg
   ```

---

## 🔧 PASO 2: YO ACTUALIZARÉ EL CÓDIGO

Una vez que guardes la imagen, yo actualizaré automáticamente:

### **Archivos a modificar:**

1. **app/dashboard/layout.tsx**
   - Logo en sidebar (desktop)
   - Logo en header móvil

2. **app/login/page.tsx**
   - Logo en página de login

3. **app/dashboard/selector-rol/page.tsx**
   - Logo en selector de rol

4. **Otros paneles** (hostess, mesero, etc.)
   - Si tienen logo

---

## 🎨 CÓDIGO QUE USARÉ

### **Opción 1: Con Next.js Image (RECOMENDADO)**

```typescript
import Image from "next/image"

<div className="flex items-center gap-3">
  <Image
    src="/images/fever-logo.png"
    alt="FEVER Logo"
    width={120}
    height={40}
    className="object-contain"
  />
</div>
```

### **Opción 2: Con img HTML**

```typescript
<div className="flex items-center gap-3">
  <img
    src="/images/fever-logo.png"
    alt="FEVER Logo"
    className="h-10 w-auto object-contain"
  />
</div>
```

---

## 📐 TAMAÑOS RECOMENDADOS

### **Para PNG:**
```
Sidebar: 120x40px o 150x50px
Header móvil: 100x35px
Login: 200x70px
```

### **Para SVG:**
```
Cualquier tamaño (escala sin perder calidad)
Recomendado: archivo original del diseñador
```

---

## 🎯 UBICACIONES DEL LOGO

### **1. Sidebar (Desktop)**
```
┌─────────────────────┐
│  [LOGO FEVER]       │
│  The Golden Age     │
├─────────────────────┤
│ Dashboard           │
│ Clientes            │
│ ...                 │
└─────────────────────┘
```

### **2. Header Móvil**
```
┌─────────────────────┐
│ [☰] [LOGO] [  ]    │
└─────────────────────┘
```

### **3. Página de Login**
```
┌─────────────────────┐
│                     │
│    [LOGO GRANDE]    │
│   The Golden Age    │
│                     │
│  [Login Form]       │
└─────────────────────┘
```

---

## ✅ CHECKLIST

```
☐ 1. Guardar imagen en /public/images/fever-logo.png
☐ 2. Confirmar que se guardó correctamente
☐ 3. Avisar para que actualice el código
☐ 4. Verificar en navegador
☐ 5. ✅ Logo actualizado en toda la app
```

---

## 🚀 DESPUÉS DE GUARDAR LA IMAGEN

**Avísame y yo actualizaré automáticamente:**

1. app/dashboard/layout.tsx
2. app/login/page.tsx
3. Todos los paneles necesarios

---

## 💡 TIPS

### **Si el logo tiene fondo:**
```
Usar PNG con transparencia
O agregar fondo en CSS
```

### **Si el logo es muy grande:**
```
Redimensionar antes de guardar
O usar CSS para ajustar tamaño
```

### **Si quieres diferentes versiones:**
```
fever-logo-light.png (fondo claro)
fever-logo-dark.png (fondo oscuro)
fever-logo-icon.png (solo ícono)
```

---

**¡Guarda la imagen y avísame para actualizar el código!** 🎨✅
