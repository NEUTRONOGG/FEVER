# 📦 INSTRUCCIONES PARA BUILD Y EXPORTACIÓN

## 🔧 PASO 1: Configuración (YA HECHO ✅)

El archivo `next.config.mjs` ya está configurado con:
```javascript
output: 'export'
```

---

## 🚀 PASO 2: Ejecutar Build

```bash
npm run build
```

**Esto generará:**
- Carpeta `out/` con todos los archivos estáticos
- HTML, CSS, JS optimizados
- Imágenes procesadas
- Assets listos para producción

---

## 📁 PASO 3: Estructura de la carpeta OUT

```
out/
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   ├── css/
│   │   └── media/
├── dashboard/
│   ├── index.html
│   ├── clientes/
│   ├── hostess/
│   ├── mesero/
│   ├── cadena/
│   ├── rp/
│   └── ...
├── login/
│   └── index.html
├── index.html
└── ...
```

---

## 📤 PASO 4: Exportar/Comprimir la carpeta OUT

### **Opción 1: Comprimir en ZIP**
```bash
# Desde la raíz del proyecto
zip -r crm-restaurante-build.zip out/
```

### **Opción 2: Comprimir en TAR.GZ**
```bash
tar -czf crm-restaurante-build.tar.gz out/
```

### **Opción 3: Copiar directamente**
```bash
# Copiar a otra ubicación
cp -r out/ /ruta/destino/
```

---

## 🌐 PASO 5: Desplegar

### **Opción A: Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### **Opción B: Netlify**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod --dir=out
```

### **Opción C: Servidor Web (Apache/Nginx)**
```bash
# 1. Comprimir
zip -r build.zip out/

# 2. Subir al servidor
scp build.zip usuario@servidor:/var/www/

# 3. En el servidor
cd /var/www/
unzip build.zip
mv out/* html/
```

### **Opción D: GitHub Pages**
```bash
# 1. Crear repositorio en GitHub
# 2. Subir la carpeta out/
git init
git add out/
git commit -m "Deploy"
git branch -M main
git remote add origin https://github.com/usuario/repo.git
git push -u origin main

# 3. En GitHub: Settings → Pages → Source: main branch / root
```

---

## ⚠️ IMPORTANTE: Variables de Entorno

**Antes de hacer build, asegúrate de tener:**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_de_supabase
```

**Estas variables deben estar en el servidor de producción también.**

---

## 🧪 PASO 6: Probar localmente antes de desplegar

```bash
# Instalar servidor estático
npm install -g serve

# Servir la carpeta out
serve out

# Abrir en navegador
# http://localhost:3000
```

---

## 📋 CHECKLIST ANTES DE BUILD

- [ ] Variables de entorno configuradas
- [ ] Supabase URL y Key correctas
- [ ] Todas las funcionalidades probadas
- [ ] No hay errores en consola
- [ ] Imágenes optimizadas
- [ ] `next.config.mjs` con `output: 'export'`

---

## 🎯 COMANDO COMPLETO (TODO EN UNO)

```bash
# 1. Build
npm run build

# 2. Probar localmente
npx serve out

# 3. Si todo funciona, comprimir
zip -r crm-restaurante-$(date +%Y%m%d).zip out/

# 4. Desplegar (elegir uno)
# Vercel: vercel --prod
# Netlify: netlify deploy --prod --dir=out
# Manual: subir el ZIP al servidor
```

---

## 📊 TAMAÑO APROXIMADO

```
Carpeta out/: ~15-30 MB
ZIP comprimido: ~5-10 MB
```

---

## 🔒 SEGURIDAD

**NUNCA incluyas en el build:**
- Archivos `.env` con keys privadas
- Credenciales de base de datos
- API keys privadas

**Solo usa:**
- `NEXT_PUBLIC_*` variables (son públicas)
- Supabase Anon Key (es segura para el cliente)

---

## ✅ RESULTADO FINAL

Después del build tendrás:
- ✅ Aplicación completamente estática
- ✅ Sin necesidad de Node.js en producción
- ✅ Puede servirse desde cualquier CDN
- ✅ Carga ultra rápida
- ✅ SEO optimizado

---

## 🚀 DESPLIEGUE RÁPIDO

```bash
# Opción más rápida: Vercel
npm run build
vercel --prod

# Listo! Tu app estará en:
# https://tu-proyecto.vercel.app
```

---

**¡Tu CRM está listo para producción!** 🎉
