-- Restaura en items_mochila el catálogo que ya mostraba Prevención antes de
-- conectarlo al backend. Los nombres proceden de la lista existente en la app.
-- Sus antiguos checks eran valores locales compartidos, no progreso de usuario;
-- no se migran a usuario_mochila_items. No inventa descripciones ni imágenes.
-- Seguro para ejecutar más de una vez: omite nombres ya presentes.
BEGIN;
INSERT INTO public.items_mochila (nombre)
SELECT v.nombre
FROM (VALUES
  ('Agua embotellada (2L por persona)'),
  ('Alimentos no perecibles (latas, barras)'),
  ('Linterna y pilas de repuesto'),
  ('Botiquín de primeros auxilios'),
  ('Radio a pilas y silbato de auxilio'),
  ('Copia de documentos de identidad')
) AS v(nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM public.items_mochila i
  WHERE lower(btrim(i.nombre)) = lower(btrim(v.nombre))
);
COMMIT;

-- Verificación posterior (sólo lectura):
-- SELECT id, nombre, descripcion, image_url FROM public.items_mochila ORDER BY id;
