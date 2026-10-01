package com.mito.sismo.entity;

import java.io.Serializable;
import java.util.Objects;

public class MissionPrerequisiteId implements Serializable {
    private Integer missionId;
    private Integer prerequisiteId;

    public MissionPrerequisiteId() {}

    public MissionPrerequisiteId(Integer missionId, Integer prerequisiteId) {
        this.missionId = missionId;
        this.prerequisiteId = prerequisiteId;
    }

    public Integer getMissionId() { return missionId; }
    public void setMissionId(Integer missionId) { this.missionId = missionId; }
    public Integer getPrerequisiteId() { return prerequisiteId; }
    public void setPrerequisiteId(Integer prerequisiteId) { this.prerequisiteId = prerequisiteId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MissionPrerequisiteId)) return false;
        MissionPrerequisiteId that = (MissionPrerequisiteId) o;
        return Objects.equals(missionId, that.missionId) &&
                Objects.equals(prerequisiteId, that.prerequisiteId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(missionId, prerequisiteId);
    }
}

