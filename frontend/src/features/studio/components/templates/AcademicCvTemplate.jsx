import { BookOpen, ExternalLink, GraduationCap, Mail, MapPin, Phone } from 'lucide-react';

export function AcademicCvTemplate({ resume, designSettings }) {
  const sections = (resume.sections || []).filter((s) => s.visible !== false);

  const personal = sections.find((s) => s.type === 'personal_info')?.data || {};
  const summary = sections.find((s) => s.type === 'summary')?.data;
  const education = sections.find((s) => s.type === 'education')?.data;
  const experience = sections.find((s) => s.type === 'experience')?.data;
  const publications = sections.find((s) => s.type === 'publications')?.data;
  const research = sections.find((s) => s.type === 'research')?.data;
  const awards =
    sections.find((s) => s.type === 'awards')?.data ||
    sections.find((s) => s.type === 'achievements')?.data ||
    sections.find((s) => s.type === 'certifications')?.data;
  const skills = sections.find((s) => s.type === 'skills')?.data;
  const languages = sections.find((s) => s.type === 'languages')?.data;

  const primaryColor = designSettings?.primaryColor || '#1e293b';

  const eduItems = education?.items || education?.entries || [];
  const expItems = experience?.items || experience?.entries || [];
  const researchItems = research?.items || research?.entries || [];
  const pubItems = publications?.items || publications?.entries || [];
  const awardItems = awards?.items || awards?.entries || [];
  const langItems = languages?.items || languages?.entries || [];
  const academicExp = researchItems.length > 0 ? researchItems : expItems;

  return (
    <div className="w-full text-slate-900 leading-normal space-y-4 font-serif text-xs">
      {/* 1. Scholarly Header */}
      <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-normal uppercase" style={{ color: primaryColor }}>
          {personal.fullName || 'Candidate Name'}
        </h1>
        {personal.headline && (
          <p className="text-xs font-serif italic text-slate-700">
            {personal.headline}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-700 font-sans pt-1">
          {personal.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{personal.city}, {personal.country}</span>
            </span>
          )}
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="flex items-center gap-1 hover:underline">
              <Mail className="w-3 h-3 text-slate-500" />
              <span>{personal.email}</span>
            </a>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" />
              <span>{personal.phone}</span>
            </span>
          )}
          {personal.portfolio && (
            <a href={personal.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3 h-3 text-slate-500" />
              <span>Academic Site</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. Research Interests / Executive Summary */}
      {summary?.summaryText && (
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: primaryColor }}>
            Research Interests & Focus
          </h2>
          <p className="text-slate-800 leading-relaxed text-justify">
            {summary.summaryText}
          </p>
        </div>
      )}

      {/* 3. Education (Primary in Academic CV) */}
      {eduItems.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Higher Education</span>
          </h2>
          <div className="space-y-2">
            {eduItems.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    {edu.degree} in {edu.fieldOfStudy}
                  </div>
                  <div className="text-slate-700 italic text-[11px]">
                    {edu.institution}{edu.city ? `, ${edu.city}` : ''}
                  </div>
                  {edu.grade && (
                    <div className="text-[10px] text-slate-600 font-sans">
                      Honors / Distinction: {edu.grade}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-700 font-sans font-medium">
                  {edu.graduationYear || edu.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Research & Academic Appointments */}
      {academicExp.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic &amp; Research Experience</span>
          </h2>
          <div className="space-y-3">
            {academicExp.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.title || item.jobTitle}</span>
                    <span className="italic text-slate-700">, {item.institution || item.company}</span>
                    {item.location && <span className="text-[11px] text-slate-600"> ({item.location})</span>}
                  </div>
                  <div className="text-xs text-slate-700 font-sans font-medium">
                    {item.startDate} – {item.current ? 'Present' : item.endDate}
                  </div>
                </div>

                {item.bullets && item.bullets.length > 0 && (
                  <ul className="list-disc list-outside pl-5 space-y-0.5 text-slate-800 text-[11px]">
                    {item.bullets.map((b, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Publications & Manuscripts */}
      {pubItems.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: primaryColor }}>
            Peer-Reviewed Publications
          </h2>
          <ol className="list-decimal list-outside pl-5 space-y-1.5 text-[11px] text-slate-800">
            {pubItems.map((pub, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-semibold text-slate-900">{pub.authors || personal.fullName}. </span>
                <span className="italic">&ldquo;{pub.title}&rdquo;</span>. In{' '}
                <span className="font-medium text-slate-900">{pub.venue || pub.publisher}</span>, {pub.year || '2024'}.
                {pub.doi && <span className="font-mono text-[10px] text-slate-500"> DOI: {pub.doi}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 6. Grants, Honors & Fellowships */}
      {awardItems.length > 0 && (
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: primaryColor }}>
            Grants, Fellowships &amp; Honors
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-1 text-[11px] text-slate-800">
            {awardItems.map((award, idx) => (
              <li key={idx} className="leading-snug">
                {typeof award === 'string'
                  ? award
                  : `${award.title || award.name} (${award.year || award.issueDate || ''}) - ${award.issuer || ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. Computational & Laboratory Methodologies */}
      {skills?.categories && (
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: primaryColor }}>
            Methodologies &amp; Scientific Computing
          </h2>
          <div className="space-y-0.5 text-[11px] text-slate-800">
            {skills.categories.map((cat, idx) => (
              <div key={idx} className="flex gap-1.5 leading-relaxed">
                <span className="font-bold text-slate-900 min-w-[120px]">{cat.category}:</span>
                <span className="text-slate-700">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Languages & Scholarly Memberships */}
      {langItems.length > 0 && (
        <div className="space-y-1 pt-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5" style={{ color: primaryColor }}>
            Languages &amp; Scholarly Affiliations
          </h2>
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-700">
            {langItems.map((lang, idx) => (
              <span key={idx}>
                <strong>{lang.name || lang.language}</strong> ({lang.proficiency})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
