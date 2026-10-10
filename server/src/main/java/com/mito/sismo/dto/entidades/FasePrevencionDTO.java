package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.FasePrevencion;
import com.mito.sismo.entity.enums.ClaveFase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la transferencia de datos de una Fase de Prevención con sus consejos asociados.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "clave",
        "titulo",
        "icono",
})
public class FasePrevencionDTO {

    private ClaveFase clave;
    private String titulo;
    private String icono;

    public static FasePrevencionDTO fromEntity(FasePrevencion fase) {
        if (fase == null) return null;
        return FasePrevencionDTO.builder()
                .clave(fase.getClave())
                .titulo(fase.getTitulo())
                .icono(fase.getIcono())
                .build();
    }
}
