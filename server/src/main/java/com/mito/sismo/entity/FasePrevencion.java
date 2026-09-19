package com.mito.sismo.entity;

import com.mito.sismo.entity.enums.ClaveFase;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "fases_prevencion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FasePrevencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private ClaveFase clave;

    private String titulo;
    private String icono;

    @OneToMany(mappedBy = "fase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ConsejoPrevencion> consejos = new HashSet<>();

}

