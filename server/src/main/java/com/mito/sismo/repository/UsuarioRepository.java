package com.mito.sismo.repository;

import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario,Long> {

    // Buscas Usuario por Email
    Optional<Usuario> findByEmail(String email);

    //Buscar Usuario por nombre de usuario
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    //Verificar existencia de usuario por email
    boolean existsByEmail(String email);

    //Verificar si existe usuario con cierto nombre
    boolean existsByNombreUsuario(String nombreUsuario);

    //Paginación y ordenamiento
    Page<Usuario> findAll(Pageable pageable);
}
