// Client-side Algorithmic AI Engine for Resume Optimization

const ACTION_VERBS = [
  'Architected',
  'Engineered',
  'Spearheaded',
  'Accelerated',
  'Streamlined',
  'Automated',
  'Optimized',
  'Orchestrated',
  'Developed',
  'Pioneered',
  'Delivered',
  'Scaled',
  'Formulated',
  'Synthesized',
];

export function enhanceSummary(formData, lang = 'en') {
  const { title, skills, experience, name } = formData;
  const topSkills = Array.isArray(skills) && skills.length > 0 ? skills.slice(0, 4).join(', ') : 'modern technologies';
  const roleName = title || 'Software Engineer';
  const totalYears = experience?.length > 1 ? '3+' : '2+';

  if (lang === 'ar') {
    return `مهندس برمجيات عالي الكفاءة متخصص في ${topSkills}. أمتلك شغفاً قوياً بتحويل الرؤى والأفكار إلى منتجات رقمية متكاملة وسريعة الاستجابة، مع التركيز على جودة البنية البرمجية، وتجربة المستخدم السلسة، والالتزام بأعلى معايير الأداء والإنتاجية.`;
  }

  if (lang === 'fr') {
    return `Ingénieur logiciel axé sur les résultats avec une solide expérience en ${topSkills}. Passionné par la conception d'architectures modernes, l'optimisation des performances et le déploiement rapide de solutions fiables et évolutives.`;
  }

  return `High-velocity ${roleName} with ${totalYears} years of proven experience leveraging ${topSkills} to engineer performant, scalable digital systems. Adept at translating complex product requirements into reliable production software with obsessive attention to architecture, speed, and user experience.`;
}

export function enhanceBulletPoints(rawText) {
  if (!rawText) return '• Spearheaded core feature development resulting in high user engagement.\n• Optimized application performance and reduced API response latency by 35%.\n• Collaborated with cross-functional stakeholders to deliver milestones on schedule.';

  const lines = rawText.split('\n').filter((l) => l.trim().length > 0);

  const enhanced = lines.map((line) => {
    let clean = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
    if (!clean) return '';

    // Check if starts with a weak word
    const lower = clean.toLowerCase();
    if (lower.startsWith('worked on') || lower.startsWith('responsible for') || lower.startsWith('helped')) {
      const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
      clean = clean.replace(/^(worked on|responsible for|helped with|did|handled)\s+/i, `${verb} `);
    } else if (!ACTION_VERBS.some((v) => clean.startsWith(v))) {
      const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
      clean = `${verb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    }

    // Ensure it starts with bullet
    return `• ${clean}`;
  });

  return enhanced.filter(Boolean).join('\n');
}

export function calculateATSMetrics(formData) {
  let score = 0;
  const feedback = [];

  // Basics check (25 pts)
  if (formData.name) score += 5;
  if (formData.title) score += 5;
  if (formData.email) score += 5;
  if (formData.phone) score += 5;
  if (formData.location || formData.github || formData.linkedin) score += 5;
  else feedback.push('Add GitHub or LinkedIn links for higher recruiter trust.');

  // Summary check (15 pts)
  if (formData.summary && formData.summary.length > 80) {
    score += 15;
  } else {
    feedback.push('Executive summary is too short or missing.');
  }

  // Skills check (20 pts)
  if (Array.isArray(formData.skills) && formData.skills.length >= 8) {
    score += 20;
  } else if (formData.skills?.length >= 4) {
    score += 12;
    feedback.push('Add at least 8 key technical skills to match ATS filters.');
  } else {
    feedback.push('Skills section is sparse. Include more targeted keywords.');
  }

  // Experience check (25 pts)
  if (Array.isArray(formData.experience) && formData.experience.length > 0) {
    score += 15;
    const hasBullets = formData.experience.some((e) => e.description && e.description.includes('•'));
    if (hasBullets) score += 10;
    else feedback.push('Use bullet points starting with strong action verbs in experience.');
  } else {
    feedback.push('Add professional or project experience.');
  }

  // Projects / Education (15 pts)
  if (Array.isArray(formData.education) && formData.education.length > 0) score += 8;
  if (Array.isArray(formData.projects) && formData.projects.length > 0) score += 7;

  return {
    score: Math.min(100, score),
    grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'Needs Polish',
    feedback,
  };
}

export function suggestSkillsForRole(title = '') {
  const t = title.toLowerCase();
  if (t.includes('front') || t.includes('react') || t.includes('ui')) {
    return ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Framer Motion', 'State Management', 'Vite', 'GraphQL'];
  }
  if (t.includes('back') || t.includes('python') || t.includes('django')) {
    return ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs', 'Celery', 'Linux / Bash'];
  }
  if (t.includes('data') || t.includes('ml') || t.includes('ai')) {
    return ['Python', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-Learn', 'LLM Prompting', 'Data Pipelines', 'Vector Databases'];
  }
  return ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'Docker', 'Linux', 'Problem Solving', 'System Design'];
}
