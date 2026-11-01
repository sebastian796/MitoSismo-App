package com.mito.sismo.service;

import java.time.Instant;
import java.util.ArrayList;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mito.sismo.dto.entidades.ConfiguracionUsuarioDTO;
import com.mito.sismo.dto.entidades.TokensDTO;
import com.mito.sismo.dto.entidades.UsuarioDTO;
import com.mito.sismo.dto.request.ConfiguracionUsuarioRequest;
import com.mito.sismo.dto.request.LoginRequest;
import com.mito.sismo.dto.request.UserCreateRequest;
import com.mito.sismo.entity.ConfiguracionUsuario;
import com.mito.sismo.entity.Criatura;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioCriatura;
import com.mito.sismo.entity.enums.Pais;
import com.mito.sismo.exception.ConfiguracionConflictException;
import com.mito.sismo.exception.EmailAlreadyExistsException;
import com.mito.sismo.exception.InvalidCredentialsException;
import com.mito.sismo.exception.InvalidTokenException;
import com.mito.sismo.exception.ResourceNotFoundException;
import com.mito.sismo.exception.UsuarioNotFoundException;
import com.mito.sismo.repository.ConfiguracionUsuarioRepository;
import com.mito.sismo.repository.CriaturaRepository;
import com.mito.sismo.repository.UsuarioCriaturaRepository;
import com.mito.sismo.repository.UsuarioRepository;
import com.mito.sismo.security.EncryptionUtil;
import com.mito.sismo.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;
    private final EncryptionUtil encrypt;
    private final JwtUtil jwtUtil;
    private final MisionSqlService sql;
    private final RefreshTokenService refreshTokenService;

    private final UsuarioRepository userRepo;
    private final ConfiguracionUsuarioRepository configUserRepo;
    private final CriaturaRepository criaRepo;
    private final UsuarioCriaturaRepository userCriaRepo;

    // -Modificaion Datos Configuracion Usuario
    @Transactional
    public ConfiguracionUsuarioDTO actualizarConfig(String authHeader, ConfiguracionUsuarioRequest request) {
        Usuario user = extraerUsuarioEmailToken(authHeader);
        ConfiguracionUsuario config = extraerConfigUser(user);
        if (!config.getUpdatedAt().equals(request.getUpdatedAt())) {
            throw new ConfiguracionConflictException();
        }
        config.setNotifGeneral(request.getNotifGeneral());
        config.setNotifSismos(request.getNotifSismos());
        config.setNotifConsejos(request.getNotifConsejos());
        config.setAlertaSonora(request.getAlertaSonora());
        config.setMagnitudMinima(request.getMagnitudMinima());
        config.setPaisesNotificacion(new ArrayList<>(request.getPaisesNotificacion()));
        config.setHoraConsejos(request.getHoraConsejos());
        config.setRecordatorioMisiones(request.getRecordatorioMisiones());
        return ConfiguracionUsuarioDTO.fromEntity(configUserRepo.saveAndFlush(config));
    }

    // -Modificar Datos Configuracion Usuario
    @Transactional
    public void actualizarDataUser(
            String authHeader,
            UsuarioDTO userDTO) {
        Usuario user = extraerUsuarioEmailToken(authHeader);
        user.setNombre(userDTO.getNombreUsuario());
        user.setEmail(userDTO.getEmail());
        user.setCiudad(userDTO.getCiudad());
        user.setPais(userDTO.getPais());
        user.setUpdatedAt(Instant.now());
        userRepo.save(user);
    }

    // Extraer y validar el usuario desde el token JWT en el encabezado
    @Transactional
    public Usuario extraerUsuarioEmailToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new InvalidTokenException("Encabezado de autorización ausente o formato no válido.");
        }
        String token = authHeader.substring(7).trim();
        if (!jwtUtil.validateToken(token)) {
            throw new InvalidTokenException("El token JWT ha expirado o no es válido.");
        }
        String email = jwtUtil.extractEmail(token);
        return userRepo.findByEmail(email)
                .orElseThrow(
                        () -> new UsuarioNotFoundException("Usuario no encontrado con el email provisto en el token."));
    }

    // -Inicio de sesión de usuario de forma segura
    @Transactional
    public TokensDTO loginUsuario(LoginRequest loginRequest) {
        // 1. Buscar usuario por email (mensaje genérico para evitar enumeración
        // sensible)
        Usuario usuario = userRepo.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException());

        // 2. Comparar contraseñas hash (SIN exponer contraseñas en logs ni excepciones)
        if (!encrypt.matches(loginRequest.getPassword(), usuario.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        // 4. Generar y guardar tokens JWT
        String refreshToken = refreshTokenService.generarRefreshToken(usuario);
        String accessToken = refreshTokenService.generarAccessToken(usuario);
        refreshTokenService.guardarToken(usuario, refreshToken);

        return TokensDTO.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    // -Registro de un nuevo usuario en la plataforma
    @Transactional
    public TokensDTO registrarUsuario(UserCreateRequest userCreateReq) {
        // 1. Verificación de correo no duplicado
        if (userRepo.existsByEmail(userCreateReq.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "El correo " + userCreateReq.getEmail() + " ya se encuentra registrado.");
        }

        // 2. Registrar entidad Usuario
        Usuario usuario = userRepo.save(Usuario.builder()
                .nombre(userCreateReq.getNombreUsuario())
                .email(userCreateReq.getEmail())
                .passwordHash(encrypt.encryptPassword(userCreateReq.getPassword()))
                .pais(Pais.valueOf(userCreateReq.getPais()))
                .ciudad(userCreateReq.getCiudad())
                .createdAt(Instant.now())
                .updatedAt(Instant.now()).build());

        // 3. Crear configuración de usuario por defecto
        configUserRepo.save(ConfiguracionUsuario.builder()
                .usuario(usuario)
                .notifSismos(true)
                .notifConsejos(true)
                .alertaSonora(false)
                .magnitudMinima(4.5)
                .updatedAt(Instant.now()).build());

        // 4. Inicializar árbol de misiones para el nuevo usuario
        sql.inicializarMisionesParaUsuario(usuario.getId());

        // 5. Asignar criatura inicial
        Criatura criatura = criaRepo.findById(userCreateReq.getCriaturaId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Criatura inicial no encontrada con ID: " + userCreateReq.getCriaturaId()));

        userCriaRepo.save(
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

        return TokensDTO.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    // -Traer Configuracion Usuario
    @Transactional
    public ConfiguracionUsuarioDTO traerConfig(
            String authHeader) {
        Usuario user = extraerUsuarioEmailToken(authHeader);
        ConfiguracionUsuario config = extraerConfigUser(user);
        return ConfiguracionUsuarioDTO.fromEntity(config);
    }

    // -Traer Datos Usuario
    @Transactional(readOnly = true)
    public UsuarioDTO traerDataUser(
            String authHeader) {
        Usuario user = extraerUsuarioEmailToken(authHeader);
        return UsuarioDTO.fromEntity(user);
    }

    // La transacción pública mantiene este bloqueo hasta terminar GET/PUT.
    private ConfiguracionUsuario extraerConfigUser(Usuario user) {
        userRepo.lockForSettings(user.getId())
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado."));
        ConfiguracionUsuario config = configUserRepo.findByUsuarioId(user.getId())
                // Usuario posee una relación EAGER; refrescar descarta una copia leída antes
                // del bloqueo.
                .map(existing -> {
                    entityManager.refresh(existing);
                    return existing;
                })
                .orElseGet(() -> configUserRepo.saveAndFlush(ConfiguracionUsuario.builder().usuario(user).build()));
        if (config.getUpdatedAt() == null) {
            config.setUpdatedAt(Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS));
            configUserRepo.saveAndFlush(config);
        }
        return config;
    }
}