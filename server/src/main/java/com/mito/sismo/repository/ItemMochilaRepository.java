package com.mito.sismo.repository;

import com.mito.sismo.entity.ItemMochila;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad ItemMochila.
 */
@Repository
public interface ItemMochilaRepository extends JpaRepository<ItemMochila, Integer> {

    Optional<ItemMochila> findByNombre(String nombre);

    List<ItemMochila> findAllByOrderByOrdenAsc();
}
