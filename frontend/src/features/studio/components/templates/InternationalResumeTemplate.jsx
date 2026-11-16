import { Award, Briefcase, Globe2, GraduationCap, Mail, MapPin, Phone } from 'lucide-react';

export function InternationalResumeTemplate({ resume, designSettings }) {
  const sections = (resume.sections || []).filter((s) => s.visible !== false);

  const personal = sections.find((s) => s.type === 'personal_info')?.data || {};
  const summary = sections.find((s) => s.type === 'summary')?.data;
  const experience = sections.find((s) => s.type === 'experience')?.data;
  const skills = sections.find((s) => s.type === 'skills')?.data;
  const education = sections.find((s) => s.type === 'education')?.data;
  const certs = sections.find((s) => s.type === 'certifications')?.data;
  const projects = sections.find((s) => s.type === 'projects')?.data;
  const languages = sections.find((s) => s.type === 'languages')?.data;

  const primaryColor = designSettings?.primaryColor || '#047857';
  const secondaryColor = designSettings?.secondaryColor || '#10b981';

  const expItems = experience?.items || experience?.entries || [];
  const projItems = projects?.items || projects?.entries || [];
  const eduItems = education?.items || education?.entries || [];
  const certItems = certs?.items || certs?.entries || [];
  const langItems = languages?.items || languages?.entries || [];

  return (
    <div className="w-full text-slate-900 leading-normal space-y-4 font-sans text-xs">
      {/* 1. Global Header with International Mobility & Contact details */}
      <div className="border-b-2 pb-3.5" style={{ borderColor: primaryColor }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
              {personal.fullName || 'Candidate Name'}
            </h1>
            <p className="text-xs font-semibold text-slate-700 tracking-wide mt-0.5">
              {personal.headline || 'Senior International Professional'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-medium">
            <Globe2 className="w-3 h-3 text-emerald-600" />
            <span>Global Mobility / Remote & Relocation Eligible</span>
          </div>
        </div>

        {/* Global Coordinates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-600 font-medium pt-2.5 border-t border-slate-100 mt-2.5">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{personal.city ? `${personal.city}, ${personal.country || 'Global'}` : 'Location Available'}</span>
          </div>
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="flex items-center gap-1 hover:text-emerald-700 truncate">
              <Mail className="w-3 h-3 text-slate-400" />
              <span className="truncate">{personal.email}</span>
            </a>
          )}
          {personal.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.linkedin && (
            <div className="flex items-center gap-1 truncate">
              <span className="font-bold text-slate-400">in:</span>
              <span className="truncate">{personal.linkedin.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Executive Value Proposition / International Summary */}
      {summary?.summaryText && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Executive Profile & Global Scope
            </h2>
            <div className="h-0.5 flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>
          <p className="text-slate-700 leading-relaxed text-justify">
            {summary.summaryText}
          </p>
        </div>
      )}

      {/* 3. Language & Cultural Proficiency Matrix (Prominent in International Resumes) */}
      {langItems.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Multilingual Competence Matrix (CEFR)
            </h2>
            <div className="h-0.5 flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {langItems.map((lang, idx) => (
              <div key={idx} className="border border-slate-200 rounded p-1.5 bg-slate-50 text-[10px]">
                <div className="font-bold text-slate-900">{lang.name || lang.language}</div>
                <div className="text-emerald-700 font-semibold">{lang.proficiency || 'C2 - Native / Fluent'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Professional Experience with International Context */}
      {expItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>International Work History</span>
            </h2>
            <div className="h-0.5 flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>

          <div className="space-y-3 pl-1">
            {expItems.map((job) => (
              <div key={job.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{job.title || job.jobTitle}</span>
                    <span className="text-slate-500 font-medium"> | </span>
                    <span className="font-semibold" style={{ color: primaryColor }}>{job.company}</span>
                    {job.location && (
                      <span className="text-[10px] text-slate-500 ml-1.5 font-medium">({job.location})</span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    {job.startDate} – {job.current ? 'Present' : job.endDate}
                  </div>
                </div>

                {Array.isArray(job.bullets) && job.bullets.length > 0 ? (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-slate-700 text-[11px]">
                    {job.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : typeof job.bullets === 'string' && job.bullets.trim() ? (
                  <p className="text-slate-700 text-[11px] leading-relaxed pl-4">{job.bullets}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Cross-Functional Projects & Initiatives */}
      {projItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Cross-Border Key Initiatives
            </h2>
            <div className="h-0.5 flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {projItems.map((proj) => (
              <div key={proj.id} className="border border-slate-200 rounded p-2 bg-slate-50/50 space-y-1">
                <div className="font-bold text-slate-900 text-xs">{proj.title || proj.name}</div>
                {proj.description && <p className="text-[10px] text-slate-600 leading-snug">{proj.description}</p>}
                {(Array.isArray(proj.technologies) ? proj.technologies.length > 0 : !!proj.technologies) && (
                  <div className="text-[9px] text-slate-500 font-medium">
                    Focus: {Array.isArray(proj.technologies) ? proj.technologies.join(' • ') : String(proj.technologies)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Education & Global Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eduItems.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 border-b pb-0.5">
              <GraduationCap className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                Education &amp; Credentials
              </h3>
            </div>
            <div className="space-y-2">
              {eduItems.map((edu) => (
                <div key={edu.id} className="text-[11px]">
                  <div className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</div>
                  <div className="text-slate-600 text-[10px]">{edu.institution} {edu.city && `(${edu.city})`} • {edu.graduationYear || edu.endDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certItems.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 border-b pb-0.5">
              <Award className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                Accreditations
              </h3>
            </div>
            <div className="space-y-1.5">
              {certItems.map((cert) => (
                <div key={cert.id} className="text-[11px]">
                  <div className="font-semibold text-slate-900">{cert.name}</div>
                  <div className="text-slate-500 text-[10px]">{cert.issuer} {cert.issueDate && `(${cert.issueDate})`}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. Core Competencies */}
      {skills?.categories && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Core Capabilities & Strategic Competencies
            </h2>
            <div className="h-0.5 flex-1" style={{ backgroundColor: secondaryColor }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-700">
            {skills.categories.map((cat, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="font-bold text-slate-900 block">{cat.category}</span>
                <span className="text-slate-600 leading-snug">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
