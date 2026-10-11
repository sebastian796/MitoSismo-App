package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.ConsejoPrevencion;
import com.mito.sismo.entity.FasePrevencion;
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
        "fase",
        "consejo"
})
public class ConsejoPrevencionDTO {

    private FasePrevencionDTO fase;
    private String consejo;

    public static ConsejoPrevencionDTO fromEntity(ConsejoPrevencion consejo){
        if(consejo == null) return null;
        return ConsejoPrevencionDTO.builder()
                .fase(FasePrevencionDTO.fromEntity(consejo.getFase()))
                .consejo(consejo.getConsejo())
                .build();
    }


}
