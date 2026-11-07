package com.mito.sismo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mito.sismo.entity.ContactoEmergencia;

public interface ContactoEmergenciaRepository extends JpaRepository<ContactoEmergencia, Integer> {
    List<ContactoEmergencia> findAllByOrderByIdAsc();
}
