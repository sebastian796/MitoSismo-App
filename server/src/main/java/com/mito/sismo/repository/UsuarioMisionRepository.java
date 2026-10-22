package com.mito.sismo.repository;

import com.mito.sismo.entity.UsuarioMision;
import com.mito.sismo.dto.entidades.MisionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para el seguimiento de misiones de cada usuario.
 */
public interface UsuarioMisionRepository extends JpaRepository<UsuarioMision, Long> {

    List<UsuarioMision> findByUsuarioId(Long usuarioId);

    List<UsuarioMision> findByMisionId(Integer misionId);

    Optional<UsuarioMision> findByUsuarioIdAndMisionId(Long usuarioId, Integer misionId);

    Page<UsuarioMision> findByUsuarioId(Long usuarioId, Pageable pageable);

    // Proyecciones directas a DTO (evitan instanciar entidades JPA y dirty checking en memoria)
    @Query("""
        SELECT new com.mito.sismo.dto.entidades.MisionDTO(
            m.id, m.titulo, m.descripcion, m.xpRecompensa, m.grado, m.imageUrl, um.completada
        )
        FROM UsuarioMision um
        JOIN um.mision m
        WHERE um.usuario.id = :usuarioId
        ORDER BY m.id ASC
    """)
    List<MisionDTO> findDtosByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("""
        SELECT new com.mito.sismo.dto.entidades.MisionDTO(
            m.id, m.titulo, m.descripcion, m.xpRecompensa, m.grado, m.imageUrl, um.completada
        )
        FROM UsuarioMision um
        JOIN um.mision m
        WHERE um.usuario.id = :usuarioId AND um.completada = :completada
        ORDER BY m.id ASC
    """)
    List<MisionDTO> findDtosByUsuarioIdAndCompletada(
            @Param("usuarioId") Long usuarioId,
            @Param("completada") Boolean completada
    );

    // Consulta con JOIN FETCH para recuperar la relación completa en 1 sola consulta sin N+1
    @Query("""
        SELECT um FROM UsuarioMision um
        JOIN FETCH um.mision
        JOIN FETCH um.usuario
        WHERE um.usuario.id = :usuarioId AND um.mision.id = :misionId
    """)
    Optional<UsuarioMision> findByUsuarioIdAndMisionIdWithDetails(
            @Param("usuarioId") Long usuarioId,
            @Param("misionId") Integer misionId
    );
}
