package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.MisionDTO;
import com.mito.sismo.entity.*;
import com.mito.sismo.entity.enums.Estado;
import com.mito.sismo.exception.InvalidTokenException;
import com.mito.sismo.exception.ResourceNotFoundException;
import com.mito.sismo.exception.UnauthorizedAccessException;
import com.mito.sismo.repository.MisionRepository;
import com.mito.sismo.repository.MissionPrerequisiteRepository;
import com.mito.sismo.repository.UsuarioMisionRepository;
import com.mito.sismo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de misiones de preparación sísmica y progreso del
 * usuario. Optimizado con proyecciones DTO directas e índices en BD.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MisionService {

    private final MisionRepository misionRepository;
    private final UsuarioMisionRepository userMisionRepository;
    private final MissionPrerequisiteRepository missionPrerequisiteRepository;
    private final UsuarioService userService;
    private final CriaturaService criaturaService;
    private final MisionSqlService jdbc;
    private final JwtUtil jwtUtil;

    // Extrae el userId directamente del token sin consultar la tabla usuarios en BD
    public Long extraerUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new InvalidTokenException("Encabezado de autorización ausente o formato no válido.");
        }
        String token = authHeader.substring(7).trim();
        try {
            return jwtUtil.extractUserId(token);
        } catch (Exception e) {
            log.warn("Fallo al extraer userId del token JWT de forma directa, usando fallback: {}", e.getMessage());
            return userService.extraerUsuarioEmailToken(authHeader).getId();
        }
    }

    // Listar únicamente las misiones disponibles para el usuario según su progresión:
    // - El usuario al registrarse ve las misiones básicas (sin misiones anteriores requeridas).
    // - Para desbloquear misiones intermedias, debe haber completado sus misiones básicas anteriores.
    // - Para desbloquear misiones avanzadas, debe haber completado sus misiones intermedias anteriores.
    // - Las misiones completadas permanecen visibles en la lista con su estado completado.
    @Transactional(readOnly = true)
    public List<MisionDTO> traerListaMisiones(Long userId) {
        // 1. Obtener las misiones del usuario y recolectar los IDs de las que ya completó
        List<MisionDTO> userMisiones = userMisionRepository.findDtosByUsuarioId(userId);

        Set<Integer> completadasIds = (userMisiones != null)
                ? userMisiones.stream()
                        .filter(m -> Boolean.TRUE.equals(m.getCompletada()) && m.getId() != null)
                        .map(MisionDTO::getId)
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        // 2. Obtener todo el catálogo maestro de misiones
        List<Mision> catalogo = misionRepository.findAll();
        if (catalogo == null || catalogo.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Cargar las misiones anteriores (prerrequisitos) necesarias para desbloquear cada misión
        Map<Integer, List<Integer>> misionesAnterioresPorMision = missionPrerequisiteRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        MissionPrerequisite::getMissionId,
                        Collectors.mapping(MissionPrerequisite::getPrerequisiteId, Collectors.toList())
                ));

        // 4. Filtrar y mapear solo las misiones disponibles para el usuario
        return catalogo.stream()
                .filter(mision -> {
                    // Si el usuario ya completó la misión, permanece visible como completada
                    if (completadasIds.contains(mision.getId())) {
                        return true;
                    }

                    // Obtener la lista de misiones anteriores necesarias para desbloquear esta misión
                    List<Integer> anteriores = misionesAnterioresPorMision.getOrDefault(mision.getId(), Collections.emptyList());

                    // - Si no tiene misiones anteriores: es una misión básica (disponible al registrarse)
                    // - Si tiene misiones anteriores: es intermedia o avanzada (requiere haber completado todas las anteriores)
                    return anteriores.isEmpty() || completadasIds.containsAll(anteriores);
                })
                .map(mision -> MisionDTO.fromEntity(mision, completadasIds.contains(mision.getId())))
                .sorted(Comparator.comparing(MisionDTO::getId))
                .collect(Collectors.toList());
    }

    // Listar misiones completadas por el usuario (filtrado en BD con índice)
    @Transactional(readOnly = true)
    public List<MisionDTO> getListMissionComplet(Long userId) {
        return userMisionRepository.findDtosByUsuarioIdAndCompletada(userId, true);
    }

    // Listar misiones pendientes/incompletas del usuario (filtrado en BD con índice)
    @Transactional(readOnly = true)
    public List<MisionDTO> getListMissionIncomplet(Long userId) {
        return userMisionRepository.findDtosByUsuarioIdAndCompletada(userId, false);
    }

    // Validar y marcar una misión como completada, asignando experiencia a la mascota
    @Transactional
    public InfoMisionDTO marcarCompletado(Long idMision, Long userId) {
        // Buscar por relación usuario y mision_id catálogo con JOIN FETCH; fallback por id de registro UsuarioMision
        Optional<UsuarioMision> misionUserOpt = userMisionRepository
                .findByUsuarioIdAndMisionIdWithDetails(userId, idMision.intValue());

        UsuarioMision misionUser;
        if (misionUserOpt.isPresent()) {
            misionUser = misionUserOpt.get();
        } else {
            misionUser = userMisionRepository.findById(idMision)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No se encontró la misión solicitada con ID: " + idMision));
        }

        // Validación de pertenencia al usuario autenticado
        if (!userId.equals(misionUser.getUsuario().getId())) {
            throw new UnauthorizedAccessException();
        }

        // Validación de no duplicar completado ni experiencia
        if (Boolean.TRUE.equals(misionUser.getCompletada())) {
            throw new IllegalArgumentException("Esta misión ya fue completada previamente.");
        }

        // Otorgar experiencia a la criatura activa del usuario
        try {
            UsuarioCriatura mascota = criaturaService.getCriaturaUsuario(userId);
            if (mascota != null && misionUser.getMision() != null && misionUser.getMision().getXpRecompensa() != null) {
                criaturaService.recalcularXpCriatura(mascota, misionUser.getMision().getXpRecompensa());
            }
        } catch (ResourceNotFoundException e) {
            log.warn("El usuario con ID {} no cuenta con criatura asignada para otorgar XP.", userId);
        } catch (Exception e) {
            log.error("Error al recalcular XP de criatura para usuario {}: {}", userId, e.getMessage());
        }

        // Actualizar el estado de la misión
        misionUser.setProgreso(100);
        misionUser.setCompletada(true);
        misionUser.setFechaCompletada(Instant.now());
        misionUser.setEstado(Estado.COMPLETED);
        misionUser.setXpOtorgada(true);

        UsuarioMision misionCompleta = userMisionRepository.save(misionUser);

        // Actualizar desbloqueo únicamente para misiones que dependían de la completada
        Integer catalogMisionId = misionUser.getMision() != null ? misionUser.getMision().getId() : idMision.intValue();
        jdbc.reconcileUnlocksForUsuario(userId, catalogMisionId);

        return InfoMisionDTO.fromEntity(misionCompleta);
    }

    // Listar todo el catálogo público de misiones
    @Transactional(readOnly = true)
    public List<MisionDTO> listarCatalogoMisiones() {
        return misionRepository.findAll().stream()
                .map(MisionDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
