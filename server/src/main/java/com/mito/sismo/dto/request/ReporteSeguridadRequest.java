package com.mito.sismo.dto.request;

import com.mito.sismo.entity.enums.EstadoSeguridad;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para registrar o actualizar el estado de seguridad de un usuario en un sismo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteSeguridadRequest {

    @NotBlank(message = "El identificador del sismo es obligatorio")
    private String sismoExternoId;

    @NotNull(message = "El estado de seguridad es obligatorio")
    private EstadoSeguridad estadoSeguridad;

    private Boolean sentido;
    private Double latitud;
    private Double longitud;

    @Size(max = 500, message = "El comentario no debe superar los 500 caracteres")
    private String comentario;
}
