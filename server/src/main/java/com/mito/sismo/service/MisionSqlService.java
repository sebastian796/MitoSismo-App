package com.mito.sismo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MisionSqlService {
    private final JdbcTemplate jdbc;

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

    // Refrescar y desbloquear únicamente misiones que dependían de la misión completada recientemente
    @Transactional
    public void reconcileUnlocksForUsuario(Long usuarioId, Integer completedMisionId) {
        if (completedMisionId == null) {
            reconcileUnlocksForUsuario(usuarioId);
            return;
        }

        String sql = ""
                + "WITH candidates AS ( "
                + "  SELECT DISTINCT mission_id FROM mission_prerequisites WHERE prerequisite_id = ? "
                + "), "
                + "completed AS ( "
                + "  SELECT mpr.mission_id, COUNT(mpr.prerequisite_id) AS total_prereqs, "
                + "         COUNT(um.mision_id) AS completed_prereqs "
                + "  FROM mission_prerequisites mpr "
                + "  JOIN candidates cand ON cand.mission_id = mpr.mission_id "
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
        jdbc.update(sql, completedMisionId, usuarioId, usuarioId);
    }
}
