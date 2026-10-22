package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.ItemMochilaDTO;
import com.mito.sismo.service.ItemMochilaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/itemMochila")
public class ItemMochilaController {

    private final ItemMochilaService itemMochiService;

    // Devolver Items Mochila
    @GetMapping("listItems")
    public ResponseEntity<List<ItemMochilaDTO>> traerListItem(){
        return ResponseEntity.ok(itemMochiService.traerListItem());
    }

    // Devolver Item de Mochila Usuario
    @GetMapping("/traerList")
    ResponseEntity<List<ItemMochilaDTO>> getItemMochila(
            @RequestHeader("Authorization")
            String authHeader
    ){
        List<ItemMochilaDTO> listItems = itemMochiService.traerListMochiItemUser(authHeader);
        return ResponseEntity.ok(listItems);
    }

    // Marcar Item de la mochila (Lista de objetos)


}
