package com.mito.sismo.repository;
import com.mito.sismo.entity.ConfiguracionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ConfiguracionUsuarioRepository extends JpaRepository<ConfiguracionUsuario, Long> {
    Optional<ConfiguracionUsuario> findByUsuarioId(Long usuarioId);
    boolean existsByUsuarioId(Long usuarioId);
}