package ai.jobachiever.profiles.service;

import ai.jobachiever.common.exception.InvalidRequestException;
import ai.jobachiever.common.exception.ResourceNotFoundException;
import ai.jobachiever.profiles.dto.*;
import ai.jobachiever.profiles.entity.*;
import ai.jobachiever.profiles.repository.*;
import ai.jobachiever.users.entity.User;
import ai.jobachiever.users.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@Transactional
public class CareerProfileServiceImpl implements CareerProfileService {

    private static final Logger log = LoggerFactory.getLogger(CareerProfileServiceImpl.class);

    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final ProfileEducationRepository educationRepository;
    private final ProfileSkillRepository skillRepository;
    private final ProfileExperienceRepository experienceRepository;
    private final ProfileProjectRepository projectRepository;
    private final ProfileCertificationRepository certificationRepository;
    private final ProfileAchievementRepository achievementRepository;
    private final ProfileCompletionCalculator completionCalculator;
    private final ObjectMapper objectMapper;

    public CareerProfileServiceImpl(UserRepository userRepository,
                                     CareerProfileRepository careerProfileRepository,
                                     ProfileEducationRepository educationRepository,
                                     ProfileSkillRepository skillRepository,
                                     ProfileExperienceRepository experienceRepository,
                                     ProfileProjectRepository projectRepository,
                                     ProfileCertificationRepository certificationRepository,
                                     ProfileAchievementRepository achievementRepository,
                                     ProfileCompletionCalculator completionCalculator,
                                     ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.educationRepository = educationRepository;
        this.skillRepository = skillRepository;
        this.experienceRepository = experienceRepository;
        this.projectRepository = projectRepository;
        this.certificationRepository = certificationRepository;
        this.achievementRepository = achievementRepository;
        this.completionCalculator = completionCalculator;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public CareerProfileResponse getProfile(UUID userId) {
        User user = findUserById(userId);
        CareerProfile profile = careerProfileRepository.findByUserId(userId)
                .orElseGet(() -> initializeDefaultProfile(user));

        return buildProfileResponse(user, profile);
    }

    @Override
    public CareerProfileResponse updateProfile(UUID userId, UpdateCareerProfileRequest request) {
        User user = findUserById(userId);
        CareerProfile profile = careerProfileRepository.findByUserId(userId)
                .orElseGet(() -> initializeDefaultProfile(user));

        // 1. Prohibit email modification via profile update
        if (request.getPersonalInfo() != null && request.getPersonalInfo().getEmail() != null) {
            String incomingEmail = request.getPersonalInfo().getEmail().trim();
            if (!incomingEmail.equalsIgnoreCase(user.getEmail().trim())) {
                throw new InvalidRequestException("Email address cannot be changed via profile management. Use account security settings.");
            }
        }

        // 2. Update User entity if fullName is provided
        if (request.getPersonalInfo() != null && isNotBlank(request.getPersonalInfo().getFullName())) {
            updateUserFullName(user, request.getPersonalInfo().getFullName());
        }

        // 3. Update CareerProfile top-level fields
        applyPersonalInfo(profile, request.getPersonalInfo());
        applyProfessionalSummary(profile, request.getProfessionalSummary());

        if (request.getCareerPreferences() != null) {
            applyCareerPreferences(profile, request.getCareerPreferences());
        }

        // 4. Update child collections idempotently
        if (request.getEducation() != null) {
            validateEducations(request.getEducation());
            educationRepository.deleteByProfileId(profile.getId());
            educationRepository.flush();
            saveEducations(profile, request.getEducation());
        }

        if (request.getSkills() != null) {
            skillRepository.deleteByProfileId(profile.getId());
            skillRepository.flush();
            saveSkills(profile, request.getSkills());
        }

        if (request.getExperience() != null) {
            validateExperiences(request.getExperience());
            experienceRepository.deleteByProfileId(profile.getId());
            experienceRepository.flush();
            saveExperiences(profile, request.getExperience());
        }

        if (request.getProjects() != null) {
            validateProjects(request.getProjects());
            projectRepository.deleteByProfileId(profile.getId());
            projectRepository.flush();
            saveProjects(profile, request.getProjects());
        }

        if (request.getCertifications() != null) {
            validateCertifications(request.getCertifications());
            certificationRepository.deleteByProfileId(profile.getId());
            certificationRepository.flush();
            saveCertifications(profile, request.getCertifications());
        }

        if (request.getAchievements() != null) {
            achievementRepository.deleteByProfileId(profile.getId());
            achievementRepository.flush();
            saveAchievements(profile, request.getAchievements());
        }

        // 5. Recalculate completion percentage
        CareerProfileResponse response = buildProfileResponse(user, profile);
        ProfileCompletionResponse completion = completionCalculator.calculate(
                response.getPersonalInfo(),
                response.getProfessionalSummary(),
                response.getEducation(),
                response.getSkills(),
                response.getExperience(),
                response.getProjects(),
                response.getCertifications(),
                response.getAchievements(),
                response.getCareerPreferences()
        );

        profile.setCompletionPercentage(completion.getCompletionPercentage());
        careerProfileRepository.save(profile);
        response.setCompletionPercentage(completion.getCompletionPercentage());

        return response;
    }

    @Override
    public CareerProfileResponse patchProfile(UUID userId, PatchCareerProfileRequest request) {
        User user = findUserById(userId);
        CareerProfile profile = careerProfileRepository.findByUserId(userId)
                .orElseGet(() -> initializeDefaultProfile(user));

        // 1. Prohibit email modification via profile patch
        if (request.getPersonalInfo() != null && request.getPersonalInfo().getEmail() != null) {
            String incomingEmail = request.getPersonalInfo().getEmail().trim();
            if (!incomingEmail.equalsIgnoreCase(user.getEmail().trim())) {
                throw new InvalidRequestException("Email address cannot be changed via profile management. Use account security settings.");
            }
        }

        // 2. Update User entity if fullName is provided
        if (request.getPersonalInfo() != null && isNotBlank(request.getPersonalInfo().getFullName())) {
            updateUserFullName(user, request.getPersonalInfo().getFullName());
        }

        // 3. Partial apply top-level fields
        if (request.getPersonalInfo() != null) {
            applyPersonalInfo(profile, request.getPersonalInfo());
        }

        if (request.getProfessionalSummary() != null) {
            applyProfessionalSummary(profile, request.getProfessionalSummary());
        }

        if (request.getCareerPreferences() != null) {
            applyCareerPreferences(profile, request.getCareerPreferences());
        }

        // 4. Update individual sections if present
        if (request.getEducation() != null) {
            validateEducations(request.getEducation());
            educationRepository.deleteByProfileId(profile.getId());
            educationRepository.flush();
            saveEducations(profile, request.getEducation());
        }

        if (request.getSkills() != null) {
            skillRepository.deleteByProfileId(profile.getId());
            skillRepository.flush();
            saveSkills(profile, request.getSkills());
        }

        if (request.getExperience() != null) {
            validateExperiences(request.getExperience());
            experienceRepository.deleteByProfileId(profile.getId());
            experienceRepository.flush();
            saveExperiences(profile, request.getExperience());
        }

        if (request.getProjects() != null) {
            validateProjects(request.getProjects());
            projectRepository.deleteByProfileId(profile.getId());
            projectRepository.flush();
            saveProjects(profile, request.getProjects());
        }

        if (request.getCertifications() != null) {
            validateCertifications(request.getCertifications());
            certificationRepository.deleteByProfileId(profile.getId());
            certificationRepository.flush();
            saveCertifications(profile, request.getCertifications());
        }

        if (request.getAchievements() != null) {
            achievementRepository.deleteByProfileId(profile.getId());
            achievementRepository.flush();
            saveAchievements(profile, request.getAchievements());
        }

        // 5. Recalculate completion percentage
        CareerProfileResponse response = buildProfileResponse(user, profile);
        ProfileCompletionResponse completion = completionCalculator.calculate(
                response.getPersonalInfo(),
                response.getProfessionalSummary(),
                response.getEducation(),
                response.getSkills(),
                response.getExperience(),
                response.getProjects(),
                response.getCertifications(),
                response.getAchievements(),
                response.getCareerPreferences()
        );

        profile.setCompletionPercentage(completion.getCompletionPercentage());
        careerProfileRepository.save(profile);
        response.setCompletionPercentage(completion.getCompletionPercentage());

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileCompletionResponse getCompletion(UUID userId) {
        CareerProfileResponse response = getProfile(userId);
        return completionCalculator.calculate(
                response.getPersonalInfo(),
                response.getProfessionalSummary(),
                response.getEducation(),
                response.getSkills(),
                response.getExperience(),
                response.getProjects(),
                response.getCertifications(),
                response.getAchievements(),
                response.getCareerPreferences()
        );
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private CareerProfile initializeDefaultProfile(User user) {
        CareerProfile profile = new CareerProfile(user);
        profile.setHeadline("");
        profile.setSummary("");
        profile.setCareerStage(CareerStage.ENTRY_LEVEL);
        profile.setYearsOfExperience(BigDecimal.ZERO);
        profile.setCompletionPercentage(0);
        return careerProfileRepository.save(profile);
    }

    private void updateUserFullName(User user, String fullName) {
        String trimmed = fullName.trim();
        int spaceIdx = trimmed.lastIndexOf(' ');
        if (spaceIdx > 0) {
            user.setFirstName(trimmed.substring(0, spaceIdx).trim());
            user.setLastName(trimmed.substring(spaceIdx + 1).trim());
        } else {
            user.setFirstName(trimmed);
            user.setLastName("");
        }
        userRepository.save(user);
    }

    private void applyPersonalInfo(CareerProfile profile, PersonalInfoDto info) {
        if (info == null) return;
        if (info.getHeadline() != null) profile.setHeadline(info.getHeadline());
        if (info.getSummary() != null) profile.setSummary(info.getSummary());
        if (info.getLocation() != null) profile.setCurrentLocation(info.getLocation());
        if (info.getCountry() != null) profile.setCountry(info.getCountry());
        if (info.getPhone() != null) profile.setPhoneNumber(info.getPhone());
        if (info.getLinkedinUrl() != null) profile.setLinkedinUrl(info.getLinkedinUrl());
        if (info.getGithubUrl() != null) profile.setGithubUrl(info.getGithubUrl());
        if (info.getPortfolioUrl() != null) profile.setPortfolioUrl(info.getPortfolioUrl());
        if (info.getWebsiteUrl() != null) profile.setWebsiteUrl(info.getWebsiteUrl());
    }

    private void applyProfessionalSummary(CareerProfile profile, ProfessionalSummaryDto summary) {
        if (summary == null) return;
        if (summary.getHeadline() != null) profile.setHeadline(summary.getHeadline());
        if (summary.getSummary() != null) profile.setSummary(summary.getSummary());
        if (summary.getCareerStage() != null) profile.setCareerStage(summary.getCareerStage());
        if (summary.getYearsOfExperience() != null) profile.setYearsOfExperience(summary.getYearsOfExperience());
    }

    private void applyCareerPreferences(CareerProfile profile, CareerPreferencesDto prefs) {
        try {
            String json = objectMapper.writeValueAsString(prefs);
            profile.setCareerPreferences(json);
            if (prefs.getPreferredLocations() != null && !prefs.getPreferredLocations().isEmpty()) {
                profile.setPreferredLocations(objectMapper.writeValueAsString(prefs.getPreferredLocations()));
            }
        } catch (Exception e) {
            log.error("Failed to serialize career preferences JSON", e);
        }
    }

    private void saveEducations(CareerProfile profile, List<EducationDto> dtos) {
        List<ProfileEducation> entities = new ArrayList<>();
        for (EducationDto dto : dtos) {
            if (!isNotBlank(dto.getInstitution()) || !isNotBlank(dto.getDegree())) continue;
            ProfileEducation entity = new ProfileEducation();
            entity.setProfile(profile);
            entity.setInstitution(dto.getInstitution().trim());
            entity.setDegree(dto.getDegree().trim());
            entity.setFieldOfStudy(dto.getFieldOfStudy());
            entity.setStartDate(parseDate(dto.getStartDate()));
            entity.setEndDate(parseDate(dto.getEndDate()));
            entity.setCurrent(dto.getCurrent());
            entity.setGradeOrGpa(dto.getGradeOrGpa());
            entity.setDescription(dto.getDescription());
            entities.add(entity);
        }
        educationRepository.saveAll(entities);
    }

    private void saveSkills(CareerProfile profile, List<SkillDto> dtos) {
        Set<String> seen = new HashSet<>();
        List<ProfileSkill> entities = new ArrayList<>();
        for (SkillDto dto : dtos) {
            if (!isNotBlank(dto.getName())) continue;
            String normalized = dto.getName().trim().toLowerCase();
            if (seen.contains(normalized)) {
                // Deduplicate case-insensitively
                continue;
            }
            seen.add(normalized);

            ProfileSkill entity = new ProfileSkill();
            entity.setProfile(profile);
            entity.setName(dto.getName().trim());
            entity.setCategory(parseSkillCategory(dto.getCategory()));
            entity.setProficiencyLevel(parseProficiencyLevel(dto.getProficiencyLevel()));
            entity.setYearsOfExperience(dto.getYearsOfExperience());
            entity.setVerified(dto.getVerified());
            entities.add(entity);
        }
        skillRepository.saveAll(entities);
    }

    private void saveExperiences(CareerProfile profile, List<ExperienceDto> dtos) {
        List<ProfileExperience> entities = new ArrayList<>();
        for (ExperienceDto dto : dtos) {
            if (!isNotBlank(dto.getCompanyName()) || !isNotBlank(dto.getJobTitle())) continue;
            ProfileExperience entity = new ProfileExperience();
            entity.setProfile(profile);
            entity.setCompanyName(dto.getCompanyName().trim());
            entity.setJobTitle(dto.getJobTitle().trim());
            entity.setLocation(dto.getLocation());
            entity.setEmploymentType(dto.getEmploymentType() != null ? dto.getEmploymentType() : "FULL_TIME");

            LocalDate start = parseDate(dto.getStartDate());
            if (start == null) {
                start = LocalDate.now();
            }
            entity.setStartDate(start);
            entity.setEndDate(parseDate(dto.getEndDate()));
            entity.setCurrent(dto.getCurrent());
            entity.setDescription(dto.getDescription());

            try {
                entity.setAchievements(objectMapper.writeValueAsString(dto.getAchievements()));
            } catch (Exception e) {
                entity.setAchievements("[]");
            }

            entities.add(entity);
        }
        experienceRepository.saveAll(entities);
    }

    private void saveProjects(CareerProfile profile, List<ProjectDto> dtos) {
        List<ProfileProject> entities = new ArrayList<>();
        for (ProjectDto dto : dtos) {
            if (!isNotBlank(dto.getTitle())) continue;
            ProfileProject entity = new ProfileProject();
            entity.setProfile(profile);
            entity.setTitle(dto.getTitle().trim());
            entity.setRole(dto.getRole());
            entity.setStartDate(parseDate(dto.getStartDate()));
            entity.setEndDate(parseDate(dto.getEndDate()));
            entity.setCurrent(dto.getCurrent());
            entity.setDescription(dto.getDescription());
            entity.setProjectUrl(dto.getProjectUrl());
            entity.setGithubUrl(dto.getGithubUrl());

            try {
                entity.setTechnologies(objectMapper.writeValueAsString(dto.getTechnologies()));
            } catch (Exception e) {
                entity.setTechnologies("[]");
            }

            entities.add(entity);
        }
        projectRepository.saveAll(entities);
    }

    private void saveCertifications(CareerProfile profile, List<CertificationDto> dtos) {
        List<ProfileCertification> entities = new ArrayList<>();
        for (CertificationDto dto : dtos) {
            if (!isNotBlank(dto.getName()) || !isNotBlank(dto.getIssuingOrganization())) continue;
            ProfileCertification entity = new ProfileCertification();
            entity.setProfile(profile);
            entity.setName(dto.getName().trim());
            entity.setIssuingOrganization(dto.getIssuingOrganization().trim());
            entity.setIssueDate(parseDate(dto.getIssueDate()));
            entity.setExpirationDate(parseDate(dto.getExpirationDate()));
            entity.setCredentialId(dto.getCredentialId());
            entity.setCredentialUrl(dto.getCredentialUrl());
            entities.add(entity);
        }
        certificationRepository.saveAll(entities);
    }

    private void saveAchievements(CareerProfile profile, List<AchievementDto> dtos) {
        List<ProfileAchievement> entities = new ArrayList<>();
        for (AchievementDto dto : dtos) {
            if (!isNotBlank(dto.getTitle())) continue;
            ProfileAchievement entity = new ProfileAchievement();
            entity.setProfile(profile);
            entity.setTitle(dto.getTitle().trim());
            entity.setDescription(dto.getDescription());
            entity.setAchievementDate(parseDate(dto.getAchievementDate()));
            entity.setIssuer(dto.getIssuer());
            entities.add(entity);
        }
        achievementRepository.saveAll(entities);
    }

    private void validateEducations(List<EducationDto> list) {
        for (EducationDto item : list) {
            LocalDate start = parseDate(item.getStartDate());
            LocalDate end = parseDate(item.getEndDate());
            validateDateRange(start, end, "education (" + item.getInstitution() + ")");
        }
    }

    private void validateExperiences(List<ExperienceDto> list) {
        for (ExperienceDto item : list) {
            LocalDate start = parseDate(item.getStartDate());
            LocalDate end = parseDate(item.getEndDate());
            validateDateRange(start, end, "work experience (" + item.getCompanyName() + ")");
        }
    }

    private void validateProjects(List<ProjectDto> list) {
        for (ProjectDto item : list) {
            LocalDate start = parseDate(item.getStartDate());
            LocalDate end = parseDate(item.getEndDate());
            validateDateRange(start, end, "project (" + item.getTitle() + ")");
        }
    }

    private void validateCertifications(List<CertificationDto> list) {
        for (CertificationDto item : list) {
            LocalDate issue = parseDate(item.getIssueDate());
            LocalDate exp = parseDate(item.getExpirationDate());
            validateDateRange(issue, exp, "certification (" + item.getName() + ")");
        }
    }

    private void validateDateRange(LocalDate start, LocalDate end, String context) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new InvalidRequestException("End date cannot be before start date for " + context + " (" + end + " is before " + start + ")");
        }
    }

    private CareerProfileResponse buildProfileResponse(User user, CareerProfile profile) {
        CareerProfileResponse response = new CareerProfileResponse();
        response.setId(profile.getId());
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setCompletionPercentage(profile.getCompletionPercentage());
        response.setVerified(profile.isVerified());
        response.setCreatedAt(profile.getCreatedAt());
        response.setUpdatedAt(profile.getUpdatedAt());

        // Personal Info
        PersonalInfoDto personal = new PersonalInfoDto();
        String fullName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();
        personal.setFullName(fullName);
        personal.setEmail(user.getEmail());
        personal.setHeadline(profile.getHeadline());
        personal.setSummary(profile.getSummary());
        personal.setLocation(profile.getCurrentLocation());
        personal.setCountry(profile.getCountry());
        personal.setPhone(profile.getPhoneNumber());
        personal.setLinkedinUrl(profile.getLinkedinUrl());
        personal.setGithubUrl(profile.getGithubUrl());
        personal.setPortfolioUrl(profile.getPortfolioUrl());
        personal.setWebsiteUrl(profile.getWebsiteUrl());
        response.setPersonalInfo(personal);

        // Professional Summary
        ProfessionalSummaryDto summary = new ProfessionalSummaryDto(
                profile.getHeadline(),
                profile.getSummary(),
                profile.getCareerStage(),
                profile.getYearsOfExperience()
        );
        response.setProfessionalSummary(summary);

        // Education
        List<ProfileEducation> educations = educationRepository.findByProfileIdOrderByStartDateDesc(profile.getId());
        response.setEducation(educations.stream().map(this::toEducationDto).toList());

        // Skills
        List<ProfileSkill> skills = skillRepository.findByProfileIdOrderByNameAsc(profile.getId());
        response.setSkills(skills.stream().map(this::toSkillDto).toList());

        // Experience
        List<ProfileExperience> experiences = experienceRepository.findByProfileIdOrderByStartDateDesc(profile.getId());
        response.setExperience(experiences.stream().map(this::toExperienceDto).toList());

        // Projects
        List<ProfileProject> projects = projectRepository.findByProfileIdOrderByStartDateDesc(profile.getId());
        response.setProjects(projects.stream().map(this::toProjectDto).toList());

        // Certifications
        List<ProfileCertification> certifications = certificationRepository.findByProfileIdOrderByIssueDateDesc(profile.getId());
        response.setCertifications(certifications.stream().map(this::toCertificationDto).toList());

        // Achievements
        List<ProfileAchievement> achievements = achievementRepository.findByProfileIdOrderByAchievementDateDesc(profile.getId());
        response.setAchievements(achievements.stream().map(this::toAchievementDto).toList());

        // Preferences
        response.setCareerPreferences(parseCareerPreferences(profile.getCareerPreferences()));

        return response;
    }

    private EducationDto toEducationDto(ProfileEducation entity) {
        EducationDto dto = new EducationDto();
        dto.setId(entity.getId());
        dto.setInstitution(entity.getInstitution());
        dto.setDegree(entity.getDegree());
        dto.setFieldOfStudy(entity.getFieldOfStudy());
        dto.setStartDate(entity.getStartDate() != null ? entity.getStartDate().toString() : null);
        dto.setEndDate(entity.getEndDate() != null ? entity.getEndDate().toString() : null);
        dto.setCurrent(entity.isCurrent());
        dto.setGradeOrGpa(entity.getGradeOrGpa());
        dto.setDescription(entity.getDescription());
        return dto;
    }

    private SkillDto toSkillDto(ProfileSkill entity) {
        SkillDto dto = new SkillDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCategory(entity.getCategory() != null ? entity.getCategory().name() : "TECHNICAL");
        dto.setProficiencyLevel(entity.getProficiencyLevel() != null ? entity.getProficiencyLevel().name() : "INTERMEDIATE");
        dto.setYearsOfExperience(entity.getYearsOfExperience());
        dto.setVerified(entity.isVerified());
        return dto;
    }

    private ExperienceDto toExperienceDto(ProfileExperience entity) {
        ExperienceDto dto = new ExperienceDto();
        dto.setId(entity.getId());
        dto.setCompanyName(entity.getCompanyName());
        dto.setJobTitle(entity.getJobTitle());
        dto.setLocation(entity.getLocation());
        dto.setEmploymentType(entity.getEmploymentType());
        dto.setStartDate(entity.getStartDate() != null ? entity.getStartDate().toString() : null);
        dto.setEndDate(entity.getEndDate() != null ? entity.getEndDate().toString() : null);
        dto.setCurrent(entity.isCurrent());
        dto.setDescription(entity.getDescription());

        if (entity.getAchievements() != null) {
            try {
                List<String> list = objectMapper.readValue(entity.getAchievements(), new TypeReference<List<String>>() {});
                dto.setAchievements(list);
            } catch (Exception e) {
                dto.setAchievements(List.of());
            }
        }
        return dto;
    }

    private ProjectDto toProjectDto(ProfileProject entity) {
        ProjectDto dto = new ProjectDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setRole(entity.getRole());
        dto.setStartDate(entity.getStartDate() != null ? entity.getStartDate().toString() : null);
        dto.setEndDate(entity.getEndDate() != null ? entity.getEndDate().toString() : null);
        dto.setCurrent(entity.isCurrent());
        dto.setDescription(entity.getDescription());
        dto.setProjectUrl(entity.getProjectUrl());
        dto.setGithubUrl(entity.getGithubUrl());

        if (entity.getTechnologies() != null) {
            try {
                List<String> list = objectMapper.readValue(entity.getTechnologies(), new TypeReference<List<String>>() {});
                dto.setTechnologies(list);
            } catch (Exception e) {
                dto.setTechnologies(List.of());
            }
        }
        return dto;
    }

    private CertificationDto toCertificationDto(ProfileCertification entity) {
        CertificationDto dto = new CertificationDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setIssuingOrganization(entity.getIssuingOrganization());
        dto.setIssueDate(entity.getIssueDate() != null ? entity.getIssueDate().toString() : null);
        dto.setExpirationDate(entity.getExpirationDate() != null ? entity.getExpirationDate().toString() : null);
        dto.setCredentialId(entity.getCredentialId());
        dto.setCredentialUrl(entity.getCredentialUrl());
        return dto;
    }

    private AchievementDto toAchievementDto(ProfileAchievement entity) {
        AchievementDto dto = new AchievementDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setAchievementDate(entity.getAchievementDate() != null ? entity.getAchievementDate().toString() : null);
        dto.setIssuer(entity.getIssuer());
        return dto;
    }

    private CareerPreferencesDto parseCareerPreferences(String json) {
        if (!isNotBlank(json) || "{}".equals(json.trim())) {
            return new CareerPreferencesDto();
        }
        try {
            return objectMapper.readValue(json, CareerPreferencesDto.class);
        } catch (Exception e) {
            log.warn("Failed to parse career preferences JSON: {}", json);
            return new CareerPreferencesDto();
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (!isNotBlank(dateStr)) return null;
        String trimmed = dateStr.trim();
        try {
            if (trimmed.length() == 10) {
                return LocalDate.parse(trimmed);
            } else if (trimmed.length() == 7) {
                YearMonth ym = YearMonth.parse(trimmed);
                return ym.atDay(1);
            } else if (trimmed.length() == 4) {
                return LocalDate.of(Integer.parseInt(trimmed), 1, 1);
            } else {
                return LocalDate.parse(trimmed);
            }
        } catch (Exception e) {
            throw new InvalidRequestException("Invalid date format: '" + dateStr + "'. Expected YYYY-MM-DD or YYYY-MM.");
        }
    }

    private SkillCategory parseSkillCategory(String cat) {
        if (!isNotBlank(cat)) return SkillCategory.TECHNICAL;
        String upper = cat.trim().toUpperCase().replace(" ", "_");
        for (SkillCategory sc : SkillCategory.values()) {
            if (sc.name().equals(upper)) return sc;
        }
        if (upper.contains("TOOL")) return SkillCategory.TOOL;
        if (upper.contains("SOFT")) return SkillCategory.SOFT;
        if (upper.contains("LANG")) return SkillCategory.LANGUAGE;
        if (upper.contains("DOMAIN") || upper.contains("SCIENCE")) return SkillCategory.DOMAIN;
        return SkillCategory.TECHNICAL;
    }

    private ProficiencyLevel parseProficiencyLevel(String level) {
        if (!isNotBlank(level)) return ProficiencyLevel.INTERMEDIATE;
        String upper = level.trim().toUpperCase();
        for (ProficiencyLevel pl : ProficiencyLevel.values()) {
            if (pl.name().equals(upper)) return pl;
        }
        return ProficiencyLevel.INTERMEDIATE;
    }

    private boolean isNotBlank(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
