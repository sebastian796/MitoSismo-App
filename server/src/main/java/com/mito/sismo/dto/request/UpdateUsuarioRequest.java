package com.mito.sismo.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para modificar los datos personales de un usuario (nombre, ciudad, país).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUsuarioRequest {

    @Size(min = 3, max = 50, message = "El nombre debe tener entre 3 y 50 caracteres")
    private String nombre;

    @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
    private String ciudad;

    private String pais;
}
