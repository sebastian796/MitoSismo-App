package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.MisionDTO;
import com.mito.sismo.entity.InfoMisionDTO;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.entity.UsuarioMision;
import com.mito.sismo.exception.GeneralAuthException;
import com.mito.sismo.repository.MisionRepository;
import com.mito.sismo.repository.UsuarioMisionRepository;
import com.mito.sismo.repository.UsuarioRepository;
import com.mito.sismo.security.JwtUtil;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MisionService {

    private final MisionRepository misionRepository;
    private final UsuarioMisionRepository userMisionRepository;
    private final UsuarioRepository userRepository;
    private final JwtUtil jwtUtil;
    private final JdbcTemplate jdbc;

    @Transactional(readOnly = true)
    public List<MisionDTO> traerListaMisiones(String authHeader){
        String token = authHeader.replace("Bearer ","");
        String email = jwtUtil.extractEmail(token);
        Usuario usuario = userRepository.findByEmail(email)
                .orElseThrow(()-> new GeneralAuthException(
                        "api/misiones/traerListaMisiones",
                        "Usuario no existente",
                        "Usuario: "+email
                ));
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        List<MisionDTO> listMisiones = listMissionUser.stream()
                .map(MisionDTO::fromEntity).collect(Collectors.toList());
        return listMisiones;
    }

    // Lista Misiones Completadas
    @Transactional(readOnly = true)
    public List<MisionDTO> getListMissionComplet(
            String authHeader
    ){
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        Usuario usuario = userRepository.findByEmail(email)
                .orElseThrow(()-> new GeneralAuthException(
                        "api/misiones/getListMissionComplet",
                        "Usuario no existente",
                        "Usuario: "+email
                ));
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        List<MisionDTO> listMisiones = listMissionUser.stream()
                .filter(mision -> mision.getCompletada())
                .map(MisionDTO::fromEntity).collect(Collectors.toList());
        return listMisiones;
    }

    // Listar Misiones Imcompletas
    @Transactional(readOnly = true)
    public List<MisionDTO> getListMissionIncomplet(
            String authHeader
    ){
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        Usuario usuario = userRepository.findByEmail(email)
                .orElseThrow(()-> new GeneralAuthException(
                        "api/misiones/getListMissionComplet",
                        "Usuario no existente",
                        "Usuario: "+email
                ));
        List<UsuarioMision> listMissionUser = userMisionRepository.findByUsuarioId(usuario.getId());
        List<MisionDTO> listMisiones = listMissionUser.stream()
                .filter(mision -> !mision.getCompletada())
                .map(MisionDTO::fromEntity).collect(Collectors.toList());
        return listMisiones;
    }
/*
    // Validar Mision
    @Transactional
    public void completarMision(
            Long idMision,
            String authHeader
    ){
        // Extraer datos necesarios
        String token = authHeader.replace("Bearer ","");
        String email = jwtUtil.extractEmail(token);
        Usuario usuario = userRepository.findByEmail(email)
                .orElseThrow(()-> new GeneralAuthException(
                        "api/misiones/getListMissionComplet",
                        "Usuario no existente",
                        "Usuario: "+email
                ));

        // Traer la Mision
        UsuarioMision mision = userMisionRepository.findById(idMision)
                .orElseThrow(()-> new GeneralAuthException(
                        "api/misiones/validacionMision",
                        "Mision No Existente",
                        "Mision: "+idMision
                ));

        // Verificar que el usuario completo la mision
        if(!usuario.getId().equals(mision.getId()) && mision.getCompletada()){
            new GeneralAuthException(
                    "api/misiones/validacionMision",
                    "Mision no Perteneciente o Completa",
                    "Usuario: "+usuario.getId()
            );
        }
        // Marcar como completa
        mision.setCompletada(true);
        userMisionRepository.save(mision);

        // Calcular la experiencia agregada al completar la mision
    }

*/
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
