-- Datos educativos de prevención para revisión y ejecución manual.
-- Idempotente: identifica fases por clave y omite consejos ya existentes por texto.
-- No modifica contactos de emergencia; sus números requieren fuente oficial verificada.
BEGIN;
INSERT INTO public.fases_prevencion (clave, titulo, icono)
SELECT v.clave, v.titulo, v.icono
FROM (VALUES
 ('ANTES','Preparación Previa','shield-checkmark'),
 ('DURANTE','Acciones Inmediatas','alert-circle'),
 ('DESPUES','Recuperación y Cuidado','medical')
) AS v(clave,titulo,icono)
WHERE NOT EXISTS (SELECT 1 FROM public.fases_prevencion f WHERE f.clave::text=v.clave);
WITH tips(clave, orden, consejo) AS (VALUES
 ('ANTES',1,'Identifica zonas seguras, rutas de evacuación y puntos de encuentro con tu familia.'),
 ('ANTES',2,'Asegura estantes y objetos pesados para reducir el riesgo de caída.'),
 ('ANTES',3,'Prepara una mochila de emergencia con agua, alimentos, linterna, radio, botiquín y documentos.'),
 ('DURANTE',1,'Mantén la calma, aléjate de ventanas y protégete junto a una columna o bajo una mesa resistente.'),
 ('DURANTE',2,'No uses ascensores ni corras hacia las salidas mientras continúa el movimiento.'),
 ('DURANTE',3,'Si estás en la calle, aléjate de fachadas, postes, cables y objetos que puedan caer.'),
 ('DESPUES',1,'Evacúa con cuidado cuando termine el movimiento y usa las rutas previamente acordadas.'),
 ('DESPUES',2,'Aléjate de edificios dañados y prepárate para posibles réplicas.'),
 ('DESPUES',3,'Revisa lesiones y daños; comunica emergencias por canales oficiales cuando sea necesario.')
)
INSERT INTO public.consejos_prevencion (fase_id, consejo, orden)
SELECT f.id, t.consejo, t.orden FROM tips t
JOIN public.fases_prevencion f ON f.clave::text=t.clave
WHERE NOT EXISTS (SELECT 1 FROM public.consejos_prevencion c WHERE c.fase_id=f.id AND c.consejo=t.consejo);
COMMIT;
-- Verificación posterior, sólo lectura:
-- SELECT f.clave, count(c.id) FROM public.fases_prevencion f LEFT JOIN public.consejos_prevencion c ON c.fase_id=f.id GROUP BY f.clave ORDER BY f.clave;
