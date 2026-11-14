import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(val),
    { message: 'Please enter a valid URL (e.g. https://...)' }
  );

export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Backend Development',
  'Frontend Development',
  'Databases',
  'Cloud and DevOps',
  'AI and Machine Learning',
  'Tools',
  'Core Computer Science',
];

export const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
  'Freelance',
];

export const WORK_ARRANGEMENTS = ['Remote', 'Hybrid', 'On-site', 'Open to Any'];

export const CAREER_ROLE_OPTIONS = [
  'Backend Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'AI/ML Engineer',
  'Data Analyst',
  'DevOps Engineer',
  'Software Engineer',
  'Solutions Architect',
  'Research Engineer',
];

// Step 1: Personal Information Schema
export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  headline: z.string().trim().min(3, 'Professional headline must be at least 3 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().min(6, 'Please enter a valid phone number'),
  country: z.string().trim().min(2, 'Country is required'),
  city: z.string().trim().min(2, 'City is required'),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  websiteUrl: optionalUrl,
  summary: z.string().trim().min(20, 'Summary must be at least 20 characters for effective AI matching'),
});

// Step 2: Education Item Schema
export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().trim().min(2, 'Institution name is required'),
  degree: z.string().trim().min(2, 'Degree is required (e.g. B.S., M.S.)'),
  fieldOfStudy: z.string().trim().min(2, 'Field of study is required (e.g. Computer Science)'),
  startDate: z.string().min(4, 'Start date is required'),
  graduationDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  gpa: z.string().optional(),
  coursework: z.string().optional(),
});

// Step 3: Skill Item Schema
export const skillItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  yearsOfExperience: z.string().optional(),
  evidence: z.string().optional(),
});

// Step 4: Experience Item Schema
export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().trim().min(2, 'Company or organization name is required'),
  jobTitle: z.string().trim().min(2, 'Job title is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  location: z.string().trim().min(2, 'Location is required'),
  startDate: z.string().min(4, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  responsibilities: z.string().trim().min(15, 'Please provide key responsibilities'),
  achievements: z.string().optional(),
  technologies: z.string().optional(),
});

// Step 5: Project Item Schema
export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, 'Project name is required'),
  description: z.string().trim().min(15, 'Project description must be at least 15 characters'),
  problemSolved: z.string().optional(),
  technologies: z.string().trim().min(2, 'Technologies used are required'),
  githubUrl: optionalUrl,
  liveDemoUrl: optionalUrl,
  role: z.string().optional(),
  keyAchievements: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Step 6: Certification & Achievement Schemas
export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, 'Certification name is required'),
  issuingOrg: z.string().trim().min(2, 'Issuing organization is required'),
  issueDate: z.string().min(4, 'Issue date is required'),
  expirationDate: z.string().optional(),
  credentialUrl: optionalUrl,
});

export const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(2, 'Achievement title is required'),
  description: z.string().trim().min(10, 'Description is required'),
  issuingOrg: z.string().optional(),
  date: z.string().optional(),
});

// Step 7: Career Preferences Schema
export const careerPreferencesSchema = z.object({
  targetRoles: z.array(z.string()).min(1, 'Select at least one career interest'),
  employmentTypes: z.array(z.string()).min(1, 'Select at least one employment type preference'),
  workArrangement: z.string().min(1, 'Select a work arrangement preference'),
  preferredLocations: z.string().trim().min(2, 'Preferred locations or cities'),
  preferredCountries: z.string().optional(),
  expectedSalary: z.string().optional(),
  careerGoals: z.string().trim().min(15, 'Please state your near-term career objectives'),
});

// Career Track Schema
export const careerTrackSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, 'Track name is required (e.g. Backend Engineer)'),
  targetRole: z.string().trim().min(2, 'Target role is required'),
  description: z.string().trim().min(10, 'Track description is required'),
  relevantSkills: z.array(z.string()).min(1, 'Select at least one skill from your master profile for this track'),
  targetIndustries: z.string().optional(),
  careerObjectives: z.string().optional(),
  preferredOpportunities: z.string().optional(),
  isPrimary: z.boolean().default(false),
});
