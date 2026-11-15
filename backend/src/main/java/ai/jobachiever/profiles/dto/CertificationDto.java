package ai.jobachiever.profiles.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CertificationDto {

    private UUID id;

    @Size(max = 255, message = "Certification name cannot exceed 255 characters")
    private String name;

    @JsonAlias({"issuingOrg", "issuingOrganization"})
    @Size(max = 255, message = "Issuing organization cannot exceed 255 characters")
    private String issuingOrganization;

    private String issueDate;

    private String expirationDate;

    @Size(max = 255, message = "Credential ID cannot exceed 255 characters")
    private String credentialId;

    @Size(max = 500, message = "Credential URL cannot exceed 500 characters")
    private String credentialUrl;

    public CertificationDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIssuingOrganization() {
        return issuingOrganization;
    }

    public void setIssuingOrganization(String issuingOrganization) {
        this.issuingOrganization = issuingOrganization;
    }

    public String getIssuingOrg() {
        return issuingOrganization;
    }

    public void setIssuingOrg(String issuingOrg) {
        this.issuingOrganization = issuingOrg;
    }

    public String getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public String getCredentialId() {
        return credentialId;
    }

    public void setCredentialId(String credentialId) {
        this.credentialId = credentialId;
    }

    public String getCredentialUrl() {
        return credentialUrl;
    }

    public void setCredentialUrl(String credentialUrl) {
        this.credentialUrl = credentialUrl;
    }
}
