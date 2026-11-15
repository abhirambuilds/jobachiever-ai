import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AtsProfessionalTemplate } from '../components/templates/AtsProfessionalTemplate';
import { ModernProfessionalTemplate } from '../components/templates/ModernProfessionalTemplate';
import { TechnicalResumeTemplate } from '../components/templates/TechnicalResumeTemplate';
import { AcademicCvTemplate } from '../components/templates/AcademicCvTemplate';
import { InternationalResumeTemplate } from '../components/templates/InternationalResumeTemplate';

const mockResume = {
  title: 'Master Engineering Resume',
  sections: [
    {
      id: 'sec-1',
      type: 'personal_info',
      title: 'Personal Info',
      visible: true,
      data: {
        fullName: 'Grace Hopper',
        headline: 'Pioneer Computer Scientist',
        email: 'grace@example.com',
        phone: '+1 555 0192',
        city: 'New York',
        country: 'USA',
        linkedin: 'https://linkedin.com/in/gracehopper',
        github: 'https://github.com/gracehopper',
      },
    },
    {
      id: 'sec-2',
      type: 'summary',
      title: 'Professional Summary',
      visible: true,
      data: {
        summaryText: 'Trailblazing computer scientist who pioneered machine-independent programming languages.',
      },
    },
    {
      id: 'sec-3',
      type: 'skills',
      title: 'Core Proficiencies',
      visible: true,
      data: {
        categories: [
          { category: 'Languages', skills: ['COBOL', 'Flow-Matic', 'Assembly'] },
        ],
      },
    },
    {
      id: 'sec-4',
      type: 'experience',
      title: 'Work Experience',
      visible: true,
      data: {
        items: [
          {
            id: 'exp-1',
            title: 'Director of Navy Programming',
            company: 'US Navy Fleet',
            startDate: '1943',
            endDate: '1986',
            location: 'Washington, DC',
            bullets: ['Led development of standardized compiler validation tests.'],
          },
        ],
      },
    },
    {
      id: 'sec-5',
      type: 'education',
      title: 'Education',
      visible: true,
      data: {
        items: [
          {
            id: 'edu-1',
            degree: 'Ph.D. in Mathematics',
            fieldOfStudy: 'Mathematics',
            institution: 'Yale University',
            graduationYear: '1934',
          },
        ],
      },
    },
    {
      id: 'sec-6',
      type: 'projects',
      title: 'Key Projects',
      visible: true,
      data: {
        items: [
          {
            id: 'proj-1',
            title: 'A-0 Compiler System',
            role: 'Lead Designer',
            technologies: ['Compiler Theory', 'Machine Code'],
            bullets: ['Created the first compiler designed for an electronic computer.'],
          },
        ],
      },
    },
    {
      id: 'sec-7',
      type: 'certifications',
      title: 'Certifications & Honors',
      visible: true,
      data: {
        items: [
          {
            id: 'cert-1',
            name: 'National Medal of Technology',
            issuer: 'The White House',
            issueDate: '1991',
          },
        ],
      },
    },
    {
      id: 'sec-8',
      type: 'publications',
      title: 'Publications',
      visible: true,
      data: {
        items: [
          {
            title: 'The Education of a Computer',
            venue: 'ACM Conference',
            year: '1952',
          },
        ],
      },
    },
  ],
};

const designSettings = {
  fontFamily: 'Inter',
  fontSize: 'medium',
  primaryColor: '#2563eb',
  accentColor: '#1e40af',
  lineSpacing: 'normal',
};

describe('Resume Template Rendering & Data Contract', () => {
  it('renders AtsProfessionalTemplate with all section items', () => {
    render(<AtsProfessionalTemplate resume={mockResume} designSettings={designSettings} />);

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText(/Director of Navy Programming/)).toBeInTheDocument();
    expect(screen.getByText(/US Navy Fleet/)).toBeInTheDocument();
    expect(screen.getByText(/Yale University/)).toBeInTheDocument();
    expect(screen.getByText(/A-0 Compiler System/)).toBeInTheDocument();
    expect(screen.getByText(/National Medal of Technology/)).toBeInTheDocument();
  });

  it('renders ModernProfessionalTemplate with all section items', () => {
    render(<ModernProfessionalTemplate resume={mockResume} designSettings={designSettings} />);

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText(/Director of Navy Programming/)).toBeInTheDocument();
    expect(screen.getByText(/Yale University/)).toBeInTheDocument();
    expect(screen.getByText(/A-0 Compiler System/)).toBeInTheDocument();
    expect(screen.getByText(/National Medal of Technology/)).toBeInTheDocument();
  });

  it('renders TechnicalResumeTemplate with all section items', () => {
    render(<TechnicalResumeTemplate resume={mockResume} designSettings={designSettings} />);

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText(/Director of Navy Programming/)).toBeInTheDocument();
    expect(screen.getByText(/Yale University/)).toBeInTheDocument();
    expect(screen.getByText(/A-0 Compiler System/)).toBeInTheDocument();
    expect(screen.getByText(/National Medal of Technology/)).toBeInTheDocument();
  });

  it('renders AcademicCvTemplate with all section items', () => {
    render(<AcademicCvTemplate resume={mockResume} designSettings={designSettings} />);

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText(/Director of Navy Programming/)).toBeInTheDocument();
    expect(screen.getByText(/Yale University/)).toBeInTheDocument();
    expect(screen.getByText(/The Education of a Computer/)).toBeInTheDocument();
    expect(screen.getByText(/National Medal of Technology/)).toBeInTheDocument();
  });

  it('renders InternationalResumeTemplate with all section items', () => {
    render(<InternationalResumeTemplate resume={mockResume} designSettings={designSettings} />);

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText(/Director of Navy Programming/)).toBeInTheDocument();
    expect(screen.getByText(/Yale University/)).toBeInTheDocument();
    expect(screen.getByText(/A-0 Compiler System/)).toBeInTheDocument();
    expect(screen.getByText(/National Medal of Technology/)).toBeInTheDocument();
  });

  it('supports backward-compatible fallback to entries property when items is omitted', () => {
    const legacyResume = {
      title: 'Legacy Resume',
      sections: [
        {
          id: 'sec-legacy-exp',
          type: 'experience',
          title: 'Experience',
          data: {
            entries: [
              {
                id: 'exp-legacy-1',
                jobTitle: 'Research Fellow',
                company: 'Harvard Computation Lab',
                startDate: '1944',
                endDate: '1949',
                bullets: ['Worked on the Mark I computer.'],
              },
            ],
          },
        },
      ],
    };

    render(<ModernProfessionalTemplate resume={legacyResume} designSettings={designSettings} />);
    expect(screen.getByText(/Research Fellow/)).toBeInTheDocument();
    expect(screen.getByText(/Harvard Computation Lab/)).toBeInTheDocument();
  });
});
