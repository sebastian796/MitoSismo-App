package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.ItemMochila;
import com.mito.sismo.entity.UsuarioMochilaItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "nombre",
        "descripcion",
        "obligaitorio",
})
public class ItemMochilaDTO {

    private String nombre;
    private String descripcion;
    private Boolean obligatorio;
    private Boolean marcado;

    public static ItemMochilaDTO fromEntity(ItemMochila itemMochila){
        return fromEntity(itemMochila, null);
    }

    public static ItemMochilaDTO fromEntity(ItemMochila itemMochila, Boolean marca){
        return ItemMochilaDTO.builder()
                .nombre(itemMochila.getNombre())
                .descripcion(itemMochila.getDescripcion())
                .obligatorio(itemMochila.getObligatorio())
                .marcado(marca)
                .build();
    }
}
