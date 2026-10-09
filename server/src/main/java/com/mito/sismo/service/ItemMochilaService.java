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

    private final ItemMochilaRepository itemMochilaRepository;
    private final UsuarioMochilaItemRepository userMochilaItemsRepository;
    private final UsuarioService userService;

    // Obtener catálogo completo indicando cuáles ítems tiene marcados el usuario autenticado
    @Transactional(readOnly = true)
    public List<ItemMochilaDTO> getItemsMochila(String authHeader) {
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<ItemMochila> listItems = itemMochilaRepository.findAllByOrderByOrdenAsc();
        List<UsuarioMochilaItem> listItemsUsuario = userMochilaItemsRepository.findByUsuarioId(usuario.getId());

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

    // Guardar / Sincronizar los ítems marcados por el usuario en su mochila
    @Transactional
    public void saveItemsMochilaNuevos(String authHeader, List<ItemMochilaRequest> listItemNueva) {
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);

        // 1. Obtener registros actuales del usuario
        List<UsuarioMochilaItem> actuales = userMochilaItemsRepository.findByUsuarioId(usuario.getId());

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
                userMochilaItemsRepository.save(existente);
            } else if (estaMarcado) {
                // Si está marcado y aún no existe registro para el usuario, crearlo
                ItemMochila item = itemMochilaRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Ítem de mochila no encontrado con ID: " + itemId));

                UsuarioMochilaItem nuevo = UsuarioMochilaItem.builder()
                        .usuario(usuario)
                        .itemMochila(item)
                        .marcado(true)
                        .build();

                userMochilaItemsRepository.save(nuevo);
            }
        }
    }

    // Listar todos los ítems del catálogo general
    @Transactional(readOnly = true)
    public List<ItemMochilaDTO> listarCatalogo() {
        return itemMochilaRepository.findAllByOrderByOrdenAsc().stream()
                .map(ItemMochilaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Obtener un ítem de catálogo por su ID
    @Transactional(readOnly = true)
    public ItemMochilaDTO obtenerPorId(Integer id) {
        ItemMochila item = itemMochilaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem de mochila no encontrado con ID: " + id));
        return ItemMochilaDTO.fromEntity(item);
    }

    // Crear un nuevo ítem en el catálogo
    @Transactional
    public ItemMochilaDTO crearItem(ItemMochila item) {
        ItemMochila guardado = itemMochilaRepository.save(item);
        return ItemMochilaDTO.fromEntity(guardado);
    }

    // Modificar un ítem existente en el catálogo
    @Transactional
    public ItemMochilaDTO actualizarItem(Integer id, ItemMochila datosActualizados) {
        ItemMochila existente = itemMochilaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ítem de mochila no encontrado con ID: " + id));

        existente.setNombre(datosActualizados.getNombre());
        existente.setDescripcion(datosActualizados.getDescripcion());
        existente.setObligatorio(datosActualizados.getObligatorio());
        existente.setOrden(datosActualizados.getOrden());

        return ItemMochilaDTO.fromEntity(itemMochilaRepository.save(existente));
    }

    // Eliminar un ítem del catálogo
    @Transactional
    public void eliminarItem(Integer id) {
        if (!itemMochilaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ítem de mochila no encontrado con ID: " + id);
        }
        itemMochilaRepository.deleteById(id);
    }
}
