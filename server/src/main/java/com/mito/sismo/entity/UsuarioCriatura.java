package com.mito.sismo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entidad que vincula a un usuario con su criatura / mascota elegida y guarda su progreso de nivel y XP.
 */
@Entity
@Table(name = "usuario_criaturas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioCriatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criatura_id", nullable = false)
    private Criatura criatura;

    @Builder.Default
    private Integer nivel = 1;

    @Builder.Default
    private Integer xpActual = 0;

    @Builder.Default
    private Boolean activa = true;

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
