package ai.jobachiever.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ProviderMetadataDto {

    private String id;
    private String name;
    private String priority;
    private boolean available;
    private boolean configured;
    private boolean isDefault;
    private String status;
    private String connectionStatus;
    private List<String> supportedModels;
    private String defaultModel;

    public ProviderMetadataDto() {
    }

    public ProviderMetadataDto(String id, String name, String priority, boolean available, boolean configured,
                               boolean isDefault, String status, String connectionStatus,
                               List<String> supportedModels, String defaultModel) {
        this.id = id;
        this.name = name;
        this.priority = priority;
        this.available = available;
        this.configured = configured;
        this.isDefault = isDefault;
        this.status = status;
        this.connectionStatus = connectionStatus;
        this.supportedModels = supportedModels;
        this.defaultModel = defaultModel;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isConfigured() {
        return configured;
    }

    public void setConfigured(boolean configured) {
        this.configured = configured;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getConnectionStatus() {
        return connectionStatus;
    }

    public void setConnectionStatus(String connectionStatus) {
        this.connectionStatus = connectionStatus;
    }

    public List<String> getSupportedModels() {
        return supportedModels;
    }

    public void setSupportedModels(List<String> supportedModels) {
        this.supportedModels = supportedModels;
    }

    public String getDefaultModel() {
        return defaultModel;
    }

    public void setDefaultModel(String defaultModel) {
        this.defaultModel = defaultModel;
    }
}
