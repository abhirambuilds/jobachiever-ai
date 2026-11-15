package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CareerPreferencesDto {

    @JsonAlias({"targetRoles", "careerInterests"})
    private List<String> targetRoles = new ArrayList<>();

    private List<String> employmentTypes = new ArrayList<>();

    @JsonAlias({"workArrangement", "remotePreference"})
    private String workArrangement;

    private List<String> preferredLocations = new ArrayList<>();

    private String preferredLocationsText;

    private List<String> preferredCountries = new ArrayList<>();

    private String preferredCountriesText;

    @JsonAlias({"expectedSalary", "salaryRange", "targetSalary"})
    private String expectedSalary;

    @JsonAlias({"careerGoals", "objectives"})
    private String careerGoals;

    public CareerPreferencesDto() {
    }

    public List<String> getTargetRoles() {
        return targetRoles;
    }

    @JsonProperty("targetRoles")
    public void setTargetRoles(Object value) {
        this.targetRoles = parseList(value);
    }

    public List<String> getEmploymentTypes() {
        return employmentTypes;
    }

    @JsonProperty("employmentTypes")
    public void setEmploymentTypes(Object value) {
        this.employmentTypes = parseList(value);
    }

    public String getWorkArrangement() {
        return workArrangement;
    }

    public void setWorkArrangement(String workArrangement) {
        this.workArrangement = workArrangement;
    }

    public String getRemotePreference() {
        return workArrangement;
    }

    public void setRemotePreference(String remotePreference) {
        this.workArrangement = remotePreference;
    }

    public List<String> getPreferredLocations() {
        return preferredLocations;
    }

    @JsonProperty("preferredLocations")
    public void setPreferredLocations(Object value) {
        if (value == null) {
            this.preferredLocations = new ArrayList<>();
            this.preferredLocationsText = null;
        } else if (value instanceof List<?> list) {
            this.preferredLocations = list.stream().map(Object::toString).map(String::trim).filter(s -> !s.isEmpty()).toList();
            this.preferredLocationsText = String.join(", ", this.preferredLocations);
        } else if (value instanceof String str) {
            this.preferredLocationsText = str;
            this.preferredLocations = Arrays.stream(str.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }

    public String getPreferredLocationsText() {
        return preferredLocationsText != null ? preferredLocationsText : String.join(", ", preferredLocations);
    }

    public void setPreferredLocationsText(String text) {
        this.preferredLocationsText = text;
    }

    public List<String> getPreferredCountries() {
        return preferredCountries;
    }

    @JsonProperty("preferredCountries")
    public void setPreferredCountries(Object value) {
        if (value == null) {
            this.preferredCountries = new ArrayList<>();
            this.preferredCountriesText = null;
        } else if (value instanceof List<?> list) {
            this.preferredCountries = list.stream().map(Object::toString).map(String::trim).filter(s -> !s.isEmpty()).toList();
            this.preferredCountriesText = String.join(", ", this.preferredCountries);
        } else if (value instanceof String str) {
            this.preferredCountriesText = str;
            this.preferredCountries = Arrays.stream(str.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }

    public String getPreferredCountriesText() {
        return preferredCountriesText != null ? preferredCountriesText : String.join(", ", preferredCountries);
    }

    public void setPreferredCountriesText(String text) {
        this.preferredCountriesText = text;
    }

    public String getExpectedSalary() {
        return expectedSalary;
    }

    public void setExpectedSalary(String expectedSalary) {
        this.expectedSalary = expectedSalary;
    }

    public String getCareerGoals() {
        return careerGoals;
    }

    public void setCareerGoals(String careerGoals) {
        this.careerGoals = careerGoals;
    }

    private List<String> parseList(Object value) {
        if (value == null) {
            return new ArrayList<>();
        } else if (value instanceof List<?> list) {
            return list.stream().map(Object::toString).map(String::trim).filter(s -> !s.isEmpty()).toList();
        } else if (value instanceof String str) {
            return Arrays.stream(str.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        }
        return new ArrayList<>();
    }
}
