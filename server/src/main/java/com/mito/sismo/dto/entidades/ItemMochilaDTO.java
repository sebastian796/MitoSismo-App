package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.ItemMochila;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "id",
        "nombre",
        "descripcion",
        "imageUrl",
        "obligatorio",
})
public class ItemMochilaDTO {

    public static ItemMochilaDTO fromEntity(ItemMochila itemMochila) {
        return fromEntity(itemMochila, null);
    }

    public static ItemMochilaDTO fromEntity(ItemMochila itemMochila, Boolean marca) {
        return ItemMochilaDTO.builder()
                .id(itemMochila.getId())
                .nombre(itemMochila.getNombre())
                .descripcion(itemMochila.getDescripcion())
                .imageUrl(itemMochila.getImageUrl())
                .obligatorio(itemMochila.getObligatorio())
                .marcado(marca)
                .build();
    }

    private Integer id;
    private String nombre;
    private String descripcion;
    private String imageUrl;

    private Boolean obligatorio;

    private Boolean marcado;
}
