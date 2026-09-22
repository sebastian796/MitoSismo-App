package com.mito.sismo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "insignias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Insignia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String nombre;

    private String descripcion;
    private String icono;
    private String colorFondo;

    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "insignia", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<UsuarioInsignia> usuarios = new HashSet<>();

}
