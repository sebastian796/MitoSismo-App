package com.mito.sismo.dto.request;

import com.mito.sismo.entity.enums.Pais;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para crear o modificar un contacto de emergencia.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactoEmergenciaRequest {

    @NotBlank(message = "El nombre del contacto o institución es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "El número telefónico es obligatorio")
    @Size(max = 50)
    private String numero;

    @Size(max = 255)
    private String descripcion;

    @Size(max = 255)
    private String icono;

    @NotNull(message = "El país es obligatorio")
    private Pais pais;

    private Integer orden;
}
