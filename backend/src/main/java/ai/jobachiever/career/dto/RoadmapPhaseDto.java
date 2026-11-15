package ai.jobachiever.career.dto;

import java.util.List;

public class RoadmapPhaseDto {

    private int phaseNumber;
    private String name;
    private String description;
    private List<MilestoneDto> milestones;

    public RoadmapPhaseDto() {
    }

    public RoadmapPhaseDto(int phaseNumber, String name, String description, List<MilestoneDto> milestones) {
        this.phaseNumber = phaseNumber;
        this.name = name;
        this.description = description;
        this.milestones = milestones;
    }

    public int getPhaseNumber() {
        return phaseNumber;
    }

    public void setPhaseNumber(int phaseNumber) {
        this.phaseNumber = phaseNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<MilestoneDto> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<MilestoneDto> milestones) {
        this.milestones = milestones;
    }
}
