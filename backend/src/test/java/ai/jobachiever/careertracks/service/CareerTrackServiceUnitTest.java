package ai.jobachiever.careertracks.service;

import ai.jobachiever.careertracks.dto.*;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.common.exception.InvalidRequestException;
import ai.jobachiever.common.exception.ResourceNotFoundException;
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
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Career Track Service Unit Tests")
class CareerTrackServiceUnitTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private CareerProfileRepository careerProfileRepository;
    @Mock
    private CareerTrackRepository careerTrackRepository;
    @Mock
    private ProfileSkillRepository skillRepository;
    @Mock
    private ProfileProjectRepository projectRepository;
    @Mock
    private ProfileExperienceRepository experienceRepository;

    private CareerTrackSkillService trackSkillService;
    private ObjectMapper objectMapper;
    private CareerTrackServiceImpl trackService;

    private User testUser;
    private CareerProfile testProfile;
    private UUID userId;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        trackSkillService = new CareerTrackSkillServiceImpl(objectMapper);

        trackService = new CareerTrackServiceImpl(
                userRepository,
                careerProfileRepository,
                careerTrackRepository,
                skillRepository,
                projectRepository,
                experienceRepository,
                trackSkillService,
                objectMapper
        );

        userId = UUID.randomUUID();
        testUser = new User("jane@example.com", "hash", "Jane", "Doe");
        testUser.setId(userId);
        testUser.setRole(Role.USER);
        testUser.setAccountStatus(AccountStatus.ACTIVE);

        testProfile = new CareerProfile(testUser);
        testProfile.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("createTrack auto-sets first created track as primary")
    void createFirstTrackAutoSetsPrimary() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));
        given(careerTrackRepository.countByUserIdAndActiveTrue(userId)).willReturn(0L);
        given(careerTrackRepository.existsByUserIdAndNameIgnoreCase(userId, "Backend Engineer")).willReturn(false);
        given(careerTrackRepository.existsByUserIdAndTargetRoleIgnoreCaseAndActiveTrue(userId, "Backend Software Engineer")).willReturn(false);
        given(careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(userId)).willReturn(Collections.emptyList());
        given(careerTrackRepository.save(any(CareerTrack.class))).willAnswer(inv -> inv.getArgument(0));

        CreateCareerTrackRequest request = new CreateCareerTrackRequest();
        request.setName("Backend Engineer");
        request.setTargetRole("Backend Software Engineer");
        request.setDescription("Scalable microservices");
        request.setRequiredSkills(List.of("Java", "Spring Boot"));

        CareerTrackResponse response = trackService.createTrack(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Backend Engineer");
        assertThat(response.isPrimary()).isTrue();
        assertThat(response.isActive()).isTrue();
    }

    @Test
    @DisplayName("createTrack rejects duplicate track name for same user")
    void createTrackRejectsDuplicateName() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));
        given(careerTrackRepository.countByUserIdAndActiveTrue(userId)).willReturn(1L);
        given(careerTrackRepository.existsByUserIdAndNameIgnoreCase(userId, "Backend Engineer")).willReturn(true);

        CreateCareerTrackRequest request = new CreateCareerTrackRequest();
        request.setName("Backend Engineer");
        request.setTargetRole("Platform Engineer");

        assertThatThrownBy(() -> trackService.createTrack(userId, request))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("A career track named 'Backend Engineer' already exists.");

        verify(careerTrackRepository, never()).save(any(CareerTrack.class));
    }

    @Test
    @DisplayName("createTrack rejects duplicate active target role for same user")
    void createTrackRejectsDuplicateActiveTargetRole() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));
        given(careerTrackRepository.countByUserIdAndActiveTrue(userId)).willReturn(1L);
        given(careerTrackRepository.existsByUserIdAndNameIgnoreCase(userId, "Backend Lead")).willReturn(false);
        given(careerTrackRepository.existsByUserIdAndTargetRoleIgnoreCaseAndActiveTrue(userId, "Backend Engineer")).willReturn(true);

        CreateCareerTrackRequest request = new CreateCareerTrackRequest();
        request.setName("Backend Lead");
        request.setTargetRole("Backend Engineer");
        request.setActive(true);

        assertThatThrownBy(() -> trackService.createTrack(userId, request))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("An active career track with target role 'Backend Engineer' already exists.");

        verify(careerTrackRepository, never()).save(any(CareerTrack.class));
    }

    @Test
    @DisplayName("createTrack rejects when max active tracks limit is exceeded")
    void createTrackRejectsExceedingMaxActiveTracks() {
        given(userRepository.findById(userId)).willReturn(Optional.of(testUser));
        given(careerProfileRepository.findByUserId(userId)).willReturn(Optional.of(testProfile));
        given(careerTrackRepository.countByUserIdAndActiveTrue(userId)).willReturn(10L); // Limit 10

        CreateCareerTrackRequest request = new CreateCareerTrackRequest();
        request.setName("Track 11");
        request.setTargetRole("Role 11");
        request.setActive(true);

        assertThatThrownBy(() -> trackService.createTrack(userId, request))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Maximum active career tracks limit (10) reached");

        verify(careerTrackRepository, never()).save(any(CareerTrack.class));
    }

    @Test
    @DisplayName("updateTrack updates fields and preserves user ownership")
    void updateTrackUpdatesFields() {
        CareerTrack track = new CareerTrack(testUser, testProfile, "Backend Dev", "Junior Dev");
        UUID trackId = UUID.randomUUID();
        track.setId(trackId);

        given(careerTrackRepository.findByIdAndUserId(trackId, userId)).willReturn(Optional.of(track));
        given(careerTrackRepository.existsByUserIdAndNameIgnoreCase(userId, "Senior Backend Dev")).willReturn(false);
        given(careerTrackRepository.findAllByUserIdAndActiveOrderByPriorityAscCreatedAtDesc(userId, true)).willReturn(List.of(track));
        given(careerTrackRepository.save(any(CareerTrack.class))).willAnswer(inv -> inv.getArgument(0));

        UpdateCareerTrackRequest request = new UpdateCareerTrackRequest();
        request.setName("Senior Backend Dev");
        request.setTargetRole("Senior Backend Engineer");
        request.setPriority(2);
        request.setRequiredSkills(List.of("Java 21", "Kafka"));

        CareerTrackResponse response = trackService.updateTrack(trackId, userId, request);

        assertThat(response.getName()).isEqualTo("Senior Backend Dev");
        assertThat(response.getTargetRole()).isEqualTo("Senior Backend Engineer");
        assertThat(response.getPriority()).isEqualTo(2);
        assertThat(response.getRequiredSkills()).containsExactly("Java 21", "Kafka");
    }

    @Test
    @DisplayName("deleteTrack deletes track and promotes next highest priority if deleted track was primary")
    void deleteTrackPromotesNextPrimary() {
        UUID track1Id = UUID.randomUUID();
        CareerTrack track1 = new CareerTrack(testUser, testProfile, "Track 1", "Role 1");
        track1.setId(track1Id);
        track1.setPrimary(true);

        UUID track2Id = UUID.randomUUID();
        CareerTrack track2 = new CareerTrack(testUser, testProfile, "Track 2", "Role 2");
        track2.setId(track2Id);
        track2.setPrimary(false);
        track2.setPriority(1);

        given(careerTrackRepository.findByIdAndUserId(track1Id, userId)).willReturn(Optional.of(track1));
        given(careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(userId)).willReturn(List.of(track2));

        trackService.deleteTrack(track1Id, userId);

        verify(careerTrackRepository).delete(track1);
        verify(careerTrackRepository).save(track2);
        assertThat(track2.isPrimary()).isTrue();
    }

    @Test
    @DisplayName("getTrackOverview returns comprehensive deterministic match overview")
    void getTrackOverviewReturnsMatchData() {
        UUID trackId = UUID.randomUUID();
        CareerTrack track = new CareerTrack(testUser, testProfile, "Backend Engineer", "Senior Backend Engineer");
        track.setId(trackId);
        track.setRequiredSkills("[\"Java\", \"Spring Boot\", \"PostgreSQL\"]");
        track.setPreferredSkills("[\"Docker\", \"AWS\"]");

        ProfileSkill s1 = new ProfileSkill(); s1.setName("Java");
        ProfileSkill s2 = new ProfileSkill(); s2.setName("Spring Boot");
        ProfileSkill s3 = new ProfileSkill(); s3.setName("React");

        given(careerTrackRepository.findByIdAndUserId(trackId, userId)).willReturn(Optional.of(track));
        given(skillRepository.findByProfileId(testProfile.getId())).willReturn(List.of(s1, s2, s3));
        given(projectRepository.findByProfileId(testProfile.getId())).willReturn(Collections.emptyList());
        given(experienceRepository.findByProfileId(testProfile.getId())).willReturn(Collections.emptyList());

        CareerTrackOverviewResponse overview = trackService.getTrackOverview(trackId, userId);

        assertThat(overview).isNotNull();
        assertThat(overview.getMatchedRequiredSkills()).containsExactlyInAnyOrder("Java", "Spring Boot");
        assertThat(overview.getMissingRequiredSkills()).containsExactly("PostgreSQL");
        assertThat(overview.getMissingPreferredSkills()).containsExactlyInAnyOrder("Docker", "AWS");
        assertThat(overview.getAdditionalProfileSkills()).containsExactly("React");
        assertThat(overview.getRequiredSkillMatchPercentage()).isEqualTo(67);
        assertThat(overview.getReadinessStatus()).isEqualTo("NEEDS_DEVELOPMENT");
    }

    @Test
    @DisplayName("User isolation: User A cannot view User B's track (404)")
    void userIsolationViewTrack() {
        UUID trackId = UUID.randomUUID();
        given(careerTrackRepository.findByIdAndUserId(trackId, userId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> trackService.getTrackById(trackId, userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Career track not found: " + trackId);
    }
}
