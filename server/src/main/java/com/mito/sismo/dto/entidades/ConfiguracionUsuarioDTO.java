package com.mito.sismo.dto.entidades;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.ConfiguracionUsuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la configuración de notificaciones y alertas de un usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "notifGeneral",
        "paisesNotificacion",
        "horaConsejos",
        "recordatorioMisiones",
        "notifSismos",
        "notifConsejos",
        "alertaSonora",
        "magnitudMinima",
        "updatedAt"
})
public class ConfiguracionUsuarioDTO {

    public static ConfiguracionUsuarioDTO fromEntity(ConfiguracionUsuario conf) {
        if (conf == null)
            return null;
        return ConfiguracionUsuarioDTO.builder()
                .notifGeneral(Boolean.TRUE.equals(conf.getNotifGeneral()))
                .paisesNotificacion(conf.getPaisesNotificacion() == null ? List.of("Perú")
                        : List.copyOf(conf.getPaisesNotificacion()))
                .horaConsejos(conf.getHoraConsejos() == null ? 8 : conf.getHoraConsejos())
                .recordatorioMisiones(conf.getRecordatorioMisiones() == null ? true : conf.getRecordatorioMisiones())
                .notifSismos(conf.getNotifSismos() == null ? true : conf.getNotifSismos())
                .notifConsejos(conf.getNotifConsejos() == null ? true : conf.getNotifConsejos())
                .alertaSonora(Boolean.TRUE.equals(conf.getAlertaSonora()))
                .magnitudMinima(conf.getMagnitudMinima() == null ? 4.5 : conf.getMagnitudMinima())
                .updatedAt(conf.getUpdatedAt())
                .build();
    }

    private Boolean notifGeneral;
    private List<String> paisesNotificacion;
    private Integer horaConsejos;
    private Boolean recordatorioMisiones;
    private Boolean notifSismos;
    private Boolean notifConsejos;
    private Boolean alertaSonora;
    private Double magnitudMinima;

    private Instant updatedAt;
}
