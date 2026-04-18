-- =====================================================
-- SISTEMA DE AUTENTICACIÓN BIOMÉTRICA PARA RPs
-- Face ID / Touch ID usando Web Authentication API
-- =====================================================

-- 1. Agregar columnas para credenciales biométricas
ALTER TABLE limites_cortesias_rp 
ADD COLUMN IF NOT EXISTS biometric_credential JSONB,
ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometric_registered_at TIMESTAMP WITH TIME ZONE;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_rp_biometric_enabled 
ON limites_cortesias_rp(biometric_enabled) 
WHERE biometric_enabled = TRUE;

-- 3. Comentarios para documentación
COMMENT ON COLUMN limites_cortesias_rp.biometric_credential IS 
'Credencial biométrica WebAuthn (Face ID/Touch ID) en formato JSONB';

COMMENT ON COLUMN limites_cortesias_rp.biometric_enabled IS 
'Indica si el RP tiene habilitada la autenticación biométrica';

COMMENT ON COLUMN limites_cortesias_rp.biometric_registered_at IS 
'Fecha y hora en que se registró la credencial biométrica';

-- 4. Función para registrar credencial biométrica
CREATE OR REPLACE FUNCTION registrar_biometric_rp(
  p_rp_id UUID,
  p_credential JSONB
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Actualizar credencial
  UPDATE limites_cortesias_rp
  SET 
    biometric_credential = p_credential,
    biometric_enabled = TRUE,
    biometric_registered_at = NOW()
  WHERE id = p_rp_id;

  -- Verificar si se actualizó
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'RP no encontrado'
    );
  END IF;

  -- Retornar éxito
  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Credencial biométrica registrada exitosamente',
    'registered_at', NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Función para desactivar biométrica
CREATE OR REPLACE FUNCTION desactivar_biometric_rp(
  p_rp_id UUID
) RETURNS JSONB AS $$
BEGIN
  UPDATE limites_cortesias_rp
  SET 
    biometric_enabled = FALSE,
    biometric_credential = NULL
  WHERE id = p_rp_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'RP no encontrado'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Autenticación biométrica desactivada'
  );
END;
$$ LANGUAGE plpgsql;

-- 6. Vista para RPs con biométrica habilitada
CREATE OR REPLACE VIEW vista_rps_biometric AS
SELECT 
  id,
  rp_nombre,
  biometric_enabled,
  biometric_registered_at,
  CASE 
    WHEN biometric_credential IS NOT NULL THEN TRUE
    ELSE FALSE
  END as has_credential
FROM limites_cortesias_rp
WHERE activo = TRUE
ORDER BY rp_nombre;

-- 7. Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_biometric_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.biometric_credential IS NOT NULL AND 
     (OLD.biometric_credential IS NULL OR 
      NEW.biometric_credential != OLD.biometric_credential) THEN
    NEW.biometric_registered_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_biometric_timestamp ON limites_cortesias_rp;
CREATE TRIGGER trg_update_biometric_timestamp
BEFORE UPDATE ON limites_cortesias_rp
FOR EACH ROW
EXECUTE FUNCTION update_biometric_timestamp();

-- =====================================================
-- DATOS DE PRUEBA (Opcional)
-- =====================================================

-- Verificar RPs existentes
SELECT 
  id,
  rp_nombre,
  biometric_enabled,
  biometric_registered_at
FROM limites_cortesias_rp
WHERE activo = TRUE
ORDER BY rp_nombre;

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Ver RPs con biométrica habilitada
SELECT * FROM vista_rps_biometric WHERE biometric_enabled = TRUE;

-- Contar RPs por estado biométrico
SELECT 
  biometric_enabled,
  COUNT(*) as total
FROM limites_cortesias_rp
WHERE activo = TRUE
GROUP BY biometric_enabled;

-- Ver último registro biométrico
SELECT 
  rp_nombre,
  biometric_registered_at,
  AGE(NOW(), biometric_registered_at) as tiempo_desde_registro
FROM limites_cortesias_rp
WHERE biometric_enabled = TRUE
ORDER BY biometric_registered_at DESC;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
ESTRUCTURA DE biometric_credential (JSONB):
{
  "id": "credential_id_string",
  "rawId": "base64_encoded_raw_id",
  "type": "public-key",
  "response": {
    "clientDataJSON": "base64_encoded_client_data",
    "attestationObject": "base64_encoded_attestation"
  }
}

SEGURIDAD:
- Las credenciales biométricas nunca salen del dispositivo
- Solo se almacena la clave pública
- Face ID/Touch ID valida localmente
- WebAuthn es el estándar W3C para autenticación segura

COMPATIBILIDAD:
- iOS 14+ con Face ID o Touch ID
- Safari 14+
- Chrome iOS 108+
- Requiere HTTPS (excepto localhost)

USO:
1. RP selecciona su perfil
2. Hace clic en "Registrar Face ID"
3. Sistema solicita Face ID
4. Credencial se guarda en BD
5. Próximos logins: solo Face ID
*/
