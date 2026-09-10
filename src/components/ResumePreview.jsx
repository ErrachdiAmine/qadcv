import React from 'react';
import { Mail, Phone, MapPin, Globe, ExternalLink, Calendar, Link2 } from 'lucide-react';

const GithubIcon = ({ size = 13, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 13, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function ResumePreview({ formData, template = 'linear', direction = 'ltr' }) {
  const isRtl = direction === 'rtl';
  const {
    name = '',
    title = '',
    email = '',
    phone = '',
    location = '',
    linkedin = '',
    github = '',
    portfolio = '',
    summary = '',
    skills = [],
    experience = [],
    education = [],
    projects = [],
    languages = [],
    certifications = [],
  } = formData || {};

  const baseFont = isRtl ? 'font-cairo' : template === 'obsidian' ? 'font-mono' : 'font-sans';

  // --- TEMPLATE 1: LINEAR TECH ---
  if (template === 'linear') {
    return (
      <div
        id="resume-canvas"
        dir={direction}
        className={`print-container bg-white text-slate-900 w-full min-h-[1050px] p-8 sm:p-12 shadow-2xl rounded-2xl ${baseFont} leading-relaxed transition-all`}
      >
        {/* Header */}
        <header className="border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 uppercase">
                {name || 'Your Full Name'}
              </h1>
              <p className="text-base sm:text-lg font-semibold text-cyan-700 tracking-wide mt-1">
                {title || 'Target Job Title'}
              </p>
            </div>
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 text-xs font-medium text-slate-600">
            {email && (
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>{email}</span>
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                <span>{phone}</span>
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <span>{location}</span>
              </span>
            )}
            {github && (
              <span className="flex items-center gap-1.5">
                <GithubIcon size={13} className="text-slate-400" />
                <span>{github.replace(/^https?:\/\//, '')}</span>
              </span>
            )}
            {linkedin && (
              <span className="flex items-center gap-1.5">
                <LinkedinIcon size={13} className="text-slate-400" />
                <span>{linkedin.replace(/^https?:\/\//, '')}</span>
              </span>
            )}
            {portfolio && (
              <span className="flex items-center gap-1.5">
                <Globe size={13} className="text-slate-400" />
                <span>{portfolio.replace(/^https?:\/\//, '')}</span>
              </span>
            )}
          </div>
        </header>

        {/* Body Content */}
        <div className="space-y-6">
          {/* Summary */}
          {summary && (
            <section>
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-2.5">
                {isRtl ? 'الملخص المهني' : 'Executive Summary'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {summary}
              </p>
            </section>
          )}

          {/* Skills Grid */}
          {skills && skills.length > 0 && (
            <section>
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-2.5">
                {isRtl ? 'المهارات والتقنيات' : 'Technical Capabilities'}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section>
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-3">
                {isRtl ? 'الخبرة المهنية' : 'Professional Experience'}
              </h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="group">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        {exp.position}{' '}
                        <span className="font-semibold text-cyan-800 font-sans">
                          @ {exp.company}
                        </span>
                      </h3>
                      <span className="text-xs font-mono text-slate-500 shrink-0">
                        {exp.startDate} — {exp.endDate || 'Present'} {exp.location ? `· ${exp.location}` : ''}
                      </span>
                    </div>
                    {exp.description && (
                      <div className="mt-1.5 text-xs sm:text-[13px] text-slate-700 space-y-1 whitespace-pre-wrap leading-relaxed">
                        {exp.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-3">
                {isRtl ? 'المشاريع البارزة' : 'Featured Projects & Artifacts'}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{proj.name}</span>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-700 hover:text-cyan-900"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </h3>
                      {proj.tech && (
                        <span className="text-[10px] font-mono font-medium text-slate-500">
                          {proj.tech}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="mt-1 text-xs text-slate-600 leading-normal">
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Languages side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {education && education.length > 0 && (
              <section>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-2.5">
                  {isRtl ? 'التعليم والمؤهلات' : 'Education'}
                </h2>
                <div className="space-y-2">
                  {education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="text-xs font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-xs text-slate-600 font-medium">
                        {edu.institution} {edu.location ? `· ${edu.location}` : ''}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {edu.graduationDate} {edu.gpa ? `· ${edu.gpa}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {languages && languages.length > 0 && (
              <section>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-2.5">
                  {isRtl ? 'اللغات' : 'Languages'}
                </h2>
                <div className="space-y-1 text-xs text-slate-700">
                  {languages.map((l, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-900">{l.name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 2: EXECUTIVE DUAL COLUMN ---
  if (template === 'executive') {
    return (
      <div
        id="resume-canvas"
        dir={direction}
        className={`print-container bg-white text-slate-900 w-full min-h-[1050px] p-8 sm:p-12 shadow-2xl rounded-2xl ${baseFont} leading-relaxed transition-all`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column (Main 8 cols) */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {name || 'Your Full Name'}
              </h1>
              <p className="text-sm sm:text-base font-bold text-indigo-700 mt-1 uppercase tracking-wider">
                {title || 'Target Job Title'}
              </p>
            </div>

            {summary && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b-2 border-indigo-100 pb-1 mb-2">
                  {isRtl ? 'الملخص' : 'About'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">{summary}</p>
              </section>
            )}

            {experience && experience.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b-2 border-indigo-100 pb-1 mb-3">
                  {isRtl ? 'الخبرات' : 'Experience'}
                </h2>
                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <div className="text-xs sm:text-sm font-bold text-slate-900">{exp.position}</div>
                        <div className="text-[11px] font-mono text-slate-500">{exp.startDate} - {exp.endDate || 'Present'}</div>
                      </div>
                      <div className="text-xs font-semibold text-indigo-700">{exp.company} {exp.location ? `· ${exp.location}` : ''}</div>
                      {exp.description && (
                        <div className="mt-1 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {exp.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {projects && projects.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b-2 border-indigo-100 pb-1 mb-3">
                  {isRtl ? 'المشاريع' : 'Key Projects'}
                </h2>
                <div className="space-y-3">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="border-l-2 border-indigo-500 pl-3">
                      <div className="text-xs font-bold text-slate-900">{proj.name}</div>
                      <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
                      {proj.tech && <div className="text-[10px] font-mono text-indigo-600 mt-1">{proj.tech}</div>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Sidebar 4 cols) */}
          <div className="md:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-6 self-start">
            {/* Contact */}
            <div className="space-y-2 text-xs text-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                {isRtl ? 'بيانات الاتصال' : 'Contact'}
              </h3>
              {email && <div className="flex items-center gap-2"><Mail size={12} className="text-indigo-600" /><span>{email}</span></div>}
              {phone && <div className="flex items-center gap-2"><Phone size={12} className="text-indigo-600" /><span>{phone}</span></div>}
              {location && <div className="flex items-center gap-2"><MapPin size={12} className="text-indigo-600" /><span>{location}</span></div>}
              {github && <div className="flex items-center gap-2"><GithubIcon size={12} className="text-indigo-600" /><span>{github.replace(/^https?:\/\//, '')}</span></div>}
              {linkedin && <div className="flex items-center gap-2"><LinkedinIcon size={12} className="text-indigo-600" /><span>{linkedin.replace(/^https?:\/\//, '')}</span></div>}
            </div>

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2.5">
                  {isRtl ? 'المهارات' : 'Skills'}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {skills.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-white text-slate-800 rounded border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                  {isRtl ? 'التعليم' : 'Education'}
                </h3>
                <div className="space-y-2">
                  {education.map((e, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="font-bold text-slate-900">{e.degree}</div>
                      <div className="text-slate-600 text-[11px]">{e.institution}</div>
                      <div className="text-slate-400 font-mono text-[10px]">{e.graduationDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                  {isRtl ? 'اللغات' : 'Languages'}
                </h3>
                <div className="space-y-1 text-xs text-slate-700">
                  {languages.map((l, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="font-medium">{l.name}</span>
                      <span className="text-slate-500 text-[11px]">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 3: AL-ANDALUS ARABIC & ELEGANT SERIF ---
  return (
    <div
      id="resume-canvas"
      dir={direction}
      className={`print-container bg-[#fcfbfa] text-stone-900 w-full min-h-[1050px] p-8 sm:p-12 shadow-2xl rounded-2xl ${isRtl ? 'font-cairo' : 'font-serif-elegant'} leading-relaxed transition-all border border-stone-200`}
    >
      {/* Centered Classical Header */}
      <header className="text-center border-b border-amber-900/20 pb-6 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-amber-950">
          {name || 'Your Full Name'}
        </h1>
        <p className="text-base text-amber-800 font-medium mt-1">
          {title || 'Target Title'}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 mt-3 text-xs text-stone-600 font-sans">
          {email && <span>{email}</span>}
          {phone && <span>• {phone}</span>}
          {location && <span>• {location}</span>}
          {portfolio && <span>• {portfolio.replace(/^https?:\/\//, '')}</span>}
        </div>
      </header>

      <div className="space-y-6">
        {summary && (
          <section>
            <h2 className="text-sm font-bold text-amber-950 uppercase tracking-widest border-b border-amber-900/10 pb-1 mb-2">
              {isRtl ? 'نبذة مهنية' : 'Profile'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-amber-950 uppercase tracking-widest border-b border-amber-900/10 pb-1 mb-3">
              {isRtl ? 'الخبرة المهنية' : 'Experience'}
            </h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline font-sans">
                    <div className="text-xs sm:text-sm font-bold text-stone-900">
                      {exp.position} — <span className="italic font-serif-elegant text-amber-900">{exp.company}</span>
                    </div>
                    <div className="text-xs text-stone-500 font-mono">{exp.startDate} - {exp.endDate || 'Present'}</div>
                  </div>
                  {exp.description && (
                    <div className="mt-1 text-xs text-stone-700 whitespace-pre-wrap leading-relaxed font-sans">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-amber-950 uppercase tracking-widest border-b border-amber-900/10 pb-1 mb-2">
              {isRtl ? 'المهارات والكفاءات' : 'Competencies'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              {skills.join(' • ')}
            </p>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-amber-950 uppercase tracking-widest border-b border-amber-900/10 pb-1 mb-2">
              {isRtl ? 'المسار الأكاديمي' : 'Education'}
            </h2>
            <div className="space-y-2 font-sans">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{edu.degree}</span> — {edu.institution}
                  </div>
                  <span className="font-mono text-stone-500">{edu.graduationDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
