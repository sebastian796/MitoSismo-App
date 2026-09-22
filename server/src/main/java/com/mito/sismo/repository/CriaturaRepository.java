package com.mito.sismo.repository;

import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.enums.Elemento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CriaturaRepository extends JpaRepository<Criatura,Long> {

    Optional<Criatura> findByNombre(String nombre);
    List<Criatura> findByElemento(Elemento elemento);

    boolean existsByNombre(String nombre);
}
