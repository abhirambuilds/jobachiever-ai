package ai.jobachiever.career.dto;

import java.util.List;

public class RoadmapTaskDto {

    private String description;
    private String taskType;
    private List<String> skills;

    public RoadmapTaskDto() {
    }

    public RoadmapTaskDto(String description, String taskType, List<String> skills) {
        this.description = description;
        this.taskType = taskType;
        this.skills = skills;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}
