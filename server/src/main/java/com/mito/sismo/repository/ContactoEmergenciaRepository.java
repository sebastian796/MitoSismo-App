package com.mito.sismo.repository;

import com.mito.sismo.entity.ContactoEmergencia;
import com.mito.sismo.entity.enums.Pais;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para contactos y líneas de emergencia.
 */
@Repository
public interface ContactoEmergenciaRepository extends JpaRepository<ContactoEmergencia, Integer> {

    List<ContactoEmergencia> findByPais(Pais pais);

    List<ContactoEmergencia> findByPaisOrderByOrdenAsc(Pais pais);

    Optional<ContactoEmergencia> findByNombre(String nombre);
}
