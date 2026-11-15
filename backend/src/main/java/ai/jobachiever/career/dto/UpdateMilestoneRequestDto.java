package ai.jobachiever.career.dto;

import java.util.List;

public class UpdateMilestoneRequestDto {

    private String status;

    private String personalNotes;

    private List<String> evidenceLinks;

    public UpdateMilestoneRequestDto() {
    }

    public UpdateMilestoneRequestDto(String status, String personalNotes, List<String> evidenceLinks) {
        this.status = status;
        this.personalNotes = personalNotes;
        this.evidenceLinks = evidenceLinks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPersonalNotes() {
        return personalNotes;
    }

    public void setPersonalNotes(String personalNotes) {
        this.personalNotes = personalNotes;
    }

    public List<String> getEvidenceLinks() {
        return evidenceLinks;
    }

    public void setEvidenceLinks(List<String> evidenceLinks) {
        this.evidenceLinks = evidenceLinks;
    }
}
