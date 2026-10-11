package com.mito.sismo.repository;
import com.mito.sismo.entity.Mision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface MisionRepository extends JpaRepository<Mision, Integer> {

    Optional<Mision> findByTitulo(String titulo);

    boolean existsByTitulo(String titulo);
}
