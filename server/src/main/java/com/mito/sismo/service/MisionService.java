package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.MisionDTO;
import com.mito.sismo.entity.*;
import com.mito.sismo.entity.enums.Estado;
import com.mito.sismo.exception.GeneralAuthException;
import com.mito.sismo.repository.CriaturaRepository;
import com.mito.sismo.repository.MisionRepository;
import com.mito.sismo.repository.UsuarioMisionRepository;
import com.mito.sismo.repository.UsuarioRepository;
import com.mito.sismo.security.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MisionService {

    private final MisionRepository misionRepository;
    private final UsuarioMisionRepository userMisionRepository;
    private final UsuarioService userService;
    private final CriaturaService criaturaService;
    private final JdbcTemplate jdbc;

    // -Traer Todas las Misiones
    @Transactional(readOnly = true)
    public List<MisionDTO> traerListaMisiones(String authHeader){
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        List<MisionDTO> listMisiones = listMissionUser.stream()
                .map(mision -> MisionDTO.fromEntity(mision.getMision())
                ).collect(Collectors.toList());
        return listMisiones;
    }

    // Lista Misiones Completadas
    @Transactional(readOnly = true)
    public List<MisionDTO> getListMissionComplet(
            String authHeader
    ){
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        List<MisionDTO> listMisiones = listMissionUser.stream()
                .filter(mision -> mision.getCompletada())
                .map(mision -> MisionDTO.fromEntity(mision.getMision(),true))
                .collect(Collectors.toList());
        return listMisiones;
    }

    // Listar Misiones Imcompletas
    @Transactional(readOnly = true)
    public List<MisionDTO> getListMissionIncomplet(
            String authHeader
    ){
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        List<MisionDTO> listMisiones = listMissionUser.stream()
                .filter(mision -> !mision.getCompletada())
                .map(mision -> MisionDTO.fromEntity(mision.getMision(), false))
                .collect(Collectors.toList());
        return listMisiones;
    }

    // -Mostrar Mision Especifica
    @Transactional(readOnly = true)
    public InfoMisionDTO getMisionEspecifica(
            Long idMisionUser
    ){
        UsuarioMision mission = userMisionRepository.findById(idMisionUser)
                .orElseThrow(()-> new GeneralAuthException(
                        "api/mision/especifica",
                        "Mision no Existente",
                        "Mision: "+idMisionUser
                ));
        return InfoMisionDTO.fromEntity(mission);
    }

    // Validar Mision
    @Transactional
    public InfoMisionDTO marcarCompletado(
            Long idMisionUser,
            String authHeader
    ){
        // Traer la Mision
        UsuarioMision misionUser = userMisionRepository.findById(idMisionUser)
                .orElseThrow(()-> new GeneralAuthException(
                        "api/misiones/validacionMision",
                        "Mision No Existente",
                        "Mision: "+idMisionUser
                ));

        // Extraer datos necesarios
        Usuario usuario = userService.extraerUsuarioEmailToken(authHeader);
        UsuarioCriatura mascota = criaturaService.getCriaturaUsuario(usuario.getId());

        // Verificar que sea mision del usuario
        if(!usuario.getId().equals(misionUser.getUsuario().getId()) && misionUser.getCompletada()){
            new GeneralAuthException(
                    "api/misiones/validacionMision",
                    "Mision no Perteneciente o Completa",
                    "Usuario: "+usuario.getId()
            );
        }

        // Recalcular Xp criatura
        criaturaService.recalcularXpCriatura(mascota,misionUser.getMision().getXpRecompensa());

        // Marcar como completa
        misionUser.setProgreso(100);
        misionUser.setCompletada(true);
        misionUser.setFechaCompletada(Instant.now());
        misionUser.setEstado(Estado.COMPLETED);
        misionUser.setXpOtorgada(true);
        UsuarioMision misionCompleta = userMisionRepository.save(misionUser); // Save Mision

        return InfoMisionDTO.fromEntity(misionCompleta);
    }


    // Inicializar misiones cuando se registra usuario
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

    // Refrescar las misiones de un usuario (desbloquear cuando todos los prerequisitos están completados)
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
