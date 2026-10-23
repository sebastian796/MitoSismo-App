package com.mito.sismo.dto.request;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Reemplazo completo de las ocho preferencias; no acepta identidad del cliente.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracionUsuarioRequest {
    @NotNull
    private Boolean notifGeneral;
    @NotNull
    private Boolean notifSismos;
    @NotNull
    private Boolean notifConsejos;
    @NotNull
    private Boolean alertaSonora;
    @NotNull
    @DecimalMin("1.0")
    @DecimalMax("10.0")
    @Digits(integer = 2, fraction = 1)
    private Double magnitudMinima;
    @NotNull
    @Size(max = 5)
    private List<@NotNull @Pattern(regexp = "Perú|Chile|Ecuador|Colombia|México") String> paisesNotificacion;
    @NotNull
    @Min(0)
    @Max(23)
    private Integer horaConsejos;
    @NotNull
    private Boolean recordatorioMisiones;
    /**
     * Versión obtenida con GET/PUT: una petición antigua no puede sobrescribir
     * otra.
     */
    @NotNull
    private Instant updatedAt;

    @AssertTrue(message = "Los países no pueden estar duplicados")
    public boolean isPaisesSinDuplicados() {
        return paisesNotificacion == null || new HashSet<>(paisesNotificacion).size() == paisesNotificacion.size();
    }
}
