package ai.jobachiever.careertracks;

import ai.jobachiever.auth.service.JwtService;
import ai.jobachiever.careertracks.dto.CreateCareerTrackRequest;
import ai.jobachiever.careertracks.dto.UpdateCareerTrackRequest;
import ai.jobachiever.careertracks.dto.UpdateTrackPriorityRequest;
import ai.jobachiever.careertracks.dto.UpdateTrackStatusRequest;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.profiles.entity.ProfileSkill;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.profiles.repository.ProfileExperienceRepository;
import ai.jobachiever.profiles.repository.ProfileProjectRepository;
import ai.jobachiever.profiles.repository.ProfileSkillRepository;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Career Track Controller Integration Tests")
class CareerTrackControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CareerProfileRepository careerProfileRepository;

    @MockBean
    private CareerTrackRepository careerTrackRepository;

    @MockBean
    private ProfileSkillRepository skillRepository;

    @MockBean
    private ProfileProjectRepository projectRepository;

    @MockBean
    private ProfileExperienceRepository experienceRepository;

    private User testUser;
    private String userToken;
    private CareerProfile testProfile;
    private CareerTrack testTrack;

    @BeforeEach
    void setUp() {
        testUser = new User("candidate@example.com", "hash", "Jane", "Doe");
        testUser.setId(UUID.randomUUID());
        testUser.setRole(Role.USER);
        testUser.setAccountStatus(AccountStatus.ACTIVE);
        testUser.setEmailVerified(true);

        userToken = jwtService.generateToken(testUser.getId(), testUser.getEmail());

        testProfile = new CareerProfile(testUser);
        testProfile.setId(UUID.randomUUID());

        testTrack = new CareerTrack(testUser, testProfile, "Backend Systems", "Senior Backend Engineer");
        testTrack.setId(UUID.randomUUID());
        testTrack.setTargetSeniority("SENIOR");
        testTrack.setPriority(1);
        testTrack.setPrimary(true);
        testTrack.setActive(true);
        testTrack.setRequiredSkills("[\"Java\", \"Spring Boot\", \"PostgreSQL\"]");
        testTrack.setPreferredSkills("[\"Docker\", \"AWS\"]");

        given(userRepository.findById(testUser.getId())).willReturn(Optional.of(testUser));
        given(userRepository.findByEmailIgnoreCase(testUser.getEmail())).willReturn(Optional.of(testUser));
    }

    @Test
    @DisplayName("GET /api/v1/career-tracks unauthenticated returns 401 Unauthorized")
    void listTracksUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/career-tracks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/career-tracks returns 200 OK with authenticated user's tracks")
    void listTracksAuthenticated() throws Exception {
        given(careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(testUser.getId()))
                .willReturn(List.of(testTrack));

        mockMvc.perform(get("/api/v1/career-tracks")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name").value("Backend Systems"))
                .andExpect(jsonPath("$.data[0].targetRole").value("Senior Backend Engineer"))
                .andExpect(jsonPath("$.data[0].requiredSkills", contains("Java", "Spring Boot", "PostgreSQL")));
    }

    @Test
    @DisplayName("GET /api/v1/career-tracks?active=true returns 200 with filtered active tracks")
    void listActiveTracksFiltered() throws Exception {
        given(careerTrackRepository.findAllByUserIdAndActiveOrderByPriorityAscCreatedAtDesc(testUser.getId(), true))
                .willReturn(List.of(testTrack));

        mockMvc.perform(get("/api/v1/career-tracks?active=true")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("GET /api/v1/career-tracks with page & size returns 200 OK paginated")
    void listTracksPaginated() throws Exception {
        given(careerTrackRepository.findAllByUserId(eq(testUser.getId()), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(testTrack)));

        mockMvc.perform(get("/api/v1/career-tracks?page=0&size=10")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    @Test
    @DisplayName("GET /api/v1/career-tracks/{id} returns 200 OK for owned track")
    void getTrackByIdSuccess() throws Exception {
        given(careerTrackRepository.findByIdAndUserId(testTrack.getId(), testUser.getId()))
                .willReturn(Optional.of(testTrack));

        mockMvc.perform(get("/api/v1/career-tracks/" + testTrack.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testTrack.getId().toString()))
                .andExpect(jsonPath("$.data.name").value("Backend Systems"));
    }

    @Test
    @DisplayName("GET /api/v1/career-tracks/{id} of another user returns 404 Not Found")
    void getTrackByIdOtherUserReturns404() throws Exception {
        UUID otherTrackId = UUID.randomUUID();
        given(careerTrackRepository.findByIdAndUserId(otherTrackId, testUser.getId()))
                .willReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/career-tracks/" + otherTrackId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Career track not found")));
    }

    @Test
    @DisplayName("POST /api/v1/career-tracks creates new track with 201 Created")
    void createTrackSuccess() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));
        given(careerTrackRepository.countByUserIdAndActiveTrue(testUser.getId())).willReturn(0L);
        given(careerTrackRepository.existsByUserIdAndNameIgnoreCase(testUser.getId(), "AI / ML Engineer")).willReturn(false);
        given(careerTrackRepository.existsByUserIdAndTargetRoleIgnoreCaseAndActiveTrue(testUser.getId(), "Machine Learning Engineer")).willReturn(false);
        given(careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(testUser.getId())).willReturn(Collections.emptyList());
        given(careerTrackRepository.save(any(CareerTrack.class))).willAnswer(inv -> {
            CareerTrack t = inv.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        CreateCareerTrackRequest request = new CreateCareerTrackRequest();
        request.setName("AI / ML Engineer");
        request.setTargetRole("Machine Learning Engineer");
        request.setDescription("Design and fine-tune LLM pipelines.");
        request.setTargetSeniority("MID_LEVEL");
        request.setPreferredLocations(List.of("San Francisco", "Remote"));
        request.setEmploymentTypes(List.of("FULL_TIME"));
        request.setIndustries(List.of("Artificial Intelligence"));
        request.setTargetCompanies(List.of("OpenAI", "Anthropic", "Google"));
        request.setRequiredSkills(List.of("Python", "PyTorch", "HuggingFace"));
        request.setPreferredSkills(List.of("vLLM", "Docker"));
        request.setPriority(1);
        request.setActive(true);

        mockMvc.perform(post("/api/v1/career-tracks")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("AI / ML Engineer"))
                .andExpect(jsonPath("$.data.targetRole").value("Machine Learning Engineer"))
                .andExpect(jsonPath("$.data.targetCompanies", hasSize(3)))
                .andExpect(jsonPath("$.data.requiredSkills", hasSize(3)));
    }

    @Test
    @DisplayName("POST /api/v1/career-tracks rejects missing name with 400 Bad Request")
    void createTrackRejectsMissingName() throws Exception {
        CreateCareerTrackRequest request = new CreateCareerTrackRequest();
        request.setName(""); // Blank!
        request.setTargetRole("DevOps Engineer");

        mockMvc.perform(post("/api/v1/career-tracks")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("name"));
    }

    @Test
    @DisplayName("POST /api/v1/career-tracks rejects invalid priority (> 100) with 400 Bad Request")
    void createTrackRejectsInvalidPriority() throws Exception {
        CreateCareerTrackRequest request = new CreateCareerTrackRequest();
        request.setName("Cloud Architect");
        request.setTargetRole("Solutions Architect");
        request.setPriority(105); // Out of bounds!

        mockMvc.perform(post("/api/v1/career-tracks")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors[0].field").value("priority"));
    }

    @Test
    @DisplayName("POST /api/v1/career-tracks rejects duplicate active target role with 400 Bad Request")
    void createTrackRejectsDuplicateActiveRole() throws Exception {
        given(careerProfileRepository.findByUserId(testUser.getId())).willReturn(Optional.of(testProfile));
        given(careerTrackRepository.countByUserIdAndActiveTrue(testUser.getId())).willReturn(1L);
        given(careerTrackRepository.existsByUserIdAndNameIgnoreCase(testUser.getId(), "Backend Track 2")).willReturn(false);
        given(careerTrackRepository.existsByUserIdAndTargetRoleIgnoreCaseAndActiveTrue(testUser.getId(), "Senior Backend Engineer")).willReturn(true);

        CreateCareerTrackRequest request = new CreateCareerTrackRequest();
        request.setName("Backend Track 2");
        request.setTargetRole("Senior Backend Engineer");
        request.setActive(true);

        mockMvc.perform(post("/api/v1/career-tracks")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("An active career track with target role 'Senior Backend Engineer' already exists.")));
    }

    @Test
    @DisplayName("PUT /api/v1/career-tracks/{id} updates track successfully")
    void updateTrackSuccess() throws Exception {
        given(careerTrackRepository.findByIdAndUserId(testTrack.getId(), testUser.getId()))
                .willReturn(Optional.of(testTrack));
        given(careerTrackRepository.save(any(CareerTrack.class))).willAnswer(inv -> inv.getArgument(0));

        UpdateCareerTrackRequest request = new UpdateCareerTrackRequest();
        request.setName("Backend Systems (Lead)");
        request.setTargetRole("Principal Backend Engineer");
        request.setTargetSeniority("LEAD");
        request.setPriority(1);
        request.setRequiredSkills(List.of("Java 21", "Distributed Systems", "Kubernetes"));

        mockMvc.perform(put("/api/v1/career-tracks/" + testTrack.getId())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Backend Systems (Lead)"))
                .andExpect(jsonPath("$.data.targetRole").value("Principal Backend Engineer"));
    }

    @Test
    @DisplayName("PATCH /api/v1/career-tracks/{id}/status toggles active state")
    void updateTrackStatusSuccess() throws Exception {
        given(careerTrackRepository.findByIdAndUserId(testTrack.getId(), testUser.getId()))
                .willReturn(Optional.of(testTrack));
        given(careerTrackRepository.save(any(CareerTrack.class))).willAnswer(inv -> inv.getArgument(0));

        UpdateTrackStatusRequest request = new UpdateTrackStatusRequest(false);

        mockMvc.perform(patch("/api/v1/career-tracks/" + testTrack.getId() + "/status")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(false));
    }

    @Test
    @DisplayName("PATCH /api/v1/career-tracks/{id}/priority updates priority")
    void updateTrackPrioritySuccess() throws Exception {
        given(careerTrackRepository.findByIdAndUserId(testTrack.getId(), testUser.getId()))
                .willReturn(Optional.of(testTrack));
        given(careerTrackRepository.save(any(CareerTrack.class))).willAnswer(inv -> inv.getArgument(0));

        UpdateTrackPriorityRequest request = new UpdateTrackPriorityRequest(3);

        mockMvc.perform(patch("/api/v1/career-tracks/" + testTrack.getId() + "/priority")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.priority").value(3));
    }

    @Test
    @DisplayName("DELETE /api/v1/career-tracks/{id} deletes track safely")
    void deleteTrackSuccess() throws Exception {
        given(careerTrackRepository.findByIdAndUserId(testTrack.getId(), testUser.getId()))
                .willReturn(Optional.of(testTrack));
        given(careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(testUser.getId()))
                .willReturn(Collections.emptyList());

        mockMvc.perform(delete("/api/v1/career-tracks/" + testTrack.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Career track deleted successfully"));

        verify(careerTrackRepository).delete(testTrack);
    }

    @Test
    @DisplayName("DELETE /api/v1/career-tracks/{id} of another user returns 404 Not Found")
    void deleteTrackOtherUserReturns404() throws Exception {
        UUID otherId = UUID.randomUUID();
        given(careerTrackRepository.findByIdAndUserId(otherId, testUser.getId()))
                .willReturn(Optional.empty());

        mockMvc.perform(delete("/api/v1/career-tracks/" + otherId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isNotFound());

        verify(careerTrackRepository, never()).delete(any());
    }

    @Test
    @DisplayName("GET /api/v1/career-tracks/{id}/overview returns deterministic skill match and master profile alignment")
    void getTrackOverviewSuccess() throws Exception {
        given(careerTrackRepository.findByIdAndUserId(testTrack.getId(), testUser.getId()))
                .willReturn(Optional.of(testTrack));

        ProfileSkill s1 = new ProfileSkill(); s1.setName("Java");
        ProfileSkill s2 = new ProfileSkill(); s2.setName("Spring Boot");
        ProfileSkill s3 = new ProfileSkill(); s3.setName("React");
        given(skillRepository.findByProfileId(testProfile.getId())).willReturn(List.of(s1, s2, s3));
        given(projectRepository.findByProfileId(testProfile.getId())).willReturn(Collections.emptyList());
        given(experienceRepository.findByProfileId(testProfile.getId())).willReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/career-tracks/" + testTrack.getId() + "/overview")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.matchedRequiredSkills", containsInAnyOrder("Java", "Spring Boot")))
                .andExpect(jsonPath("$.data.missingRequiredSkills", contains("PostgreSQL")))
                .andExpect(jsonPath("$.data.missingPreferredSkills", containsInAnyOrder("Docker", "AWS")))
                .andExpect(jsonPath("$.data.additionalProfileSkills", contains("React")))
                .andExpect(jsonPath("$.data.requiredSkillMatchPercentage").value(67))
                .andExpect(jsonPath("$.data.readinessStatus").value("NEEDS_DEVELOPMENT"));
    }
}
