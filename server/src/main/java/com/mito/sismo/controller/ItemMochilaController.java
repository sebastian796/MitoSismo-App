package com.mito.sismo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mito.sismo.dto.entidades.ItemMochilaDTO;
import com.mito.sismo.dto.request.ItemMochilaRequest;
import com.mito.sismo.service.ItemMochilaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/itemMochila")
public class ItemMochilaController {

    private final ItemMochilaService itemMochiService;

    @PutMapping("/actualizar")
    public ResponseEntity<Void> actualizarItems(@RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody List<ItemMochilaRequest> items) {
        itemMochiService.saveListItemMochiUser(authHeader, items);
        return ResponseEntity.noContent().build();
    }

    // Devolver Items Mochila
    @GetMapping("listItems")
    public ResponseEntity<List<ItemMochilaDTO>> traerListItem() {
        return ResponseEntity.ok(itemMochiService.traerListItem());
    }

    // Devolver Item de Mochila Usuario
    @GetMapping("/traerList")
    ResponseEntity<List<ItemMochilaDTO>> getItemMochila(
            @RequestHeader("Authorization") String authHeader) {
        List<ItemMochilaDTO> listItems = itemMochiService.traerListMochiItemUser(authHeader);
        return ResponseEntity.ok(listItems);
    }

    // Marcar Item de la mochila (Lista de objetos)

}
