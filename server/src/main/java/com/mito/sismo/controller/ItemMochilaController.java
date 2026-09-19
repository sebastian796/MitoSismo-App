package com.mito.sismo.controller;

import com.mito.sismo.service.ItemMochilaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/itemMochila")
public class ItemMochilaController {

    private final ItemMochilaService itemMochilaService;

    public ItemMochilaController(ItemMochilaService itemMochilaService){
        this.itemMochilaService = itemMochilaService;
    }
}
