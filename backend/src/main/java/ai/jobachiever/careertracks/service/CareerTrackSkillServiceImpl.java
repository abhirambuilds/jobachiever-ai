package ai.jobachiever.careertracks.service;

import ai.jobachiever.careertracks.dto.SkillMatchResult;
import ai.jobachiever.profiles.dto.ExperienceDto;
import ai.jobachiever.profiles.dto.ProjectDto;
import ai.jobachiever.profiles.entity.ProfileExperience;
import ai.jobachiever.profiles.entity.ProfileProject;
import ai.jobachiever.profiles.entity.ProfileSkill;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CareerTrackSkillServiceImpl implements CareerTrackSkillService {

    private static final Map<String, String> CANONICAL_ALIASES = Map.ofEntries(
            Map.entry("react.js", "react"),
            Map.entry("reactjs", "react"),
            Map.entry("node.js", "node"),
            Map.entry("nodejs", "node"),
            Map.entry("vue.js", "vue"),
            Map.entry("vuejs", "vue"),
            Map.entry("springboot", "spring boot"),
            Map.entry("spring-boot", "spring boot"),
            Map.entry("postgres", "postgresql"),
            Map.entry("k8s", "kubernetes"),
            Map.entry("golang", "go"),
            Map.entry("ts", "typescript"),
            Map.entry("js", "javascript")
    );

    private final ObjectMapper objectMapper;

    public CareerTrackSkillServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public SkillMatchResult matchSkills(List<String> requiredSkills,
                                       List<String> preferredSkills,
                                       List<ProfileSkill> masterProfileSkills) {

        List<String> uniqueReq = deduplicateSkills(requiredSkills);
        List<String> uniquePref = deduplicateSkills(preferredSkills);

        List<ProfileSkill> profileSkills = masterProfileSkills != null ? masterProfileSkills : List.of();

        // Build normalized lookup maps from master profile
        Map<String, String> masterSkillMap = new HashMap<>();
        for (ProfileSkill ps : profileSkills) {
            if (ps.getName() != null && !ps.getName().trim().isEmpty()) {
                String norm = normalizeSkillName(ps.getName());
                masterSkillMap.putIfAbsent(norm, ps.getName().trim());
            }
        }

        List<String> matchedReq = new ArrayList<>();
        List<String> missingReq = new ArrayList<>();
        Set<String> matchedNormSet = new HashSet<>();

        for (String req : uniqueReq) {
            String norm = normalizeSkillName(req);
            if (masterSkillMap.containsKey(norm)) {
                matchedReq.add(masterSkillMap.get(norm));
                matchedNormSet.add(norm);
            } else {
                missingReq.add(req);
            }
        }

        List<String> matchedPref = new ArrayList<>();
        List<String> missingPref = new ArrayList<>();

        for (String pref : uniquePref) {
            String norm = normalizeSkillName(pref);
            if (masterSkillMap.containsKey(norm)) {
                matchedPref.add(masterSkillMap.get(norm));
                matchedNormSet.add(norm);
            } else {
                missingPref.add(pref);
            }
        }

        // Additional profile skills not matched in track
        List<String> additionalProfileSkills = new ArrayList<>();
        for (ProfileSkill ps : profileSkills) {
            if (ps.getName() != null && !ps.getName().trim().isEmpty()) {
                String norm = normalizeSkillName(ps.getName());
                if (!matchedNormSet.contains(norm) && !additionalProfileSkills.contains(ps.getName().trim())) {
                    additionalProfileSkills.add(ps.getName().trim());
                }
            }
        }

        // Percentage calculations
        int reqPercent = uniqueReq.isEmpty() ? 100
                : Math.round((float) matchedReq.size() * 100 / uniqueReq.size());

        int totalTrackSkills = uniqueReq.size() + uniquePref.size();
        int totalMatched = matchedReq.size() + matchedPref.size();
        int overallPercent = totalTrackSkills == 0 ? 100
                : Math.round((float) totalMatched * 100 / totalTrackSkills);

        return new SkillMatchResult(
                matchedReq,
                matchedPref,
                missingReq,
                missingPref,
                additionalProfileSkills,
                reqPercent,
                overallPercent
        );
    }

    @Override
    public List<ProjectDto> findRelevantProjects(List<String> trackSkills,
                                                 String targetRole,
                                                 List<ProfileProject> masterProjects) {
        if (masterProjects == null || masterProjects.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> searchTerms = new HashSet<>();
        if (trackSkills != null) {
            trackSkills.forEach(s -> searchTerms.add(normalizeSkillName(s)));
        }
        if (targetRole != null && !targetRole.trim().isEmpty()) {
            Arrays.stream(targetRole.toLowerCase().split("\\s+"))
                    .filter(w -> w.length() > 2)
                    .forEach(searchTerms::add);
        }

        List<ProjectDto> relevant = new ArrayList<>();
        for (ProfileProject entity : masterProjects) {
            boolean matches = false;

            // Check technologies
            List<String> techList = parseJsonList(entity.getTechnologies());
            for (String tech : techList) {
                if (searchTerms.contains(normalizeSkillName(tech))) {
                    matches = true;
                    break;
                }
            }

            // Check title and description
            if (!matches) {
                String text = (entity.getTitle() + " " + (entity.getDescription() != null ? entity.getDescription() : "")).toLowerCase();
                for (String term : searchTerms) {
                    if (text.contains(term)) {
                        matches = true;
                        break;
                    }
                }
            }

            if (matches) {
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
                dto.setTechnologies(techList);
                relevant.add(dto);
            }
        }
        return relevant;
    }

    @Override
    public List<ExperienceDto> findRelevantExperiences(List<String> trackSkills,
                                                       String targetRole,
                                                       List<ProfileExperience> masterExperiences) {
        if (masterExperiences == null || masterExperiences.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> searchTerms = new HashSet<>();
        if (trackSkills != null) {
            trackSkills.forEach(s -> searchTerms.add(normalizeSkillName(s)));
        }
        if (targetRole != null && !targetRole.trim().isEmpty()) {
            Arrays.stream(targetRole.toLowerCase().split("\\s+"))
                    .filter(w -> w.length() > 2)
                    .forEach(searchTerms::add);
        }

        List<ExperienceDto> relevant = new ArrayList<>();
        for (ProfileExperience entity : masterExperiences) {
            boolean matches = false;

            String text = (entity.getJobTitle() + " " + entity.getCompanyName() + " "
                    + (entity.getDescription() != null ? entity.getDescription() : "") + " "
                    + (entity.getAchievements() != null ? entity.getAchievements() : "")).toLowerCase();

            for (String term : searchTerms) {
                if (text.contains(term)) {
                    matches = true;
                    break;
                }
            }

            if (matches) {
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
                dto.setAchievements(parseJsonList(entity.getAchievements()));
                relevant.add(dto);
            }
        }
        return relevant;
    }

    @Override
    public String normalizeSkillName(String skillName) {
        if (skillName == null) return "";
        String trimmed = skillName.trim().toLowerCase();
        return CANONICAL_ALIASES.getOrDefault(trimmed, trimmed);
    }

    @Override
    public List<String> deduplicateSkills(List<String> skills) {
        if (skills == null) return Collections.emptyList();
        Set<String> seenNormalized = new HashSet<>();
        List<String> result = new ArrayList<>();
        for (String skill : skills) {
            if (skill == null || skill.trim().isEmpty()) continue;
            String trimmed = skill.trim();
            String norm = normalizeSkillName(trimmed);
            if (!seenNormalized.contains(norm)) {
                seenNormalized.add(norm);
                result.add(trimmed);
            }
        }
        return result;
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.trim().isEmpty() || "[]".equals(json.trim())) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
