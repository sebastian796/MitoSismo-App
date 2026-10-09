package com.mito.sismo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entidad que almacena las preferencias y parámetros de alerta sísmica para cada usuario.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "configuraciones_usuario")
public class ConfiguracionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Builder.Default
    private Boolean notifSismos = true;

    @Builder.Default
    private Boolean notifConsejos = true;

    @Builder.Default
    private Boolean alertaSonora = false;

    @Column(name = "magnitud_minima")
    @Builder.Default
    private Double magnitudMinima = 4.5;

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
