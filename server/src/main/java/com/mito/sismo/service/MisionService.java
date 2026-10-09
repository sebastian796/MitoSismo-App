package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.MisionDTO;
import com.mito.sismo.dto.request.MisionRequest;
import com.mito.sismo.entity.InfoMisionDTO;
import com.mito.sismo.entity.Mision;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioCriatura;
import com.mito.sismo.entity.UsuarioMision;
import com.mito.sismo.entity.enums.Estado;
import com.mito.sismo.exception.ResourceNotFoundException;
import com.mito.sismo.exception.UnauthorizedAccessException;
import com.mito.sismo.repository.MisionRepository;
import com.mito.sismo.repository.UsuarioMisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de misiones de preparación sísmica y progreso del
 * usuario.
 */
@Service
@RequiredArgsConstructor
public class MisionService {

    private final MisionRepository misionRepository;
    private final UsuarioMisionRepository userMisionRepository;
    private final UsuarioService userService;
    private final CriaturaService criaturaService;
    private final JdbcTemplate jdbc;

    // Listar todas las misiones asociadas al usuario autenticado
    @Transactional(readOnly = true)
    public List<MisionDTO> traerListaMisiones(String authHeader) {
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        return listMissionUser.stream()
                .map(mision -> MisionDTO.fromEntity(mision.getMision(), Boolean.TRUE.equals(mision.getCompletada())))
                .collect(Collectors.toList());
    }

    // Listar misiones completadas por el usuario
    @Transactional(readOnly = true)
    public List<MisionDTO> getListMissionComplet(String authHeader) {
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        return listMissionUser.stream()
                .filter(mision -> Boolean.TRUE.equals(mision.getCompletada()))
                .map(mision -> MisionDTO.fromEntity(mision.getMision(), true))
                .collect(Collectors.toList());
    }

    // Listar misiones pendientes/incompletas del usuario
    @Transactional(readOnly = true)
    public List<MisionDTO> getListMissionIncomplet(String authHeader) {
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        return listMissionUser.stream()
                .filter(mision -> !Boolean.TRUE.equals(mision.getCompletada()))
                .map(mision -> MisionDTO.fromEntity(mision.getMision(), false))
                .collect(Collectors.toList());
    }

    // Obtener detalle de una misión específica por su ID de relación usuario-misión
    // o catálogo
    @Transactional(readOnly = true)
    public InfoMisionDTO getMisionEspecifica(Long idMisionUser) {
        UsuarioMision mission = userMisionRepository.findById(idMisionUser)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Misión de usuario no encontrada con ID: " + idMisionUser));
        return InfoMisionDTO.fromEntity(mission);
    }

    // Validar y marcar una misión como completada, asignando experiencia a la
    // mascota
    @Transactional
    public InfoMisionDTO marcarCompletado(Long idMision, String authHeader) {
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);

        // Buscar primero por relación usuario y mision_id catálogo, o por el id directo
        // del registro UsuarioMision
        UsuarioMision misionUser = userMisionRepository.findByUsuarioIdAndMisionId(usuario.getId(), idMision.intValue())
                .orElseGet(() -> userMisionRepository.findById(idMision)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "No se encontró la misión solicitada con ID: " + idMision)));

        // Validación de pertenencia al usuario autenticado
        if (!usuario.getId().equals(misionUser.getUsuario().getId())) {
            throw new UnauthorizedAccessException();
        }

        // Validación de no duplicar completado ni experiencia
        if (Boolean.TRUE.equals(misionUser.getCompletada())) {
            throw new IllegalArgumentException("Esta misión ya fue completada previamente.");
        }

        // Otorgar experiencia a la criatura activa del usuario
        try {
            UsuarioCriatura mascota = criaturaService.getCriaturaUsuario(usuario.getId());
            if (mascota != null && misionUser.getMision() != null && misionUser.getMision().getXpRecompensa() != null) {
                criaturaService.recalcularXpCriatura(mascota, misionUser.getMision().getXpRecompensa());
            }
        } catch (Exception e) {
            // Continuar incluso si la mascota no está registrada por alguna inconsistencia
        }

        // Actualizar el estado de la misión
        misionUser.setProgreso(100);
        misionUser.setCompletada(true);
        misionUser.setFechaCompletada(Instant.now());
        misionUser.setEstado(Estado.COMPLETED);
        misionUser.setXpOtorgada(true);

        UsuarioMision misionCompleta = userMisionRepository.save(misionUser);

        // Actualizar desbloqueo de misiones posteriores que dependían de ésta
        reconcileUnlocksForUsuario(usuario.getId());

        return InfoMisionDTO.fromEntity(misionCompleta);
    }

    // Listar todo el catálogo público de misiones
    @Transactional(readOnly = true)
    public List<MisionDTO> listarCatalogoMisiones() {
        return misionRepository.findAll().stream()
                .map(MisionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Obtener misión por ID del catálogo
    @Transactional(readOnly = true)
    public MisionDTO obtenerMisionPorId(Integer id) {
        Mision mision = misionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Misión no encontrada con ID: " + id));
        return MisionDTO.fromEntity(mision);
    }

    // Crear una nueva misión en el catálogo
    @Transactional
    public MisionDTO crearMision(MisionRequest request) {
        Mision mision = new Mision();
        mision.setTitulo(request.getTitulo());
        mision.setDescripcion(request.getDescripcion());
        mision.setXpRecompensa(request.getXpRecompensa());
        mision.setGrado(request.getGrado());
        mision.setImageUrl(request.getImageUrl());
        mision.setCreatedAt(Instant.now());

        Mision guardada = misionRepository.save(mision);
        return MisionDTO.fromEntity(guardada);
    }

    // Modificar una misión existente
    @Transactional
    public MisionDTO actualizarMision(Integer id, MisionRequest request) {
        Mision mision = misionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Misión no encontrada con ID: " + id));

        mision.setTitulo(request.getTitulo());
        mision.setDescripcion(request.getDescripcion());
        mision.setXpRecompensa(request.getXpRecompensa());
        mision.setGrado(request.getGrado());
        mision.setImageUrl(request.getImageUrl());

        return MisionDTO.fromEntity(misionRepository.save(mision));
    }

    // Eliminar una misión del catálogo
    @Transactional
    public void eliminarMision(Integer id) {
        if (!misionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Misión no encontrada con ID: " + id);
        }
        misionRepository.deleteById(id);
    }

    // Inicializar misiones cuando se registra un usuario nuevo
    @Transactional
    public void inicializarMisionesParaUsuario(Long usuarioId) {
        String sql = ""
                + "INSERT INTO usuario_misiones (usuario_id, mision_id, progreso, completada, estado, xp_otorgada, evidencia_url, fecha_completada) "
                + "SELECT ?, m.id, 0, FALSE, "
                + "  CASE WHEN NOT EXISTS (SELECT 1 FROM mission_prerequisites mp WHERE mp.mission_id = m.id) "
                + "       THEN 'UNLOCKED' ELSE 'LOCKED' END, "
                + "  FALSE, NULL, NULL "
                + "FROM misiones m "
                + "ON CONFLICT (usuario_id, mision_id) DO NOTHING";
        jdbc.update(sql, usuarioId);
    }

    // Refrescar y desbloquear misiones cuyos prerrequisitos ya fueron cumplidos
    @Transactional
    public void reconcileUnlocksForUsuario(Long usuarioId) {
        String sql = ""
                + "WITH completed AS ( "
                + "  SELECT mpr.mission_id, COUNT(mpr.prerequisite_id) AS total_prereqs, "
                + "         COUNT(um.mision_id) AS completed_prereqs "
                + "  FROM mission_prerequisites mpr "
                + "  LEFT JOIN usuario_misiones um "
                + "    ON um.mision_id = mpr.prerequisite_id "
                + "   AND um.usuario_id = ? "
                + "   AND um.completada = TRUE "
                + "  GROUP BY mpr.mission_id "
                + ") "
                + "UPDATE usuario_misiones um2 "
                + "SET estado = 'UNLOCKED' "
                + "FROM completed c "
                + "WHERE um2.usuario_id = ? "
                + "  AND um2.mision_id = c.mission_id "
                + "  AND c.total_prereqs > 0 "
                + "  AND c.total_prereqs = c.completed_prereqs "
                + "  AND um2.estado <> 'UNLOCKED'";
        jdbc.update(sql, usuarioId, usuarioId);
    }
}
