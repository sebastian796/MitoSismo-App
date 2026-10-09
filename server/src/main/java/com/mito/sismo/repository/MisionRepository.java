package com.mito.sismo.repository;

import com.mito.sismo.entity.Mision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para el catálogo de misiones.
 */
@Repository
public interface MisionRepository extends JpaRepository<Mision, Integer> {

    Optional<Mision> findByTitulo(String titulo);

    boolean existsByTitulo(String titulo);
}
