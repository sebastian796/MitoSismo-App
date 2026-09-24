package com.mito.sismo.dto.request;

import com.mito.sismo.entity.enums.Pais;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
public class UserCreateRequest {

    // Datos de Usuario

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 20, message = "El nombre de usuario debe tener entre 3 a 20 caracteres")
    private String nombreUsuario;

    @NotBlank(message = "El Email es obligatorio")
    @Email(message = "Debe ser un email válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatorio")
    @Size(min = 6, message = "La Contraseña debe tener minimo 6 caracteres")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$",
            message = "La contraseña debe contener letras, números y al menos un signo especial"
    )
    private String password;

    @Size(max = 100)
    private String ciudad;

    @Size(max = 100)
    @NotNull(message = "El Pais es obligatorio")
    private Pais pais;

    // Datos de Criatura

    private Long criaturaId;


}
