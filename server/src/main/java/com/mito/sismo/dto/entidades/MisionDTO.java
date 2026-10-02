package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.InfoMisionDTO;
import com.mito.sismo.entity.UsuarioMision;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "id",
        "titulo",
        "descripcion",
        "xpRecompensa",
        "grado",
        "imageUrl",
        "info"
})
public class MisionDTO {
    //Datos Misiones
    private Long idMision;
    private String titulo;
    private String descripcion;
    private Integer xpRecompensa;
    private String grado;
    private String imageUrl;

    //Datos Detallados
    private InfoMisionDTO info;

    public static MisionDTO fromEntity(UsuarioMision mision) {
        return MisionDTO.builder()
                .idMision(mision.getId())
                .titulo(mision.getMision().getTitulo())
                .descripcion(mision.getMision().getDescripcion())
                .xpRecompensa(mision.getMision().getXpRecompensa())
                .grado(mision.getMision().getGrado())
                .imageUrl(mision.getMision().getImageUrl())
                .info(InfoMisionDTO.builder()
                        .progreso(mision.getProgreso())
                        .completada(mision.getCompletada())
                        .estado(mision.getEstado().toString())
                        .xpOtorgada(mision.getXpOtorgada())
                        .evidenciaUrl(mision.getEvidenciaUrl())
                        .build()
                )
                .build();
    }


}
