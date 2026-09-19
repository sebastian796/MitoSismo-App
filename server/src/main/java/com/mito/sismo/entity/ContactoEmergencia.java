package com.mito.sismo.entity;

import com.mito.sismo.entity.enums.Pais;
import jakarta.persistence.*;
import lombok.*;

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
    private Pais pais = Pais.PERU;
    private Integer orden = 0;
}
