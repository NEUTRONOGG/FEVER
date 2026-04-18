# Sistema de Distribución de Personas - Instrucciones

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de distribución de personas en todos los formularios de reservaciones y asignación de mesas, con validación inteligente en tiempo real.

## 🎯 Cambios Implementados

### 1. ❌ Email Eliminado
- **Removido de**: Formularios de hostess para asignación de mesas
- **Razón**: Campo innecesario que ralentizaba el proceso
- **Impacto**: Formularios más rápidos y simples

### 2. ✅ Campos de Niños y Niñas Agregados

Ahora todos los formularios incluyen:
- 👨 **Hombres** (numero_hombres)
- 👩 **Mujeres** (numero_mujeres)
- 👦 **Niños** (numero_ninos) - **NUEVO**
- 👧 **Niñas** (numero_ninas) - **NUEVO**

### 3. ✅ Validación Inteligente de Suma

**Regla de Validación:**
```
Hombres + Mujeres + Niños + Niñas = Total de Personas
```

**Comportamiento:**
- ✅ **Verde**: Suma correcta → Botón habilitado
- ⚠️ **Rojo**: Suma incorrecta → Botón deshabilitado
- 🔄 **Tiempo real**: Validación instantánea al cambiar cualquier valor

## 🚀 Instalación

### Paso 1: Ejecutar Script SQL

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor**
3. Abre el archivo `ACTUALIZAR-RESERVACIONES-NINOS.sql`
4. Copia todo el contenido y pégalo en el editor
5. Haz clic en **Run** para ejecutar

**El script hará:**
- ✅ Agregar columnas `numero_ninos` y `numero_ninas` a la tabla `reservaciones`
- ✅ Crear índices para optimizar consultas
- ✅ Crear vista de análisis `vista_distribucion_reservaciones`
- ✅ Actualizar registros existentes con valores por defecto (0)

### Paso 2: Verificar la Instalación

Ejecuta esta consulta para verificar:

```sql
-- Ver estructura de la tabla
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'reservaciones'
AND column_name IN ('numero_ninos', 'numero_ninas');

-- Ver datos de ejemplo
SELECT * FROM vista_distribucion_reservaciones LIMIT 5;
```

## 📁 Archivos Modificados

### 1. `/app/dashboard/hostess/page.tsx`
**Cambios:**
- ❌ Eliminado campo de email
- ✅ Agregados estados: `numeroNinos`, `numeroNinas`
- ✅ Grid de 4 selectores con emojis
- ✅ Validación visual en tiempo real
- ✅ Botón deshabilitado si suma incorrecta

### 2. `/app/dashboard/reservaciones/page.tsx`
**Cambios:**
- ✅ Agregados campos `numero_ninos`, `numero_ninas` al estado
- ✅ Grid de 4 selectores con validación
- ✅ Inserción en BD incluye nuevos campos
- ✅ Limpieza de formulario actualizada

### 3. `/app/dashboard/rp/page.tsx`
**Cambios:**
- ✅ Mismos cambios que reservaciones
- ✅ Validación consistente
- ✅ Interfaz con colores púrpura (marca RP)

## 🎨 Interfaz de Usuario

### Ejemplo Visual

```
┌─────────────────────────────────────────────┐
│ Total Personas: 6                           │
├───────────┬───────────┬───────────┬─────────┤
│ 👨 H: 2   │ 👩 M: 2   │ 👦 N: 1   │ 👧 N: 1 │
└───────────┴───────────┴───────────┴─────────┘

✓ Distribución correcta: 6 de 6 personas
```

### Estados del Indicador

**✅ Correcto (Verde):**
```
✓ Distribución correcta: 6 de 6 personas
```

**⚠️ Incorrecto (Rojo):**
```
⚠ La suma debe ser 6 personas (actual: 5)
```

## 🔧 Características Técnicas

### Selectores Dinámicos
Los selectores se ajustan automáticamente al total:
- Si seleccionas **6 personas**, cada selector muestra opciones de **0 a 6**
- Si cambias a **10 personas**, los selectores muestran **0 a 10**

### Validación en Tiempo Real
```javascript
const total = numeroHombres + numeroMujeres + numeroNinos + numeroNinas
const esValido = total === numeroPersonas
```

### Botón Inteligente
```javascript
disabled={
  !nuevoCliente.nombre || 
  !nuevoCliente.edad || 
  !nuevoCliente.genero ||
  (numeroHombres + numeroMujeres + numeroNinos + numeroNinas) !== numeroPersonas
}
```

## 📊 Base de Datos

### Estructura Actualizada

```sql
CREATE TABLE reservaciones (
  id SERIAL PRIMARY KEY,
  cliente_nombre VARCHAR(255),
  fecha DATE,
  hora TIME,
  numero_personas INTEGER,
  numero_hombres INTEGER DEFAULT 0,
  numero_mujeres INTEGER DEFAULT 0,
  numero_ninos INTEGER DEFAULT 0,    -- NUEVO
  numero_ninas INTEGER DEFAULT 0,    -- NUEVO
  rp_nombre VARCHAR(100),
  notas TEXT,
  estado VARCHAR(50),
  creado_por VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Vista de Análisis

La vista `vista_distribucion_reservaciones` proporciona:
- Suma automática de todas las categorías
- Validación de consistencia
- Análisis por RP, fecha, estado

**Ejemplo de uso:**
```sql
-- Ver reservaciones con inconsistencias
SELECT * FROM vista_distribucion_reservaciones
WHERE validacion = 'Inconsistente';

-- Estadísticas por RP
SELECT 
  rp_nombre,
  COUNT(*) as total_reservaciones,
  SUM(numero_ninos + numero_ninas) as total_menores
FROM vista_distribucion_reservaciones
WHERE estado = 'pendiente'
GROUP BY rp_nombre;
```

## 🎯 Casos de Uso

### Caso 1: Familia con Niños
```
Total: 4 personas
- Hombres: 1 (papá)
- Mujeres: 1 (mamá)
- Niños: 1 (hijo)
- Niñas: 1 (hija)
= 4 ✓ Válido
```

### Caso 2: Grupo de Adultos
```
Total: 6 personas
- Hombres: 3
- Mujeres: 3
- Niños: 0
- Niñas: 0
= 6 ✓ Válido
```

### Caso 3: Evento Infantil
```
Total: 10 personas
- Hombres: 2 (padres)
- Mujeres: 2 (madres)
- Niños: 3
- Niñas: 3
= 10 ✓ Válido
```

## ⚠️ Validaciones y Restricciones

### Reglas de Negocio
1. **Suma obligatoria**: La suma SIEMPRE debe ser igual al total
2. **Valores mínimos**: Todos los campos aceptan 0
3. **Valores máximos**: Limitados al total de personas seleccionado
4. **Campos requeridos**: Nombre del cliente + distribución correcta

### Mensajes de Error
- ❌ "La suma debe ser X personas (actual: Y)"
- ❌ Botón deshabilitado hasta que la suma sea correcta
- ✅ "Distribución correcta: X de X personas"

## 🐛 Solución de Problemas

### Problema: No aparecen los selectores de niños/niñas
**Solución**: 
1. Verifica que ejecutaste el script SQL
2. Recarga la página (Ctrl/Cmd + R)
3. Limpia caché del navegador

### Problema: El botón no se habilita
**Solución**:
1. Verifica que la suma sea exacta
2. Completa todos los campos requeridos (nombre, edad, género)
3. Revisa el indicador visual (debe estar verde)

### Problema: Error al guardar en BD
**Solución**:
1. Verifica que las columnas existan en Supabase
2. Ejecuta la consulta de verificación
3. Revisa los logs de Supabase

## 📈 Métricas y Análisis

### Consultas Útiles

**Distribución por género y edad:**
```sql
SELECT 
  fecha,
  SUM(numero_hombres) as hombres,
  SUM(numero_mujeres) as mujeres,
  SUM(numero_ninos) as ninos,
  SUM(numero_ninas) as ninas,
  SUM(numero_personas) as total
FROM reservaciones
WHERE fecha >= CURRENT_DATE
GROUP BY fecha
ORDER BY fecha;
```

**Reservaciones con menores:**
```sql
SELECT 
  cliente_nombre,
  fecha,
  hora,
  (numero_ninos + numero_ninas) as total_menores,
  numero_personas
FROM reservaciones
WHERE (numero_ninos + numero_ninas) > 0
AND estado = 'pendiente'
ORDER BY fecha, hora;
```

## 🎓 Mejores Prácticas

### Para Hostess
1. ✅ Siempre verifica el indicador visual antes de asignar
2. ✅ Pregunta específicamente por niños para registro preciso
3. ✅ Usa la distribución para asignar mesas apropiadas

### Para RPs
1. ✅ Registra la distribución exacta al crear reservaciones
2. ✅ Usa la info de menores para preparar amenidades
3. ✅ Revisa la vista de análisis para planificar eventos

### Para Administradores
1. ✅ Monitorea la vista `vista_distribucion_reservaciones`
2. ✅ Revisa inconsistencias periódicamente
3. ✅ Usa las métricas para análisis de público

## 📞 Soporte

Si encuentras problemas:
1. Verifica que el script SQL se ejecutó correctamente
2. Revisa la consola del navegador (F12) para errores
3. Verifica la conexión con Supabase
4. Consulta los logs de la aplicación

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado en Supabase
- [ ] Columnas `numero_ninos` y `numero_ninas` creadas
- [ ] Vista `vista_distribucion_reservaciones` disponible
- [ ] Formularios muestran los 4 selectores
- [ ] Validación visual funciona (verde/rojo)
- [ ] Botón se deshabilita con suma incorrecta
- [ ] Datos se guardan correctamente en BD
- [ ] Email eliminado de formularios de hostess

## 🎉 Resultado Final

Un sistema robusto y fácil de usar que:
- ✅ Elimina campos innecesarios (email)
- ✅ Agrega información valiosa (niños/niñas)
- ✅ Valida en tiempo real
- ✅ Previene errores de captura
- ✅ Facilita análisis y reportes
- ✅ Mejora la experiencia del usuario
