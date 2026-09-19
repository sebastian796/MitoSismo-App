package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.UsuarioDTO;
import com.mito.sismo.dto.request.UsuarioCreateDTO;
import com.mito.sismo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository){
        this.usuarioRepository = usuarioRepository;
    }
}
