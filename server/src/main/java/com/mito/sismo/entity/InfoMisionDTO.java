package com.mito.sismo.entity;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.dto.entidades.MisionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que encapsula el progreso detallado y estado de una misión asignada a un usuario.
 */
@Data
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

    public static InfoMisionDTO fromEntity(UsuarioMision mision) {
        if (mision == null) return null;
        return InfoMisionDTO.builder()
                .mision(MisionDTO.fromEntity(mision.getMision(), mision.getCompletada()))
                .progreso(mision.getProgreso())
                .estado(mision.getEstado() != null ? mision.getEstado().toString() : null)
                .xpOtorgada(mision.getXpOtorgada())
                .evidenciaUrl(mision.getEvidenciaUrl())
                .build();
    }
}
