package ai.jobachiever.career.service;

import ai.jobachiever.ai.client.AIServiceClient;
import ai.jobachiever.ai.dto.UserAiPreferenceDto;
import ai.jobachiever.ai.service.UserAiPreferenceService;
import ai.jobachiever.career.dto.*;
import ai.jobachiever.career.entity.CareerMilestone;
import ai.jobachiever.career.entity.CareerRecommendation;
import ai.jobachiever.career.entity.CareerRoadmap;
import ai.jobachiever.career.entity.CareerSkillGap;
import ai.jobachiever.career.repository.CareerMilestoneRepository;
import ai.jobachiever.career.repository.CareerRecommendationRepository;
import ai.jobachiever.career.repository.CareerRoadmapRepository;
import ai.jobachiever.career.repository.CareerSkillGapRepository;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.profiles.dto.CareerProfileResponse;
import ai.jobachiever.profiles.dto.CertificationDto;
import ai.jobachiever.profiles.dto.ExperienceDto;
import ai.jobachiever.profiles.dto.ProjectDto;
import ai.jobachiever.profiles.dto.SkillDto;
import ai.jobachiever.profiles.service.CareerProfileService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class CareerIntelligenceServiceImpl implements CareerIntelligenceService {

    private static final Logger log = LoggerFactory.getLogger(CareerIntelligenceServiceImpl.class);

    private final CareerSkillGapRepository skillGapRepository;
    private final CareerRecommendationRepository recommendationRepository;
    private final CareerRoadmapRepository roadmapRepository;
    private final CareerMilestoneRepository milestoneRepository;
    private final CareerTrackRepository careerTrackRepository;
    private final CareerProfileService careerProfileService;
    private final UserAiPreferenceService userAiPreferenceService;
    private final AIServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public CareerIntelligenceServiceImpl(
            CareerSkillGapRepository skillGapRepository,
            CareerRecommendationRepository recommendationRepository,
            CareerRoadmapRepository roadmapRepository,
            CareerMilestoneRepository milestoneRepository,
            CareerTrackRepository careerTrackRepository,
            CareerProfileService careerProfileService,
            UserAiPreferenceService userAiPreferenceService,
            AIServiceClient aiServiceClient,
            ObjectMapper objectMapper) {
        this.skillGapRepository = skillGapRepository;
        this.recommendationRepository = recommendationRepository;
        this.roadmapRepository = roadmapRepository;
        this.milestoneRepository = milestoneRepository;
        this.careerTrackRepository = careerTrackRepository;
        this.careerProfileService = careerProfileService;
        this.userAiPreferenceService = userAiPreferenceService;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public SkillGapAnalysisDto analyzeSkillGaps(UUID userId, AnalyzeSkillGapRequestDto request) {
        log.info("Analyzing skill gaps for userId={}, trackId={}", userId, request.getCareerTrackId());

        // 1. Enforce user AI processing consent
        verifyAiConsent(userId);

        // 2. Tenancy & track verification
        CareerTrack track = careerTrackRepository.findByIdAndUserId(request.getCareerTrackId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Career track not found with id: " + request.getCareerTrackId()));

        // 3. Resolve user profile evidence
        CareerProfileResponse profile = careerProfileService.getProfile(userId);
        List<String> candidateSkills = extractSkills(profile);
        List<String> candidateExperience = extractExperience(profile);
        List<String> candidateProjects = extractProjects(profile);
        List<String> candidateCertifications = extractCertifications(profile);

        // 4. Resolve AI provider & model preferences
        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);
        String provider = request.getProvider() != null && !request.getProvider().isBlank()
                ? request.getProvider() : preferences.getSelectedProvider();
        String model = request.getModel() != null && !request.getModel().isBlank()
                ? request.getModel() : preferences.getPreferredModel();

        String targetRole = request.getTargetRole() != null && !request.getTargetRole().isBlank()
                ? request.getTargetRole() : track.getTargetRole();

        // 5. Prepare payload for FastAPI microservice
        Map<String, Object> payload = new HashMap<>();
        payload.put("candidate_skills", candidateSkills);
        payload.put("candidate_experience", candidateExperience);
        payload.put("candidate_projects", candidateProjects);
        payload.put("candidate_certifications", candidateCertifications);
        payload.put("target_role", targetRole);
        payload.put("career_track_name", track.getName());
        payload.put("career_goals", track.getCareerGoals());
        payload.put("provider", provider);
        payload.put("model", model);
        payload.put("user_consent", true);

        // 6. Call AI microservice
        String rawJson = aiServiceClient.analyzeCareerSkillGaps(payload);

        // 7. Parse response and persist
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            String summary = root.path("summary").asText("");

            List<SkillGapItemDto> demonstrated = parseSkillItems(root.path("demonstrated_skills"));
            List<SkillGapItemDto> developing = parseSkillItems(root.path("developing_skills"));
            List<SkillGapItemDto> missing = parseSkillItems(root.path("missing_evidence_skills"));
            List<SkillGapItemDto> critical = parseSkillItems(root.path("critical_priorities"));
            List<SkillGapItemDto> allItems = parseSkillItems(root.path("all_evaluated_skills"));

            CareerSkillGap entity = new CareerSkillGap(
                    userId,
                    track.getId(),
                    targetRole,
                    provider,
                    model,
                    summary,
                    objectMapper.writeValueAsString(demonstrated),
                    objectMapper.writeValueAsString(developing),
                    objectMapper.writeValueAsString(missing),
                    objectMapper.writeValueAsString(critical),
                    rawJson
            );

            CareerSkillGap saved = skillGapRepository.save(entity);

            return new SkillGapAnalysisDto(
                    saved.getId(),
                    track.getId(),
                    targetRole,
                    provider,
                    model,
                    summary,
                    demonstrated,
                    developing,
                    missing,
                    critical,
                    allItems,
                    saved.getCreatedAt()
            );
        } catch (Exception e) {
            log.error("Failed to parse or persist skill gap analysis for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to process skill gap analysis: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SkillGapAnalysisDto getLatestSkillGaps(UUID userId, UUID careerTrackId) {
        verifyTrackOwnership(userId, careerTrackId);

        Optional<CareerSkillGap> gapOpt = skillGapRepository
                .findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(userId, careerTrackId);

        if (gapOpt.isEmpty()) {
            return null;
        }

        CareerSkillGap entity = gapOpt.get();
        try {
            JsonNode root = objectMapper.readTree(entity.getAnalysisJson());
            return new SkillGapAnalysisDto(
                    entity.getId(),
                    entity.getCareerTrackId(),
                    entity.getTargetRole(),
                    entity.getProvider(),
                    entity.getModel(),
                    entity.getSummary(),
                    parseSkillItems(root.path("demonstrated_skills")),
                    parseSkillItems(root.path("developing_skills")),
                    parseSkillItems(root.path("missing_evidence_skills")),
                    parseSkillItems(root.path("critical_priorities")),
                    parseSkillItems(root.path("all_evaluated_skills")),
                    entity.getCreatedAt()
            );
        } catch (Exception e) {
            log.error("Error reading saved skill gap analysis: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    @Transactional
    public CareerRecommendationsDto generateRecommendations(UUID userId, GenerateRecommendationsRequestDto request) {
        log.info("Generating career recommendations for userId={}, trackId={}", userId, request.getCareerTrackId());

        verifyAiConsent(userId);
        CareerTrack track = careerTrackRepository.findByIdAndUserId(request.getCareerTrackId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Career track not found with id: " + request.getCareerTrackId()));

        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);
        String provider = request.getProvider() != null && !request.getProvider().isBlank()
                ? request.getProvider() : preferences.getSelectedProvider();
        String model = request.getModel() != null && !request.getModel().isBlank()
                ? request.getModel() : preferences.getPreferredModel();

        String targetRole = request.getTargetRole() != null && !request.getTargetRole().isBlank()
                ? request.getTargetRole() : track.getTargetRole();

        // Get latest skill gaps or evaluate
        SkillGapAnalysisDto skillGaps = getLatestSkillGaps(userId, track.getId());
        if (skillGaps == null) {
            AnalyzeSkillGapRequestDto gapReq = new AnalyzeSkillGapRequestDto();
            gapReq.setCareerTrackId(track.getId());
            gapReq.setTargetRole(targetRole);
            gapReq.setProvider(provider);
            gapReq.setModel(model);
            skillGaps = analyzeSkillGaps(userId, gapReq);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("skill_gaps", skillGaps.getAllEvaluatedSkills());
        payload.put("target_role", targetRole);
        payload.put("career_track_name", track.getName());
        payload.put("provider", provider);
        payload.put("model", model);
        payload.put("user_consent", true);

        String rawJson = aiServiceClient.generateCareerRecommendations(payload);

        try {
            JsonNode root = objectMapper.readTree(rawJson);
            List<CareerRecommendationItemDto> items = parseRecommendationItems(root.path("recommendations"));

            CareerRecommendation entity = new CareerRecommendation(
                    userId,
                    track.getId(),
                    targetRole,
                    provider,
                    model,
                    rawJson
            );

            CareerRecommendation saved = recommendationRepository.save(entity);

            return new CareerRecommendationsDto(
                    saved.getId(),
                    track.getId(),
                    targetRole,
                    provider,
                    model,
                    items,
                    saved.getCreatedAt()
            );
        } catch (Exception e) {
            log.error("Failed to parse career recommendations: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate career recommendations: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CareerRecommendationsDto getLatestRecommendations(UUID userId, UUID careerTrackId) {
        verifyTrackOwnership(userId, careerTrackId);

        Optional<CareerRecommendation> recOpt = recommendationRepository
                .findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(userId, careerTrackId);

        if (recOpt.isEmpty()) {
            return null;
        }

        CareerRecommendation entity = recOpt.get();
        try {
            JsonNode root = objectMapper.readTree(entity.getRecommendationsJson());
            return new CareerRecommendationsDto(
                    entity.getId(),
                    entity.getCareerTrackId(),
                    entity.getTargetRole(),
                    entity.getProvider(),
                    entity.getModel(),
                    parseRecommendationItems(root.path("recommendations")),
                    entity.getCreatedAt()
            );
        } catch (Exception e) {
            log.error("Error reading saved recommendations: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    @Transactional
    public CareerRoadmapDto generateRoadmap(UUID userId, GenerateRoadmapRequestDto request) {
        log.info("Generating learning roadmap for userId={}, trackId={}", userId, request.getCareerTrackId());

        verifyAiConsent(userId);
        CareerTrack track = careerTrackRepository.findByIdAndUserId(request.getCareerTrackId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Career track not found with id: " + request.getCareerTrackId()));

        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);
        String provider = request.getProvider() != null && !request.getProvider().isBlank()
                ? request.getProvider() : preferences.getSelectedProvider();
        String model = request.getModel() != null && !request.getModel().isBlank()
                ? request.getModel() : preferences.getPreferredModel();

        String targetRole = request.getTargetRole() != null && !request.getTargetRole().isBlank()
                ? request.getTargetRole() : track.getTargetRole();

        // Get latest skill gaps
        SkillGapAnalysisDto skillGaps = getLatestSkillGaps(userId, track.getId());
        if (skillGaps == null) {
            AnalyzeSkillGapRequestDto gapReq = new AnalyzeSkillGapRequestDto();
            gapReq.setCareerTrackId(track.getId());
            gapReq.setTargetRole(targetRole);
            gapReq.setProvider(provider);
            gapReq.setModel(model);
            skillGaps = analyzeSkillGaps(userId, gapReq);
        }

        CareerProfileResponse profile = careerProfileService.getProfile(userId);

        Map<String, Object> payload = new HashMap<>();
        payload.put("skill_gaps", skillGaps.getAllEvaluatedSkills());
        payload.put("candidate_skills", extractSkills(profile));
        payload.put("target_role", targetRole);
        payload.put("custom_goal", request.getCustomGoal() != null ? request.getCustomGoal() : track.getCareerGoals());
        payload.put("provider", provider);
        payload.put("model", model);
        payload.put("user_consent", true);

        String rawJson = aiServiceClient.generateCareerRoadmap(payload);

        try {
            JsonNode root = objectMapper.readTree(rawJson);
            String title = root.path("title").asText(targetRole + " Strategic Learning Roadmap");
            String description = root.path("description").asText("");
            String estimatedDuration = root.path("estimated_duration").asText(null);

            CareerRoadmap roadmapEntity = new CareerRoadmap(
                    userId,
                    track.getId(),
                    targetRole,
                    title,
                    description,
                    "IN_PROGRESS",
                    provider,
                    model,
                    estimatedDuration,
                    rawJson
            );

            CareerRoadmap savedRoadmap = roadmapRepository.save(roadmapEntity);

            // Persist individual milestones
            JsonNode phasesNode = root.path("phases");
            List<RoadmapPhaseDto> phaseDtos = new ArrayList<>();

            if (phasesNode.isArray()) {
                for (JsonNode phaseNode : phasesNode) {
                    int phaseNum = phaseNode.path("phase_number").asInt(1);
                    String phaseName = phaseNode.path("name").asText("Phase " + phaseNum);
                    String phaseDesc = phaseNode.path("description").asText("");

                    List<MilestoneDto> milestoneDtos = new ArrayList<>();
                    JsonNode milestonesNode = phaseNode.path("milestones");

                    if (milestonesNode.isArray()) {
                        for (JsonNode mNode : milestonesNode) {
                            String mTitle = mNode.path("title").asText("Milestone");
                            String mDesc = mNode.path("description").asText("");
                            String mPriority = mNode.path("priority").asText("MEDIUM");
                            String mStatus = "NOT_STARTED";
                            String mDuration = mNode.path("estimated_duration").asText(null);

                            List<String> skills = parseStringList(mNode.path("related_skills"));
                            List<String> criteria = parseStringList(mNode.path("completion_criteria"));
                            List<RoadmapTaskDto> tasks = parseTasks(mNode.path("tasks"));

                            CareerMilestone milestone = new CareerMilestone(
                                    savedRoadmap.getId(),
                                    userId,
                                    phaseNum,
                                    mTitle,
                                    mDesc,
                                    mPriority,
                                    mStatus,
                                    objectMapper.writeValueAsString(skills),
                                    objectMapper.writeValueAsString(tasks),
                                    objectMapper.writeValueAsString(criteria),
                                    mDuration
                            );

                            CareerMilestone savedMilestone = milestoneRepository.save(milestone);

                            milestoneDtos.add(mapToMilestoneDto(savedMilestone, tasks, skills, criteria));
                        }
                    }

                    phaseDtos.add(new RoadmapPhaseDto(phaseNum, phaseName, phaseDesc, milestoneDtos));
                }
            }

            return mapToRoadmapDto(savedRoadmap, phaseDtos);
        } catch (Exception e) {
            log.error("Failed to generate and persist career roadmap: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate career roadmap: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CareerRoadmapDto getActiveRoadmap(UUID userId, UUID careerTrackId) {
        verifyTrackOwnership(userId, careerTrackId);

        Optional<CareerRoadmap> roadmapOpt = roadmapRepository
                .findFirstByUserIdAndCareerTrackIdOrderByCreatedAtDesc(userId, careerTrackId);

        if (roadmapOpt.isEmpty()) {
            return null;
        }

        CareerRoadmap roadmap = roadmapOpt.get();
        List<CareerMilestone> milestones = milestoneRepository
                .findAllByRoadmapIdAndUserIdOrderByPhaseNumberAscCreatedAtAsc(roadmap.getId(), userId);

        return buildRoadmapDtoFromMilestones(roadmap, milestones);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CareerRoadmapDto> getUserRoadmaps(UUID userId) {
        List<CareerRoadmap> roadmaps = roadmapRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        List<CareerRoadmapDto> dtos = new ArrayList<>();
        for (CareerRoadmap rm : roadmaps) {
            List<CareerMilestone> milestones = milestoneRepository
                    .findAllByRoadmapIdAndUserIdOrderByPhaseNumberAscCreatedAtAsc(rm.getId(), userId);
            dtos.add(buildRoadmapDtoFromMilestones(rm, milestones));
        }
        return dtos;
    }

    @Override
    @Transactional
    public MilestoneDto updateMilestone(UUID userId, UUID milestoneId, UpdateMilestoneRequestDto request) {
        CareerMilestone milestone = milestoneRepository.findByIdAndUserId(milestoneId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String newStatus = request.getStatus().toUpperCase(Locale.ROOT);
            if (!Set.of("NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED").contains(newStatus)) {
                throw new IllegalArgumentException("Invalid milestone status: " + newStatus);
            }
            milestone.setStatus(newStatus);
            if ("COMPLETED".equals(newStatus)) {
                if (milestone.getCompletedAt() == null) {
                    milestone.setCompletedAt(Instant.now());
                }
            } else if ("IN_PROGRESS".equals(newStatus)) {
                if (milestone.getStartDate() == null) {
                    milestone.setStartDate(Instant.now());
                }
            }
        }

        if (request.getPersonalNotes() != null) {
            milestone.setPersonalNotes(request.getPersonalNotes());
        }

        if (request.getEvidenceLinks() != null) {
            try {
                milestone.setEvidenceLinks(objectMapper.writeValueAsString(request.getEvidenceLinks()));
            } catch (Exception e) {
                log.warn("Failed to serialize evidence links: {}", e.getMessage());
            }
        }

        CareerMilestone updated = milestoneRepository.save(milestone);

        // Check if all milestones in roadmap are completed
        updateRoadmapStatusIfFinished(userId, milestone.getRoadmapId());

        List<RoadmapTaskDto> tasks = parseTasksFromString(updated.getTasks());
        List<String> skills = parseStringListFromString(updated.getRelatedSkills());
        List<String> criteria = parseStringListFromString(updated.getCompletionCriteria());

        return mapToMilestoneDto(updated, tasks, skills, criteria);
    }

    @Override
    @Transactional
    public ProjectRecommendationsResponseDto recommendProjects(UUID userId, UUID careerTrackId) {
        log.info("Recommending portfolio projects for userId={}, trackId={}", userId, careerTrackId);

        verifyAiConsent(userId);
        CareerTrack track = careerTrackRepository.findByIdAndUserId(careerTrackId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Career track not found with id: " + careerTrackId));

        UserAiPreferenceDto preferences = userAiPreferenceService.getPreferences(userId);
        String provider = preferences.getSelectedProvider();
        String model = preferences.getPreferredModel();

        SkillGapAnalysisDto skillGaps = getLatestSkillGaps(userId, careerTrackId);
        List<String> missingSkills = new ArrayList<>();
        if (skillGaps != null) {
            if (skillGaps.getMissingEvidenceSkills() != null) {
                missingSkills.addAll(skillGaps.getMissingEvidenceSkills().stream().map(SkillGapItemDto::getCanonicalName).toList());
            }
            if (skillGaps.getDevelopingSkills() != null) {
                missingSkills.addAll(skillGaps.getDevelopingSkills().stream().map(SkillGapItemDto::getCanonicalName).toList());
            }
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("missing_skills", missingSkills);
        payload.put("target_role", track.getTargetRole());
        payload.put("provider", provider);
        payload.put("model", model);
        payload.put("user_consent", true);

        String rawJson = aiServiceClient.recommendCareerProjects(payload);

        try {
            JsonNode root = objectMapper.readTree(rawJson);
            List<ProjectRecommendationDto> projects = new ArrayList<>();
            JsonNode projectsNode = root.path("projects");
            if (projectsNode.isArray()) {
                for (JsonNode pNode : projectsNode) {
                    projects.add(new ProjectRecommendationDto(
                            pNode.path("title").asText("Portfolio Project"),
                            pNode.path("description").asText(""),
                            parseStringList(pNode.path("target_missing_skills")),
                            pNode.path("architecture_overview").asText(""),
                            parseStringList(pNode.path("key_deliverables")),
                            pNode.path("estimated_difficulty").asText("INTERMEDIATE"),
                            pNode.path("portfolio_impact").asText("")
                    ));
                }
            }

            return new ProjectRecommendationsResponseDto(
                    track.getId(),
                    track.getTargetRole(),
                    provider,
                    model,
                    projects
            );
        } catch (Exception e) {
            log.error("Failed to recommend projects: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to recommend projects: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CareerDashboardSummaryDto getDashboardSummary(UUID userId) {
        int trackCount = (int) careerTrackRepository.countByUserIdAndActiveTrue(userId);

        Optional<CareerTrack> primaryTrackOpt = careerTrackRepository.findByUserIdAndPrimaryTrue(userId);
        if (primaryTrackOpt.isEmpty()) {
            List<CareerTrack> tracks = careerTrackRepository.findAllByUserIdAndActiveOrderByPriorityAscCreatedAtDesc(userId, true);
            if (!tracks.isEmpty()) {
                primaryTrackOpt = Optional.of(tracks.get(0));
            }
        }

        if (primaryTrackOpt.isEmpty()) {
            return new CareerDashboardSummaryDto(
                    0, null, null, null, 0, List.of(), 0, 0, 0, 0, List.of(), false
            );
        }

        CareerTrack track = primaryTrackOpt.get();

        // Skill Gaps
        SkillGapAnalysisDto gaps = getLatestSkillGaps(userId, track.getId());
        int criticalCount = 0;
        List<SkillGapItemDto> topGaps = List.of();
        if (gaps != null && gaps.getCriticalPriorities() != null) {
            criticalCount = gaps.getCriticalPriorities().size();
            topGaps = gaps.getCriticalPriorities().stream().limit(5).toList();
        }

        // Active Roadmap
        CareerRoadmapDto roadmap = getActiveRoadmap(userId, track.getId());
        int totalMilestones = 0;
        int completedMilestones = 0;
        int inProgressMilestones = 0;
        int progressPct = 0;
        List<MilestoneDto> upcoming = new ArrayList<>();
        boolean hasRoadmap = false;

        if (roadmap != null) {
            hasRoadmap = true;
            totalMilestones = roadmap.getTotalMilestones();
            completedMilestones = roadmap.getCompletedMilestones();
            inProgressMilestones = roadmap.getInProgressMilestones();
            progressPct = roadmap.getProgressPercentage();

            if (roadmap.getPhases() != null) {
                for (RoadmapPhaseDto phase : roadmap.getPhases()) {
                    if (phase.getMilestones() != null) {
                        for (MilestoneDto m : phase.getMilestones()) {
                            if (!"COMPLETED".equals(m.getStatus())) {
                                upcoming.add(m);
                            }
                        }
                    }
                }
            }
        }

        return new CareerDashboardSummaryDto(
                trackCount,
                track.getId(),
                track.getName(),
                track.getTargetRole(),
                criticalCount,
                topGaps,
                totalMilestones,
                completedMilestones,
                inProgressMilestones,
                progressPct,
                upcoming.stream().limit(3).toList(),
                hasRoadmap
        );
    }

    // -------------------------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------------------------

    private void verifyAiConsent(UUID userId) {
        if (!userAiPreferenceService.hasConsent(userId)) {
            log.warn("Access denied for userId={}: User has not granted AI processing consent", userId);
            throw new AccessDeniedException("External AI processing consent is required. Please grant consent in AI Provider Settings before using Career Intelligence.");
        }
    }

    private void verifyTrackOwnership(UUID userId, UUID trackId) {
        if (!careerTrackRepository.existsByIdAndUserId(trackId, userId)) {
            throw new ResourceNotFoundException("Career track not found with id: " + trackId);
        }
    }

    private void updateRoadmapStatusIfFinished(UUID userId, UUID roadmapId) {
        List<CareerMilestone> milestones = milestoneRepository.findAllByRoadmapIdAndUserIdOrderByPhaseNumberAscCreatedAtAsc(roadmapId, userId);
        if (milestones.isEmpty()) return;

        boolean allCompleted = milestones.stream().allMatch(m -> "COMPLETED".equals(m.getStatus()));
        if (allCompleted) {
            roadmapRepository.findByIdAndUserId(roadmapId, userId).ifPresent(rm -> {
                rm.setStatus("COMPLETED");
                roadmapRepository.save(rm);
            });
        }
    }

    private CareerRoadmapDto buildRoadmapDtoFromMilestones(CareerRoadmap roadmap, List<CareerMilestone> milestones) {
        Map<Integer, List<CareerMilestone>> groupedByPhase = new LinkedHashMap<>();
        for (CareerMilestone m : milestones) {
            groupedByPhase.computeIfAbsent(m.getPhaseNumber(), k -> new ArrayList<>()).add(m);
        }

        int total = milestones.size();
        int completed = 0;
        int inProgress = 0;
        int blocked = 0;

        List<RoadmapPhaseDto> phases = new ArrayList<>();
        for (Map.Entry<Integer, List<CareerMilestone>> entry : groupedByPhase.entrySet()) {
            int phaseNum = entry.getKey();
            List<MilestoneDto> mDtos = new ArrayList<>();
            for (CareerMilestone m : entry.getValue()) {
                if ("COMPLETED".equals(m.getStatus())) completed++;
                else if ("IN_PROGRESS".equals(m.getStatus())) inProgress++;
                else if ("BLOCKED".equals(m.getStatus())) blocked++;

                mDtos.add(mapToMilestoneDto(
                        m,
                        parseTasksFromString(m.getTasks()),
                        parseStringListFromString(m.getRelatedSkills()),
                        parseStringListFromString(m.getCompletionCriteria())
                ));
            }
            phases.add(new RoadmapPhaseDto(phaseNum, "Phase " + phaseNum, "", mDtos));
        }

        int progressPct = total > 0 ? (int) Math.round(((double) completed / total) * 100.0) : 0;

        return new CareerRoadmapDto(
                roadmap.getId(),
                roadmap.getCareerTrackId(),
                roadmap.getTargetRole(),
                roadmap.getTitle(),
                roadmap.getDescription(),
                roadmap.getStatus(),
                roadmap.getProvider(),
                roadmap.getModel(),
                roadmap.getEstimatedDuration(),
                phases,
                total,
                completed,
                inProgress,
                blocked,
                progressPct,
                roadmap.getCreatedAt(),
                roadmap.getUpdatedAt()
        );
    }

    private CareerRoadmapDto mapToRoadmapDto(CareerRoadmap roadmap, List<RoadmapPhaseDto> phases) {
        int total = 0;
        int completed = 0;
        int inProgress = 0;
        int blocked = 0;

        for (RoadmapPhaseDto phase : phases) {
            if (phase.getMilestones() != null) {
                for (MilestoneDto m : phase.getMilestones()) {
                    total++;
                    if ("COMPLETED".equals(m.getStatus())) completed++;
                    else if ("IN_PROGRESS".equals(m.getStatus())) inProgress++;
                    else if ("BLOCKED".equals(m.getStatus())) blocked++;
                }
            }
        }

        int progressPct = total > 0 ? (int) Math.round(((double) completed / total) * 100.0) : 0;

        return new CareerRoadmapDto(
                roadmap.getId(),
                roadmap.getCareerTrackId(),
                roadmap.getTargetRole(),
                roadmap.getTitle(),
                roadmap.getDescription(),
                roadmap.getStatus(),
                roadmap.getProvider(),
                roadmap.getModel(),
                roadmap.getEstimatedDuration(),
                phases,
                total,
                completed,
                inProgress,
                blocked,
                progressPct,
                roadmap.getCreatedAt(),
                roadmap.getUpdatedAt()
        );
    }

    private MilestoneDto mapToMilestoneDto(CareerMilestone m, List<RoadmapTaskDto> tasks,
                                           List<String> skills, List<String> criteria) {
        List<String> evidence = parseStringListFromString(m.getEvidenceLinks());
        return new MilestoneDto(
                m.getId(),
                m.getRoadmapId(),
                m.getPhaseNumber(),
                m.getTitle(),
                m.getDescription(),
                m.getPriority(),
                m.getStatus(),
                skills,
                tasks,
                criteria,
                m.getEstimatedDuration(),
                m.getStartDate(),
                m.getCompletedAt(),
                m.getPersonalNotes(),
                evidence,
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }

    private List<String> extractSkills(CareerProfileResponse profile) {
        if (profile == null || profile.getSkills() == null) return List.of();
        return profile.getSkills().stream().map(SkillDto::getName).filter(Objects::nonNull).toList();
    }

    private List<String> extractExperience(CareerProfileResponse profile) {
        if (profile == null || profile.getExperience() == null) return List.of();
        return profile.getExperience().stream()
                .map(ExperienceDto::getDescription)
                .filter(Objects::nonNull)
                .toList();
    }

    private List<String> extractProjects(CareerProfileResponse profile) {
        if (profile == null || profile.getProjects() == null) return List.of();
        return profile.getProjects().stream()
                .map(ProjectDto::getDescription)
                .filter(Objects::nonNull)
                .toList();
    }

    private List<String> extractCertifications(CareerProfileResponse profile) {
        if (profile == null || profile.getCertifications() == null) return List.of();
        return profile.getCertifications().stream()
                .map(CertificationDto::getName)
                .filter(Objects::nonNull)
                .toList();
    }

    private List<SkillGapItemDto> parseSkillItems(JsonNode node) {
        List<SkillGapItemDto> items = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                items.add(new SkillGapItemDto(
                        item.path("canonical_name").asText(""),
                        item.path("category").asText("TECHNICAL"),
                        item.path("classification").asText("MISSING_EVIDENCE"),
                        item.path("evidence_status").asText("MISSING"),
                        item.path("priority_score").asInt(50),
                        item.path("priority_level").asText("MEDIUM"),
                        item.path("importance_rationale").asText(""),
                        parseStringList(item.path("required_for_roles")),
                        parseStringList(item.path("prerequisites")),
                        parseStringList(item.path("candidate_evidence"))
                ));
            }
        }
        return items;
    }

    private List<CareerRecommendationItemDto> parseRecommendationItems(JsonNode node) {
        List<CareerRecommendationItemDto> items = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                items.add(new CareerRecommendationItemDto(
                        item.path("title").asText("Recommendation"),
                        item.path("category").asText("SKILL_DEVELOPMENT"),
                        item.path("priority").asText("MEDIUM"),
                        item.path("rationale").asText(""),
                        parseStringList(item.path("target_skills")),
                        parseStringList(item.path("actionable_steps")),
                        item.path("estimated_effort").asText("2-3 weeks")
                ));
            }
        }
        return items;
    }

    private List<RoadmapTaskDto> parseTasks(JsonNode node) {
        List<RoadmapTaskDto> tasks = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode taskNode : node) {
                tasks.add(new RoadmapTaskDto(
                        taskNode.path("description").asText(""),
                        taskNode.path("task_type").asText("PRACTICE"),
                        parseStringList(taskNode.path("skills"))
                ));
            }
        }
        return tasks;
    }

    private List<String> parseStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode el : node) {
                list.add(el.asText());
            }
        }
        return list;
    }

    private List<String> parseStringListFromString(String json) {
        if (json == null || json.isBlank() || "[]".equals(json.trim())) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<RoadmapTaskDto> parseTasksFromString(String json) {
        if (json == null || json.isBlank() || "[]".equals(json.trim())) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<RoadmapTaskDto>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
