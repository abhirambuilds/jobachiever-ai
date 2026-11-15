package ai.jobachiever.careertracks.service;

import ai.jobachiever.careertracks.dto.SkillMatchResult;
import ai.jobachiever.profiles.dto.ExperienceDto;
import ai.jobachiever.profiles.dto.ProjectDto;
import ai.jobachiever.profiles.entity.ProfileExperience;
import ai.jobachiever.profiles.entity.ProfileProject;
import ai.jobachiever.profiles.entity.ProfileSkill;

import java.util.List;

public interface CareerTrackSkillService {

    SkillMatchResult matchSkills(List<String> requiredSkills,
                                List<String> preferredSkills,
                                List<ProfileSkill> masterProfileSkills);

    List<ProjectDto> findRelevantProjects(List<String> trackSkills,
                                          String targetRole,
                                          List<ProfileProject> masterProjects);

    List<ExperienceDto> findRelevantExperiences(List<String> trackSkills,
                                                String targetRole,
                                                List<ProfileExperience> masterExperiences);

    String normalizeSkillName(String skillName);

    List<String> deduplicateSkills(List<String> skills);
}
