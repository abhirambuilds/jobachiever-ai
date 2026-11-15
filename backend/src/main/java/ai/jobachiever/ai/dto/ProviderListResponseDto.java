package ai.jobachiever.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ProviderListResponseDto {

    private List<ProviderMetadataDto> providers;

    public ProviderListResponseDto() {
    }

    public ProviderListResponseDto(List<ProviderMetadataDto> providers) {
        this.providers = providers;
    }

    public List<ProviderMetadataDto> getProviders() {
        return providers;
    }

    public void setProviders(List<ProviderMetadataDto> providers) {
        this.providers = providers;
    }
}
