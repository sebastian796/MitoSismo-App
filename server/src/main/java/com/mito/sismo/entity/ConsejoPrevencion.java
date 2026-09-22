package com.mito.sismo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "consejos_prevencion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsejoPrevencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fase_id", nullable = false)
    private FasePrevencion fase;

    private String consejo;
    private Integer orden = 0;
}

