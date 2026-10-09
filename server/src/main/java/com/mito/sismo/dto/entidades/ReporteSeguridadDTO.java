package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.ReporteSeguridad;
import com.mito.sismo.entity.enums.EstadoSeguridad;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO para la visualización de un Reporte de Seguridad de un usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "id",
        "usuarioId",
        "nombreUsuario",
        "sismoExternoId",
        "estadoSeguridad",
        "sentido",
        "latitud",
        "longitud",
        "comentario",
        "createdAt"
})
public class ReporteSeguridadDTO {

    private Long id;
    private Long usuarioId;
    private String nombreUsuario;
    private String sismoExternoId;
    private EstadoSeguridad estadoSeguridad;
    private Boolean sentido;
    private Double latitud;
    private Double longitud;
    private String comentario;
    private Instant createdAt;

    public static ReporteSeguridadDTO fromEntity(ReporteSeguridad reporte) {
        if (reporte == null) return null;
        return ReporteSeguridadDTO.builder()
                .id(reporte.getId())
                .usuarioId(reporte.getUsuario() != null ? reporte.getUsuario().getId() : null)
                .nombreUsuario(reporte.getUsuario() != null ? reporte.getUsuario().getNombre() : null)
                .sismoExternoId(reporte.getSismoExternoId())
                .estadoSeguridad(reporte.getEstadoSeguridad())
                .sentido(reporte.getSentido())
                .latitud(reporte.getLatitud())
                .longitud(reporte.getLongitud())
                .comentario(reporte.getComentario())
                .createdAt(reporte.getCreatedAt())
                .build();
    }
}
