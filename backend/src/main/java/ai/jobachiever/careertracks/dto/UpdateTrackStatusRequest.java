package ai.jobachiever.careertracks.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotNull;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateTrackStatusRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;

    public UpdateTrackStatusRequest() {
    }

    public UpdateTrackStatusRequest(Boolean active) {
        this.active = active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
