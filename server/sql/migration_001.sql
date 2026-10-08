-- Migración: imagen de producto en el catálogo

ALTER TABLE catalogo
  ADD COLUMN IF NOT EXISTS imagen_url text;
