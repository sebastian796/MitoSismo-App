package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.ConsejoPrevencion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la transferencia de datos de un Consejo de Prevención.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "id",
        "consejo",
        "orden",
        "faseId"
})
public class ConsejoPrevencionDTO {

    private Integer id;
    private String consejo;
    private Integer orden;
    private Integer faseId;

    public static ConsejoPrevencionDTO fromEntity(ConsejoPrevencion entidad) {
        if (entidad == null) return null;
        return ConsejoPrevencionDTO.builder()
                .id(entidad.getId())
                .consejo(entidad.getConsejo())
                .orden(entidad.getOrden())
                .faseId(entidad.getFase() != null ? entidad.getFase().getId() : null)
                .build();
    }
}
