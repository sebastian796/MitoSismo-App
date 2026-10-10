package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.ConfiguracionUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO para la configuración de notificaciones y alertas de un usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "notifSismos",
        "notifConsejos",
        "alertaSonora",
        "magnitudMinima",
        "updatedAt"
})
public class ConfiguracionUsuarioDTO {

    private Boolean notifSismos;
    private Boolean notifConsejos;
    private Boolean alertaSonora;
    private Double magnitudMinima;
    private Instant updatedAt;

    public static ConfiguracionUsuarioDTO fromEntity(ConfiguracionUsuario conf) {
        if (conf == null) return null;
        return ConfiguracionUsuarioDTO.builder()
                .notifSismos(conf.getNotifSismos())
                .notifConsejos(conf.getNotifConsejos())
                .alertaSonora(conf.getAlertaSonora())
                .magnitudMinima(conf.getMagnitudMinima())
                .updatedAt(conf.getUpdatedAt())
                .build();
    }
}
