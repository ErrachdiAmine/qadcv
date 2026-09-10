import React, { useState } from 'react';
import { User, Briefcase, FolderGit2, Wrench, GraduationCap, Languages, Sparkles, Plus, Trash2, Zap, ArrowRight } from 'lucide-react';
import { enhanceSummary, enhanceBulletPoints, suggestSkillsForRole } from '../services/aiEngine';

export default function EditorPane({ formData, setFormData, direction = 'ltr' }) {
  const [activeTab, setActiveTab] = useState('basics');
  const isRtl = direction === 'rtl';

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // AI Helpers
  const handleEnhanceSummary = () => {
    const enhanced = enhanceSummary(formData, isRtl ? 'ar' : 'en');
    updateField('summary', enhanced);
  };

  const handleEnhanceExperience = (idx) => {
    const exp = [...(formData.experience || [])];
    if (exp[idx]) {
      exp[idx].description = enhanceBulletPoints(exp[idx].description);
      updateField('experience', exp);
    }
  };

  const handleSuggestSkills = () => {
    const suggested = suggestSkillsForRole(formData.title);
    const existing = new Set(formData.skills || []);
    suggested.forEach((s) => existing.add(s));
    updateField('skills', Array.from(existing));
  };

  const tabs = [
    { id: 'basics', label: isRtl ? 'الملف الشخصي' : 'Profile & Basics', icon: User },
    { id: 'experience', label: isRtl ? 'الخبرات' : 'Experience', icon: Briefcase },
    { id: 'skills', label: isRtl ? 'المهارات' : 'Skills & Tech', icon: Wrench },
    { id: 'projects', label: isRtl ? 'المشاريع' : 'Projects', icon: FolderGit2 },
    { id: 'education', label: isRtl ? 'التعليم' : 'Education', icon: GraduationCap },
  ];

  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Editor Tab Navigation */}
      <div className="flex items-center gap-1 p-2 bg-white/[0.02] border-b border-white/5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-neutral-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
        {/* --- TAB 1: BASICS --- */}
        {activeTab === 'basics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  {isRtl ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Amine Errachdi"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  {isRtl ? 'المسمى الوظيفي المستهدف' : 'Target Title / Role'}
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Lead Full-Stack Engineer"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="e.g. errachdi.og@gmail.com"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  {isRtl ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="e.g. +212 675 806074"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  {isRtl ? 'الموقع الجغرافي' : 'Location / Country'}
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g. Morocco (Remote)"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  {isRtl ? 'رابط لينكد إن' : 'LinkedIn Profile'}
                </label>
                <input
                  type="text"
                  value={formData.linkedin || ''}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/..."
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  {isRtl ? 'رابط جيت هب' : 'GitHub Profile'}
                </label>
                <input
                  type="text"
                  value={formData.github || ''}
                  onChange={(e) => updateField('github', e.target.value)}
                  placeholder="github.com/..."
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  {isRtl ? 'الموقع الشخصي / البورتفوليو' : 'Portfolio / Website'}
                </label>
                <input
                  type="text"
                  value={formData.portfolio || ''}
                  onChange={(e) => updateField('portfolio', e.target.value)}
                  placeholder="portfolio-errachdi.vercel.app"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Summary with AI Generator Button */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-400">
                  {isRtl ? 'الملخص التنفيذي' : 'Executive Summary'}
                </label>
                <button
                  type="button"
                  onClick={handleEnhanceSummary}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>{isRtl ? 'توليد بالذكاء الاصطناعي' : 'AI Synthesize Summary'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={formData.summary || ''}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="High-velocity product engineer with extensive experience..."
                className="w-full glass-input rounded-xl p-3 text-xs text-white leading-relaxed resize-none"
              />
            </div>
          </div>
        )}

        {/* --- TAB 2: EXPERIENCE --- */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {isRtl ? 'سجل الخبرات العملية' : 'Work History & Roles'}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateField('experience', [
                    ...(formData.experience || []),
                    {
                      id: Date.now().toString(),
                      position: '',
                      company: '',
                      location: '',
                      startDate: '',
                      endDate: 'Present',
                      description: '',
                    },
                  ])
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>{isRtl ? 'إضافة خبرة' : 'Add Experience'}</span>
              </button>
            </div>

            {(formData.experience || []).map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 relative group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    #{idx + 1} {exp.position || (isRtl ? 'منصب جديد' : 'New Position')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (formData.experience || []).filter((_, i) => i !== idx);
                      updateField('experience', updated);
                    }}
                    className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'المسمى الوظيفي' : 'Role Title'}
                    </label>
                    <input
                      type="text"
                      value={exp.position || ''}
                      onChange={(e) => {
                        const updated = [...(formData.experience || [])];
                        updated[idx].position = e.target.value;
                        updateField('experience', updated);
                      }}
                      placeholder="e.g. Lead Software Engineer"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'الشركة / المنظمة' : 'Company Name'}
                    </label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => {
                        const updated = [...(formData.experience || [])];
                        updated[idx].company = e.target.value;
                        updateField('experience', updated);
                      }}
                      placeholder="e.g. Independent Systems"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'الفترة الزمنية' : 'Start — End Date'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={exp.startDate || ''}
                        onChange={(e) => {
                          const updated = [...(formData.experience || [])];
                          updated[idx].startDate = e.target.value;
                          updateField('experience', updated);
                        }}
                        placeholder="2023"
                        className="w-1/2 glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={exp.endDate || ''}
                        onChange={(e) => {
                          const updated = [...(formData.experience || [])];
                          updated[idx].endDate = e.target.value;
                          updateField('experience', updated);
                        }}
                        placeholder="Present"
                        className="w-1/2 glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'الموقع' : 'Location'}
                    </label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => {
                        const updated = [...(formData.experience || [])];
                        updated[idx].location = e.target.value;
                        updateField('experience', updated);
                      }}
                      placeholder="Remote"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-neutral-400">
                      {isRtl ? 'المهام والإنجازات (نقاط •)' : 'Impact & Responsibilities (• Bullets)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleEnhanceExperience(idx)}
                      className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <Zap size={11} />
                      <span>{isRtl ? 'تحسين الأفعال القوية' : 'AI Action-Verb Polish'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={exp.description || ''}
                    onChange={(e) => {
                      const updated = [...(formData.experience || [])];
                      updated[idx].description = e.target.value;
                      updateField('experience', updated);
                    }}
                    placeholder="• Architected and shipped 8+ production web applications..."
                    className="w-full glass-input rounded-lg p-2.5 text-xs text-white leading-relaxed resize-none font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB 3: SKILLS --- */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {isRtl ? 'قائمة الكفاءات والتقنيات' : 'Technical & Soft Skills'}
              </span>
              <button
                type="button"
                onClick={handleSuggestSkills}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold cursor-pointer"
              >
                <Sparkles size={12} className="text-cyan-400" />
                <span>{isRtl ? 'اقتراح مهارات للدور' : 'Auto-Suggest for Role'}</span>
              </button>
            </div>

            {/* Tags Pills */}
            <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[90px]">
              {(formData.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-200 font-mono group"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (formData.skills || []).filter((_, i) => i !== idx);
                      updateField('skills', updated);
                    }}
                    className="text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                id="skill-input"
                placeholder={isRtl ? 'اكتب مهارة واضغط Enter...' : 'Type a skill and press Enter (e.g. React 19, Python)...'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    const newSkill = e.target.value.trim();
                    if (!formData.skills?.includes(newSkill)) {
                      updateField('skills', [...(formData.skills || []), newSkill]);
                    }
                    e.target.value = '';
                  }
                }}
                className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* --- TAB 4: PROJECTS --- */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {isRtl ? 'المشاريع البارزة' : 'Featured Projects'}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateField('projects', [
                    ...(formData.projects || []),
                    { id: Date.now().toString(), name: '', url: '', tech: '', description: '' },
                  ])
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 cursor-pointer"
              >
                <Plus size={13} />
                <span>{isRtl ? 'إضافة مشروع' : 'Add Project'}</span>
              </button>
            </div>

            {(formData.projects || []).map((proj, idx) => (
              <div
                key={proj.id || idx}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 relative group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    #{idx + 1} {proj.name || (isRtl ? 'مشروع جديد' : 'New Project')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (formData.projects || []).filter((_, i) => i !== idx);
                      updateField('projects', updated);
                    }}
                    className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'اسم المشروع' : 'Project Name'}
                    </label>
                    <input
                      type="text"
                      value={proj.name || ''}
                      onChange={(e) => {
                        const updated = [...(formData.projects || [])];
                        updated[idx].name = e.target.value;
                        updateField('projects', updated);
                      }}
                      placeholder="e.g. QadCV"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'الرابط المباشر' : 'Live URL'}
                    </label>
                    <input
                      type="text"
                      value={proj.url || ''}
                      onChange={(e) => {
                        const updated = [...(formData.projects || [])];
                        updated[idx].url = e.target.value;
                        updateField('projects', updated);
                      }}
                      placeholder="https://qadcv.vercel.app"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {isRtl ? 'التقنيات المستخدمة' : 'Tech Stack Used'}
                  </label>
                  <input
                    type="text"
                    value={proj.tech || ''}
                    onChange={(e) => {
                      const updated = [...(formData.projects || [])];
                      updated[idx].tech = e.target.value;
                      updateField('projects', updated);
                    }}
                    placeholder="React 19, RTL Engine, Vector PDF"
                    className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {isRtl ? 'وصف المشروع والتأثير' : 'Impact & Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={proj.description || ''}
                    onChange={(e) => {
                      const updated = [...(formData.projects || [])];
                      updated[idx].description = e.target.value;
                      updateField('projects', updated);
                    }}
                    placeholder="Engineered an AI-accelerated resume creator with dynamic line balancing..."
                    className="w-full glass-input rounded-lg p-2.5 text-xs text-white resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB 5: EDUCATION --- */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {isRtl ? 'المسار التعليمي' : 'Education History'}
              </span>
              <button
                type="button"
                onClick={() =>
                  updateField('education', [
                    ...(formData.education || []),
                    { id: Date.now().toString(), degree: '', institution: '', location: '', graduationDate: '', gpa: '' },
                  ])
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 cursor-pointer"
              >
                <Plus size={13} />
                <span>{isRtl ? 'إضافة شهادة' : 'Add Degree'}</span>
              </button>
            </div>

            {(formData.education || []).map((edu, idx) => (
              <div
                key={edu.id || idx}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 relative group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    #{idx + 1} {edu.degree || (isRtl ? 'مؤهل دراسي' : 'New Degree')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (formData.education || []).filter((_, i) => i !== idx);
                      updateField('education', updated);
                    }}
                    className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'الدرجة العلمية / التخصص' : 'Degree / Field of Study'}
                    </label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const updated = [...(formData.education || [])];
                        updated[idx].degree = e.target.value;
                        updateField('education', updated);
                      }}
                      placeholder="B.Sc. in Computer Science"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'المؤسسة / الجامعة' : 'Institution / University'}
                    </label>
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => {
                        const updated = [...(formData.education || [])];
                        updated[idx].institution = e.target.value;
                        updateField('education', updated);
                      }}
                      placeholder="University Name"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'سنة التخرج' : 'Graduation Year'}
                    </label>
                    <input
                      type="text"
                      value={edu.graduationDate || ''}
                      onChange={(e) => {
                        const updated = [...(formData.education || [])];
                        updated[idx].graduationDate = e.target.value;
                        updateField('education', updated);
                      }}
                      placeholder="2023"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isRtl ? 'الموقع' : 'Location'}
                    </label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => {
                        const updated = [...(formData.education || [])];
                        updated[idx].location = e.target.value;
                        updateField('education', updated);
                      }}
                      placeholder="Morocco"
                      className="w-full glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
