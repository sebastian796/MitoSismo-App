package com.mito.sismo.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name = "mission_prerequisites",
        uniqueConstraints = @UniqueConstraint(columnNames = {"mission_id","prerequisite_id"}))
@IdClass(MissionPrerequisiteId.class)
public class MissionPrerequisite {
    @Id
    @Column(name = "mission_id", nullable = false)
    private Integer missionId;
    @Id
    @Column(name = "prerequisite_id", nullable = false)
    private Integer prerequisiteId;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    public MissionPrerequisite() {}
    public MissionPrerequisite(Integer missionId, Integer prerequisiteId) {
        this.missionId = missionId;
        this.prerequisiteId = prerequisiteId;
    }
    public Integer getMissionId() { return missionId; }
    public void setMissionId(Integer missionId) { this.missionId = missionId; }
    public Integer getPrerequisiteId() { return prerequisiteId; }
    public void setPrerequisiteId(Integer prerequisiteId) { this.prerequisiteId = prerequisiteId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}