export function AtsProfessionalTemplate({ resume, designSettings }) {
  const sections = (resume.sections || []).filter((s) => s.visible);

  const personal = sections.find((s) => s.type === 'personal_info')?.data || {};
  const summary = sections.find((s) => s.type === 'summary')?.data;
  const skills = sections.find((s) => s.type === 'skills')?.data;
  const experience = sections.find((s) => s.type === 'experience')?.data;
  const projects = sections.find((s) => s.type === 'projects')?.data;
  const education = sections.find((s) => s.type === 'education')?.data;
  const certs = sections.find((s) => s.type === 'certifications')?.data;
  const languages = sections.find((s) => s.type === 'languages')?.data;

  const primaryColor = designSettings?.primaryColor || '#0f172a';

  return (
    <div className="w-full text-slate-900 leading-normal space-y-4 font-sans">
      {/* 1. Header: Single-column centered or linear left */}
      <div className="border-b-2 pb-3 text-center space-y-1" style={{ borderColor: primaryColor }}>
        <h1 className="text-2xl font-bold tracking-tight uppercase" style={{ color: primaryColor }}>
          {personal.fullName || 'Candidate Name'}
        </h1>
        <p className="text-xs font-medium text-slate-700 tracking-wide">
          {personal.headline}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-600 font-mono pt-1">
          {personal.city && <span>{personal.city}, {personal.country}</span>}
          {personal.email && <span>• {personal.email}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.linkedin && <span>• {personal.linkedin.replace('https://', '')}</span>}
          {personal.github && <span>• {personal.github.replace('https://', '')}</span>}
        </div>
      </div>

      {/* 2. Professional Summary */}
      {summary?.summaryText && (
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: primaryColor, borderColor: '#cbd5e1' }}>
            Professional Summary
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed text-justify">
            {summary.summaryText}
          </p>
        </div>
      )}

      {/* 3. Technical Proficiencies */}
      {skills?.categories && (
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: primaryColor, borderColor: '#cbd5e1' }}>
            Technical Proficiencies
          </h2>
          <div className="space-y-0.5 text-xs text-slate-800">
            {skills.categories.map((cat, idx) => (
              <div key={idx} className="flex flex-wrap gap-1 leading-snug">
                <span className="font-bold text-slate-900">{cat.category}:</span>
                <span>{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Professional Experience */}
      {experience?.entries && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: primaryColor, borderColor: '#cbd5e1' }}>
            Professional Experience
          </h2>
          <div className="space-y-3 text-xs">
            {experience.entries.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{entry.jobTitle} — <span className="font-semibold text-slate-700">{entry.company}</span></span>
                  <span className="font-mono text-[10px] text-slate-600">{entry.startDate} – {entry.endDate}</span>
                </div>
                <div className="text-[10px] text-slate-500 italic">{entry.location}</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                  {entry.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="leading-relaxed pl-1">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Key Engineering Projects */}
      {projects?.entries && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: primaryColor, borderColor: '#cbd5e1' }}>
            Key Engineering Projects
          </h2>
          <div className="space-y-2.5 text-xs">
            {projects.entries.map((proj) => (
              <div key={proj.id} className="space-y-0.5">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{proj.name} {proj.role && <span className="font-normal text-slate-600">({proj.role})</span>}</span>
                  {proj.link && <span className="text-[10px] font-mono text-slate-500">{proj.link.replace('https://', '')}</span>}
                </div>
                {proj.technologies && (
                  <div className="text-[10px] text-slate-600 font-mono">
                    Technologies: {proj.technologies.join(', ')}
                  </div>
                )}
                <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                  {proj.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="leading-relaxed pl-1">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Education */}
      {education?.entries && (
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: primaryColor, borderColor: '#cbd5e1' }}>
            Education
          </h2>
          <div className="space-y-1 text-xs">
            {education.entries.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                  <div className="text-slate-700">{edu.institution} {edu.grade && `• ${edu.grade}`}</div>
                </div>
                <span className="font-mono text-[10px] text-slate-600">{edu.startDate} – {edu.endDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Certifications */}
      {certs?.entries && (
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: primaryColor, borderColor: '#cbd5e1' }}>
            Certifications
          </h2>
          <div className="space-y-1 text-xs text-slate-800">
            {certs.entries.map((c) => (
              <div key={c.id} className="flex justify-between items-baseline">
                <span><strong className="text-slate-900">{c.name}</strong> — {c.issuer}</span>
                <span className="font-mono text-[10px] text-slate-600">{c.issueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Languages */}
      {languages?.entries && (
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: primaryColor, borderColor: '#cbd5e1' }}>
            Languages
          </h2>
          <div className="flex flex-wrap gap-4 text-xs text-slate-800">
            {languages.entries.map((l, i) => (
              <span key={i}><strong>{l.language}:</strong> {l.proficiency}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
