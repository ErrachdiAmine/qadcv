import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { enhanceCVWithAI, generateSummary, enhanceExperienceDescription, suggestSkills, generateCoverLetter } from './services/ai.js';
import { categorizeSkills, getSkillGaps, getRecommendedSkills } from './utils/skills.js';
import { matchJobToCV, saveApplication, getApplications, generateApplicationMaterials, updateApplicationStatus } from './utils/jobs.js';
import { saveVersion, getVersions, restoreVersion, deleteVersion, getVersionStats, autoSaveVersion } from './utils/versions.js';
import { analyzeResume, generateImprovementPlan, generateInterviewQuestions, generateSalaryInsights, generateNetworkingTips } from './utils/analytics.js';

const STORAGE_KEY = 'cv-generator-data';
const API_BASE = 'http://localhost:8001/api';

const templates = {
  modern: { 
    name: 'Modern', 
    primaryColor: 'var(--brand)', 
    fontFamily: 'var(--font-sans)', 
    headerStyle: 'centered', 
    sectionStyle: 'bordered',
    layout: 'single-column',
    sidebar: false,
    accentColor: 'var(--brand)',
    backgroundColor: 'white',
    sectionSpacing: '2rem',
    headerBg: 'transparent'
  },
  classic: { 
    name: 'Classic', 
    primaryColor: '#1a1a2e', 
    fontFamily: 'var(--font-serif)', 
    headerStyle: 'left', 
    sectionStyle: 'underlined',
    layout: 'single-column',
    sidebar: false,
    accentColor: '#1a1a2e',
    backgroundColor: '#f7f4ee',
    sectionSpacing: '1.75rem',
    headerBg: '#ffffff',
    headerTextColor: '#111827',
    headerSubTextColor: '#475569'
  },
  minimal: { 
    name: 'Minimal', 
    primaryColor: '#000000', 
    fontFamily: 'var(--font-sans)', 
    headerStyle: 'left', 
    sectionStyle: 'plain',
    layout: 'single-column',
    sidebar: false,
    accentColor: '#333333',
    backgroundColor: 'white',
    sectionSpacing: '1.25rem',
    headerBg: 'transparent'
  },
  elegant: { 
    name: 'Elegant', 
    primaryColor: '#7c2d12', 
    fontFamily: 'var(--font-elegant)', 
    headerStyle: 'centered', 
    sectionStyle: 'plain',
    layout: 'sidebar',
    sidebar: true,
    accentColor: '#7c2d12',
    backgroundColor: 'white',
    sidebarBg: '#7c2d12',
    sectionSpacing: '1.75rem',
    headerBg: '#7c2d12',
    headerTextColor: 'white',
    headerSubTextColor: 'rgba(255,255,255,0.9)'
  }
};

function getDefaultFormData() {
  return {
    name: '', title: '', email: '', phone: '', location: '',
    linkedin: '', github: '', portfolio: '', summary: '',
    experience: [], education: [], skills: [], languages: [],
    certifications: [], projects: [], customSections: []
  };
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('Error caught by boundary:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <pre>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) try { const p = JSON.parse(saved); return p && typeof p === 'object' ? p : getDefaultFormData(); } catch { return getDefaultFormData(); }
    return getDefaultFormData();
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [activeTab, setActiveTab] = useState('basics');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [atsScore, setAtsScore] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [modals, setModals] = useState({
    export: false, coverLetter: false, jobMatch: false,
    applications: false, versions: false, analytics: false,
    settings: false, import: false, templateSelect: false
  });
  const [coverLetterData, setCoverLetterData] = useState({ companyName: '', jobTitle: '', jobDescription: '' });
  const [jobMatchData, setJobMatchData] = useState({ company: '', title: '', description: '' });
  const [jobMatchResult, setJobMatchResult] = useState(null);
  const [applications, setApplications] = useState(() => { try { return JSON.parse(localStorage.getItem('job-applications') || '[]'); } catch { return []; }});
  const [skillAnalysis, setSkillAnalysis] = useState(null);
  const [skillWarning, setSkillWarning] = useState('');
  const [exportPageSize, setExportPageSize] = useState('A4');
  const [targetRole, setTargetRole] = useState('fullstack');
  const [versions, setVersions] = useState(() => getVersions());
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [improvementPlan, setImprovementPlan] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [salaryInsights, setSalaryInsights] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [cvId, setCvId] = useState(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setAutoSaveStatus('saving...');
    setTimeout(() => setAutoSaveStatus('saved'), 1000);
    if (autoSaveVersion(formData)) setVersions(getVersions());
  }, [formData]);

  useEffect(() => {
    if (Array.isArray(formData.skills) && formData.skills.length > 0) {
      const analysis = categorizeSkills(formData.skills);
      const gaps = getSkillGaps(formData.skills, targetRole);
      const recommended = getRecommendedSkills(formData.skills, targetRole);
      setSkillAnalysis({ categorized: analysis, gaps, recommended });
    }
  }, [formData.skills, targetRole]);

  const preview = useCallback(() => {
    const { name, title, email, phone, location, linkedin, github, portfolio, summary, experience, education, skills, languages, certifications, projects } = formData;
    const template = templates[selectedTemplate];
    const isClassic = selectedTemplate === 'classic';
    const isSidebar = template.layout === 'sidebar';
    const headerTextColor = template.headerTextColor ?? (template.headerBg !== 'transparent' ? '#ffffff' : template.primaryColor);
    const headerSubTextColor = template.headerSubTextColor ?? (template.headerBg !== 'transparent' ? 'rgba(255,255,255,0.9)' : '#334155');
    
    return `
      <div class="cv-preview${isClassic ? ' cv-preview-classic' : ''}" style="font-family: ${template.fontFamily}; --primary: ${template.primaryColor}; background: ${template.backgroundColor}; color: #1e293b;">
        ${isClassic ? `
          <div class="cv-classic-shell">
            <div class="cv-classic-card">
              <div class="cv-classic-header">
                <div style="max-width: 640px;">
                  <h1>${name || 'Your Name'}</h1>
                  <p>${title || 'Professional Title'}</p>
                </div>
                <div class="cv-classic-contacts">
                  ${location ? `<span class="contact-item"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#location"/></svg>${location}</span>` : ''}
                  ${email ? `<span class="contact-item"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#email"/></svg><a href="mailto:${email}">${email}</a></span>` : ''}
                  ${phone ? `<span class="contact-item"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#phone"/></svg>${phone}</span>` : ''}
                  ${linkedin ? `<span class="contact-item"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#linkedin"/></svg><a href="${linkedin}" target="_blank">LinkedIn</a></span>` : ''}
                  ${github ? `<span class="contact-item"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#github"/></svg><a href="${github}" target="_blank">GitHub</a></span>` : ''}
                  ${portfolio ? `<span class="contact-item"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#globe"/></svg><a href="${portfolio}" target="_blank">Portfolio</a></span>` : ''}
                </div>
                ${Array.isArray(skills) && skills.length > 0 ? `
                  <div class="cv-classic-skills">
                    ${skills.map(skill => `<span class="cv-classic-skill">${skill}</span>`).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="cv-classic-body">
                ${summary ? `<section class="cv-classic-section"><h3 class="cv-classic-section-title">Summary</h3><p>${summary}</p></section>` : ''}
                ${Array.isArray(experience) && experience.length > 0 ? `<section class="cv-classic-section"><h3 class="cv-classic-section-title">Experience</h3>${experience.map(exp => `<div class="cv-classic-item"><h4>${exp.position || 'Position'}</h4><p style="font-weight:500; color:#334155; margin-bottom:0.35rem;">${exp.company || 'Company'}</p><div class="date-range">${exp.startDate || ''} - ${exp.endDate || 'Present'}${exp.location ? ` · ${exp.location}` : ''}</div>${exp.description ? `<p style="line-height:1.75; color:#334155; margin-top:0.75rem;">${exp.description}</p>` : ''}</div>`).join('')}</section>` : ''}
                ${Array.isArray(education) && education.length > 0 ? `<section class="cv-classic-section"><h3 class="cv-classic-section-title">Education</h3>${education.map(edu => `<div class="cv-classic-item"><h4>${edu.degree || 'Degree'} in ${edu.field || 'Field'}</h4><p style="font-weight:500; color:#334155; margin-bottom:0.35rem;">${edu.institution || 'Institution'}</p><div class="date-range">${edu.graduationDate || ''}${edu.location ? ` · ${edu.location}` : ''}${edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div></div>`).join('')}</section>` : ''}
                ${Array.isArray(projects) && projects.length > 0 ? `<section class="cv-classic-section"><h3 class="cv-classic-section-title">Projects</h3>${projects.map(proj => `<div class="cv-classic-item"><h4>${proj.name}${proj.url ? ` <a href="${proj.url}" target="_blank" style="color:${template.primaryColor}; text-decoration:none;">🔗</a>` : ''}</h4><p style="line-height:1.75; color:#334155; margin-top:0.5rem;">${proj.description || ''}</p>${proj.tech ? `<div class="date-range">Tech: ${proj.tech}</div>` : ''}</div>`).join('')}</section>` : ''}
                ${Array.isArray(languages) && languages.length > 0 ? `<section class="cv-classic-section"><h3 class="cv-classic-section-title">Languages</h3><p>${languages.map(l => `${l.name} (${l.proficiency})`).join(', ')}</p></section>` : ''}
                ${Array.isArray(certifications) && certifications.length > 0 ? `<section class="cv-classic-section"><h3 class="cv-classic-section-title">Certifications</h3>${certifications.map(cert => `<div class="cv-classic-item"><h4>${cert.name}</h4><div class="date-range">${cert.issuer}${cert.date ? ` · ${cert.date}` : ''}</div></div>`).join('')}</section>` : ''}
              </div>
            </div>
          </div>
        ` : isSidebar ? `
        <div style="display: grid; grid-template-columns: 280px 1fr; min-height: 100vh;">
          <!-- Sidebar -->
          <div style="background: ${template.sidebarBg || template.headerBg}; color: ${template.headerTextColor || '#1e293b'}; padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
            <h1 style="font-size: 2rem; margin-bottom: 0.5rem; font-weight: 700; line-height: 1.2;">${name || 'Your Name'}</h1>
            <h2 style="font-size: 1.1rem; font-weight: 400; opacity: 0.9; margin-bottom: 2rem;">${title || 'Professional Title'}</h2>
            <div class="cv-contacts" style="flex-direction: column; gap: 1rem; width: 100%;">
              ${location ? `<span class="contact-item" style="justify-content: center;"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#location"/></svg>${location}</span>` : ''}
              ${email ? `<span class="contact-item" style="justify-content: center;"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#email"/></svg><a href="mailto:${email}" style="color: inherit;">${email}</a></span>` : ''}
              ${phone ? `<span class="contact-item" style="justify-content: center;"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#phone"/></svg>${phone}</span>` : ''}
              ${linkedin ? `<span class="contact-item" style="justify-content: center;"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#linkedin"/></svg><a href="${linkedin}" target="_blank" style="color: inherit;">LinkedIn</a></span>` : ''}
              ${github ? `<span class="contact-item" style="justify-content: center;"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#github"/></svg><a href="${github}" target="_blank" style="color: inherit;">GitHub</a></span>` : ''}
              ${portfolio ? `<span class="contact-item" style="justify-content: center;"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#globe"/></svg><a href="${portfolio}" target="_blank" style="color: inherit;">Portfolio</a></span>` : ''}
            </div>
            
            ${Array.isArray(skills) && skills.length > 0 ? `
              <div style="margin-top: 3rem; width: 100%; text-align: left;">
                <h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; opacity: 0.7;">Skills</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; justify-content: center;">
                  ${skills.map(skill => `<span class="skill-tag" style="background: ${template.primaryColor}; color: white; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 500;">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            
            ${Array.isArray(languages) && languages.length > 0 ? `
              <div style="margin-top: 2rem; width: 100%; text-align: left;">
                <h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; opacity: 0.7;">Languages</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  ${languages.map(l => `<div style="font-size: 0.85rem; opacity: 0.9;">${l.name} <span style="opacity: 0.6;">(${l.proficiency})</span></div>`).join('')}
                </div>
              </div>
            ` : ''}
            
            ${Array.isArray(certifications) && certifications.length > 0 ? `
              <div style="margin-top: 2rem; width: 100%; text-align: left;">
                <h3 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; opacity: 0.7;">Certifications</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  ${certifications.map(cert => `<div style="font-size: 0.8rem; opacity: 0.9;">${cert.name}<br><span style="opacity: 0.6;">${cert.issuer} ${cert.date ? `· ${cert.date}` : ''}</span></div>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Main Content -->
          <div style="padding: 3rem;">
            ${summary ? `<div class="cv-section"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.primaryColor};">Summary</h3><p style="line-height: 1.7;">${summary}</p></div>` : ''}
            ${Array.isArray(experience) && experience.length > 0 ? `<div class="cv-section"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.primaryColor};">Experience</h3>${experience.map(exp => `<div class="cv-item" style="margin-bottom: ${template.sectionSpacing}; padding-left: 1.5rem; border-left: 3px solid ${template.primaryColor};"><h4 style="font-size: 1.1rem; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 0.25rem;">${exp.position || 'Position'}</h4><p style="font-weight: 500; color: #334155;">${exp.company || 'Company'}</p><p class="date-range" style="color: #64748b; font-size: 0.9rem; margin-bottom: 0.75rem;">${exp.startDate || ''} - ${exp.endDate || 'Present'} ${exp.location ? `· ${exp.location}` : ''}</p>${exp.description ? `<p style="line-height: 1.7; color: #334155;">${exp.description}</p>` : ''}</div>`).join('')}</div>` : ''}
            ${Array.isArray(education) && education.length > 0 ? `<div class="cv-section"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.primaryColor};">Education</h3>${education.map(edu => `<div class="cv-item" style="margin-bottom: ${template.sectionSpacing}; padding-left: 1.5rem; border-left: 3px solid ${template.primaryColor};"><h4 style="font-size: 1.1rem; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 0.25rem;">${edu.degree || 'Degree'} in ${edu.field || 'Field'}</h4><p style="font-weight: 500; color: #334155;">${edu.institution || 'Institution'}</p><p class="date" style="color: #64748b; font-size: 0.9rem;">${edu.graduationDate || ''} ${edu.location ? `· ${edu.location}` : ''} ${edu.gpa ? `· GPA: ${edu.gpa}` : ''}</p></div>`).join('')}</div>` : ''}
            ${Array.isArray(projects) && projects.length > 0 ? `<div class="cv-section"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.primaryColor};">Projects</h3>${projects.map(proj => `<div class="cv-item" style="margin-bottom: ${template.sectionSpacing}; padding-left: 1.5rem; border-left: 3px solid ${template.primaryColor};"><h4 style="font-size: 1.1rem; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 0.25rem;">${proj.name}${proj.url ? ` <a href="${proj.url}" target="_blank" style="font-size:0.8em;color:${template.primaryColor}">🔗</a>` : ''}</h4><p style="line-height: 1.7; color: #334155;">${proj.description}</p><p class="date" style="color: #64748b; font-size: 0.85rem;">${proj.tech ? `Tech: ${proj.tech}` : ''}</p></div>`).join('')}</div>` : ''}
          </div>
        </div>
        ` : `
        <!-- Single Column Layout (Modern, Classic, Minimal) -->
        <div style="max-width: 800px; margin: 0 auto; padding: 2.5rem;">
          <div class="cv-header" style="text-align: ${template.headerStyle === 'centered' ? 'center' : 'left'}; margin-bottom: ${template.sectionSpacing}; padding-bottom: 1.5rem; ${template.headerBg !== 'transparent' ? `background: ${template.headerBg}; padding: 2rem; border-radius: 12px; margin: -2.5rem -2.5rem ${template.sectionSpacing}; border: 1px solid rgba(15, 23, 42, 0.08);` : ''}">
            <h1 style="font-size: 2.5rem; color: ${headerTextColor}; margin-bottom: 0.5rem; font-weight: 700;">${name || 'Your Name'}</h1>
            <h2 style="font-size: 1.5rem; color: ${headerSubTextColor}; font-weight: 400; margin-bottom: 1rem;">${title || 'Professional Title'}</h2>
            <div class="cv-contacts" style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: ${template.headerStyle === 'centered' ? 'center' : 'flex-start'};">
              ${location ? `<span class="contact-item" style="display: flex; align-items: center; gap: 0.4rem; color: ${template.headerBg !== 'transparent' ? 'rgba(255,255,255,0.9)' : '#64748b'}; font-size: 0.9rem;"><svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><use href="/icons/sprite.svg#location"/></svg>${location}</span>` : ''}
              ${email ? `<span class="contact-item" style="display: flex; align-items: center; gap: 0.4rem; color: ${template.headerBg !== 'transparent' ? 'rgba(255,255,255,0.9)' : '#64748b'}; font-size: 0.9rem;"><svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><use href="/icons/sprite.svg#email"/></svg><a href="mailto:${email}" style="color: inherit;">${email}</a></span>` : ''}
              ${phone ? `<span class="contact-item" style="display: flex; align-items: center; gap: 0.4rem; color: ${template.headerBg !== 'transparent' ? 'rgba(255,255,255,0.9)' : '#64748b'}; font-size: 0.9rem;"><svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><use href="/icons/sprite.svg#phone"/></svg>${phone}</span>` : ''}
              ${linkedin ? `<span class="contact-item" style="display: flex; align-items: center; gap: 0.4rem; color: ${template.headerBg !== 'transparent' ? 'rgba(255,255,255,0.9)' : '#64748b'}; font-size: 0.9rem;"><svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><use href="/icons/sprite.svg#linkedin"/></svg><a href="${linkedin}" target="_blank" style="color: inherit;">LinkedIn</a></span>` : ''}
              ${github ? `<span class="contact-item" style="display: flex; align-items: center; gap: 0.4rem; color: ${template.headerBg !== 'transparent' ? 'rgba(255,255,255,0.9)' : '#64748b'}; font-size: 0.9rem;"><svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><use href="/icons/sprite.svg#github"/></svg><a href="${github}" target="_blank" style="color: inherit;">GitHub</a></span>` : ''}
              ${portfolio ? `<span class="contact-item" style="display: flex; align-items: center; gap: 0.4rem; color: ${template.headerBg !== 'transparent' ? 'rgba(255,255,255,0.9)' : '#64748b'}; font-size: 0.9rem;"><svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><use href="/icons/sprite.svg#globe"/></svg><a href="${portfolio}" target="_blank" style="color: inherit;">Portfolio</a></span>` : ''}
            </div>
          </div>
          
          ${summary ? `<div class="cv-section" style="margin-bottom: ${template.sectionSpacing};"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; ${template.sectionStyle === 'bordered' ? 'border-left: 4px solid ' + template.primaryColor + '; padding-left: 1rem;' : template.sectionStyle === 'underlined' ? 'border-bottom: 2px solid ' + template.primaryColor + '; padding-bottom: 0.5rem;' : ''}">Summary</h3><p style="line-height: 1.7;">${summary}</p></div>` : ''}
          
          ${Array.isArray(experience) && experience.length > 0 ? `<div class="cv-section" style="margin-bottom: ${template.sectionSpacing};"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; ${template.sectionStyle === 'bordered' ? 'border-left: 4px solid ' + template.primaryColor + '; padding-left: 1rem;' : template.sectionStyle === 'underlined' ? 'border-bottom: 2px solid ' + template.primaryColor + '; padding-bottom: 0.5rem;' : ''}">Experience</h3>${experience.map(exp => `<div class="cv-item" style="margin-bottom: ${template.sectionSpacing}; padding-left: 1.5rem; border-left: 3px solid ${template.primaryColor};"><h4 style="font-size: 1.1rem; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 0.25rem;">${exp.position || 'Position'}</h4><p style="font-weight: 500; color: #334155;">${exp.company || 'Company'}</p><p class="date-range" style="color: #64748b; font-size: 0.9rem; margin-bottom: 0.75rem;">${exp.startDate || ''} - ${exp.endDate || 'Present'} ${exp.location ? `· ${exp.location}` : ''}</p>${exp.description ? `<p style="line-height: 1.7; color: #334155;">${exp.description}</p>` : ''}</div>`).join('')}</div>` : ''}
          
          ${Array.isArray(education) && education.length > 0 ? `<div class="cv-section" style="margin-bottom: ${template.sectionSpacing};"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; ${template.sectionStyle === 'bordered' ? 'border-left: 4px solid ' + template.primaryColor + '; padding-left: 1rem;' : template.sectionStyle === 'underlined' ? 'border-bottom: 2px solid ' + template.primaryColor + '; padding-bottom: 0.5rem;' : ''}">Education</h3>${education.map(edu => `<div class="cv-item" style="margin-bottom: ${template.sectionSpacing}; padding-left: 1.5rem; border-left: 3px solid ${template.primaryColor};"><h4 style="font-size: 1.1rem; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 0.25rem;">${edu.degree || 'Degree'} in ${edu.field || 'Field'}</h4><p style="font-weight: 500; color: #334155;">${edu.institution || 'Institution'}</p><p class="date" style="color: #64748b; font-size: 0.9rem;">${edu.graduationDate || ''} ${edu.location ? `· ${edu.location}` : ''} ${edu.gpa ? `· GPA: ${edu.gpa}` : ''}</p></div>`).join('')}</div>` : ''}
          
          ${Array.isArray(skills) && skills.length > 0 ? `<div class="cv-section" style="margin-bottom: ${template.sectionSpacing};"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; ${template.sectionStyle === 'bordered' ? 'border-left: 4px solid ' + template.primaryColor + '; padding-left: 1rem;' : template.sectionStyle === 'underlined' ? 'border-bottom: 2px solid ' + template.primaryColor + '; padding-bottom: 0.5rem;' : ''}">Skills</h3><div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">${skills.map(skill => `<span class="skill-tag" style="background: ${template.primaryColor}; color: white; padding: 0.2rem 0.55rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 500; display: inline-flex; align-items: center;">${skill}</span>`).join('')}</div></div>` : ''}
          
          ${Array.isArray(languages) && languages.length > 0 ? `<div class="cv-section" style="margin-bottom: ${template.sectionSpacing};"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; ${template.sectionStyle === 'bordered' ? 'border-left: 4px solid ' + template.primaryColor + '; padding-left: 1rem;' : template.sectionStyle === 'underlined' ? 'border-bottom: 2px solid ' + template.primaryColor + '; padding-bottom: 0.5rem;' : ''}">Languages</h3><p style="line-height: 1.7;">${languages.map(l => `${l.name} (${l.proficiency})`).join(', ')}</p></div>` : ''}
          
          ${Array.isArray(certifications) && certifications.length > 0 ? `<div class="cv-section" style="margin-bottom: ${template.sectionSpacing};"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; ${template.sectionStyle === 'bordered' ? 'border-left: 4px solid ' + template.primaryColor + '; padding-left: 1rem;' : template.sectionStyle === 'underlined' ? 'border-bottom: 2px solid ' + template.primaryColor + '; padding-bottom: 0.5rem;' : ''}">Certifications</h3>${certifications.map(cert => `<div class="cv-item" style="margin-bottom: 1rem; padding-left: 1.5rem; border-left: 3px solid ${template.primaryColor};"><h4 style="font-size: 1rem; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 0.25rem;">${cert.name}</h4><p style="color: #334155;">${cert.issuer} ${cert.date ? `· ${cert.date}` : ''}</p></div>`).join('')}</div>` : ''}
          
          ${Array.isArray(projects) && projects.length > 0 ? `<div class="cv-section"><h3 style="font-size: 1.1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${template.primaryColor}; margin-bottom: 1rem; ${template.sectionStyle === 'bordered' ? 'border-left: 4px solid ' + template.primaryColor + '; padding-left: 1rem;' : template.sectionStyle === 'underlined' ? 'border-bottom: 2px solid ' + template.primaryColor + '; padding-bottom: 0.5rem;' : ''}">Projects</h3>${projects.map(proj => `<div class="cv-item" style="margin-bottom: ${template.sectionSpacing}; padding-left: 1.5rem; border-left: 3px solid ${template.primaryColor};"><h4 style="font-size: 1.1rem; font-weight: 600; color: ${template.primaryColor}; margin-bottom: 0.25rem;">${proj.name}${proj.url ? ` <a href="${proj.url}" target="_blank" style="font-size:0.8em;color:${template.primaryColor}">🔗</a>` : ''}</h4><p style="line-height: 1.7; color: #334155;">${proj.description}</p><p class="date" style="color: #64748b; font-size: 0.85rem;">${proj.tech ? `Tech: ${proj.tech}` : ''}</p></div>`).join('')}</div>` : ''}
        </div>
        `}
      </div>
    `;
  }, [formData, selectedTemplate]);

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleArrayChange = (arrayName, index, field, value) => setFormData(prev => { const arr = [...prev[arrayName]]; arr[index] = { ...arr[index], [field]: value }; return { ...prev, [arrayName]: arr }; });
  const MAX_SKILLS = 6;
  const handleSkillsChange = (e) => {
    const parsedSkills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    const newSkills = parsedSkills.slice(0, MAX_SKILLS);
    if (parsedSkills.length > MAX_SKILLS) {
      setSkillWarning(`Max ${MAX_SKILLS} skills allowed. Extra skills were removed.`);
    } else {
      setSkillWarning('');
    }
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };
  const addArrayItem = (arrayName, defaultItem) => setFormData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], defaultItem] }));
  const removeArrayItem = (arrayName, index) => setFormData(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
  const removeSkill = (index) => setFormData(p => ({ ...p, skills: p.skills.filter((_, j) => j !== index) }));

  const handleAI = async (fn, successMsg) => {
    setAiLoading(true); setAiError(null);
    try { const result = await fn(); if (result) {
        if (typeof result === 'object' && !Array.isArray(result)) setFormData(p => ({ ...p, ...result }));
        else if (Array.isArray(result)) setFormData(p => ({
          ...p,
          skills: Array.from(new Set([...p.skills, ...result])).slice(0, MAX_SKILLS)
        }));
        else setFormData(p => ({ ...p, summary: result }));
      } alert(successMsg);
    }
    catch (error) { setAiError(error.message); alert(`AI Error: ${error.message}`); }
    finally { setAiLoading(false); }
  };

  const enhanceWithAI = () => handleAI(() => enhanceCVWithAI(formData), 'CV enhanced!');
  const enhanceSummary = () => handleAI(() => generateSummary(formData), 'Summary enhanced!');
  const enhanceExperience = async (index) => { const exp = formData.experience[index]; if (!exp?.description) return; setAiLoading(true); setAiError(null); try { const updated = await enhanceExperienceDescription(exp); if (updated) setFormData(p => { const arr = [...p.experience]; arr[index] = { ...arr[index], description: updated }; return { ...p, experience: arr }; }); alert('Experience enhanced!'); } catch (e) { setAiError(e.message); alert(`AI Error: ${e.message}`); } finally { setAiLoading(false); }};
  const suggestSkillsAI = () => handleAI(() => suggestSkills(formData), 'Skills suggested!');

  const generateCoverLetterAI = async () => {
    if (!coverLetterData.companyName || !coverLetterData.jobTitle) { alert('Please fill company name and job title'); return; }
    setAiLoading(true); setAiError(null);
    try { const letter = await generateCoverLetter(formData, coverLetterData); setModals({ ...modals, coverLetter: false }); alert(letter); }
    catch (e) { setAiError(e.message); alert(`AI Error: ${e.message}`); } finally { setAiLoading(false); }
  };

  const checkATSScore = () => {
    let score = 0; const checks = [
      { c: formData.name, p: 10 }, { c: formData.title, p: 10 }, { c: formData.email, p: 10 },
      { c: formData.phone, p: 5 }, { c: formData.linkedin, p: 5 },
      { c: formData.summary && formData.summary.length > 50, p: 15 },
      { c: Array.isArray(formData.experience) && formData.experience.length > 0, p: 15 },
      { c: Array.isArray(formData.experience) && formData.experience.some(e => e.description && e.description.length > 100), p: 10 },
      { c: Array.isArray(formData.education) && formData.education.length > 0, p: 10 },
      { c: Array.isArray(formData.skills) && formData.skills.length >= 5, p: 10 },
      { c: Array.isArray(formData.skills) && formData.skills.length >= 10, p: 5 },
    ]; checks.forEach(c => { if (c.c) score += c.p; }); setAtsScore({ score: Math.min(score, 100) }); alert(`ATS Score: ${Math.min(score, 100)}/100`);
  };

  const exportJSON = () => { const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `cv-${formData.name || 'cv'}.json`; a.click(); URL.revokeObjectURL(url); setModals(p => ({ ...p, export: false })); };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow pop-ups to export your CV.'); return; }
    const template = templates[selectedTemplate];
    const html = preview();
    const pageWidth = exportPageSize === 'Letter' ? '216mm' : '210mm';
    const pageHeight = exportPageSize === 'Letter' ? '279mm' : '297mm';
    const printStyles = `:root{--brand:#2563eb;--font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;--font-serif:Georgia,Cambria,'Times New Roman',Times,serif;--font-elegant:'Playfair Display',Georgia,serif}*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:${template.fontFamily};line-height:1.6;color:#1e293b;padding:0;margin:0;background:${template.backgroundColor}}a{color:inherit;text-decoration:none}.cv-preview{width:100%;max-width:100%;margin:0 auto;padding:0}.cv-preview-classic{background:${template.backgroundColor};padding:0}.cv-classic-shell{max-width:900px;margin:0 auto;padding:1.5rem 1rem}.cv-classic-card{background:#ffffff;border-radius:28px;box-shadow:0 24px 60px rgba(15,23,42,0.08);overflow:visible}.cv-classic-header{padding:2.5rem 2.5rem 2rem;border-bottom:1px solid #e5e7eb}.cv-classic-header h1{font-size:2.4rem;margin-bottom:0.5rem;color:${template.primaryColor}}.cv-classic-header p{font-size:1.05rem;color:#475569;line-height:1.6}.cv-classic-contacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.85rem;margin-top:1.75rem}.cv-classic-contacts .contact-item{display:inline-flex;align-items:center;gap:0.65rem;padding:0.75rem 0.95rem;background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;color:#475569;font-size:0.92rem}.cv-classic-contacts .contact-item .icon{width:16px;height:16px;color:${template.primaryColor}}.cv-classic-skills{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1.75rem}.cv-classic-skill{background:${template.primaryColor};color:#ffffff;padding:0.4rem 0.85rem;border-radius:9999px;font-size:0.78rem;font-weight:600;display:inline-flex;align-items:center}.cv-classic-body{padding:2rem 2.5rem 2.5rem;display:grid;gap:1.75rem}.cv-classic-section{padding-top:0.25rem}.cv-classic-section-title{display:inline-block;font-size:0.95rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${template.primaryColor};margin-bottom:1rem;border-bottom:2px solid ${template.primaryColor};padding-bottom:0.35rem}.cv-classic-item h4{font-size:1rem;font-weight:600;color:${template.primaryColor};margin-bottom:0.35rem}.cv-classic-item p{color:#334155;line-height:1.75;margin-bottom:0.5rem}.cv-classic-item .date-range{color:#64748b;font-size:0.9rem}.cv-section{margin-bottom:${template.sectionSpacing}}.cv-section h3{font-size:1.1rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${template.primaryColor};margin-bottom:1rem;${template.sectionStyle === 'bordered' ? 'border-left:4px solid ' + template.primaryColor + ';padding-left:1rem' : template.sectionStyle === 'underlined' ? 'border-bottom:2px solid ' + template.primaryColor + ';padding-bottom:0.5rem' : ''}}.cv-item{margin-bottom:${template.sectionSpacing};padding-left:1.5rem;border-left:3px solid ${template.primaryColor}}.cv-item h4{font-size:1.1rem;font-weight:600;color:${template.primaryColor};margin-bottom:0.25rem}.cv-item p{color:#334155;line-height:1.7;margin-bottom:0.75rem}.date-range,.date{display:block;color:#64748b;font-size:0.9rem;margin-bottom:0.75rem}.skill-tag{display:inline-flex;align-items:center;justify-content:center;gap:0.25rem;margin:0.15rem;padding:0.25rem 0.65rem;background:${template.primaryColor};color:#ffffff;border-radius:9999px;font-size:0.78rem;font-weight:500;line-height:1}.cv-section,.cv-classic-section,.cv-item,.cv-classic-item{break-inside:avoid-page;page-break-inside:avoid;overflow:visible}.cv-preview,.cv-classic-card,body,html{overflow:visible}.export-note{font-size:0.85rem;color:#475569;margin-top:1rem}@page{size:${pageWidth} ${pageHeight};margin:12mm}@media print{body{padding:0;background:white}.cv-preview{box-shadow:none;padding:0}.cv-classic-shell{padding:0}.cv-classic-header{padding:2rem 2rem 1.5rem}.cv-classic-body{padding:2rem}.cv-classic-card{box-shadow:none}}`;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>CV - ${formData.name}</title><style>${printStyles}</style></head><body>${html}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
    setModals(p => ({ ...p, export: false }));
  };

  const exportCoverLetterPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Cover Letter</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui;line-height:1.6;color:#1e293b;padding:2rem;max-width:800px;margin:0 auto}.letter{background:white;padding:3rem;box-shadow:0 4px 12px rgba(0,0,0,0.1)}.letter-header{margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #e2e8f0}.letter-header h2{color:#1e293b;margin-bottom:0.5rem}.letter-header p{color:#64748b}.letter-body{white-space:pre-wrap}@media print{body{padding:0}.letter{box-shadow:none;padding:0}}</style></head><body><div class="letter"><div class="letter-header"><h2>${coverLetterData.companyName}</h2><p>${coverLetterData.jobTitle}</p></div><div class="letter-body">${document.querySelector('#coverLetterPreview')?.value || ''}</div></div></body></html>`);
    printWindow.document.close(); printWindow.focus(); setTimeout(() => printWindow.print(), 250);
  };

  const clearAllData = () => { if (confirm('Clear all CV data? This cannot be undone.')) { localStorage.removeItem(STORAGE_KEY); setFormData(getDefaultFormData()); setAtsScore(null); setModals({ export: false, coverLetter: false, jobMatch: false, applications: false, versions: false, analytics: false, settings: false, import: false }); }};

  const importLinkedIn = () => { const mockData = { name: 'John Doe', title: 'Senior Software Engineer', email: 'john.doe@email.com', phone: '+1 (555) 123-4567', location: 'San Francisco, CA', linkedin: 'https://linkedin.com/in/johndoe', github: 'https://github.com/johndoe', portfolio: 'https://johndoe.dev', summary: 'Experienced software engineer with 8+ years building scalable web applications...', experience: [{ company: 'TechCorp Inc.', position: 'Senior Software Engineer', startDate: '2020-01', endDate: 'Present', location: 'San Francisco, CA', description: '• Led team of 5 engineers building microservices architecture\n• Reduced API latency by 40% through caching optimization\n• Mentored junior developers and conducted code reviews' }, { company: 'StartupXYZ', position: 'Software Engineer', startDate: '2017-06', endDate: '2019-12', location: 'Remote', description: '• Built RESTful APIs serving 1M+ daily requests\n• Implemented CI/CD pipelines reducing deployment time by 60%' }], education: [{ institution: 'Stanford University', degree: 'Master of Science', field: 'Computer Science', graduationDate: '2017-06', location: 'Stanford, CA', gpa: '3.9' }], skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Redis', 'CI/CD'], languages: [{ name: 'English', proficiency: 'Native' }, { name: 'Spanish', proficiency: 'Professional' }], certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: '2021-03' }], projects: [{ name: 'Open Source Library', description: 'Popular npm package with 10k+ weekly downloads', tech: 'TypeScript, Node.js', url: 'https://github.com/johndoe/lib' }] }; setFormData(mockData); alert('Mock LinkedIn data imported!'); setModals(p => ({ ...p, import: false })); };

  const openModal = (name) => setModals(p => ({ ...p, [name]: true }));
  const closeModal = (name) => setModals(p => ({ ...p, [name]: false }));

  const syncToBackend = async () => {
    setAiLoading(true); setAiError(null);
    try {
      const res = await fetch(`${API_BASE}/cvs/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(formData) });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json(); setCvId(data.id); setSynced(true); alert('CV synced to backend!');
    } catch (e) { setAiError(e.message); alert(`Sync failed: ${e.message}`); }
    finally { setAiLoading(false); }
  };

  const loadFromBackend = async (id) => {
    setAiLoading(true); setAiError(null);
    try {
      const res = await fetch(`${API_BASE}/cvs/${id}/`, { credentials: 'include' });
      if (!res.ok) throw new Error('Load failed');
      const data = await res.json(); setFormData(data); setCvId(data.id); setSynced(true); alert('CV loaded from backend!');
    } catch (e) { setAiError(e.message); alert(`Load failed: ${e.message}`); }
    finally { setAiLoading(false); }
  };

  const analyzeJobMatch = async () => {
    if (!jobMatchData.description) { alert('Please paste job description'); return; }
    setAiLoading(true); setAiError(null);
    try { const result = matchJobToCV(jobMatchData.description, formData); setJobMatchResult(result); }
    catch (e) { setAiError(e.message); alert(`AI Error: ${e.message}`); }
    finally { setAiLoading(false); }
  };

  const saveApplication = () => {
    if (!jobMatchData.company || !jobMatchData.title) { alert('Please fill company and title'); return; }
    const app = { id: Date.now(), ...jobMatchData, cvData: formData, matchResult: jobMatchResult, status: 'applied', date: new Date().toISOString().split('T')[0] };
    const updated = [...applications, app]; setApplications(updated); localStorage.setItem('job-applications', JSON.stringify(updated)); setModals(p => ({ ...p, jobMatch: false })); alert('Application saved!');
  };

  const tabs = [{ id: 'basics', label: 'Basics' }, { id: 'summary', label: 'Summary' }, { id: 'experience', label: 'Experience' }, { id: 'education', label: 'Education' }, { id: 'skills', label: 'Skills' }, { id: 'more', label: 'More' }];

  const skillTagStyle = { background: 'var(--brand)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' };
  const removeBtnStyle = { background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: '0.25rem', fontSize: '1rem' };

  const renderExperience = () => formData.experience.map((exp, index) => (
    <div key={index} className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4>Position #{index + 1}</h4>
        <button type="button" onClick={() => removeArrayItem('experience', index)} className="btn-icon">Remove</button>
      </div>
      <div className="form-row">
        <div><label>Company</label><input type="text" value={exp.company || ''} onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)} placeholder="Company name" /></div>
        <div><label>Position</label><input type="text" value={exp.position || ''} onChange={(e) => handleArrayChange('experience', index, 'position', e.target.value)} placeholder="Job title" /></div>
      </div>
      <div className="form-row">
        <div><label>Location</label><input type="text" value={exp.location || ''} onChange={(e) => handleArrayChange('experience', index, 'location', e.target.value)} placeholder="City, Country" /></div>
        <div><label>Dates</label><input type="text" value={`${exp.startDate || ''} - ${exp.endDate || 'Present'}`} onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value.split(' - ')[0])} placeholder="Start - End" /></div>
      </div>
      <div className="form-group"><label>Description</label><textarea value={exp.description || ''} onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)} rows="4" placeholder="Key achievements and responsibilities..." /></div>
      <button type="button" onClick={() => enhanceExperience(index)} className="btn-secondary" disabled={aiLoading} style={{ width: 'auto', marginTop: '0.5rem' }}>Enhance with AI</button>
    </div>
  ));

  const renderEducation = () => formData.education.map((edu, index) => (
    <div key={index} className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4>Education #{index + 1}</h4>
        <button type="button" onClick={() => removeArrayItem('education', index)} className="btn-icon">Remove</button>
      </div>
      <div className="form-row">
        <div><label>Institution</label><input type="text" value={edu.institution || ''} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} placeholder="University name" /></div>
        <div><label>Degree</label><input type="text" value={edu.degree || ''} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} placeholder="e.g., Master of Science" /></div>
      </div>
      <div className="form-row">
        <div><label>Field of Study</label><input type="text" value={edu.field || ''} onChange={(e) => handleArrayChange('education', index, 'field', e.target.value)} placeholder="Computer Science" /></div>
        <div><label>Graduation Date</label><input type="text" value={edu.graduationDate || ''} onChange={(e) => handleArrayChange('education', index, 'graduationDate', e.target.value)} placeholder="YYYY-MM" /></div>
      </div>
      <div className="form-row">
        <div><label>Location</label><input type="text" value={edu.location || ''} onChange={(e) => handleArrayChange('education', index, 'location', e.target.value)} placeholder="City, Country" /></div>
        <div><label>GPA</label><input type="text" value={edu.gpa || ''} onChange={(e) => handleArrayChange('education', index, 'gpa', e.target.value)} placeholder="Optional" /></div>
      </div>
    </div>
  ));

  const renderLanguages = () => formData.languages.map((lang, index) => (
    <div key={index} className="form-section" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <input type="text" value={lang.name || ''} onChange={(e) => handleArrayChange('languages', index, 'name', e.target.value)} placeholder="Language" style={{ flex: 1, minWidth: '150px' }} />
      <input type="text" value={lang.proficiency || ''} onChange={(e) => handleArrayChange('languages', index, 'proficiency', e.target.value)} placeholder="Proficiency (e.g., Native, Fluent, Professional)" style={{ flex: 1, minWidth: '150px' }} />
      <button type="button" onClick={() => removeArrayItem('languages', index)} className="btn-icon" style={{ alignSelf: 'flex-end' }}>Remove</button>
    </div>
  ));

  const renderCertifications = () => formData.certifications.map((cert, index) => (
    <div key={index} className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4>Certification #{index + 1}</h4>
        <button type="button" onClick={() => removeArrayItem('certifications', index)} className="btn-icon">Remove</button>
      </div>
      <div className="form-row">
        <div><label>Name</label><input type="text" value={cert.name || ''} onChange={(e) => handleArrayChange('certifications', index, 'name', e.target.value)} placeholder="Certification name" /></div>
        <div><label>Issuer</label><input type="text" value={cert.issuer || ''} onChange={(e) => handleArrayChange('certifications', index, 'issuer', e.target.value)} placeholder="Issuing organization" /></div>
      </div>
      <div className="form-row">
        <div><label>Date</label><input type="text" value={cert.date || ''} onChange={(e) => handleArrayChange('certifications', index, 'date', e.target.value)} placeholder="YYYY-MM" /></div>
        <div><label>URL</label><input type="text" value={cert.url || ''} onChange={(e) => handleArrayChange('certifications', index, 'url', e.target.value)} placeholder="Verification URL" /></div>
      </div>
    </div>
  ));

  const renderProjects = () => formData.projects.map((proj, index) => (
    <div key={index} className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4>Project #{index + 1}</h4>
        <button type="button" onClick={() => removeArrayItem('projects', index)} className="btn-icon">Remove</button>
      </div>
      <div className="form-row">
        <div><label>Name</label><input type="text" value={proj.name || ''} onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)} placeholder="Project name" /></div>
        <div><label>URL</label><input type="text" value={proj.url || ''} onChange={(e) => handleArrayChange('projects', index, 'url', e.target.value)} placeholder="https://..." /></div>
      </div>
      <div className="form-group"><label>Description</label><textarea value={proj.description || ''} onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)} rows="3" placeholder="Project description..." /></div>
      <div className="form-group"><label>Technologies</label><input type="text" value={proj.tech || ''} onChange={(e) => handleArrayChange('projects', index, 'tech', e.target.value)} placeholder="React, Node.js, PostgreSQL, etc." /></div>
    </div>
  ));

  const renderSkillTags = () => formData.skills.map((skill, i) => (
    <span key={i} style={skillTagStyle}>{skill}<button type="button" onClick={() => removeSkill(i)} style={removeBtnStyle}>×</button></span>
  ));

  const templatePreviewStyles = {
      modern: {
        backgroundColor: '#ffffff',
        headerBg: '#2563eb',
        headerTextColor: '#ffffff',
        primaryColor: '#2563eb'
      },
      classic: {
        backgroundColor: '#fafafa',
        headerBg: '#f8f8f8',
        headerTextColor: '#1a1a2e',
        primaryColor: '#1a1a2e'
      },
      minimal: {
        backgroundColor: '#ffffff',
        headerBg: 'transparent',
        headerTextColor: '#000000',
        primaryColor: '#000000'
      },
      elegant: {
        backgroundColor: '#ffffff',
        headerBg: '#7c2d12',
        headerTextColor: '#ffffff',
        primaryColor: '#7c2d12'
      }
    };

    return (
      <ErrorBoundary>
        <div className="app">
          <div className="app-header-shell">
          <header className="header">
            <div className="header-top">
              <h1>CV Builder</h1>
              <button className="btn-secondary template-select-btn" onClick={() => openModal('templateSelect')}>
                              <svg className="icon" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}><use href="/icons/sprite.svg#layout"/></svg>
                              {templates[selectedTemplate].name}
                            </button>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={enhanceWithAI} disabled={aiLoading}>{aiLoading ? 'Processing...' : 'Enhance CV'}</button>
              {/* <button className="btn-secondary" onClick={checkATSScore}>ATS Score</button> */}
              {/* <button className="btn-secondary" onClick={() => openModal('jobMatch')}>Job Match</button> */}
              <button className="btn-secondary" onClick={() => openModal('applications')}>Applications</button>
              <button className="btn-secondary" onClick={() => openModal('versions')}>Versions</button>
              <button className="btn-secondary" onClick={() => openModal('analytics')}>Analytics</button>
              <button className="btn-icon" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? 'Light mode' : 'Dark mode'}>{darkMode ? '☀️' : '🌙'}</button>
              <span className="sync-status">{synced ? '✓ Synced' : 'Local only'}</span>
              {aiError && <span className="error-toast">{aiError}</span>}
            </div>
          </header>

        <nav className="tab-bar" role="tablist">
          {tabs.map(tab => (
          <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
          </div>

        <main className="main-layout">
          <aside className="form-panel">
            <form>
              {activeTab === 'basics' && (
                <>
                  <div className="form-section"><h3>Personal Information</h3>
                    <div className="form-row">
                      <div><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" /></div>
                      <div><label>Professional Title</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Senior Software Engineer" /></div>
                    </div>
                    <div className="form-row">
                      <div><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" /></div>
                      <div><label>Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" /></div>
                    </div>
                    <div className="form-row">
                      <div><label>Location</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="San Francisco, CA" /></div>
                    </div>
                    <div className="form-row">
                      <div><label>LinkedIn</label><input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." /></div>
                      <div><label>GitHub</label><input type="url" name="github" value={formData.github} onChange={handleInputChange} placeholder="https://github.com/..." /></div>
                    </div>
                    <div className="form-row">
                      <div><label>Portfolio</label><input type="url" name="portfolio" value={formData.portfolio} onChange={handleInputChange} placeholder="https://yourportfolio.com" /></div>
                    </div>
                    <button type="button" onClick={importLinkedIn} className="btn-secondary" style={{ width: 'auto', marginTop: '1rem' }}>Import from LinkedIn</button>
                    <button type="button" onClick={syncToBackend} className="btn-secondary" style={{ width: 'auto', marginTop: '0.5rem' }} disabled={synced || aiLoading}>{synced ? 'Synced' : 'Sync to Backend'}</button>
                  </div>
                </>
              )}

              {activeTab === 'summary' && (
                <div className="form-section"><h3>Professional Summary</h3>
                  <div className="form-group"><label>Summary</label><textarea name="summary" value={formData.summary} onChange={handleInputChange} rows="6" placeholder="Write a compelling summary of your experience and career goals..." /></div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={enhanceSummary} className="btn-secondary" disabled={aiLoading}>{aiLoading ? 'Enhancing...' : 'Enhance with AI'}</button>
                    <button type="button" onClick={() => handleAI(() => generateSummary(formData), 'Summary generated!')} className="btn-secondary" disabled={aiLoading}>Generate New</button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Tip: Keep it concise (3-4 sentences). Highlight your key achievements and what you bring to the table.</p>
                </div>
              )}

              {activeTab === 'experience' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Work Experience</h3>
                    <button type="button" onClick={() => addArrayItem('experience', { company: '', position: '', location: '', startDate: '', endDate: 'Present', description: '' })} className="btn-primary" style={{ width: 'auto' }}>Add Position</button>
                  </div>
                  {renderExperience()}
                </>
              )}

              {activeTab === 'education' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Education</h3>
                    <button type="button" onClick={() => addArrayItem('education', { institution: '', degree: '', field: '', location: '', graduationDate: '', gpa: '' })} className="btn-primary" style={{ width: 'auto' }}>Add Education</button>
                  </div>
                  {renderEducation()}
                </>
              )}

              {activeTab === 'skills' && (
                <div className="form-section"><h3>Skills</h3>
                  <div className="form-group"><label>Skills (comma separated)</label><input type="text" value={formData.skills.join(', ')} onChange={handleSkillsChange} placeholder="JavaScript, React, Node.js, Python, AWS" /></div>
                  {skillWarning && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{skillWarning}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '60px', padding: '0.5rem', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>{renderSkillTags()}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button type="button" onClick={suggestSkillsAI} className="btn-secondary" disabled={aiLoading}>{aiLoading ? 'Suggesting...' : 'Suggest Skills'}</button>
                    <button type="button" onClick={() => handleAI(() => suggestSkills(formData), 'Skills added!')} className="btn-secondary" disabled={aiLoading}>Add Trending</button>
                  </div>
                  {skillAnalysis && (
                    <div className="skill-analysis" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '0.75rem' }}>Skill Analysis</h4>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Categorized:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {Object.entries(skillAnalysis.categorized).map(([cat, skills]) => (
                            <span key={cat} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--brand)', color: 'white', borderRadius: '4px' }}>{cat}: {skills.join(', ')}</span>
                          ))}
                        </div>
                      </div>
                      {skillAnalysis.gaps.length > 0 && (
                        <div><strong>Gaps for {targetRole}:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {skillAnalysis.gaps.map(g => <span key={g} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--warning)', color: 'white', borderRadius: '4px' }}>{g}</span>)}
                          </div>
                        </div>
                      )}
                      {skillAnalysis.recommended.length > 0 && (
                        <div><strong>Recommended:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {skillAnalysis.recommended.map(r => <span key={r} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--success)', color: 'white', borderRadius: '4px' }}>{r}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="form-group" style={{ marginTop: '1.5rem' }}><label>Target Role</label><select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}><option value="fullstack">Full Stack Developer</option><option value="frontend">Frontend Developer</option><option value="backend">Backend Developer</option><option value="devops">DevOps Engineer</option><option value="data">Data Scientist</option><option value="mobile">Mobile Developer</option><option value="manager">Engineering Manager</option></select></div>
                </div>
              )}

              {activeTab === 'more' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Languages</h3>
                    <button type="button" onClick={() => addArrayItem('languages', { name: '', proficiency: '' })} className="btn-primary" style={{ width: 'auto' }}>Add Language</button>
                  </div>
                  {renderLanguages()}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                    <h3>Certifications</h3>
                    <button type="button" onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '', url: '' })} className="btn-primary" style={{ width: 'auto' }}>Add Certification</button>
                  </div>
                  {renderCertifications()}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
                    <h3>Projects</h3>
                    <button type="button" onClick={() => addArrayItem('projects', { name: '', description: '', tech: '', url: '' })} className="btn-primary" style={{ width: 'auto' }}>Add Project</button>
                  </div>
                  {renderProjects()}
                </>
              )}
            </form>
          </aside>

          <section className="preview-panel">
            <div className="preview-header">
              <h2>CV Preview <span className="template-badge">{templates[selectedTemplate].name}</span></h2>
              <div className="preview-actions">
                <button className="btn-icon" onClick={() => setShowPreview(true)} aria-label="Open full preview">Expand</button>
                <button className="btn-danger btn-icon" onClick={clearAllData} aria-label="Clear all data">Clear</button>
                <button className="btn-secondary" onClick={() => openModal('export')} aria-label="Export CV"><svg class="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#print"/></svg> Export</button>
              </div>
            </div>
            <div className="preview-container">
              <div className="preview-inner" dangerouslySetInnerHTML={{ __html: preview() }} />
            </div>
          </section>
        </main>

        {showPreview && (
          <div className="preview-overlay" onClick={() => setShowPreview(false)}>
            <div className="preview-overlay-content" onClick={(e) => e.stopPropagation()}>
              <button className="preview-close-btn" onClick={() => setShowPreview(false)} aria-label="Close preview">Close</button>
              <div className="preview-overlay-inner" dangerouslySetInnerHTML={{ __html: preview() }} />
            </div>
          </div>
        )}

        {modals.export && (
          <div className="modal-overlay" onClick={() => closeModal('export')}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Export CV</h3><button className="modal-close" onClick={() => closeModal('export')}>×</button></div>
              <div className="modal-body">
                <div className="form-group"><label>Page Size</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {['A4', 'Letter'].map(size => (
                      <button key={size} type="button" className={`btn-secondary ${exportPageSize === size ? 'active' : ''}`} style={{ minWidth: '100px' }} onClick={() => setExportPageSize(size)}>{size}</button>
                    ))}
                  </div>
                </div>
                <div className="export-options-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  <button className="export-option" onClick={exportJSON}><svg className="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#download"/></svg><span>Download JSON</span><small>For backup/import</small></button>
                  <button className="export-option" onClick={exportPDF}><svg className="icon" viewBox="0 0 24 24"><use href="/icons/sprite.svg#print"/></svg><span>Print / Save as PDF</span><small>{`A4 page ${exportPageSize === 'A4' ? 'selected' : 'Letter page selected'}`}</small></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modals.coverLetter && (
          <div className="modal-overlay" onClick={() => closeModal('coverLetter')}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Generate Cover Letter</h3><button className="modal-close" onClick={() => closeModal('coverLetter')}>×</button></div>
              <div className="modal-body">
                <div className="form-group"><label>Company Name</label><input type="text" value={coverLetterData.companyName} onChange={(e) => setCoverLetterData({...coverLetterData, companyName: e.target.value})} placeholder="Company name" /></div>
                <div className="form-group"><label>Job Title</label><input type="text" value={coverLetterData.jobTitle} onChange={(e) => setCoverLetterData({...coverLetterData, jobTitle: e.target.value})} placeholder="Job title" /></div>
                <div className="form-group"><label>Job Description (optional)</label><textarea value={coverLetterData.jobDescription} onChange={(e) => setCoverLetterData({...coverLetterData, jobDescription: e.target.value})} rows="5" placeholder="Paste job description for tailored letter" /></div>
                <button className="btn-primary" onClick={generateCoverLetterAI} disabled={aiLoading} style={{ width: '100%' }}>{aiLoading ? 'Generating...' : 'Generate Cover Letter'}</button>
              </div>
            </div>
          </div>
        )}

        {modals.jobMatch && (
          <div className="modal-overlay" onClick={() => closeModal('jobMatch')}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Job Match Analysis</h3><button className="modal-close" onClick={() => closeModal('jobMatch')}>×</button></div>
              <div className="modal-body">
                <div className="form-group"><label>Company Name</label><input type="text" value={jobMatchData.company} onChange={(e) => setJobMatchData({...jobMatchData, company: e.target.value})} placeholder="Company name" /></div>
                <div className="form-group"><label>Job Title</label><input type="text" value={jobMatchData.title} onChange={(e) => setJobMatchData({...jobMatchData, title: e.target.value})} placeholder="Job title" /></div>
                <div className="form-group"><label>Job Description</label><textarea value={jobMatchData.description} onChange={(e) => setJobMatchData({...jobMatchData, description: e.target.value})} rows="8" placeholder="Paste the full job description here..." /></div>
                <button className="btn-primary" onClick={analyzeJobMatch} disabled={aiLoading || !jobMatchData.description} style={{ width: '100%' }}>{aiLoading ? 'Analyzing...' : 'Analyze Match'}</button>
                {jobMatchResult && (
                  <div className="job-match-result" style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4>Match Score: {jobMatchResult.matchScore || jobMatchResult.score || 0}%</h4>
                      <span className={`score-badge ${(jobMatchResult.matchScore || jobMatchResult.score || 0) >= 70 ? 'high' : (jobMatchResult.matchScore || jobMatchResult.score || 0) >= 40 ? 'medium' : 'low'}`}>
                        {(jobMatchResult.matchScore || jobMatchResult.score || 0) >= 70 ? 'Strong Match' : (jobMatchResult.matchScore || jobMatchResult.score || 0) >= 40 ? 'Moderate Match' : 'Weak Match'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div><strong>Matched Skills:</strong><ul style={{ marginTop: '0.5rem' }}>{(jobMatchResult.matchedSkills || []).map(s => <li key={s}>{s}</li>)}</ul></div>
                      <div><strong>Missing Skills:</strong><ul style={{ marginTop: '0.5rem' }}>{(jobMatchResult.missingSkills || []).map(s => <li key={s}>{s}</li>)}</ul></div>
                      <div><strong>Experience Match:</strong> {jobMatchResult.experienceMatch || jobMatchResult.experience_score || 0}%</div>
                      <div><strong>Recommendations:</strong><ul style={{ marginTop: '0.5rem' }}>{(jobMatchResult.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}</ul></div>
                    </div>
                    <button className="btn-secondary" onClick={saveApplication} style={{ width: 'auto', marginTop: '1rem' }}>Save Application</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {modals.applications && (
          <div className="modal-overlay" onClick={() => closeModal('applications')}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Job Applications</h3><button className="modal-close" onClick={() => closeModal('applications')}>×</button></div>
              <div className="modal-body">
                {applications.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No applications yet. Use Job Match to apply!</p> : (
                  <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
                    {applications.map(app => (
                      <div key={app.id} className="application-card" style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong>{app.title}</strong> at {app.company}
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{app.date} • Match: {app.matchResult?.matchScore || app.matchResult?.score || 0}%</p>
                          </div>
                          <select value={app.status} onChange={(e) => { const updated = applications.map(a => a.id === app.id ? { ...a, status: e.target.value } : a); setApplications(updated); localStorage.setItem('job-applications', JSON.stringify(updated)); }}>
                            <option value="saved">Saved</option><option value="applied">Applied</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {modals.versions && (
          <div className="modal-overlay" onClick={() => closeModal('versions')}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Version History</h3><button className="modal-close" onClick={() => closeModal('versions')}>×</button></div>
              <div className="modal-body">
                {versions.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No versions yet. Changes are auto-saved.</p> : (
                  <div>
                    {versions.slice().reverse().map(v => (
                      <div key={v.id || v.version_number} className="version-item" style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>v{v.version_number}</strong> {v.label && <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{v.label}</span>}
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: v.is_auto ? 'var(--brand)' : 'var(--success)', color: 'white' }}>{v.is_auto ? 'AUTO' : 'MANUAL'}</span>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(v.created_at || v.timestamp).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-secondary" style={{ width: 'auto', padding: '0.4rem 0.75rem' }} onClick={() => { setSelectedVersion(v); setModals(p => ({ ...p, versions: false })); setTimeout(() => restoreVersion(v), 100); }}>Restore</button>
                          <button className="btn-secondary" style={{ width: 'auto', padding: '0.4rem 0.75rem' }} onClick={() => { if (confirm('Delete this version?')) { deleteVersion(v.id); setVersions(getVersions()); } }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {modals.analytics && (
          <div className="modal-overlay" onClick={() => closeModal('analytics')}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Resume Analytics</h3><button className="modal-close" onClick={() => closeModal('analytics')}>×</button></div>
              <div className="modal-body">
                <button className="btn-primary" onClick={() => { const a = analyzeResume(formData); setResumeAnalysis(a); setImprovementPlan(generateImprovementPlan(formData)); setInterviewQuestions(generateInterviewQuestions(formData, targetRole)); setSalaryInsights(generateSalaryInsights(formData)); }} style={{ width: '100%', marginBottom: '1.5rem' }}>Run Full Analysis</button>
                {resumeAnalysis && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4>Overall Score: {resumeAnalysis.overallScore}/100</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                      <div className="metric"><strong>Completeness</strong><span>{resumeAnalysis.completeness}%</span></div>
                      <div className="metric"><strong>Keywords</strong><span>{resumeAnalysis.keywordScore}%</span></div>
                      <div className="metric"><strong>Impact</strong><span>{resumeAnalysis.impactScore}%</span></div>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}><strong>Issues:</strong><ul>{resumeAnalysis.issues.map(i => <li key={i}>{i}</li>)}</ul></div>
                  </div>
                )}
                {improvementPlan && <div style={{ marginTop: '1.5rem' }}><strong>Improvement Plan:</strong><ol>{improvementPlan.map(p => <li key={p}>{p}</li>)}</ol></div>}
                {interviewQuestions && <div style={{ marginTop: '1.5rem' }}><strong>Interview Questions:</strong><ol>{interviewQuestions.map(q => <li key={q}>{q}</li>)}</ol></div>}
                {salaryInsights && <div style={{ marginTop: '1.5rem' }}><strong>Salary Insights:</strong><p>{salaryInsights}</p></div>}
              </div>
            </div>
          </div>
        )}

        {modals.templateSelect && (
          <div className="modal-overlay" onClick={() => closeModal('templateSelect')}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Choose CV Layout</h3><button className="modal-close" onClick={() => closeModal('templateSelect')}>×</button></div>
              <div className="modal-body">
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Select a template to change your CV's visual style. Your content stays the same.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {Object.entries(templates).map(([key, template]) => {
                    const previewStyle = templatePreviewStyles[key];
                    return (
                    <button
                      key={key}
                      onClick={() => { setSelectedTemplate(key); closeModal('templateSelect'); }}
                      className={`template-card ${selectedTemplate === key ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '1.5rem',
                        background: selectedTemplate === key ? 'var(--brand-light)' : 'var(--surface)',
                        border: selectedTemplate === key ? '2px solid var(--brand)' : '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: '120px',
                        background: previewStyle.backgroundColor,
                        borderRadius: 'var(--radius)',
                        marginBottom: '1rem',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid var(--border)'
                      }}>
                        {template.layout === 'sidebar' ? (
                          <div style={{ display: 'flex', height: '100%' }}>
                            <div style={{ width: '35%', background: previewStyle.headerBg, opacity: 0.8 }} />
                            <div style={{ flex: 1, background: previewStyle.backgroundColor }} />
                          </div>
                        ) : (
                          <div style={{ height: '30%', background: previewStyle.headerBg !== 'transparent' ? previewStyle.headerBg : previewStyle.primaryColor, opacity: 0.8 }} />
                        )}
                      </div>
                      <h4 style={{ marginBottom: '0.25rem', color: 'var(--text)', fontSize: '1rem' }}>{template.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {template.layout === 'sidebar' ? 'Sidebar layout with profile' : 'Classic single column'}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {template.fontFamily === 'var(--font-serif)' ? 'Serif font' : template.fontFamily === 'var(--font-elegant)' ? 'Elegant serif' : 'Sans-serif font'}
                      </p>
                    </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {modals.import && (
          <div className="modal-overlay" onClick={() => closeModal('import')}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>Import LinkedIn</h3><button className="modal-close" onClick={() => closeModal('import')}>×</button></div>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>In production, this would use LinkedIn OAuth. For now, we provide mock data.</p>
                <button className="btn-primary" onClick={importLinkedIn} style={{ width: '100%' }}>Import Mock Data</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
