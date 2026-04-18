-- ============================================
-- AGREGAR QR CODE A CLIENTES
-- ============================================

-- 1. Agregar columna qr_code (usaremos el ID del cliente como QR)
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- 2. Generar QR codes para todos los clientes existentes
-- El QR code será simplemente el ID del cliente
UPDATE clientes
SET qr_code = id::text
WHERE qr_code IS NULL;

-- 3. Trigger para generar QR automáticamente para nuevos clientes
CREATE OR REPLACE FUNCTION generar_qr_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := NEW.id::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_qr_cliente
BEFORE INSERT ON clientes
FOR EACH ROW
EXECUTE FUNCTION generar_qr_cliente();

-- 4. Verificar que todos los clientes tienen QR
SELECT 
  nombre,
  telefono,
  qr_code,
  CASE 
    WHEN qr_code IS NOT NULL THEN '✅ QR Generado'
    ELSE '❌ Sin QR'
  END as estado_qr
FROM clientes
ORDER BY created_at DESC
LIMIT 10;

-- 5. Estadísticas
SELECT 
  COUNT(*) as total_clientes,
  COUNT(qr_code) as clientes_con_qr,
  COUNT(*) - COUNT(qr_code) as clientes_sin_qr
FROM clientes;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
El QR Code contiene el ID del cliente (UUID).

Cuando la Hostess escanea el QR:
1. Lee el ID del cliente
2. Busca el cliente en la base de datos
3. Muestra información del cliente
4. Permite asignar mesa automáticamente

Para generar el QR físico:
1. Usar el ID del cliente como contenido
2. Generar QR con cualquier generador online
3. Imprimir y entregar al cliente
4. Cliente lo guarda en su wallet/teléfono

Ejemplo de QR:
- Contenido: "550e8400-e29b-41d4-a716-446655440000"
- Este es el ID del cliente en la base de datos
*/

-- ============================================
-- CONSULTA PARA VER QR DE UN CLIENTE ESPECÍFICO
-- ============================================

SELECT 
  id,
  nombre,
  telefono,
  nivel_fidelidad,
  total_visitas,
  qr_code,
  'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' || qr_code as qr_url
FROM clientes
WHERE nombre ILIKE '%Juan%'
LIMIT 5;

-- Para generar el QR físico, usa la URL de qr_url en un navegador
