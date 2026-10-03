package com.mito.sismo.entity;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.dto.entidades.MisionDTO;
import com.mito.sismo.entity.enums.Estado;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "mision",
        "progreso",
        "estado",
        "xpOtorgada",
        "evidenciaUrl"
})
public class InfoMisionDTO {

    private MisionDTO mision;

    private Integer progreso;
    private String estado;
    private Boolean xpOtorgada;
    private String evidenciaUrl;

    public static InfoMisionDTO fromEntity(
            UsuarioMision mision){
        return InfoMisionDTO.builder()
                .mision(MisionDTO.fromEntity(mision.getMision(),mision.getCompletada()))
                .progreso(mision.getProgreso())
                .estado(mision.getEstado().toString())
                .xpOtorgada(mision.getXpOtorgada())
                .evidenciaUrl(mision.getEvidenciaUrl())
                .build();

    }

}
