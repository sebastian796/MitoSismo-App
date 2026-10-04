package com.mito.sismo.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "misiones")
public class Mision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;
    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;
    @Column(name = "xp_recompensa")
    private Integer xpRecompensa;
    @Column(name = "grado", length = 255)
    private String grado;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    @OneToMany(mappedBy = "mision", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<UsuarioMision> usuarios = new HashSet<>();
}