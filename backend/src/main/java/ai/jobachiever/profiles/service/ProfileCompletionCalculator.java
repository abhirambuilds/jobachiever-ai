package ai.jobachiever.profiles.service;

import ai.jobachiever.profiles.dto.*;
import ai.jobachiever.profiles.entity.CareerStage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProfileCompletionCalculator {

    public ProfileCompletionResponse calculate(PersonalInfoDto personalInfo,
                                               ProfessionalSummaryDto summary,
                                               List<EducationDto> education,
                                               List<SkillDto> skills,
                                               List<ExperienceDto> experience,
                                               List<ProjectDto> projects,
                                               List<CertificationDto> certifications,
                                               List<AchievementDto> achievements,
                                               CareerPreferencesDto preferences) {

        CareerStage stage = summary != null && summary.getCareerStage() != null
                ? summary.getCareerStage()
                : CareerStage.ENTRY_LEVEL;

        boolean isStudentOrEntry = stage == CareerStage.STUDENT || stage == CareerStage.ENTRY_LEVEL;
        boolean hasExperience = experience != null && !experience.isEmpty();

        // Adaptive weights for student / entry level without corporate experience
        boolean adaptive = isStudentOrEntry && !hasExperience;

        int educationWeight = adaptive ? 20 : 15;
        int projectWeight = adaptive ? 25 : 15;
        int experienceWeight = adaptive ? 0 : 15;
        int personalInfoWeight = 15;
        int summaryWeight = 10;
        int skillsWeight = 15;
        int certsAchievementsWeight = 5;
        int preferencesWeight = 10;

        List<SectionScoreDto> breakdown = new ArrayList<>();
        List<String> completedSections = new ArrayList<>();
        List<String> incompleteSections = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // 1. Personal Information (15%)
        int personalEarned = 0;
        boolean hasHeadline = personalInfo != null && isNotBlank(personalInfo.getHeadline());
        boolean hasLocation = personalInfo != null && (isNotBlank(personalInfo.getLocation()) || isNotBlank(personalInfo.getCountry()));
        boolean hasLink = personalInfo != null && (isNotBlank(personalInfo.getLinkedinUrl())
                || isNotBlank(personalInfo.getGithubUrl())
                || isNotBlank(personalInfo.getPortfolioUrl())
                || isNotBlank(personalInfo.getWebsiteUrl()));

        if (hasHeadline) personalEarned += 5;
        if (hasLocation) personalEarned += 5;
        if (hasLink) personalEarned += 5;

        boolean personalCompleted = personalEarned == personalInfoWeight;
        breakdown.add(new SectionScoreDto("Personal Information", personalInfoWeight, personalEarned, personalCompleted,
                personalCompleted ? "Complete contact info and social links" : "Missing headline, location, or portfolio links"));
        if (personalCompleted) {
            completedSections.add("Personal Information");
        } else {
            incompleteSections.add("Personal Information");
            recommendations.add("Add your professional headline, location, and at least one portfolio link (LinkedIn, GitHub, or website).");
        }

        // 2. Professional Summary (10%)
        int summaryEarned = 0;
        String summaryText = summary != null ? summary.getSummary() : (personalInfo != null ? personalInfo.getSummary() : null);
        boolean summaryCompleted = summaryText != null && summaryText.trim().length() >= 20;
        if (summaryCompleted) {
            summaryEarned = summaryWeight;
        } else if (summaryText != null && !summaryText.trim().isEmpty()) {
            summaryEarned = 5;
        }

        breakdown.add(new SectionScoreDto("Professional Summary", summaryWeight, summaryEarned, summaryCompleted,
                summaryCompleted ? "Comprehensive professional summary provided" : "Summary is missing or under 20 characters"));
        if (summaryCompleted) {
            completedSections.add("Professional Summary");
        } else {
            incompleteSections.add("Professional Summary");
            recommendations.add("Write a professional summary (at least 20 characters) highlighting your strengths and domain focus.");
        }

        // 3. Education (15% or 20% adaptive)
        int eduEarned = 0;
        boolean eduCompleted = education != null && education.stream().anyMatch(e -> isNotBlank(e.getInstitution()) && isNotBlank(e.getDegree()));
        if (eduCompleted) {
            eduEarned = educationWeight;
        }
        breakdown.add(new SectionScoreDto("Education", educationWeight, eduEarned, eduCompleted,
                eduCompleted ? "Educational background provided (" + education.size() + " records)" : "No valid education record found"));
        if (eduCompleted) {
            completedSections.add("Education");
        } else {
            incompleteSections.add("Education");
            recommendations.add("Add your educational background including institution name and degree.");
        }

        // 4. Skills (15%)
        int skillsEarned = 0;
        int skillCount = skills != null ? (int) skills.stream().filter(s -> isNotBlank(s.getName())).count() : 0;
        if (skillCount >= 3) {
            skillsEarned = skillsWeight;
        } else if (skillCount == 2) {
            skillsEarned = 10;
        } else if (skillCount == 1) {
            skillsEarned = 5;
        }
        boolean skillsCompleted = skillCount >= 3;
        breakdown.add(new SectionScoreDto("Skills", skillsWeight, skillsEarned, skillsCompleted,
                skillsCompleted ? skillCount + " skills registered" : skillCount + " of 3 minimum skills registered"));
        if (skillsCompleted) {
            completedSections.add("Skills");
        } else {
            incompleteSections.add("Skills");
            recommendations.add("Add at least 3 skills with proficiency levels to improve AI matching accuracy.");
        }

        // 5. Work Experience (15% or 0% waived if adaptive)
        int expEarned = 0;
        boolean expCompleted = false;
        if (adaptive) {
            expCompleted = true;
            expEarned = 0;
            breakdown.add(new SectionScoreDto("Work Experience", experienceWeight, expEarned, true,
                    "Waived for Student/Entry-Level profile (redistributed to Projects & Education)"));
            completedSections.add("Work Experience");
        } else {
            expCompleted = experience != null && experience.stream().anyMatch(e -> isNotBlank(e.getCompanyName()) || isNotBlank(e.getCompany()));
            if (expCompleted) {
                expEarned = experienceWeight;
            }
            breakdown.add(new SectionScoreDto("Work Experience", experienceWeight, expEarned, expCompleted,
                    expCompleted ? "Work history provided (" + experience.size() + " records)" : "No work experience records added"));
            if (expCompleted) {
                completedSections.add("Work Experience");
            } else {
                incompleteSections.add("Work Experience");
                recommendations.add("Add your work history to demonstrate domain experience.");
            }
        }

        // 6. Projects (15% or 25% adaptive)
        int projEarned = 0;
        boolean projCompleted = projects != null && projects.stream().anyMatch(p -> isNotBlank(p.getTitle()) || isNotBlank(p.getName()));
        if (projCompleted) {
            projEarned = projectWeight;
        }
        breakdown.add(new SectionScoreDto("Projects", projectWeight, projEarned, projCompleted,
                projCompleted ? "Projects provided (" + projects.size() + " records)" : "No project records added"));
        if (projCompleted) {
            completedSections.add("Projects");
        } else {
            incompleteSections.add("Projects");
            recommendations.add("Add at least 1 key project showcasing your practical abilities and code repositories.");
        }

        // 7. Certifications & Achievements (5%)
        int certsEarned = 0;
        boolean hasCerts = certifications != null && certifications.stream().anyMatch(c -> isNotBlank(c.getName()));
        boolean hasAchievements = achievements != null && achievements.stream().anyMatch(a -> isNotBlank(a.getTitle()));
        boolean certsCompleted = hasCerts || hasAchievements;
        if (certsCompleted) {
            certsEarned = certsAchievementsWeight;
        }
        breakdown.add(new SectionScoreDto("Certifications & Achievements", certsAchievementsWeight, certsEarned, certsCompleted,
                certsCompleted ? "Verified certifications or achievements present" : "No certifications or achievements added"));
        if (certsCompleted) {
            completedSections.add("Certifications & Achievements");
        } else {
            incompleteSections.add("Certifications & Achievements");
            recommendations.add("Add certifications or notable career achievements to stand out to employers.");
        }

        // 8. Career Preferences (10%)
        int prefEarned = 0;
        boolean hasRoles = preferences != null && preferences.getTargetRoles() != null && !preferences.getTargetRoles().isEmpty();
        boolean hasTypes = preferences != null && preferences.getEmploymentTypes() != null && !preferences.getEmploymentTypes().isEmpty();
        boolean hasGoals = preferences != null && isNotBlank(preferences.getCareerGoals());
        boolean prefCompleted = hasRoles || hasTypes || hasGoals;
        if (prefCompleted) {
            prefEarned = preferencesWeight;
        }
        breakdown.add(new SectionScoreDto("Career Preferences", preferencesWeight, prefEarned, prefCompleted,
                prefCompleted ? "Target roles and employment preferences specified" : "No career preferences specified"));
        if (prefCompleted) {
            completedSections.add("Career Preferences");
        } else {
            incompleteSections.add("Career Preferences");
            recommendations.add("Specify your target roles, preferred work arrangements, and near-term career goals.");
        }

        int totalEarned = personalEarned + summaryEarned + eduEarned + skillsEarned + expEarned + projEarned + certsEarned + prefEarned;
        int boundedPercentage = Math.min(100, Math.max(0, totalEarned));

        return new ProfileCompletionResponse(
                boundedPercentage,
                completedSections,
                incompleteSections,
                breakdown,
                recommendations
        );
    }

    private boolean isNotBlank(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
