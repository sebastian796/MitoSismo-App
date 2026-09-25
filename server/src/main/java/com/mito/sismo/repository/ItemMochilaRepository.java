package com.mito.sismo.repository;

import com.mito.sismo.entity.ItemMochila;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemMochilaRepository extends JpaRepository<ItemMochila, Long> {
    Optional<ItemMochila> findByNombre(String nombre);
}
