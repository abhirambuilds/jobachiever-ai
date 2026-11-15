package ai.jobachiever.careertracks.service;

import ai.jobachiever.careertracks.dto.*;
import ai.jobachiever.careertracks.entity.CareerTrack;
import ai.jobachiever.careertracks.repository.CareerTrackRepository;
import ai.jobachiever.common.exception.InvalidRequestException;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.profiles.dto.ExperienceDto;
import ai.jobachiever.profiles.dto.ProjectDto;
import ai.jobachiever.profiles.entity.CareerProfile;
import ai.jobachiever.profiles.entity.ProfileExperience;
import ai.jobachiever.profiles.entity.ProfileProject;
import ai.jobachiever.profiles.entity.ProfileSkill;
import ai.jobachiever.profiles.repository.CareerProfileRepository;
import ai.jobachiever.profiles.repository.ProfileExperienceRepository;
import ai.jobachiever.profiles.repository.ProfileProjectRepository;
import ai.jobachiever.profiles.repository.ProfileSkillRepository;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class CareerTrackServiceImpl implements CareerTrackService {

    private static final Logger log = LoggerFactory.getLogger(CareerTrackServiceImpl.class);
    private static final int MAX_ACTIVE_TRACKS = 10;

    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final CareerTrackRepository careerTrackRepository;
    private final ProfileSkillRepository skillRepository;
    private final ProfileProjectRepository projectRepository;
    private final ProfileExperienceRepository experienceRepository;
    private final CareerTrackSkillService trackSkillService;
    private final ObjectMapper objectMapper;

    public CareerTrackServiceImpl(UserRepository userRepository,
                                  CareerProfileRepository careerProfileRepository,
                                  CareerTrackRepository careerTrackRepository,
                                  ProfileSkillRepository skillRepository,
                                  ProfileProjectRepository projectRepository,
                                  ProfileExperienceRepository experienceRepository,
                                  CareerTrackSkillService trackSkillService,
                                  ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.careerTrackRepository = careerTrackRepository;
        this.skillRepository = skillRepository;
        this.projectRepository = projectRepository;
        this.experienceRepository = experienceRepository;
        this.trackSkillService = trackSkillService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CareerTrackResponse> getTracks(UUID userId, Boolean activeOnly) {
        List<CareerTrack> tracks;
        if (Boolean.TRUE.equals(activeOnly)) {
            tracks = careerTrackRepository.findAllByUserIdAndActiveOrderByPriorityAscCreatedAtDesc(userId, true);
        } else if (Boolean.FALSE.equals(activeOnly)) {
            tracks = careerTrackRepository.findAllByUserIdAndActiveOrderByPriorityAscCreatedAtDesc(userId, false);
        } else {
            tracks = careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(userId);
        }
        return tracks.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CareerTrackResponse> getTracksPaginated(UUID userId, Boolean activeOnly, Pageable pageable) {
        Page<CareerTrack> page;
        if (Boolean.TRUE.equals(activeOnly)) {
            page = careerTrackRepository.findAllByUserIdAndActive(userId, true, pageable);
        } else if (Boolean.FALSE.equals(activeOnly)) {
            page = careerTrackRepository.findAllByUserIdAndActive(userId, false, pageable);
        } else {
            page = careerTrackRepository.findAllByUserId(userId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CareerTrackResponse getTrackById(UUID trackId, UUID userId) {
        CareerTrack track = findTrackByIdAndUser(trackId, userId);
        return toResponse(track);
    }

    @Override
    public CareerTrackResponse createTrack(UUID userId, CreateCareerTrackRequest request) {
        User user = findUserById(userId);
        CareerProfile profile = findOrCreateProfile(user);

        // 1. Check max active tracks limit
        boolean isActive = request.getActive() != null ? request.getActive() : true;
        if (isActive) {
            long activeCount = careerTrackRepository.countByUserIdAndActiveTrue(userId);
            if (activeCount >= MAX_ACTIVE_TRACKS) {
                throw new InvalidRequestException("Maximum active career tracks limit (" + MAX_ACTIVE_TRACKS + ") reached. Please deactivate an existing track.");
            }
        }

        // 2. Prevent duplicate track name (case-insensitive) for the same user
        if (careerTrackRepository.existsByUserIdAndNameIgnoreCase(userId, request.getName().trim())) {
            throw new InvalidRequestException("A career track named '" + request.getName().trim() + "' already exists.");
        }

        // 3. Prevent duplicate active tracks with the same target role (case-insensitive)
        if (isActive && careerTrackRepository.existsByUserIdAndTargetRoleIgnoreCaseAndActiveTrue(userId, request.getTargetRole().trim())) {
            throw new InvalidRequestException("An active career track with target role '" + request.getTargetRole().trim() + "' already exists.");
        }

        CareerTrack track = new CareerTrack(user, profile, request.getName().trim(), request.getTargetRole().trim());
        track.setDescription(request.getDescription());
        track.setTargetSeniority(request.getTargetSeniority() != null ? request.getTargetSeniority() : "ENTRY_LEVEL");
        track.setPriority(request.getPriority() != null ? request.getPriority() : 1);
        track.setActive(isActive);
        track.setCareerGoals(request.getCareerGoals());

        // Handle primary flag
        boolean isFirstTrack = careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(userId).isEmpty();
        boolean shouldBePrimary = isFirstTrack || Boolean.TRUE.equals(request.getIsPrimary());
        if (shouldBePrimary) {
            unsetOtherPrimaryTracks(userId);
            track.setPrimary(true);
        } else {
            track.setPrimary(false);
        }

        // JSON fields
        track.setPreferredLocations(toJson(trackSkillService.deduplicateSkills(request.getPreferredLocations())));
        track.setEmploymentTypes(toJson(trackSkillService.deduplicateSkills(request.getEmploymentTypes())));
        track.setIndustries(toJson(trackSkillService.deduplicateSkills(request.getIndustries())));
        track.setTargetCompanies(toJson(trackSkillService.deduplicateSkills(request.getTargetCompanies())));
        track.setRequiredSkills(toJson(trackSkillService.deduplicateSkills(request.getRequiredSkills())));
        track.setPreferredSkills(toJson(trackSkillService.deduplicateSkills(request.getPreferredSkills())));

        CareerTrack saved = careerTrackRepository.save(track);
        return toResponse(saved);
    }

    @Override
    public CareerTrackResponse updateTrack(UUID trackId, UUID userId, UpdateCareerTrackRequest request) {
        CareerTrack track = findTrackByIdAndUser(trackId, userId);

        String newName = request.getName().trim();
        String newRole = request.getTargetRole().trim();
        boolean newActive = request.getActive() != null ? request.getActive() : track.isActive();

        // 1. Check duplicate name if changed
        if (!track.getName().equalsIgnoreCase(newName)) {
            if (careerTrackRepository.existsByUserIdAndNameIgnoreCase(userId, newName)) {
                throw new InvalidRequestException("A career track named '" + newName + "' already exists.");
            }
        }

        // 2. Check duplicate active target role if changed or if activating
        if (newActive) {
            List<CareerTrack> userActiveTracks = careerTrackRepository.findAllByUserIdAndActiveOrderByPriorityAscCreatedAtDesc(userId, true);
            boolean duplicateRoleExists = userActiveTracks.stream()
                    .anyMatch(t -> !t.getId().equals(track.getId()) && t.getTargetRole().equalsIgnoreCase(newRole));
            if (duplicateRoleExists) {
                throw new InvalidRequestException("An active career track with target role '" + newRole + "' already exists.");
            }
        }

        track.setName(newName);
        track.setTargetRole(newRole);
        track.setDescription(request.getDescription());
        track.setTargetSeniority(request.getTargetSeniority() != null ? request.getTargetSeniority() : "ENTRY_LEVEL");
        track.setPriority(request.getPriority() != null ? request.getPriority() : track.getPriority());
        track.setActive(newActive);
        track.setCareerGoals(request.getCareerGoals());

        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            unsetOtherPrimaryTracks(userId);
            track.setPrimary(true);
        } else if (Boolean.FALSE.equals(request.getIsPrimary()) && track.isPrimary()) {
            track.setPrimary(false);
        }

        track.setPreferredLocations(toJson(trackSkillService.deduplicateSkills(request.getPreferredLocations())));
        track.setEmploymentTypes(toJson(trackSkillService.deduplicateSkills(request.getEmploymentTypes())));
        track.setIndustries(toJson(trackSkillService.deduplicateSkills(request.getIndustries())));
        track.setTargetCompanies(toJson(trackSkillService.deduplicateSkills(request.getTargetCompanies())));
        track.setRequiredSkills(toJson(trackSkillService.deduplicateSkills(request.getRequiredSkills())));
        track.setPreferredSkills(toJson(trackSkillService.deduplicateSkills(request.getPreferredSkills())));

        CareerTrack saved = careerTrackRepository.save(track);
        return toResponse(saved);
    }

    @Override
    public CareerTrackResponse updateTrackStatus(UUID trackId, UUID userId, UpdateTrackStatusRequest request) {
        CareerTrack track = findTrackByIdAndUser(trackId, userId);
        boolean newActive = Boolean.TRUE.equals(request.getActive());

        if (newActive && !track.isActive()) {
            long activeCount = careerTrackRepository.countByUserIdAndActiveTrue(userId);
            if (activeCount >= MAX_ACTIVE_TRACKS) {
                throw new InvalidRequestException("Maximum active career tracks limit (" + MAX_ACTIVE_TRACKS + ") reached. Please deactivate an existing track.");
            }
            if (careerTrackRepository.existsByUserIdAndTargetRoleIgnoreCaseAndActiveTrue(userId, track.getTargetRole().trim())) {
                throw new InvalidRequestException("An active career track with target role '" + track.getTargetRole().trim() + "' already exists.");
            }
        }

        track.setActive(newActive);
        CareerTrack saved = careerTrackRepository.save(track);
        return toResponse(saved);
    }

    @Override
    public CareerTrackResponse updateTrackPriority(UUID trackId, UUID userId, UpdateTrackPriorityRequest request) {
        CareerTrack track = findTrackByIdAndUser(trackId, userId);
        track.setPriority(request.getPriority());
        CareerTrack saved = careerTrackRepository.save(track);
        return toResponse(saved);
    }

    @Override
    public void deleteTrack(UUID trackId, UUID userId) {
        CareerTrack track = findTrackByIdAndUser(trackId, userId);
        boolean wasPrimary = track.isPrimary();

        careerTrackRepository.delete(track);

        // If the deleted track was primary, promote the next highest priority track
        if (wasPrimary) {
            List<CareerTrack> remaining = careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                CareerTrack nextPrimary = remaining.get(0);
                nextPrimary.setPrimary(true);
                careerTrackRepository.save(nextPrimary);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CareerTrackOverviewResponse getTrackOverview(UUID trackId, UUID userId) {
        CareerTrack track = findTrackByIdAndUser(trackId, userId);
        CareerProfile profile = track.getProfile();

        List<ProfileSkill> masterSkills = skillRepository.findByProfileId(profile.getId());
        List<ProfileProject> masterProjects = projectRepository.findByProfileId(profile.getId());
        List<ProfileExperience> masterExperiences = experienceRepository.findByProfileId(profile.getId());

        List<String> requiredSkills = parseList(track.getRequiredSkills());
        List<String> preferredSkills = parseList(track.getPreferredSkills());

        SkillMatchResult matchResult = trackSkillService.matchSkills(requiredSkills, preferredSkills, masterSkills);

        List<String> combinedTrackSkills = new ArrayList<>();
        combinedTrackSkills.addAll(requiredSkills);
        combinedTrackSkills.addAll(preferredSkills);

        List<ProjectDto> relevantProjects = trackSkillService.findRelevantProjects(combinedTrackSkills, track.getTargetRole(), masterProjects);
        List<ExperienceDto> relevantExperiences = trackSkillService.findRelevantExperiences(combinedTrackSkills, track.getTargetRole(), masterExperiences);

        String readiness;
        if (matchResult.getRequiredSkillMatchPercentage() >= 80) {
            readiness = "READY_TO_APPLY";
        } else if (matchResult.getRequiredSkillMatchPercentage() >= 50) {
            readiness = "NEEDS_DEVELOPMENT";
        } else {
            readiness = "FOUNDATIONAL";
        }

        List<String> notes = new ArrayList<>();
        notes.add("Matched " + matchResult.getMatchedRequiredSkills().size() + " of " + requiredSkills.size() + " required skills (" + matchResult.getRequiredSkillMatchPercentage() + "%).");
        if (!matchResult.getMissingRequiredSkills().isEmpty()) {
            notes.add("Key missing required skills: " + String.join(", ", matchResult.getMissingRequiredSkills()) + ".");
        }
        if (!matchResult.getMissingPreferredSkills().isEmpty()) {
            notes.add("Preferred skills to consider: " + String.join(", ", matchResult.getMissingPreferredSkills()) + ".");
        }
        notes.add("Identified " + relevantProjects.size() + " relevant projects and " + relevantExperiences.size() + " relevant work experiences in your master profile.");

        CareerTrackOverviewResponse overview = new CareerTrackOverviewResponse();
        overview.setTrack(toResponse(track));
        overview.setRequiredSkillsCount(requiredSkills.size());
        overview.setPreferredSkillsCount(preferredSkills.size());
        overview.setMatchedRequiredSkills(matchResult.getMatchedRequiredSkills());
        overview.setMatchedPreferredSkills(matchResult.getMatchedPreferredSkills());
        overview.setMissingRequiredSkills(matchResult.getMissingRequiredSkills());
        overview.setMissingPreferredSkills(matchResult.getMissingPreferredSkills());
        overview.setAdditionalProfileSkills(matchResult.getAdditionalProfileSkills());
        overview.setRequiredSkillMatchPercentage(matchResult.getRequiredSkillMatchPercentage());
        overview.setOverallSkillMatchPercentage(matchResult.getOverallSkillMatchPercentage());
        overview.setRelevantProjects(relevantProjects);
        overview.setRelevantExperience(relevantExperiences);
        overview.setReadinessStatus(readiness);
        overview.setSummaryNotes(notes);

        return overview;
    }

    private CareerTrack findTrackByIdAndUser(UUID trackId, UUID userId) {
        return careerTrackRepository.findByIdAndUserId(trackId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Career track not found: " + trackId));
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private CareerProfile findOrCreateProfile(User user) {
        return careerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CareerProfile profile = new CareerProfile(user);
                    profile.setHeadline("");
                    profile.setSummary("");
                    profile.setCompletionPercentage(0);
                    return careerProfileRepository.save(profile);
                });
    }

    private void unsetOtherPrimaryTracks(UUID userId) {
        List<CareerTrack> tracks = careerTrackRepository.findAllByUserIdOrderByPriorityAscCreatedAtDesc(userId);
        for (CareerTrack t : tracks) {
            if (t.isPrimary()) {
                t.setPrimary(false);
                careerTrackRepository.save(t);
            }
        }
    }

    private CareerTrackResponse toResponse(CareerTrack entity) {
        CareerTrackResponse dto = new CareerTrackResponse();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setProfileId(entity.getProfile().getId());
        dto.setName(entity.getName());
        dto.setTargetRole(entity.getTargetRole());
        dto.setDescription(entity.getDescription());
        dto.setTargetSeniority(entity.getTargetSeniority());
        dto.setPreferredLocations(parseList(entity.getPreferredLocations()));
        dto.setEmploymentTypes(parseList(entity.getEmploymentTypes()));
        dto.setIndustries(parseList(entity.getIndustries()));
        dto.setTargetCompanies(parseList(entity.getTargetCompanies()));
        dto.setRequiredSkills(parseList(entity.getRequiredSkills()));
        dto.setPreferredSkills(parseList(entity.getPreferredSkills()));
        dto.setCareerGoals(entity.getCareerGoals());
        dto.setPriority(entity.getPriority());
        dto.setActive(entity.isActive());
        dto.setPrimary(entity.isPrimary());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj != null ? obj : Collections.emptyList());
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<String> parseList(String json) {
        if (json == null || json.trim().isEmpty() || "[]".equals(json.trim())) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
