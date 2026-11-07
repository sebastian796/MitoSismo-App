package com.mito.sismo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.enums.Elemento;

public interface CriaturaRepository extends JpaRepository<Criatura, Integer> {

    boolean existsByNombre(String nombre);

    List<Criatura> findByElemento(Elemento elemento);

    Optional<Criatura> findByNombre(String nombre);

    Optional<Criatura> findFirstByElementoOrderByIdAsc(Elemento elemento);
}
