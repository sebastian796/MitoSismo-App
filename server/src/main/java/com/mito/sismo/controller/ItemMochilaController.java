package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.ItemMochilaDTO;
import com.mito.sismo.service.ItemMochilaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/itemMochila")
public class ItemMochilaController {

    private final ItemMochilaService itemMochilaService;

    // Devolver item de mochila por usuario
    @GetMapping("/listItem")
    ResponseEntity<List<ItemMochilaDTO>> getItemMochila(
            @RequestHeader
            String authHeader
    ){
        List<ItemMochilaDTO> listItems = itemMochilaService.getItemsMochila(authHeader);
        return ResponseEntity.ok(listItems);
    }

    // Marcar Item de la mochila (Lista de objetos)


}
