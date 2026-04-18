# Plan de Mejoras CRM - FEVER

## 📋 Resumen de Funcionalidades Solicitadas

### 1. CRM ADMIN - Perfil de Cliente
- [ ] **Consumo Total** en vista de perfil
- [ ] **Calificación Promedio** visible en perfil
- [ ] **Dashboard de Clientes**: Mostrar calificación y racha
- [ ] **Ordenamiento**: Por calificación de usuario y ticket promedio

### 2. MESAS
- [ ] **Consumo Real por Mesa**: Mostrar total consumido
- [ ] **Historial al Clic**: Ver detalle de consumos al hacer clic en mesa
- [ ] **Integración con Tickets**: Datos reales desde tabla tickets

### 3. HISTORIAL DE CONSUMOS
- [ ] **Por Cliente**: Ver todos los consumos históricos de un cliente
- [ ] **Detalles**: Fecha, hora, mesa, items, total
- [ ] **Filtros**: Por fecha, rango, tipo

### 4. RPs - Métricas y Desempeño
- [ ] **Reservas vs Asistencia**: Medir conversión
- [ ] **Calificación Promedio**: De sus mesas
- [ ] **Consumo por Mesas**: RPs que mueven más dinero
- [ ] **Mesas por Período**: Semana y mes
- [ ] **Ranking de RPs**: Mejor desempeño

### 5. BONOS - Dashboard de Desempeño
- [ ] **Métricas de Desempeño**: Por RP
- [ ] **Mesas Totales**: Quién metió más mesas
- [ ] **Promedio de Consumo**: Por RP
- [ ] **Mejor RP**: Ranking general

### 6. RP - Menú
- [ ] **Acceso al Menú**: RP puede mostrar menú a clientes
- [ ] **Vista Optimizada**: Para mostrar en dispositivo

---

## 🎯 Implementación por Fases

### FASE 1: CRM Admin - Perfil y Dashboard de Clientes ✅

#### Archivos a Modificar:
- `/app/dashboard/clientes/page.tsx`
- `/lib/supabase-clientes.ts`

#### Funcionalidades:
1. **Agregar Consumo Total en Perfil**
   ```typescript
   // Obtener suma de tickets del cliente
   const { data: tickets } = await supabase
     .from('tickets')
     .select('total')
     .eq('cliente_id', clienteId)
   
   const consumoTotal = tickets.reduce((sum, t) => sum + t.total, 0)
   ```

2. **Mostrar Calificación Promedio**
   ```typescript
   // Obtener calificaciones del cliente
   const { data: calificaciones } = await supabase
     .from('calificaciones_clientes')
     .select('*')
     .eq('cliente_id', clienteId)
   
   const promedio = calcularPromedioCalificaciones(calificaciones)
   ```

3. **Agregar Racha en Dashboard**
   - Mostrar visitas consecutivas
   - Icono de fuego 🔥 si tiene racha activa

4. **Ordenamiento**
   - Dropdown para ordenar por:
     - Calificación (mayor a menor)
     - Ticket promedio (mayor a menor)
     - Visitas totales
     - Consumo total

---

### FASE 2: Mesas - Consumo Real e Historial

#### Archivos a Modificar:
- `/app/dashboard/mesas-clientes/page.tsx`
- `/app/dashboard/mesas-consumo/page.tsx`

#### Funcionalidades:
1. **Consumo Real por Mesa**
   ```typescript
   // Calcular consumo actual de la mesa
   const { data: tickets } = await supabase
     .from('tickets')
     .select('total')
     .eq('mesa_numero', mesaNumero)
     .gte('created_at', mesaAsignacion)
   ```

2. **Dialog de Historial al Clic**
   - Mostrar todos los items consumidos
   - Total acumulado
   - Tiempo en mesa
   - Botón para ver más detalles

3. **Indicador Visual**
   - Badge con consumo actual
   - Color según monto (verde < $500, amarillo < $1000, rojo > $1000)

---

### FASE 3: Historial de Consumos por Cliente

#### Archivos a Crear/Modificar:
- `/app/dashboard/clientes/[id]/historial/page.tsx` (nuevo)
- Componente `HistorialConsumos.tsx`

#### Funcionalidades:
1. **Vista de Historial**
   ```typescript
   const { data: historial } = await supabase
     .from('tickets')
     .select('*')
     .eq('cliente_id', clienteId)
     .order('created_at', { ascending: false })
   ```

2. **Detalles por Ticket**
   - Fecha y hora
   - Mesa número
   - Items consumidos
   - Total
   - Mesero que atendió
   - RP asociado

3. **Estadísticas**
   - Total gastado histórico
   - Ticket promedio
   - Ticket más alto
   - Frecuencia de visitas

---

### FASE 4: RPs - Métricas Completas

#### Archivos a Crear:
- `/app/dashboard/rp-metricas/page.tsx` (nuevo)
- `/app/dashboard/bonos/page.tsx` (nuevo)

#### Funcionalidades:

**1. Reservas vs Asistencia**
```sql
SELECT 
  rp_nombre,
  COUNT(*) as total_reservas,
  COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as asistencias,
  ROUND(COUNT(CASE WHEN estado = 'confirmada' THEN 1 END)::numeric / COUNT(*) * 100, 2) as tasa_conversion
FROM reservaciones
GROUP BY rp_nombre
```

**2. Calificación Promedio de Mesas**
```sql
SELECT 
  m.rp,
  AVG(cc.calificacion_promedio) as calificacion_promedio
FROM mesas m
JOIN calificaciones_clientes cc ON m.cliente_id = cc.cliente_id
WHERE m.rp IS NOT NULL
GROUP BY m.rp
```

**3. Consumo por RP**
```sql
SELECT 
  t.rp_nombre,
  COUNT(DISTINCT t.mesa_numero) as total_mesas,
  SUM(t.total) as consumo_total,
  AVG(t.total) as ticket_promedio
FROM tickets t
WHERE t.rp_nombre IS NOT NULL
GROUP BY t.rp_nombre
ORDER BY consumo_total DESC
```

**4. Mesas por Período**
```sql
-- Semana
SELECT rp_nombre, COUNT(*) as mesas_semana
FROM tickets
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY rp_nombre

-- Mes
SELECT rp_nombre, COUNT(*) as mesas_mes
FROM tickets
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY rp_nombre
```

---

### FASE 5: Dashboard de Bonos

#### Componentes:
1. **Ranking de RPs**
   - Top 5 RPs por mesas
   - Top 5 por consumo
   - Top 5 por calificación

2. **Métricas Individuales**
   - Mesas totales (semana/mes)
   - Consumo generado
   - Ticket promedio
   - Tasa de conversión reservas
   - Calificación promedio

3. **Cálculo de Bonos**
   ```typescript
   const calcularBono = (rp: RP) => {
     const baseBonus = 1000
     const mesasBonus = rp.mesas_mes * 50
     const consumoBonus = (rp.consumo_total / 10000) * 100
     const calificacionBonus = rp.calificacion_promedio * 200
     
     return baseBonus + mesasBonus + consumoBonus + calificacionBonus
   }
   ```

4. **Visualización**
   - Cards con métricas
   - Gráficas de barras comparativas
   - Tabla de ranking
   - Badges de logros

---

### FASE 6: RP - Acceso al Menú

#### Archivos a Modificar:
- `/app/dashboard/rp/page.tsx`

#### Funcionalidades:
1. **Botón "Ver Menú"**
   - En el dashboard del RP
   - Abre modal o página nueva

2. **Vista de Menú Optimizada**
   - Categorías colapsables
   - Imágenes de productos
   - Precios visibles
   - Descripciones
   - Búsqueda rápida

3. **Modo Presentación**
   - Pantalla completa
   - Navegación táctil
   - Zoom en imágenes
   - Filtros por categoría

---

## 📊 Estructura de Datos Necesaria

### Tablas Existentes a Usar:
- ✅ `clientes`
- ✅ `tickets`
- ✅ `mesas`
- ✅ `reservaciones`
- ✅ `calificaciones_clientes`
- ✅ `productos`

### Nuevas Columnas/Índices:
```sql
-- Agregar RP a tickets si no existe
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS rp_nombre VARCHAR(100);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_tickets_cliente_id ON tickets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tickets_rp_nombre ON tickets(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_calificaciones_cliente_id ON calificaciones_clientes(cliente_id);
```

---

## 🎨 Componentes UI a Crear

### 1. `ClientePerfilCard.tsx`
- Consumo total
- Calificación con estrellas
- Racha con icono de fuego
- Gráfica de consumo histórico

### 2. `MesaConsumoCard.tsx`
- Badge con consumo actual
- Indicador de tiempo
- Botón para ver historial

### 3. `HistorialConsumosTable.tsx`
- Tabla con paginación
- Filtros por fecha
- Exportar a CSV

### 4. `RPMetricasCard.tsx`
- Métricas principales
- Gráficas de desempeño
- Comparativa con otros RPs

### 5. `BonosDashboard.tsx`
- Ranking de RPs
- Cálculo de bonos
- Logros y badges

### 6. `MenuViewer.tsx`
- Vista de menú optimizada
- Modo presentación
- Búsqueda y filtros

---

## 🚀 Orden de Implementación Recomendado

### Prioridad Alta (Implementar primero):
1. ✅ Consumo Total en Perfil de Cliente
2. ✅ Calificación en Dashboard de Clientes
3. ✅ Ordenamiento por calificación/ticket
4. ✅ Consumo Real por Mesa

### Prioridad Media:
5. ⏳ Historial de Consumos por Cliente
6. ⏳ Métricas de RPs (reservas vs asistencia)
7. ⏳ Consumo por RP

### Prioridad Baja (Implementar después):
8. ⏳ Dashboard de Bonos completo
9. ⏳ Menú para RPs

---

## 📝 Notas de Implementación

### Consideraciones:
- Todas las consultas deben ser optimizadas con índices
- Usar caché para datos que no cambian frecuentemente
- Implementar paginación en listas largas
- Agregar loading states en todas las consultas
- Manejar errores gracefully

### Performance:
- Limitar consultas a últimos 30-90 días por defecto
- Usar agregaciones en la base de datos, no en el cliente
- Implementar lazy loading para imágenes del menú
- Cachear resultados de métricas por 5 minutos

### UX:
- Feedback visual inmediato en todas las acciones
- Tooltips explicativos en métricas complejas
- Gráficas interactivas con Recharts
- Colores consistentes con la marca FEVER (naranja/ámbar)

---

## ✅ Checklist de Implementación

- [ ] Fase 1: CRM Admin - Perfil y Dashboard
- [ ] Fase 2: Mesas - Consumo e Historial
- [ ] Fase 3: Historial de Consumos
- [ ] Fase 4: RPs - Métricas
- [ ] Fase 5: Dashboard de Bonos
- [ ] Fase 6: Menú para RPs
- [ ] Testing completo
- [ ] Documentación actualizada
- [ ] Scripts SQL ejecutados
- [ ] Optimización de queries
- [ ] Deploy a producción
