package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.enums.Elemento;
import com.mito.sismo.entity.enums.Role;
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
        "nombreUsuario",
        "email",
        "rol",
        "accessToken",
        "refreshToken",
        "dataMascota"
})
public class UsuarioDTO {
    private Long id;
    private String nombreUsuario;
    private String email;
    private Role rol;

    private String accessToken;
    private String refreshToken;

    private CriaturaDataDTO dataMascota;

}
