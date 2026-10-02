package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.UsuarioCriatura;
import com.mito.sismo.entity.enums.Elemento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonPropertyOrder({
        "id",
        "nombre",
        "titulo",
        "descripcion",
        "elemento",
        "mitoLore",
        "imageUrl"
})
public class CriaturaDTO {

    public static CriaturaDTO fromEntity(Criatura criatura){
        return CriaturaDTO.builder()
                .id(criatura.getId())
                .nombre(criatura.getNombre())
                .titulo(criatura.getTitulo())
                .descripcion(criatura.getDescripcion())
                .elemento(criatura.getElemento())
                .mitoLore(criatura.getMitoLore())
                .imageUrl(criatura.getImageUrl())
                .build();
    }

    private Integer id;
    private String nombre;
    private String titulo;
    private Elemento elemento;
    private String descripcion;
    private String mitoLore;
    private String imageUrl;
}

