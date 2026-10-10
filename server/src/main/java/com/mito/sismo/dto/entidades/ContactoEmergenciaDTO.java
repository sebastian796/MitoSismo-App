package com.mito.sismo.dto.entidades;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mito.sismo.entity.ContactoEmergencia;
import com.mito.sismo.entity.enums.Pais;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la visualización de un Contacto o Línea de Emergencia.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({
        "nombre",
        "numero",
        "descripcion",
        "icono",
        "pais",
})
public class ContactoEmergenciaDTO {

    private String nombre;
    private String numero;
    private String descripcion;
    private String icono;
    private Pais pais;

    public static ContactoEmergenciaDTO fromEntity(ContactoEmergencia contacto) {
        if (contacto == null) return null;
        return ContactoEmergenciaDTO.builder()
                .nombre(contacto.getNombre())
                .numero(contacto.getNumero())
                .descripcion(contacto.getDescripcion())
                .icono(contacto.getIcono())
                .pais(contacto.getPais())
                .build();
    }
}
