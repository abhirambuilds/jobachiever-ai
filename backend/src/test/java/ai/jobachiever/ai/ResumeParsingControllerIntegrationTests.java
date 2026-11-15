package ai.jobachiever.ai;

import ai.jobachiever.ai.controller.ResumeParsingController;
import ai.jobachiever.ai.dto.ParsedPersonalInfoDto;
import ai.jobachiever.ai.dto.ParsedResumeDto;
import ai.jobachiever.ai.service.ResumeParsingService;
import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.users.entity.AccountStatus;
import ai.jobachiever.users.entity.Role;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("ResumeParsingController Integration Tests")
class ResumeParsingControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private ResumeParsingService resumeParsingService;

    @MockBean
    private UserRepository userRepository;

    private UUID userId;
    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User("Test", "Candidate", "candidate@jobachiever.ai", "HashedPassword123!");
        testUser.setId(userId);
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser.setEmailVerified(true);
        testUser.setRole(Role.USER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmailIgnoreCase("candidate@jobachiever.ai")).thenReturn(Optional.of(testUser));

        jwtToken = jwtService.generateToken(userId, testUser.getEmail());
    }

    @Test
    @DisplayName("POST /api/v1/resumes/{documentId}/parse successfully parses document and returns 200 OK")
    void parseResumeSuccess() throws Exception {
        UUID docId = UUID.randomUUID();

        ParsedResumeDto mockDto = new ParsedResumeDto();
        ParsedPersonalInfoDto personalInfo = new ParsedPersonalInfoDto();
        personalInfo.setName("Test Candidate");
        personalInfo.setEmail("candidate@jobachiever.ai");
        mockDto.setPersonalInformation(personalInfo);

        when(resumeParsingService.parseResumeDocument(eq(docId), eq(userId))).thenReturn(mockDto);

        mockMvc.perform(post("/api/v1/resumes/" + docId + "/parse")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.personalInformation.name").value("Test Candidate"))
                .andExpect(jsonPath("$.data.personalInformation.email").value("candidate@jobachiever.ai"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/v1/resumes/{documentId}/parse without bearer token returns 401 Unauthorized")
    void parseResumeUnauthenticatedReturns401() throws Exception {
        UUID docId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/resumes/" + docId + "/parse")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
