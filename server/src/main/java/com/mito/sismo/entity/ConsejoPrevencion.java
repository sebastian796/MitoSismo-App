package com.mito.sismo.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidad de catálogo para consejos y recomendaciones de prevención ante sismos.
 */
@Entity
@Table(name = "consejos_prevencion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsejoPrevencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fase_id", nullable = false)
    private FasePrevencion fase;

    private String consejo;

    @Builder.Default
    private Integer orden = 0;
}
