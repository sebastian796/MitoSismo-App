package com.mito.sismo.repository;

import com.mito.sismo.entity.RefreshToken;
import com.mito.sismo.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findAllByUsuario(Usuario usuario);

    void deleteByUsuario(Usuario usuario);
}

