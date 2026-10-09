package com.mito.sismo.repository;

import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.enums.Elemento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad Criatura.
 */
@Repository
public interface CriaturaRepository extends JpaRepository<Criatura, Integer> {

    Optional<Criatura> findByNombre(String nombre);

    List<Criatura> findByElemento(Elemento elemento);

    boolean existsByNombre(String nombre);
}
