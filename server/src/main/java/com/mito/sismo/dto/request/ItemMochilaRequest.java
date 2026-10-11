package com.mito.sismo.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para actualizar o sincronizar el estado marcado de un ítem de mochila.
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ItemMochilaRequest {

    @NotNull(message = "El id del ítem es obligatorio")
    private Integer id;

    @NotNull(message = "El estado marcado es obligatorio")
    private Boolean marcado;

    // Métodos de compatibilidad
    public Integer getItemId() {
        return id;
    }

    public void setItemId(Integer itemId) {
        this.id = itemId;
    }

    public boolean isMarcado() {
        return Boolean.TRUE.equals(marcado);
    }
}
