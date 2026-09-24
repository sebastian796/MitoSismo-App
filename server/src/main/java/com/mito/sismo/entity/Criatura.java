package com.mito.sismo.entity;

import com.mito.sismo.entity.enums.Elemento;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "criaturas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Criatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 100)
    private String nombre;

    private String titulo;

    @Enumerated(EnumType.STRING)
    private Elemento elemento;

    private String descripcion;
    private String mitoLore;
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "criatura", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<UsuarioCriatura> usuarios = new HashSet<>();

}
