package com.mito.sismo.entity;

import com.mito.sismo.entity.enums.Pais;
import jakarta.persistence.*;
import lombok.*;

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

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Pais pais = Pais.PERU;

}
