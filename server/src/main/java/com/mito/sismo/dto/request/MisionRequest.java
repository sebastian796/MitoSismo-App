package com.mito.sismo.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para crear o modificar una misión en el catálogo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MisionRequest {

    @NotBlank(message = "El título de la misión es obligatorio")
    @Size(max = 255)
    private String titulo;

    private String descripcion;

    @NotNull(message = "La recompensa de XP es obligatoria")
    @Min(value = 1, message = "La recompensa de XP debe ser al menos 1")
    private Integer xpRecompensa;

    @Size(max = 255)
    private String grado;

    @Size(max = 500)
    private String imageUrl;
}
