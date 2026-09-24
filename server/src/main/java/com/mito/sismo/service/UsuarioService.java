package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.CriaturaDTO;
import com.mito.sismo.dto.entidades.CriaturaDataDTO;
import com.mito.sismo.dto.entidades.UsuarioDTO;
import com.mito.sismo.dto.request.LoginRequest;
import com.mito.sismo.dto.request.UserCreateRequest;
import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioCriatura;
import com.mito.sismo.exception.GeneralAuthException;
import com.mito.sismo.repository.CriaturaRepository;
import com.mito.sismo.repository.UsuarioCriaturaRepository;
import com.mito.sismo.repository.UsuarioRepository;
import com.mito.sismo.security.EncryptionUtil;
import com.mito.sismo.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final EncryptionUtil encrypt;
    private final JwtUtil jwtUtil;

    private final UsuarioRepository usuarioRepository;
    private final CriaturaRepository criaturaRepository;
    private final UsuarioCriaturaRepository usuarioCriaturaRepository;
    private final RefreshTokenService refreshTokenService;

    public UsuarioService(
            EncryptionUtil encryptionUtil,
            JwtUtil jwtUtil,
            UsuarioRepository usuarioRepository,
            CriaturaRepository criaturaRepository,
            UsuarioCriaturaRepository usuarioCriaturaRepository,
            RefreshTokenService refreshTokenService
    ){
        this.encrypt = encryptionUtil;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
        this.criaturaRepository = criaturaRepository;
        this.usuarioCriaturaRepository = usuarioCriaturaRepository;
        this.refreshTokenService = refreshTokenService;
    }

    // Registro de Nuevo Usuario
    @Transactional
    public UsuarioDTO registrarUsuario(UserCreateRequest userCreate){
        // Verificacion de correo existente
        if(usuarioRepository.existsByEmail(userCreate.getEmail())){
            throw new GeneralAuthException(
                    "Correo Registrado",
                    "/api/auth/registrar",
                    "Email: " + userCreate.getEmail()
            );
        }

        // Registrar Usuario
        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .nombre(userCreate.getNombreUsuario())
                .email(userCreate.getEmail())
                .passwordHash(encrypt.encryptPassword(userCreate.getPassword()))
                .pais(userCreate.getPais())
                .ciudad(userCreate.getCiudad())
                .build());


        // Guardar Token
        String refreshToken = refreshTokenService.generarRefreshToken(usuario);
        String accessToken = refreshTokenService.generarAccessToken(usuario);
        refreshTokenService.guardarToken(usuario,refreshToken);

        // Buscar Criatura
        Criatura criatura = criaturaRepository.findById(userCreate.getCriaturaId())
                .orElseThrow(()-> new GeneralAuthException(
                        "Criatura no Encontrada",
                        "api/auth/registrar",
                        "ID: " + userCreate.getCriaturaId()
                ));

        // Registrar Criatura
        UsuarioCriatura mascota = usuarioCriaturaRepository.save(
                UsuarioCriatura.builder()
                        .usuario(usuario)
                        .criatura(criatura)
                        .build()
        );

        // Response
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .dataMascota(CriaturaDataDTO.builder()
                        .criatura(CriaturaDTO.builder()
                                .id(criatura.getId())
                                .nombre(criatura.getNombre())
                                .titulo(criatura.getTitulo())
                                .elemento(criatura.getElemento())
                                .imageUrl(criatura.getImageUrl())
                                .build()
                        )
                        .nivel(mascota.getNivel())
                        .xpActual(mascota.getXpActual())
                        .activa(mascota.getActiva())
                        .build()
                )
                .build();
    }

    // Iniciar Seesion Usuario
    @Transactional
    public UsuarioDTO loginUsuario(LoginRequest loginRequest){
        // Verificar Existencia de Usuario
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(()-> new GeneralAuthException(
                        "Usuario No Existente",
                        "api/auth/login",
                        "Email: "+loginRequest.getEmail()
                ));
        // Comparar Contraseñas hash
        if(!encrypt.matches(loginRequest.getPassword(),usuario.getPasswordHash())){
            throw new GeneralAuthException(
                    "Password Incorrecto",
                    "api/auth/login",
                    "Password: "+loginRequest.getPassword()
            );
        }

        // -Preparar Datos
        // Datos Mascota
        UsuarioCriatura mascota = usuarioCriaturaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(()-> new GeneralAuthException(
                        "Datos Criatura No Existente",
                        "api/auth/login",
                        "ID: "+usuario.getId()
                ));
        // Datos Criatura
        Criatura criatura = mascota.getCriatura();

        // Generar Tokens
        String refreshToken = refreshTokenService.generarRefreshToken(usuario);
        String accessToken = refreshTokenService.generarAccessToken(usuario);
        refreshTokenService.guardarToken(usuario,refreshToken);

        // Enviar
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .dataMascota(CriaturaDataDTO.builder()
                        .criatura(CriaturaDTO.builder()
                                .id(criatura.getId())
                                .nombre(criatura.getNombre())
                                .titulo(criatura.getTitulo())
                                .elemento(criatura.getElemento())
                                .imageUrl(criatura.getImageUrl())
                                .build()
                        )
                        .nivel(mascota.getNivel())
                        .xpActual(mascota.getXpActual())
                        .activa(mascota.getActiva())
                        .build()
                )
                .build();
    }

}
