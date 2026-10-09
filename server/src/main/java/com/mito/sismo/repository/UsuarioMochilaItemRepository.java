package com.mito.sismo.repository;

import com.mito.sismo.entity.UsuarioMochilaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para los ítems de mochila guardados por el usuario.
 */
@Repository
public interface UsuarioMochilaItemRepository extends JpaRepository<UsuarioMochilaItem, Long> {

    List<UsuarioMochilaItem> findByUsuarioId(Long usuarioId);

    List<UsuarioMochilaItem> findByItemMochilaId(Integer itemMochilaId);

    Optional<UsuarioMochilaItem> findByUsuarioIdAndItemMochilaId(Long usuarioId, Integer itemMochilaId);
}
