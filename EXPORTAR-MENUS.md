# 🔥 Exportar Menús FEVER como Sitio Estático

## 📦 Generar Build Estático

### Opción 1: Usando el script (Recomendado)
```bash
./build-menus.sh
```

### Opción 2: Manual
```bash
# Backup de configuración actual
mv next.config.mjs next.config.backup.mjs

# Usar configuración de exportación
cp next.config.export.mjs next.config.mjs

# Build
npm run build

# Restaurar configuración
mv next.config.backup.mjs next.config.mjs
```

## 📁 Resultado

Después del build, tendrás una carpeta `out-menus/` con:

```
out-menus/
├── menu/
│   └── index.html          → Selector de versiones
├── menu-1/
│   └── index.html          → Bold Grid
├── menu-2/
│   └── index.html          → Premium Animated
├── menu-3/
│   └── index.html          → Minimal Elegant
├── _next/
│   ├── static/             → CSS, JS optimizados
│   └── ...
├── images/
│   ├── fever-logo.png
│   ├── fever-bg-1.png
│   ├── fever-bg-2.png
│   └── fever-bg-3.png
└── favicon.ico
```

## 🚀 Probar Localmente

```bash
cd out-menus
python3 -m http.server 8000
```

Abre: `http://localhost:8000/menu`

## 📤 Desplegar

### GitHub Pages
1. Sube la carpeta `out-menus` a tu repositorio
2. Settings → Pages → Selecciona la carpeta
3. ¡Listo!

### Netlify
```bash
netlify deploy --prod --dir=out-menus
```

O arrastra la carpeta a netlify.com

### Vercel
```bash
vercel --prod out-menus
```

### Servidor Web (Apache/Nginx)
```bash
# Copiar archivos
scp -r out-menus/* usuario@servidor:/var/www/html/menu/

# O con rsync
rsync -avz out-menus/ usuario@servidor:/var/www/html/menu/
```

## 🌐 URLs Finales

Si despliegas en `tudominio.com`:
- `tudominio.com/menu/` → Selector
- `tudominio.com/menu-1/` → Bold Grid
- `tudominio.com/menu-2/` → Premium Animated
- `tudominio.com/menu-3/` → Minimal Elegant

## ✨ Características del Build

- ✅ **HTML estático** - Sin servidor Node.js necesario
- ✅ **CSS optimizado** - Minificado y comprimido
- ✅ **JavaScript optimizado** - Code splitting automático
- ✅ **Imágenes optimizadas** - Formatos modernos
- ✅ **SEO friendly** - Meta tags incluidos
- ✅ **Performance** - Carga ultra rápida
- ✅ **Offline ready** - Service worker incluido

## 🔧 Configuración

El archivo `next.config.export.mjs` contiene:

```javascript
{
  output: 'export',           // Genera HTML estático
  distDir: 'out-menus',      // Carpeta de salida
  images: {
    unoptimized: true,       // Imágenes sin optimización server-side
  },
  trailingSlash: true,       // URLs con / al final
}
```

## 📝 Notas Importantes

1. **No incluye el CRM** - Solo los menús digitales
2. **Sin base de datos** - Todo es estático
3. **Sin API calls** - No hay llamadas a Supabase
4. **Componentes React** - Hidratados en el cliente
5. **Rutas estáticas** - Cada página es un HTML

## 🎯 Ventajas

- Hosting gratis (GitHub Pages, Netlify, Vercel)
- Carga instantánea
- Sin costos de servidor
- CDN global automático
- HTTPS gratis
- 99.9% uptime

## 🔄 Actualizar Contenido

1. Modifica los archivos en `app/menu*/page.tsx`
2. Ejecuta `./build-menus.sh`
3. Sube la nueva carpeta `out-menus`

## 📞 Soporte

Para dudas sobre el build o despliegue, contactar al equipo de desarrollo.

---

**FEVER Club** · León, Gto · The Golden Age
