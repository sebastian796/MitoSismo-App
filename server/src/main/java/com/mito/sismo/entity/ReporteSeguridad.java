package com.mito.sismo.entity;

import com.mito.sismo.entity.enums.EstadoSeguridad;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entidad que registra el reporte de estado de seguridad enviado por un usuario ante un sismo.
 */
@Entity
@Table(name = "reportes_seguridad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteSeguridad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "sismo_externo_id")
    private String sismoExternoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_seguridad")
    @Builder.Default
    private EstadoSeguridad estadoSeguridad = EstadoSeguridad.DESCONOCIDO;

    @Builder.Default
    private Boolean sentido = true;

    private Double latitud;
    private Double longitud;
    private String comentario;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
