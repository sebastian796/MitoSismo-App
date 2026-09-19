package com.mito.sismo.service;

import com.mito.sismo.repository.ItemMochilaRepository;
import org.springframework.stereotype.Service;

@Service
public class ItemMochilaService {

    private final ItemMochilaRepository itemMochilaRepository;

    public ItemMochilaService(ItemMochilaRepository itemMochilaRepository){
        this.itemMochilaRepository = itemMochilaRepository;
    }

}
