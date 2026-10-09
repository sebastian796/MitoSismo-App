package com.mito.sismo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Entidad de catálogo para los artículos recomendados de la mochila de emergencia.
 */
@Entity
@Table(name = "items_mochila")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemMochila {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;
    private String descripcion;

    @Builder.Default
    private Boolean obligatorio = true;

    @Builder.Default
    private Integer orden = 0;

    @Builder.Default
    @OneToMany(mappedBy = "itemMochila", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<UsuarioMochilaItem> usuarios = new HashSet<>();
}
