-- Script para crear tabla de Hostess
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- CREAR TABLA HOSTESS
-- ============================================

CREATE TABLE IF NOT EXISTS hostess (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  fecha_contratacion DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INSERTAR HOSTESS DE EJEMPLO
-- ============================================

-- Insertar Verónica como hostess
INSERT INTO hostess (nombre, apellido, telefono, activo)
VALUES 
  ('Verónica', 'García', '555-0101', true),
  ('Ana', 'Martínez', '555-0102', true),
  ('Laura', 'López', '555-0103', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAR DATOS
-- ============================================

SELECT * FROM hostess ORDER BY id;

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Después de ejecutar este script:
-- 1. Guarda el ID de Verónica en localStorage:
--    localStorage.setItem("hostessId", "1")  // Usa el ID que te aparezca
-- 2. O guarda el nombre directamente:
--    localStorage.setItem("userName", "Verónica")
-- 3. Recarga el panel de Hostess

-- ============================================
-- ALTERNATIVA: Si prefieres usar la tabla de usuarios existente
-- ============================================

-- Si ya tienes una tabla de usuarios, puedes agregar un campo tipo:
-- ALTER TABLE usuarios ADD COLUMN tipo VARCHAR(20) DEFAULT 'staff';
-- UPDATE usuarios SET tipo = 'hostess' WHERE nombre = 'Verónica';

-- Y luego consultar así:
-- SELECT nombre FROM usuarios WHERE tipo = 'hostess' AND id = [id];
