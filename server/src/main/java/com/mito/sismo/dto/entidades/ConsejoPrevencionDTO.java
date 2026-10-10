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
        "consejo",
        "orden",
        "faseId"
})
public class ConsejoPrevencionDTO {


}
