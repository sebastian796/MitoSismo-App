package com.mito.sismo.entity;

import ch.qos.logback.core.joran.spi.DefaultClass;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

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
