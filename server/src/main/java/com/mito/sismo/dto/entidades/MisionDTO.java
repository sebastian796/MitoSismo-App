package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
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
        "icono"
})
public class MisionDTO {

    private Long id;
    private String titulo;
    private String descripcion;
    private Integer xpRecompensa;
    private String icono;
}
