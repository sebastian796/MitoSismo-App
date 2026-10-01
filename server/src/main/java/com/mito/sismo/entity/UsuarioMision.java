package com.mito.sismo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "usuario_misiones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioMision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mision_id", nullable = false)
    private Mision mision;

    @Column(nullable = false)
    private Integer progreso = 0;

    @Column(nullable = false)
    private Boolean completada = false;

    @Column(name = "fecha_completada")
    private Instant fechaCompletada;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado = "LOCKED";

    @Column(name = "xp_otorgada", nullable = false)
    private Boolean xpOtorgada = false;

    @Column(name = "evidencia_url", columnDefinition = "text")
    private String evidenciaUrl;


}

