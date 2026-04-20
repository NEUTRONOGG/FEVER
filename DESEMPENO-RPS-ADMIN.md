# 📊 Sistema de Desempeño de RPs - Admin

## Resumen

Sistema completo para **medir y analizar el desempeño de RPs** basado en las reservaciones procesadas con IA.

---

## 🎯 Características

### 1. **Procesamiento Automático**
- ✅ Detecta día y fecha del encabezado (ej: "MIÉRCOLES 25")
- ✅ Extrae RP e iniciales (ej: "Alejandro Maciel (AT)")
- ✅ Procesa lista completa de clientes
- ✅ Guarda en **Supabase Storage** con estructura de carpetas por fecha

### 2. **Almacenamiento**
- 📁 **Storage**: `reservaciones/{fecha}/{timestamp}-{archivo}.json`
- 📊 **Tabla Tracking**: `reservaciones_procesadas_tracking`
- 📈 **Tabla Desempeño**: `desempeno_rps`

### 3. **Vistas de Análisis**
- `vista_desempeno_rps_resumen`: Estadísticas globales por RP
- `vista_desempeno_diario`: Ranking diario de RPs

---

## 📋 Estructura de Datos

### Archivo JSON en Storage
```json
{
  "dia_semana": "MIÉRCOLES",
  "numero_dia": 25,
  "fecha": "2025-04-17",
  "reservaciones": [
    {
      "cliente_nombre": "Alejandro Maciel",
      "telefono": null,
      "hora": "20:00",
      "numero_personas": 8,
      "rp_nombre": "Alejandro Maciel",
      "rp_iniciales": "AT",
      "notas": null
    }
  ],
  "resumen_por_rp": {
    "Juan Pérez": {
      "iniciales": "JP",
      "total_reservaciones": 8
    }
  },
  "total_reservaciones": 15,
  "archivo_original": "FEVER_DATOS.xlsx",
  "fecha_procesamiento": "2025-04-17T22:30:45.123Z",
  "modelo_usado": "claude-3-5-haiku-20241022"
}
```

### Tabla: `reservaciones_procesadas_tracking`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL | ID único |
| fecha | DATE | Fecha de las reservaciones |
| dia_semana | VARCHAR | Día de la semana |
| rps_procesados | TEXT[] | Array de RPs procesados |
| total_reservaciones | INTEGER | Total de reservaciones |
| archivo_original | VARCHAR | Nombre del archivo subido |
| archivo_storage | VARCHAR | Ruta en Storage |
| fecha_procesamiento | TIMESTAMP | Cuándo se procesó |
| modelo_usado | VARCHAR | Modelo de Claude usado |

### Tabla: `desempeno_rps`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL | ID único |
| rp_nombre | VARCHAR | Nombre del RP |
| rp_iniciales | VARCHAR | Iniciales (ej: "AT") |
| fecha | DATE | Fecha de las reservaciones |
| total_reservaciones | INTEGER | Cuántas reservaciones hizo |
| total_personas | INTEGER | Total de personas |
| promedio_personas_por_reserva | DECIMAL | Promedio por reserva |
| fecha_procesamiento | TIMESTAMP | Cuándo se procesó |

---

## 🚀 Instalación

### Paso 1: Crear Tablas
Ejecuta en Supabase SQL Editor:
```sql
-- Copiar y pegar contenido de CREAR-TABLA-TRACKING-RESERVACIONES.sql
```

### Paso 2: Crear Storage Bucket
En Supabase Console → Storage:
1. Crear bucket: `reservaciones-procesadas`
2. Hacer privado (no público)

### Paso 3: Configurar Políticas
En Supabase Console → SQL Editor, ejecutar:
```sql
CREATE POLICY "Allow authenticated users to read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'reservaciones-procesadas' AND auth.role() = 'authenticated');

CREATE POLICY "Allow service role to upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'reservaciones-procesadas' AND auth.role() = 'service_role');
```

---

## 📊 Consultas Útiles

### Top 5 RPs por Total de Reservaciones
```sql
SELECT 
  rp_nombre,
  rp_iniciales,
  SUM(total_reservaciones) as total,
  SUM(total_personas) as personas,
  COUNT(DISTINCT fecha) as dias
FROM desempeno_rps
GROUP BY rp_nombre, rp_iniciales
ORDER BY total DESC
LIMIT 5;
```

### Desempeño por Día
```sql
SELECT 
  fecha,
  rp_nombre,
  rp_iniciales,
  total_reservaciones,
  total_personas,
  ROUND(promedio_personas_por_reserva, 2) as promedio
FROM desempeno_rps
WHERE fecha = '2025-04-17'
ORDER BY total_reservaciones DESC;
```

### Historial de Archivos Procesados
```sql
SELECT 
  fecha,
  dia_semana,
  total_reservaciones,
  array_length(rps_procesados, 1) as cantidad_rps,
  archivo_original,
  fecha_procesamiento
FROM reservaciones_procesadas_tracking
ORDER BY fecha_procesamiento DESC
LIMIT 20;
```

---

## 🔍 Visualización en Admin

### Panel de Desempeño (Próxima Implementación)
```
┌─────────────────────────────────────────┐
│  📊 DESEMPEÑO DE RPs                    │
├─────────────────────────────────────────┤
│  Período: [Selector de fechas]          │
│                                         │
│  🏆 TOP 5 RPs                          │
│  1. Juan Pérez (JP)      - 45 reservas │
│  2. Ana García (AG)      - 38 reservas │
│  3. Carlos López (CL)    - 32 reservas │
│  4. María Rodríguez (MR) - 28 reservas │
│  5. Pedro Martínez (PM)  - 25 reservas │
│                                         │
│  📈 Gráfica de Tendencia                │
│  [Gráfica de líneas por día]            │
│                                         │
│  📋 Tabla Detallada                     │
│  [Tabla con filtros por RP y fecha]     │
└─────────────────────────────────────────┘
```

---

## 🔧 Flujo Completo

1. **Ashton sube archivo** (Excel, PDF, imagen)
   ↓
2. **Claude IA procesa** y extrae:
   - Día y fecha
   - RPs e iniciales
   - Clientes y número de personas
   ↓
3. **API guarda en Storage**
   - Ruta: `reservaciones/{fecha}/{timestamp}.json`
   ↓
4. **API registra en BD**
   - Tabla: `reservaciones_procesadas_tracking`
   - Tabla: `desempeno_rps` (agregada)
   ↓
5. **Admin visualiza en panel**
   - Ranking de RPs
   - Gráficas de desempeño
   - Historial de archivos

---

## 📱 Próximas Mejoras

- [ ] Panel de desempeño en `/dashboard/admin/desempeno-rps`
- [ ] Gráficas con Chart.js o Recharts
- [ ] Exportar reportes a PDF/Excel
- [ ] Alertas de RPs con bajo desempeño
- [ ] Comparativa mes a mes
- [ ] Bonificación automática basada en desempeño

---

## ⚠️ Notas Importantes

- Los archivos en Storage son **privados** (no públicos)
- Los datos se guardan **automáticamente** al procesar
- Las iniciales se extraen del formato `(XX)` al final del nombre del RP
- La fecha se detecta del encabezado (ej: "MIÉRCOLES 25")
- Si no hay hora, se usa 20:00 por defecto
- Si no hay número de personas, se asume 2

---

## 🆘 Solución de Problemas

**P: No aparecen los archivos en Storage**
R: Verifica que el bucket `reservaciones-procesadas` exista y las políticas estén configuradas.

**P: No se guardan en la tabla de tracking**
R: Verifica que la tabla `reservaciones_procesadas_tracking` exista y tenga permisos.

**P: Las iniciales no se extraen correctamente**
R: Asegúrate que el formato sea `Nombre Apellido Nxpx (INICIALES)` con paréntesis.

**P: La fecha no se detecta**
R: El encabezado debe estar en formato `DÍA NÚMERO` (ej: "MIÉRCOLES 25").
