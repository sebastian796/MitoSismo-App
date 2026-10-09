package com.mito.sismo.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición para el registro de un nuevo usuario en la plataforma.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserCreateRequest {

    // Datos de Usuario
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    private String nombreUsuario;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener mínimo 6 caracteres")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$",
            message = "La contraseña debe contener letras, números y al menos un carácter especial (@$!%*?&)"
    )
    private String password;

    @Size(max = 100)
    private String ciudad;

    @NotNull(message = "El país es obligatorio")
    private String pais;

    // ID de la Criatura inicial seleccionada
    @NotNull(message = "Debe seleccionar una criatura inicial")
    private Integer criaturaId;
}
