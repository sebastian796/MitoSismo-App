package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.CriaturaDTO;
import com.mito.sismo.dto.entidades.CriaturaDataDTO;
import com.mito.sismo.dto.entidades.UsuarioDTO;
import com.mito.sismo.dto.request.LoginRequest;
import com.mito.sismo.dto.request.UpdateUsuarioRequest;
import com.mito.sismo.dto.request.UserCreateRequest;
import com.mito.sismo.entity.ConfiguracionUsuario;
import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioCriatura;
import com.mito.sismo.entity.enums.Pais;
import com.mito.sismo.entity.enums.Role;
import com.mito.sismo.exception.*;
import com.mito.sismo.repository.ConfiguracionUsuarioRepository;
import com.mito.sismo.repository.CriaturaRepository;
import com.mito.sismo.repository.UsuarioCriaturaRepository;
import com.mito.sismo.repository.UsuarioRepository;
import com.mito.sismo.security.EncryptionUtil;
import com.mito.sismo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Servicio para la gestión de usuarios, registro, autenticación segura y
 * perfil.
 */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final EncryptionUtil encrypt;
    private final JwtUtil jwtUtil;

    private final UsuarioRepository usuarioRepository;
    private final CriaturaRepository criaturaRepository;
    private final UsuarioCriaturaRepository usuarioCriaturaRepository;
    private final ConfiguracionUsuarioRepository configuracionUsuarioRepository;
    private final RefreshTokenService refreshTokenService;

    private final MisionSqlService sql;

    // Registro de un nuevo usuario en la plataforma
    @Transactional
    public UsuarioDTO registrarUsuario(UserCreateRequest userCreate) {
        // 1. Verificación de correo no duplicado
        if (usuarioRepository.existsByEmail(userCreate.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "El correo " + userCreate.getEmail() + " ya se encuentra registrado.");
        }

        Pais paisSeleccionado = Pais.PERU;
        if (userCreate.getPais() != null) {
            try {
                paisSeleccionado = Pais.valueOf(userCreate.getPais().toUpperCase());
            } catch (IllegalArgumentException e) {
                paisSeleccionado = Pais.PERU;
            }
        }

        // 2. Registrar entidad Usuario
        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .nombre(userCreate.getNombreUsuario())
                .email(userCreate.getEmail())
                .passwordHash(encrypt.encryptPassword(userCreate.getPassword()))
                .pais(paisSeleccionado)
                .ciudad(userCreate.getCiudad())
                .rol(Role.USUARIO)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        // 3. Crear configuración de usuario por defecto
        configuracionUsuarioRepository.save(ConfiguracionUsuario.builder()
                .usuario(usuario)
                .notifSismos(true)
                .notifConsejos(true)
                .alertaSonora(false)
                .magnitudMinima(4.5)
                .updatedAt(Instant.now())
                .build());

        // 4. Inicializar árbol de misiones para el nuevo usuario
        sql.inicializarMisionesParaUsuario(usuario.getId());

        // 5. Asignar criatura inicial
        Criatura criatura = criaturaRepository.findById(userCreate.getCriaturaId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Criatura inicial no encontrada con ID: " + userCreate.getCriaturaId()));

        UsuarioCriatura mascota = usuarioCriaturaRepository.save(
                UsuarioCriatura.builder()
                        .usuario(usuario)
                        .criatura(criatura)
                        .nivel(1)
                        .xpActual(0)
                        .activa(true)
                        .updatedAt(Instant.now())
                        .build());

        // 6. Generar tokens JWT
        String refreshToken = refreshTokenService.generarRefreshToken(usuario);
        String accessToken = refreshTokenService.generarAccessToken(usuario);
        refreshTokenService.guardarToken(usuario, refreshToken);

        // 7. Retornar DTO de respuesta
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .dataMascota(CriaturaDataDTO.builder()
                        .criatura(CriaturaDTO.fromEntity(criatura))
                        .nivel(mascota.getNivel())
                        .xpActual(mascota.getXpActual())
                        .activa(mascota.getActiva())
                        .build())
                .build();
    }

    // Inicio de sesión de usuario de forma segura
    @Transactional
    public UsuarioDTO loginUsuario(LoginRequest loginRequest) {
        // 1. Buscar usuario por email (mensaje genérico para evitar enumeración
        // sensible)
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException());

        // 2. Comparar contraseñas hash (SIN exponer contraseñas en logs ni excepciones)
        if (!encrypt.matches(loginRequest.getPassword(), usuario.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        // 3. Obtener datos de la mascota del usuario
        UsuarioCriatura mascota = usuarioCriaturaRepository.findByUsuarioId(usuario.getId())
                .orElse(null);

        CriaturaDTO criaturaDTO = null;
        CriaturaDataDTO mascotaDTO = null;

        if (mascota != null && mascota.getCriatura() != null) {
            criaturaDTO = CriaturaDTO.fromEntity(mascota.getCriatura());
            mascotaDTO = CriaturaDataDTO.builder()
                    .criatura(criaturaDTO)
                    .nivel(mascota.getNivel())
                    .xpActual(mascota.getXpActual())
                    .activa(mascota.getActiva())
                    .build();
        }

        // 4. Generar y guardar tokens JWT
        String refreshToken = refreshTokenService.generarRefreshToken(usuario);
        String accessToken = refreshTokenService.generarAccessToken(usuario);
        refreshTokenService.guardarToken(usuario, refreshToken);

        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .dataMascota(mascotaDTO)
                .build();
    }

    // Obtener datos del perfil del usuario autenticado
    @Transactional(readOnly = true)
    public UsuarioDTO obtenerPerfil(String authHeader) {
        Usuario usuario = extraerUsuarioEmailToken(authHeader);

        UsuarioCriatura mascota = usuarioCriaturaRepository.findByUsuarioId(usuario.getId()).orElse(null);
        CriaturaDataDTO mascotaDTO = null;
        if (mascota != null && mascota.getCriatura() != null) {
            mascotaDTO = CriaturaDataDTO.builder()
                    .criatura(CriaturaDTO.fromEntity(mascota.getCriatura()))
                    .nivel(mascota.getNivel())
                    .xpActual(mascota.getXpActual())
                    .activa(mascota.getActiva())
                    .build();
        }

        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .dataMascota(mascotaDTO)
                .build();
    }

    // Modificar datos personales del usuario autenticado
    @Transactional
    public UsuarioDTO actualizarPerfil(String authHeader, UpdateUsuarioRequest request) {
        Usuario usuario = extraerUsuarioEmailToken(authHeader);

        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            usuario.setNombre(request.getNombre().trim());
        }
        if (request.getCiudad() != null) {
            usuario.setCiudad(request.getCiudad().trim());
        }
        if (request.getPais() != null) {
            try {
                usuario.setPais(Pais.valueOf(request.getPais().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }
        usuario.setUpdatedAt(Instant.now());

        Usuario guardado = usuarioRepository.save(usuario);
        return obtenerPerfil(authHeader);
    }

    // Extraer y validar el usuario desde el token JWT en el encabezado
    // Authorization
    public Usuario extraerUsuarioEmailToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new InvalidTokenException("Encabezado de autorización ausente o formato no válido.");
        }
        String token = authHeader.substring(7).trim();
        if (!jwtUtil.validateToken(token)) {
            throw new InvalidTokenException("El token JWT ha expirado o no es válido.");
        }
        String email = jwtUtil.extractEmail(token);
        return usuarioRepository.findByEmail(email)
                .orElseThrow(
                        () -> new UsuarioNotFoundException("Usuario no encontrado con el email provisto en el token."));
    }

    // Obtener un usuario por ID
    @Transactional(readOnly = true)
    public UsuarioDTO obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNotFoundException(id));

        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombreUsuario(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .build();
    }

    // Listar usuarios paginados
    @Transactional(readOnly = true)
    public Page<UsuarioDTO> listarUsuarios(Pageable pageable) {
        return usuarioRepository.findAll(pageable)
                .map(u -> UsuarioDTO.builder()
                        .id(u.getId())
                        .nombreUsuario(u.getNombre())
                        .email(u.getEmail())
                        .rol(u.getRol())
                        .build());
    }
}
