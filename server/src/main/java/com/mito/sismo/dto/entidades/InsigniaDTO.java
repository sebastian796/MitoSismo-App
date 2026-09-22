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
        "nombre",
        "descripcion",
        "icono",
        "colorFondo",
})
public class InsigniaDTO {

    private Integer id;
    private String nombre;
    private String descripcion;
    private String icono;
    private String colorFondo;
}
