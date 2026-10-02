package com.mito.sismo.entity;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.enums.Estado;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "progreso",
        "completada",
        "estado",
        "xpOtorgada",
        "evidenciaUrl"
})
public class InfoMisionDTO {

    private Integer progreso;
    private Boolean completada;
    private String estado;
    private Boolean xpOtorgada;
    private String evidenciaUrl;
}
