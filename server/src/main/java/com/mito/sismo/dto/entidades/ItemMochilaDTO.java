package com.mito.sismo.dto.entidades;

import com.mito.sismo.entity.ItemMochila;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemMochilaDTO {

    public static ItemMochilaDTO fromEntity(
            ItemMochila itemMochila){
        return ItemMochilaDTO.fromEntity(itemMochila,false);
    }

    public static ItemMochilaDTO fromEntity(
            ItemMochila itemMochila,
            Boolean marca
    ){
        return ItemMochilaDTO.builder()
                .id(itemMochila.getId())
                .nombre(itemMochila.getNombre())
                .obligatorio(itemMochila.getObligatorio())
                .orden(itemMochila.getOrden())
                .marcado(marca)
                .build();
    }

    private Integer id;
    private String nombre;
    private Boolean obligatorio;
    private Integer orden;
    private Boolean marcado;



}
