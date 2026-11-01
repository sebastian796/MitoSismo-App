package com.mito.sismo.entity;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad que almacena las preferencias y parámetros de alerta sísmica para
 * cada usuario.
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

    @Column(name = "notif_general", nullable = false)
    @Builder.Default
    private Boolean notifGeneral = false;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "paises_notificacion", columnDefinition = "text[]", nullable = false)
    @Builder.Default
    private List<String> paisesNotificacion = new ArrayList<>(List.of("Perú"));

    @Column(name = "hora_consejos", nullable = false)
    @Builder.Default
    private Integer horaConsejos = 8;

    @Column(name = "recordatorio_misiones", nullable = false)
    @Builder.Default
    private Boolean recordatorioMisiones = true;

    @Column(name = "notif_sismos")
    @Builder.Default
    private Boolean notifSismos = true;

    @Column(name = "notif_consejos")
    @Builder.Default
    private Boolean notifConsejos = true;

    @Column(name = "alerta_sonora")
    @Builder.Default
    private Boolean alertaSonora = false;
    @Column(name = "magnitud_minima")
    @Builder.Default
    private Double magnitudMinima = 4.5;

    @Builder.Default
    private Instant updatedAt = Instant.now().truncatedTo(ChronoUnit.MICROS);

    @PreUpdate
    public void preUpdate() {
        Instant now = Instant.now().truncatedTo(ChronoUnit.MICROS);
        this.updatedAt = updatedAt != null && !now.isAfter(updatedAt)
                ? updatedAt.plus(1, ChronoUnit.MICROS)
                : now;
    }
}
