package com.mito.sismo.service;

import com.mito.sismo.repository.MisionRepository;
import com.mito.sismo.repository.MissionPrerequisiteRepository;
import com.mito.sismo.repository.UsuarioMisionRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MissionPrerequisiteService {

    private final MissionPrerequisiteRepository mpRepo;

    public MissionPrerequisiteService(MissionPrerequisiteRepository mpRepo,
            MisionRepository misionRepo,
            UsuarioMisionRepository usuarioMisionRepo,
            JdbcTemplate jdbc) {
        this.mpRepo = mpRepo;
    }

    @Transactional(readOnly = true)
    public List<Integer> getPrerequisiteIds(Integer missionId) {
        return mpRepo.findPrerequisiteIdsByMissionId(missionId);
    }

    @Transactional(readOnly = true)
    public List<Integer> getDependentMissionIds(Integer prerequisiteId) {
        return mpRepo.findDependentMissionIdsByPrerequisiteId(prerequisiteId);
    }

}
