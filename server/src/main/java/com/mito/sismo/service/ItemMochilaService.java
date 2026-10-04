package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.ItemMochilaDTO;
import com.mito.sismo.dto.request.ItemMochilaRequest;
import com.mito.sismo.entity.ItemMochila;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioMochilaItem;
import com.mito.sismo.repository.ItemMochilaRepository;
import com.mito.sismo.repository.UsuarioMochilaItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemMochilaService {

    private final ItemMochilaRepository itemMochilaRepository;
    private final UsuarioMochilaItemRepository userMochilaItemsRepository;
    private final UsuarioService userService;

    // -Traer lista de item completa de mochila del usuario
    @Transactional(readOnly = true)
    public List<ItemMochilaDTO> getItemsMochila(
            String authHeader
    ){
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<ItemMochila> listItems = itemMochilaRepository.findAll();
        List<UsuarioMochilaItem> listItemsUsuario = userMochilaItemsRepository.findByUsuarioId(usuario.getId());
        List<ItemMochila> listItemMochilaUsuario =
                listItemsUsuario.stream()
                        .map(item -> item.getItemMochila())
                        .collect(Collectors.toList())
        return listItems.stream()
                        .map(item -> (listItemMochilaUsuario.contains(item)
                                ? ItemMochilaDTO.fromEntity(item,true)
                                : ItemMochilaDTO.fromEntity(item)))
                        .collect(Collectors.toList());
    }

    // Guardar Items Agregados a Mochila
    @Transactional
    public void saveItemsMochilaNuevos(
            String authHeader,
            List<ItemMochilaRequest> listItemNueva
    ){
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);

        // 1. Obtener los ítems actuales del usuario
        List<UsuarioMochilaItem> actuales = userMochilaItemsRepository.findByUsuarioId(usuario.getId());

        // 2. Crear un mapa de los ítems actuales para fácil búsqueda
        Map<Long, UsuarioMochilaItem> mapaActuales = actuales.stream()
                .collect(Collectors.toMap(
                        item -> item.getItemMochila().getId(),
                        item -> item
                ));

        // 3. Recorrer la nueva lista enviada
        for (ItemMochilaRequest req : listItemNueva) {
            if (req.isMarcado()) {
                // Si está marcado y no existe en actuales → agregar
                if (!mapaActuales.containsKey(req.getItemId())) {
                    ItemMochila item = itemMochilaRepository.findById(req.getItemId())
                            .orElseThrow(() -> new IllegalArgumentException("Item no encontrado: " + req.getItemId()));

                    ItemMochilaUsuario nuevo = ItemMochilaUsuario.builder()
                            .usuario(usuario)
                            .itemMochila(item)
                            .build();

                    userMochilaItemsRepository.save(nuevo);
                }
            } else {
                // Si está desmarcado y existe en actuales → eliminar
                if (mapaActuales.containsKey(req.getItemId())) {
                    userMochilaItemsRepository.delete(mapaActuales.get(req.getItemId()));
                }
            }
        }
    }



}
