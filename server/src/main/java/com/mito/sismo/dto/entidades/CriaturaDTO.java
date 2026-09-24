package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
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
        "elemento",
        "descripcion",
        "mitoLore",
        "imageUrl"
})
public class CriaturaDTO {

    private Integer id;
    private String nombre;
    private String titulo;
    private Elemento elemento;
    private String descripcion;
    private String mitoLore;
    private String imageUrl;

}
