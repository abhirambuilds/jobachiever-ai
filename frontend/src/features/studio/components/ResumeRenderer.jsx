import { AtsProfessionalTemplate } from './templates/AtsProfessionalTemplate';
import { ModernProfessionalTemplate } from './templates/ModernProfessionalTemplate';
import { TechnicalResumeTemplate } from './templates/TechnicalResumeTemplate';
import { AcademicCvTemplate } from './templates/AcademicCvTemplate';
import { InternationalResumeTemplate } from './templates/InternationalResumeTemplate';
import { AVAILABLE_FONTS } from '@/services/resumeStudioService';

export function ResumeRenderer({ resume, designSettings }) {
  if (!resume) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
        No resume loaded for preview.
      </div>
    );
  }

  const rawTemplateId = resume.templateId || designSettings?.templateId || 'ats_professional';
  const activeTemplateId = rawTemplateId.replace(/-/g, '_');

  // Find font family
  const selectedFont = AVAILABLE_FONTS.find((f) => f.id === designSettings?.fontFamily) || AVAILABLE_FONTS[0];

  // Dynamic margin styles
  const marginPaddingMap = {
    compact: 'p-6 sm:p-8', // ~16mm
    normal: 'p-8 sm:p-12', // ~24mm
    relaxed: 'p-10 sm:p-14', // ~30mm
  };
  const paddingClass = marginPaddingMap[designSettings?.margins] || marginPaddingMap.normal;

  // Render template switcher
  const renderTemplate = () => {
    switch (activeTemplateId) {
      case 'modern_professional':
        return <ModernProfessionalTemplate resume={resume} designSettings={designSettings} />;
      case 'technical_resume':
        return <TechnicalResumeTemplate resume={resume} designSettings={designSettings} />;
      case 'academic_cv':
        return <AcademicCvTemplate resume={resume} designSettings={designSettings} />;
      case 'international_resume':
        return <InternationalResumeTemplate resume={resume} designSettings={designSettings} />;
      case 'ats_professional':
      default:
        return <AtsProfessionalTemplate resume={resume} designSettings={designSettings} />;
    }
  };

  return (
    <div
      id="resume-preview-sheet"
      className={`resume-sheet bg-white text-slate-900 shadow-2xl rounded-sm transition-all duration-200 mx-auto w-[210mm] min-h-[297mm] ${paddingClass}`}
      style={{
        fontFamily: selectedFont.fontFamily,
        lineHeight: designSettings?.lineHeight || 1.45,
      }}
    >
      {renderTemplate()}
    </div>
  );
}
