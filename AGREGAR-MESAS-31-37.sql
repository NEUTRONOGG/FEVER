-- =====================================================
-- AGREGAR MESAS 31 A 37 FALTANTES
-- =====================================================

-- Insertar mesas con IDs específicos
DO $$
BEGIN
  -- Insertar solo si no existen
  IF NOT EXISTS (SELECT 1 FROM mesas WHERE numero = '31') THEN
    INSERT INTO mesas (id, numero, capacidad, estado) VALUES (31, '31', '10', 'disponible');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM mesas WHERE numero = '32') THEN
    INSERT INTO mesas (id, numero, capacidad, estado) VALUES (32, '32', '10', 'disponible');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM mesas WHERE numero = '33') THEN
    INSERT INTO mesas (id, numero, capacidad, estado) VALUES (33, '33', '10', 'disponible');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM mesas WHERE numero = '34') THEN
    INSERT INTO mesas (id, numero, capacidad, estado) VALUES (34, '34', '10', 'disponible');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM mesas WHERE numero = '35') THEN
    INSERT INTO mesas (id, numero, capacidad, estado) VALUES (35, '35', '10', 'disponible');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM mesas WHERE numero = '36') THEN
    INSERT INTO mesas (id, numero, capacidad, estado) VALUES (36, '36', '10', 'disponible');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM mesas WHERE numero = '37') THEN
    INSERT INTO mesas (id, numero, capacidad, estado) VALUES (37, '37', '10', 'disponible');
  END IF;
END $$;

-- Verificar que se crearon correctamente
SELECT numero, capacidad, estado 
FROM mesas 
WHERE numero IN ('31', '32', '33', '34', '35', '36', '37')
ORDER BY numero::integer;
