package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.FasePrevencion;
import com.mito.sismo.entity.enums.ClaveFase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO para la transferencia de datos de una Fase de Prevención con sus consejos asociados.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "id",
        "clave",
        "titulo",
        "icono",
        "consejos"
})
public class FasePrevencionDTO {

    private Integer id;
    private ClaveFase clave;
    private String titulo;
    private String icono;
    private List<ConsejoPrevencionDTO> consejos;

    public static FasePrevencionDTO fromEntity(FasePrevencion fase) {
        if (fase == null) return null;

        List<ConsejoPrevencionDTO> consejosDTO = (fase.getConsejos() != null)
                ? fase.getConsejos().stream()
                .sorted((a, b) -> Integer.compare(
                        a.getOrden() != null ? a.getOrden() : 0,
                        b.getOrden() != null ? b.getOrden() : 0
                ))
                .map(ConsejoPrevencionDTO::fromEntity)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return FasePrevencionDTO.builder()
                .id(fase.getId())
                .clave(fase.getClave())
                .titulo(fase.getTitulo())
                .icono(fase.getIcono())
                .consejos(consejosDTO)
                .build();
    }
}
