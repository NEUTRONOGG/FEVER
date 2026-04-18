# 🔐 CREDENCIALES DE RPs - FEVER

## 📋 Lista de RPs y Contraseñas

| # | Nombre RP | Contraseña | Límites por Período |
|---|-----------|------------|---------------------|
| 1 | **Elsa Vela** | `elsa2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 2 | **Leah Vazquez** | `leah2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 3 | **Emiliano Fox** | `emiliano2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 4 | **Oscar Navarro** | `oscar2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 5 | **Patricio García** | `patricio2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 6 | **Silvana Noriega** | `silvana2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 7 | **Fernanda Lira** | `fernanda2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 8 | **Daniela Navarro** | `daniela2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 9 | **Ximena Muñoz** | `ximena2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 10 | **Milton Guerrero** | `milton2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 11 | **Alejandra Urteaga** | `alejandra2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 12 | **Regina Rodríguez** | `regina2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |
| 13 | **Diego Oliveros** | `diego2025` | 5 shots, 3 perlas, 1 desc, 10 bienvenida |

---

## 🌐 URL de Acceso

**Login de RPs:** https://fevermx.site/dashboard/rp-login

---

## 🎯 Límites por Defecto

Cada RP tiene los siguientes límites por período:
- 🥃 **Shots Regulares**: 5 por período
- 💎 **Perlas Negras**: 3 por período
- 🎫 **Descuento Botella**: 1 por período
- 🍾 **Shots Bienvenida**: 10 por período

---

## 📝 Instrucciones para RPs

1. Ir a: https://fevermx.site/dashboard/rp-login
2. Ingresar su nombre completo (ej: "Elsa Vela")
3. Ingresar su contraseña (ej: "elsa2025")
4. Hacer clic en "Iniciar Sesión"

---

## 🔧 Cambiar Contraseñas

Para cambiar la contraseña de un RP, ejecuta en Supabase:

```sql
UPDATE limites_cortesias_rp 
SET password = 'nueva_contraseña' 
WHERE rp_nombre = 'Nombre del RP';
```

---

## 📊 Monitoreo

Los administradores pueden ver las métricas de cada RP en:
- **Métricas RPs**: `/dashboard/rp-metricas`
- **Dashboard de Bonos**: `/dashboard/bonos`

---

## ⚠️ IMPORTANTE

- ✅ Mantén estas credenciales seguras
- ✅ Comparte solo con los RPs correspondientes
- ✅ Cambia las contraseñas periódicamente
- ✅ Los límites se resetean automáticamente cada día

---

**Fecha de creación:** Octubre 28, 2025
**Sistema:** FEVER CRM
