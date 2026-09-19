package com.mito.sismo.entity;

import com.mito.sismo.entity.enums.EstadoSeguridad;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

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

    private String sismoExternoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_seguridad")
    private EstadoSeguridad estadoSeguridad = EstadoSeguridad.DESCONOCIDO; // Enum-like

    private Boolean sentido = true;
    private Double latitud;
    private Double longitud;
    private String comentario;

    private Instant createdAt = Instant.now();
}
