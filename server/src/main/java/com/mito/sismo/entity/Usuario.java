package com.mito.sismo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El Nombre es Obligatorio")
    @Size(max = 100, message = "El nombre no debe de superar los 100 Caracteres")
    private String nombre;

    @NotBlank(message = "El Email es Obligatorio")
    @Email(message = "Debe ser Email Valido")
    @Column(unique = true,nullable = false,length = 150)
    private String passwordHash;

    @NotBlank(message = "El rol es obligatorio")
    @Column(nullable = false, length = 50)
    private String rol; // USUARIO o ADMIN

    @Size(max = 100)
    private String ciudad;

    @Size(max = 100)
    private String pais;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

}
