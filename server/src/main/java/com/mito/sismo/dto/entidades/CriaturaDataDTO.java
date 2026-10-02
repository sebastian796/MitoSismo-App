package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.UsuarioCriatura;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonPropertyOrder({
        "criatura",
        "nivel",
        "xpActual",
        "activa",
        "xpMinima",
        "xpMaxima"
})
public class CriaturaDataDTO {

    public static CriaturaDataDTO fromEntity(UsuarioCriatura datos){
        return fromEntity(datos, null,null);
    }

    public static CriaturaDataDTO fromEntity(UsuarioCriatura datos, Integer xpMinima, Integer xpMaxima){
        return CriaturaDataDTO.builder()
                .criatura(CriaturaDTO.fromEntity(datos.getCriatura()))
                .nivel(datos.getNivel())
                .xpActual(datos.getXpActual())
                .activa(datos.getActiva())
                .xpMinima(xpMinima)
                .xpMaxima(xpMaxima)
                .build();
    }

    private CriaturaDTO criatura;
    private Integer nivel;
    private Integer xpActual;
    private Boolean activa;
    private Integer xpMinima;
    private Integer xpMaxima;
}
