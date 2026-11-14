export function ModernProfessionalTemplate({ resume, designSettings }) {
  const sections = (resume.sections || []).filter((s) => s.visible);

  const personal = sections.find((s) => s.type === 'personal_info')?.data || {};
  const summary = sections.find((s) => s.type === 'summary')?.data;
  const skills = sections.find((s) => s.type === 'skills')?.data;
  const experience = sections.find((s) => s.type === 'experience')?.data;
  const projects = sections.find((s) => s.type === 'projects')?.data;
  const education = sections.find((s) => s.type === 'education')?.data;
  const certs = sections.find((s) => s.type === 'certifications')?.data;
  const languages = sections.find((s) => s.type === 'languages')?.data;

  const primaryColor = designSettings?.primaryColor || '#1e1b4b';
  const secondaryColor = designSettings?.secondaryColor || '#4338ca';

  return (
    <div className="w-full text-slate-900 leading-normal font-sans grid grid-cols-12 gap-6">
      {/* LEFT COLUMN: Sidebar (4 cols) */}
      <div className="col-span-4 border-r pr-5 space-y-5 border-slate-200">
        {/* Contact info */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: secondaryColor, borderColor: '#e2e8f0' }}>
            Contact &amp; Links
          </h3>
          <div className="space-y-1 text-[11px] text-slate-600 break-all">
            {personal.email && <div><span className="font-semibold text-slate-800">Email:</span> {personal.email}</div>}
            {personal.phone && <div><span className="font-semibold text-slate-800">Phone:</span> {personal.phone}</div>}
            {personal.city && <div><span className="font-semibold text-slate-800">Location:</span> {personal.city}, {personal.country}</div>}
            {personal.linkedin && <div><span className="font-semibold text-slate-800">LinkedIn:</span> {personal.linkedin.replace('https://', '')}</div>}
            {personal.github && <div><span className="font-semibold text-slate-800">GitHub:</span> {personal.github.replace('https://', '')}</div>}
            {personal.website && <div><span className="font-semibold text-slate-800">Web:</span> {personal.website.replace('https://', '')}</div>}
          </div>
        </div>

        {/* Technical Skills Sidebar */}
        {skills?.categories && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: secondaryColor, borderColor: '#e2e8f0' }}>
              Skills &amp; Stacks
            </h3>
            <div className="space-y-2 text-xs">
              {skills.categories.map((cat, idx) => (
                <div key={idx} className="space-y-0.5">
                  <span className="font-bold text-[10px] text-slate-900 uppercase tracking-wide block">
                    {cat.category}
                  </span>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    {cat.skills.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Sidebar */}
        {education?.entries && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: secondaryColor, borderColor: '#e2e8f0' }}>
              Education
            </h3>
            <div className="space-y-2 text-xs">
              {education.entries.map((edu) => (
                <div key={edu.id} className="space-y-0.5">
                  <div className="font-bold text-slate-900 leading-snug">{edu.degree}</div>
                  <div className="text-[11px] text-slate-700">{edu.fieldOfStudy}</div>
                  <div className="text-[10px] text-slate-500">{edu.institution} ({edu.startDate}–{edu.endDate})</div>
                  {edu.grade && <div className="text-[10px] text-slate-600 font-mono">{edu.grade}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Sidebar */}
        {certs?.entries && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: secondaryColor, borderColor: '#e2e8f0' }}>
              Certifications
            </h3>
            <div className="space-y-1.5 text-xs">
              {certs.entries.map((c) => (
                <div key={c.id} className="space-y-0.5">
                  <div className="font-semibold text-slate-900 leading-snug text-[11px]">{c.name}</div>
                  <div className="text-[10px] text-slate-500">{c.issuer} • {c.issueDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Sidebar */}
        {languages?.entries && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: secondaryColor, borderColor: '#e2e8f0' }}>
              Languages
            </h3>
            <div className="space-y-1 text-xs">
              {languages.entries.map((l, i) => (
                <div key={i} className="text-[11px]">
                  <span className="font-semibold text-slate-900">{l.language}:</span>{' '}
                  <span className="text-slate-600">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Main Content (8 cols) */}
      <div className="col-span-8 space-y-4">
        {/* Name and headline */}
        <div className="border-b pb-3 space-y-1" style={{ borderColor: primaryColor }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
            {personal.fullName || 'Candidate Name'}
          </h1>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {personal.headline}
          </p>
        </div>

        {/* Summary */}
        {summary?.summaryText && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
              Executive Profile
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              {summary.summaryText}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience?.entries && (
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
              Professional Career Track
            </h2>
            <div className="space-y-3.5 text-xs">
              {experience.entries.map((entry) => (
                <div key={entry.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-xs">
                      {entry.jobTitle} <span className="font-normal text-slate-500">at</span> {entry.company}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{entry.startDate} – {entry.endDate}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic">{entry.location}</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {entry.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed pl-0.5">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects?.entries && (
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
              Featured Deliverables
            </h2>
            <div className="space-y-3 text-xs">
              {projects.entries.map((proj) => (
                <div key={proj.id} className="space-y-1">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{proj.name} {proj.role && <span className="text-slate-500 font-normal">({proj.role})</span>}</span>
                    {proj.link && <span className="text-[10px] font-mono text-slate-500">{proj.link.replace('https://', '')}</span>}
                  </div>
                  {proj.technologies && (
                    <div className="text-[10px] text-slate-600 font-mono">
                      Stack: {proj.technologies.join(' • ')}
                    </div>
                  )}
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed pl-0.5">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
