package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.Mision;
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
        "imageUrl"
})
public class MisionDTO {
    //Datos Misiones
    private String titulo;
    private String descripcion;
    private Integer xpRecompensa;
    private String grado;
    private String imageUrl;
    private Boolean completada;

    public static MisionDTO fromEntity(Mision mision){
        fromEntity(mision, null);
    }

    public static MisionDTO fromEntity(Mision mision, Boolean completada) {
        return MisionDTO.builder()
                .titulo(mision.getTitulo())
                .descripcion(mision.getDescripcion())
                .xpRecompensa(mision.getXpRecompensa())
                .grado(mision.getGrado())
                .imageUrl(mision.getImageUrl())
                .completada(completada)
                .build();
    }


}
