package com.mito.sismo.entity;

import com.mito.sismo.entity.enums.Pais;

import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad de catálogo para números y líneas de emergencia según el país.
 */
@Entity
@Table(name = "contactos_emergencia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactoEmergencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String nombre;
    private String numero;
    private String descripcion;
    private String icono;

    @Convert(converter = PaisDbConverter.class)
    @Builder.Default
    private Pais pais = Pais.PERU;

}
