package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonPropertyOrder({
        "criatura",
        "nivel",
        "xpActual",
        "activa"
})
public class CriaturaDataDTO {

    private CriaturaDTO criatura;
    private Integer nivel;
    private Integer xpActual;
    private Boolean activa;
}
