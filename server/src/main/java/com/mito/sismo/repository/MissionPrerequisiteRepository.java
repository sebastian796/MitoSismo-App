package com.mito.sismo.repository;
import com.mito.sismo.entity.MissionPrerequisite;
import com.mito.sismo.entity.MissionPrerequisiteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface MissionPrerequisiteRepository extends JpaRepository<MissionPrerequisite, MissionPrerequisiteId> {
    @Query("SELECT mp.prerequisiteId FROM MissionPrerequisite mp WHERE mp.missionId = :missionId")
    List<Integer> findPrerequisiteIdsByMissionId(@Param("missionId") Integer missionId);
    @Query("SELECT mp.missionId FROM MissionPrerequisite mp WHERE mp.prerequisiteId = :prereqId")
    List<Integer> findDependentMissionIdsByPrerequisiteId(@Param("prereqId") Integer prereqId);
    boolean existsByMissionIdAndPrerequisiteId(Integer missionId, Integer prerequisiteId);
}