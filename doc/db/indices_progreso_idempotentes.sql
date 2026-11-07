-- Índices idempotentes para impedir duplicados de catálogo, progreso y reportes.
-- Revisión manual: comprobar los conteos de duplicados antes de ejecutar.
-- Si hay duplicados, el bloque omite ese índice y deja aviso; no altera filas.
DO $$
BEGIN
  -- ItemMochilaRepository.findByNombre retorna Optional y el seed requiere catálogo único.
  IF NOT EXISTS (SELECT 1 FROM public.items_mochila WHERE nombre IS NOT NULL
                 GROUP BY lower(btrim(nombre)) HAVING count(*) > 1) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS ux_items_mochila_nombre_normalizado
      ON public.items_mochila ((lower(btrim(nombre)))) WHERE nombre IS NOT NULL;
  ELSE RAISE NOTICE 'No se creó índice de catálogo: revisar nombres de materiales duplicados.'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.usuario_mochila_items GROUP BY usuario_id, item_mochila_id HAVING count(*) > 1) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_mochila_item ON public.usuario_mochila_items(usuario_id, item_mochila_id);
  ELSE RAISE NOTICE 'No se creó índice de mochila: revisar pares usuario/item duplicados.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.usuario_misiones GROUP BY usuario_id, mision_id HAVING count(*) > 1) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_mision ON public.usuario_misiones(usuario_id, mision_id);
  ELSE RAISE NOTICE 'No se creó índice de misión: revisar pares usuario/misión duplicados.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.reportes_seguridad WHERE sismo_externo_id IS NOT NULL GROUP BY usuario_id, sismo_externo_id HAVING count(*) > 1) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS ux_reporte_usuario_sismo ON public.reportes_seguridad(usuario_id, sismo_externo_id) WHERE sismo_externo_id IS NOT NULL;
  ELSE RAISE NOTICE 'No se creó índice de reporte: revisar pares usuario/sismo duplicados.'; END IF;
END $$;
-- Verificación posterior (sólo lectura):
-- SELECT indexname FROM pg_indexes WHERE schemaname='public' AND indexname LIKE 'ux_%';
