package com.mito.sismo.dto.request;

import com.mito.sismo.entity.enums.Elemento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para crear o modificar criaturas en el catálogo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CriaturaRequest {

    @NotBlank(message = "El nombre de la criatura es obligatorio")
    @Size(max = 100)
    private String nombre;

    @Size(max = 255)
    private String titulo;

    @NotNull(message = "El elemento es obligatorio")
    private Elemento elemento;

    private String descripcion;
    private String mitoLore;

    @Size(max = 500)
    private String imageUrl;
}
