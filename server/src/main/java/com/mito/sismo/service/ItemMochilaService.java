package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.ItemMochilaDTO;
import com.mito.sismo.dto.request.ItemMochilaRequest;
import com.mito.sismo.entity.ItemMochila;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioMochilaItem;
import com.mito.sismo.exception.ResourceNotFoundException;
import com.mito.sismo.repository.ItemMochilaRepository;
import com.mito.sismo.repository.UsuarioMochilaItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de ítems de la mochila de emergencia y su sincronización por usuario.
 */
@Service
@RequiredArgsConstructor
public class ItemMochilaService {

    private final ItemMochilaRepository itemMochiRepo;
    private final UsuarioMochilaItemRepository userMochiItemRepo;
    private final UsuarioService userService;

    // Obtener catálogo completo indicando cuáles ítems tiene marcados el usuario autenticado
    @Transactional(readOnly = true)
    public List<ItemMochilaDTO> getItemsMochila(String authHeader) {
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<ItemMochila> listItems = itemMochiRepo.findAllByOrderByOrdenAsc();
        List<UsuarioMochilaItem> listItemsUsuario = userMochiItemRepo.findByUsuarioId(usuario.getId());

        // Mapa de itemId -> estado marcado
        Map<Integer, Boolean> marcasMap = listItemsUsuario.stream()
                .collect(Collectors.toMap(
                        item -> item.getItemMochila().getId(),
                        item -> Boolean.TRUE.equals(item.getMarcado()),
                        (existing, replacement) -> replacement
                ));

        return listItems.stream()
                .map(item -> ItemMochilaDTO.fromEntity(item, marcasMap.getOrDefault(item.getId(), false)))
                .collect(Collectors.toList());
    }

    // Obtener catàlogo de Items Guardados
    @Transactional(readOnly = true)
    public List<ItemMochilaDTO> getItemMochilaGuardado(String authHeader){
        return userMochiItemRepo.findAll().stream()
                .map(item -> ItemMochilaDTO.fromEntity(item.getItemMochila())).toList();
    }

    // Obtener catalogo de Items No Guardados
    @Transactional(readOnly = true)
    public List<ItemMochilaDTO> getItemMochilaNoGuardado(String authHeader){
        Usuario user = userService.extraerUsuarioEmailToken(authHeader);
        Map<Integer,Boolean> itemUser = userMochiItemRepo.findByUsuarioId(user.getId())
                .stream().collect(Collectors.toMap(
                        item -> item.getItemMochila().getId(),
                        item -> Boolean.TRUE.equals(item.getMarcado()),
                        (existente,reemplazo) -> existente
                ));
        return itemMochiRepo.findAll().stream()
                .filter(item ->  !itemUser.containsKey(item.getId()))
                .map(ItemMochilaDTO::fromEntity).toList();
    }


    // Guardar / Sincronizar los ítems marcados por el usuario en su mochila
    @Transactional
    public void saveItemsMochilaNuevos(String authHeader, List<ItemMochilaRequest> listItemNueva) {
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);

        // 1. Obtener registros actuales del usuario
        List<UsuarioMochilaItem> actuales = userMochiItemRepo.findByUsuarioId(usuario.getId());

        // 2. Mapear por item_mochila_id para acceso rápido
        Map<Integer, UsuarioMochilaItem> mapaActuales = actuales.stream()
                .collect(Collectors.toMap(
                        item -> item.getItemMochila().getId(),
                        item -> item,
                        (existente, reemplazo) -> existente
                ));

        // 3. Procesar cada ítem enviado
        for (ItemMochilaRequest req : listItemNueva) {
            Integer itemId = req.getId() != null ? req.getId() : req.getItemId();
            if (itemId == null) continue;

            boolean estaMarcado = Boolean.TRUE.equals(req.getMarcado());

            if (mapaActuales.containsKey(itemId)) {
                // Actualizar estado marcado existente
                UsuarioMochilaItem existente = mapaActuales.get(itemId);
                existente.setMarcado(estaMarcado);
                userMochiItemRepo.save(existente);
            } else if (estaMarcado) {
                // Si está marcado y aún no existe registro para el usuario, crearlo
                ItemMochila item = itemMochiRepo.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Ítem de mochila no encontrado con ID: " + itemId));

                UsuarioMochilaItem nuevo = UsuarioMochilaItem.builder()
                        .usuario(usuario)
                        .itemMochila(item)
                        .marcado(true)
                        .build();

                userMochiItemRepo.save(nuevo);
            }
        }
    }


}
