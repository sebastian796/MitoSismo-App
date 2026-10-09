package com.mito.sismo.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para actualizar los parámetros de configuración de alertas del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionUsuarioRequest {

    private Boolean notifSismos;
    private Boolean notifConsejos;
    private Boolean alertaSonora;

    @DecimalMin(value = "1.0", message = "La magnitud mínima no puede ser menor a 1.0")
    @DecimalMax(value = "10.0", message = "La magnitud mínima no puede ser mayor a 10.0")
    private Double magnitudMinima;
}
