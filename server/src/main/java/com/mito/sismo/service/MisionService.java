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
    private final UsuarioService userService; /////
    private final CriaturaService criaturaService;
    private final MisionSqlService jdbc;

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
        jdbc.reconcileUnlocksForUsuario(usuario.getId());

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


}
