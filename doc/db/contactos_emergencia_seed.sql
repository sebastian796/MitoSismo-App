-- Recupera los tres contactos solicitados desde el arreglo histórico de la app.
-- contactos_emergencia usa nombre, numero, descripcion, icono y pais (texto).
-- Se guarda PERU, que es el valor Pais.PERU que serializa el DTO de Spring.
-- No sobrescribe ni borra contactos existentes; evita duplicar teléfono y país.
-- El arreglo histórico también contenía INDECI 115 como cuarto contacto:
-- descripción "Defensa Civil y reportes de desastres naturales.", icono alert-circle.
-- Se excluyó únicamente porque el alcance previo pidió tres líneas (105, 116, 106),
-- no por incompatibilidad o falta de verificación. No se borra ningún registro.
-- El 106 de SAMU tiene cobertura por regiones; validar cobertura local al mostrarlo.
BEGIN;
INSERT INTO public.contactos_emergencia
  (nombre, numero, descripcion, icono, pais)
SELECT v.nombre, v.numero, v.descripcion, v.icono, v.pais
FROM (VALUES
  ('Bomberos del Perú', '116', 'Emergencias médicas, rescates e incendios.', 'flame', 'PERU'),
  ('Policía Nacional', '105', 'Seguridad ciudadana y auxilio inmediato.', 'shield-checkmark', 'PERU'),
  ('SAMU (Salud)', '106', 'Ambulancias y urgencias médicas.', 'medkit', 'PERU')
) AS v(nombre, numero, descripcion, icono, pais)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.contactos_emergencia c
  WHERE regexp_replace(c.numero, '[^0-9]', '', 'g') = v.numero
    AND upper(trim(c.pais)) IN ('PERU', 'PERÚ')
);
COMMIT;

-- Verificación posterior (sólo lectura):
-- SELECT nombre, numero, descripcion, icono, pais
-- FROM public.contactos_emergencia WHERE upper(trim(pais)) IN ('PERU', 'PERÚ')
-- ORDER BY id;
