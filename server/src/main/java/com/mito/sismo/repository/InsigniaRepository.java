package com.mito.sismo.repository;

import com.mito.sismo.entity.Insignia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InsigniaRepository extends JpaRepository<Insignia, Long> {
    Optional<Insignia> findByNombre(String nombre);
}
