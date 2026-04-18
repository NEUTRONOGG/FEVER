# ✅ LOGO DE FEVER ACTUALIZADO

## 🎨 CÓDIGO YA ACTUALIZADO

He modificado todos los archivos para usar el nuevo logo de FEVER.

---

## 📝 SOLO NECESITAS HACER ESTO:

### **Guardar la imagen del logo en:**

```
/Users/mac/Downloads/crm-restaurante/public/images/fever-logo.png
```

**Pasos:**

1. Descarga/guarda la imagen del logo de FEVER
2. Renómbrala a: `fever-logo.png`
3. Muévela a: `/Users/mac/Downloads/crm-restaurante/public/images/`
4. ✅ Listo!

---

## 📁 ARCHIVOS YA MODIFICADOS

### **1. app/dashboard/layout.tsx** ✅
```typescript
// Sidebar (Desktop)
<Image
  src="/images/fever-logo.png"
  alt="FEVER Logo"
  width={150}
  height={50}
  className="object-contain"
  priority
/>

// Header (Móvil)
<Image
  src="/images/fever-logo.png"
  alt="FEVER"
  width={100}
  height={35}
  className="object-contain"
  priority
/>
```

### **2. app/login/page.tsx** ✅
```typescript
// Logo grande en login
<Image
  src="/images/fever-logo.png"
  alt="FEVER Logo"
  width={250}
  height={80}
  className="object-contain mx-auto"
  priority
/>
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
│ Mesas               │
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
│   [LOGO GRANDE]     │
│   The Golden Age    │
│                     │
│  [Selecciona rol]   │
└─────────────────────┘
```

---

## 📐 TAMAÑOS CONFIGURADOS

```
Sidebar: 150x50px
Header móvil: 100x35px
Login: 250x80px
```

**Nota:** Next.js Image optimiza automáticamente, así que puedes usar una imagen más grande y se ajustará.

---

## 🚀 VERIFICAR

### **1. Guardar imagen:**
```bash
# Verificar que existe
ls -la /Users/mac/Downloads/crm-restaurante/public/images/fever-logo.png
```

### **2. Recargar aplicación:**
```
http://localhost:3000/login
```

### **3. Verificar en:**
```
✅ Página de login
✅ Sidebar del dashboard
✅ Header móvil
```

---

## 🎨 RECOMENDACIONES PARA LA IMAGEN

### **Formato:**
```
✅ PNG con transparencia (recomendado)
✅ SVG (mejor calidad, cualquier tamaño)
⚠️ JPG (solo si tiene fondo)
```

### **Tamaño:**
```
Mínimo: 300x100px
Recomendado: 500x170px
Máximo: 1000x340px
```

### **Fondo:**
```
✅ Transparente (PNG)
✅ Fondo oscuro (para tema oscuro)
```

---

## 🔧 SI LA IMAGEN NO APARECE

### **Problema 1: Archivo no encontrado**
```bash
# Verificar ruta
ls public/images/fever-logo.png

# Si no existe, crear carpeta
mkdir -p public/images
```

### **Problema 2: Caché del navegador**
```
Ctrl+Shift+R (hard refresh)
O
Cmd+Shift+R (Mac)
```

### **Problema 3: Nombre incorrecto**
```
Debe ser exactamente: fever-logo.png
No: Fever-Logo.png
No: fever_logo.png
No: feverlogo.png
```

---

## 📊 ESTRUCTURA DE CARPETAS

```
crm-restaurante/
├── public/
│   └── images/
│       └── fever-logo.png  ← AQUÍ
├── app/
│   ├── dashboard/
│   │   └── layout.tsx  ✅ Actualizado
│   └── login/
│       └── page.tsx  ✅ Actualizado
└── ...
```

---

## ✅ CHECKLIST

```
☐ 1. Descargar/tener imagen del logo
☐ 2. Renombrar a: fever-logo.png
☐ 3. Mover a: /public/images/
☐ 4. Verificar que existe
☐ 5. Recargar navegador (Ctrl+Shift+R)
☐ 6. ✅ Ver logo en login
☐ 7. ✅ Ver logo en sidebar
☐ 8. ✅ Ver logo en header móvil
```

---

## 🎯 ALTERNATIVA: USAR SVG

Si tienes el logo en SVG (mejor calidad):

```
1. Guardar como: fever-logo.svg
2. Cambiar en código:
   src="/images/fever-logo.svg"
3. SVG escala perfectamente a cualquier tamaño
```

---

## ✅ RESUMEN

```
╔════════════════════════════════════════════════════╗
║   CÓDIGO YA ACTUALIZADO:                           ║
║   ✅ app/dashboard/layout.tsx                      ║
║   ✅ app/login/page.tsx                            ║
║                                                    ║
║   SOLO FALTA:                                      ║
║   📁 Guardar imagen en:                            ║
║      /public/images/fever-logo.png                 ║
║                                                    ║
║   LUEGO:                                           ║
║   🔄 Recargar navegador                            ║
║   ✅ Logo aparecerá automáticamente                ║
╚════════════════════════════════════════════════════╝
```

---

**¡Código listo! Solo guarda la imagen y recarga el navegador.** 🎨✅🚀
