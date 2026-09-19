package com.mito.sismo.repository;

import com.mito.sismo.entity.UsuarioMochilaItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioMochilaItemRepository extends JpaRepository<UsuarioMochilaItem, Long> {
    List<UsuarioMochilaItem> findByUsuarioId(Long usuarioId);
    List<UsuarioMochilaItem> findByItemMochilaId(Long itemMochilaId);
}
