import { ExternalLink, Github, Globe, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export function TechnicalResumeTemplate({ resume, designSettings }) {
  const sections = (resume.sections || []).filter((s) => s.visible !== false);

  const personal = sections.find((s) => s.type === 'personal_info')?.data || {};
  const summary = sections.find((s) => s.type === 'summary')?.data;
  const skills = sections.find((s) => s.type === 'skills')?.data;
  const experience = sections.find((s) => s.type === 'experience')?.data;
  const projects = sections.find((s) => s.type === 'projects')?.data;
  const education = sections.find((s) => s.type === 'education')?.data;
  const certs = sections.find((s) => s.type === 'certifications')?.data;
  const achievements = sections.find((s) => s.type === 'achievements')?.data;

  const primaryColor = designSettings?.primaryColor || '#0284c7';
  const secondaryColor = designSettings?.secondaryColor || '#0ea5e9';

  const expItems = experience?.items || experience?.entries || [];
  const projItems = projects?.items || projects?.entries || [];
  const eduItems = education?.items || education?.entries || [];
  const certItems = certs?.items || certs?.entries || [];
  const achItems = achievements?.items || achievements?.entries || [];

  return (
    <div className="w-full text-slate-900 leading-normal space-y-4 font-sans text-xs">
      {/* 1. Technical Header */}
      <div className="border-b border-slate-300 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
              {personal.fullName || 'Candidate Name'}
            </h1>
            <p className="text-xs font-semibold text-slate-700 tracking-wide mt-0.5">
              {personal.headline || 'Full Stack Software Engineer'}
            </p>
          </div>
          {personal.city && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{personal.city}, {personal.country}</span>
            </div>
          )}
        </div>

        {/* Links bar with monospace tech badges */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-600 font-mono">
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="flex items-center gap-1 hover:text-sky-600 transition-colors">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{personal.email}</span>
            </a>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{personal.phone}</span>
            </span>
          )}
          {personal.github && (
            <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-sky-600 transition-colors">
              <Github className="w-3 h-3 text-slate-400" />
              <span>{personal.github.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {personal.linkedin && (
            <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-sky-600 transition-colors">
              <Linkedin className="w-3 h-3 text-slate-400" />
              <span>{personal.linkedin.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {personal.portfolio && (
            <a href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-sky-600 transition-colors">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{personal.portfolio.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. Technical Profile Summary */}
      {summary?.summaryText && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: secondaryColor }} />
            <h2 className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-900">
              Technical Profile
            </h2>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
          <p className="text-slate-700 leading-relaxed text-justify pl-4">
            {summary.summaryText}
          </p>
        </div>
      )}

      {/* 3. Core Competencies / Tech Stack */}
      {skills?.categories && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: secondaryColor }} />
            <h2 className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-900">
              Core Competencies & Stack
            </h2>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
            {skills.categories.map((cat, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-1.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono">
                  {cat.category}
                </span>
                <div className="flex flex-wrap gap-1">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white border border-slate-200 text-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Engineering Experience */}
      {expItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: secondaryColor }} />
            <h2 className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-900">
              Professional Experience
            </h2>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="space-y-3.5 pl-4">
            {expItems.map((job) => (
              <div key={job.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{job.title || job.jobTitle}</span>
                    <span className="text-slate-500 font-medium"> @ </span>
                    <span className="font-semibold text-slate-800">{job.company}</span>
                    {job.location && (
                      <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({job.location})</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 font-medium">
                    {job.startDate} – {job.current ? 'Present' : job.endDate}
                  </div>
                </div>

                {job.technologies && job.technologies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500">Tech:</span>
                    {job.technologies.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-1 py-0.2 rounded text-[9px] font-mono font-medium bg-sky-50 text-sky-800 border border-sky-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {Array.isArray(job.bullets) && job.bullets.length > 0 ? (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-700">
                    {job.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-snug">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : typeof job.bullets === 'string' && job.bullets.trim() ? (
                  <p className="text-slate-700 leading-snug text-[11px] pl-4">{job.bullets}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Key Engineering Projects */}
      {projItems.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: secondaryColor }} />
            <h2 className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-900">
              Key Projects &amp; Systems
            </h2>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-2.5 pl-4">
            {projItems.map((proj) => (
              <div key={proj.id} className="border border-slate-200 rounded p-2 bg-white space-y-1">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{proj.title || proj.name}</span>
                    {proj.role && <span className="text-[10px] text-slate-500 font-mono">({proj.role})</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    {(proj.github || proj.link) && (
                      <a href={(proj.github || proj.link).startsWith('http') ? (proj.github || proj.link) : `https://${proj.github || proj.link}`} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-sky-600 hover:underline">
                        <Github className="w-2.5 h-2.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {(proj.liveUrl || proj.link) && (
                      <a href={(proj.liveUrl || proj.link).startsWith('http') ? (proj.liveUrl || proj.link) : `https://${proj.liveUrl || proj.link}`} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-sky-600 hover:underline">
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Live</span>
                      </a>
                    )}
                  </div>
                </div>

                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.map((t, idx) => (
                      <span key={idx} className="text-[9px] font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {proj.description && (
                  <p className="text-slate-600 text-[11px] leading-snug">{proj.description}</p>
                )}

                {Array.isArray(proj.bullets) && proj.bullets.length > 0 ? (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-700 pt-0.5">
                    {proj.bullets.map((b, idx) => (
                      <li key={idx} className="leading-snug text-[11px]">
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : typeof proj.bullets === 'string' && proj.bullets.trim() ? (
                  <p className="text-slate-700 leading-snug text-[11px] pt-0.5">{proj.bullets}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Education & Certifications Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
        {eduItems.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-700 border-b pb-0.5">
              Education
            </h3>
            <div className="space-y-2">
              {eduItems.map((edu) => (
                <div key={edu.id} className="text-[11px]">
                  <div className="font-bold text-slate-900">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</div>
                  <div className="text-slate-600 text-[10px]">{edu.institution} • {edu.graduationYear || edu.endDate}</div>
                  {edu.grade && <div className="text-[10px] font-mono text-slate-500">GPA / Score: {edu.grade}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {certItems.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-700 border-b pb-0.5">
              Certifications &amp; Credentials
            </h3>
            <div className="space-y-1.5">
              {certItems.map((cert) => (
                <div key={cert.id} className="text-[11px]">
                  <div className="font-semibold text-slate-900">{cert.name}</div>
                  <div className="text-slate-500 text-[10px] font-mono">{cert.issuer} {cert.issueDate && `(${cert.issueDate})`}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. Key Achievements if present */}
      {achItems.length > 0 && (
        <div className="space-y-1 pl-4 pt-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-700 border-b pb-0.5">
            Selected Honors &amp; Achievements
          </h3>
          <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-700 text-[11px]">
            {achItems.map((ach, idx) => (
              <li key={idx} className="leading-snug">
                {typeof ach === 'string' ? ach : (ach.title || ach.name)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
