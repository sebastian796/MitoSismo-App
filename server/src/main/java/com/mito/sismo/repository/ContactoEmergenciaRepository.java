package com.mito.sismo.repository;

import com.mito.sismo.entity.ContactoEmergencia;
import com.mito.sismo.entity.enums.Pais;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContactoEmergenciaRepository extends JpaRepository<ContactoEmergencia, Long> {
    List<ContactoEmergencia> findByPais(Pais pais);
    Optional<ContactoEmergencia> findByNombre(String nombre);
}
