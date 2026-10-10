package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.enums.Elemento;
import com.mito.sismo.entity.enums.Pais;
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
        "ciudad",
        "pais"
})
public class UsuarioDTO {
    private Long id;
    private String nombreUsuario;
    private String email;
    private Role rol;
    private String ciudad;
    private Pais pais;


    public static UsuarioDTO fromEntity(Usuario user){
        if(user == null) return null;
        return UsuarioDTO.builder()
                .id(user.getId())
                .nombreUsuario(user.getNombre())
                .email(user.getEmail())
                .rol(user.getRol())
                .pais(user.getPais())
                .ciudad(user.getCiudad())
                .build();

    }

}
