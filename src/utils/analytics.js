// Resume analytics and insights
export function analyzeResume(formData) {
  const insights = [];
  const warnings = [];
  const suggestions = [];
  
  // Length analysis
  const totalChars = JSON.stringify(formData).length;
  if (totalChars < 500) {
    warnings.push('CV seems quite brief. Consider adding more detail to experience and skills.');
  } else if (totalChars > 5000) {
    suggestions.push('CV is quite long. Consider condensing for better readability.');
  }
  
  // Section completeness
  const sections = {
    basics: ['name', 'title', 'email', 'phone'],
    summary: ['summary'],
    experience: ['experience'],
    education: ['education'],
    skills: ['skills']
  };
  
  const missingSections = [];
  Object.entries(sections).forEach(([section, fields]) => {
    const missing = fields.filter(f => !formData[f] || (Array.isArray(formData[f]) && formData[f].length === 0));
    if (missing.length > 0) {
      missingSections.push(section);
    }
  });
  
  if (missingSections.length > 0) {
    warnings.push(`Missing sections: ${missingSections.join(', ')}`);
  }
  
  // Experience quality
  if (formData.experience && formData.experience.length > 0) {
    const expWithDesc = formData.experience.filter(e => e.description && e.description.length > 50).length;
    const expWithMetrics = formData.experience.filter(e => 
      e.description && /\d+%|\d+\+|\$\d+|\d+\s*(years?|months?)|\d+x/.test(e.description)
    ).length;
    
    if (expWithDesc < formData.experience.length) {
      suggestions.push(`${formData.experience.length - expWithDesc} experience entries lack detailed descriptions.`);
    }
    if (expWithMetrics === 0 && formData.experience.length > 0) {
      suggestions.push('Add quantified achievements (percentages, dollar amounts, time saved) to experience.');
    }
  }
  
  // Skills analysis
  if (formData.skills && formData.skills.length > 0) {
    if (formData.skills.length < 5) {
      warnings.push('Consider adding more skills (aim for 8-15 relevant skills).');
    } else if (formData.skills.length > 20) {
      suggestions.push('Consider grouping or prioritizing skills (20+ may overwhelm recruiters).');
    }
    
    // Check for outdated skills
    const outdatedSkills = ['jQuery', 'Flash', 'ActionScript', 'COBOL', 'Fortran', 'Perl', 'VB6'];
    const foundOutdated = formData.skills.filter(s => outdatedSkills.some(o => o.toLowerCase() === s.toLowerCase()));
    if (foundOutdated.length > 0) {
      warnings.push(`Potentially outdated skills detected: ${foundOutdated.join(', ')}`);
    }
  }
  
  // Contact info
  const contactFields = ['email', 'phone', 'linkedin', 'github', 'portfolio'];
  const hasContact = contactFields.some(f => formData[f]);
  if (!hasContact) {
    warnings.push('No contact information provided. Add at least email and phone.');
  }
  
  // ATS optimization
  const atsKeywords = extractATSKeywords(formData);
  if (atsKeywords.length < 10) {
    suggestions.push('Add more industry-standard keywords for better ATS parsing.');
  }
  
  return {
    score: calculateScore(formData),
    insights,
    warnings,
    suggestions,
    completeness: calculateCompleteness(formData),
    keywordDensity: atsKeywords.length,
    wordCount: estimateWordCount(formData)
  };
}

function calculateScore(formData) {
  let score = 0;
  const maxScore = 100;
  
  // Basics (20 points)
  if (formData.name) score += 5;
  if (formData.title) score += 5;
  if (formData.email) score += 5;
  if (formData.phone) score += 5;
  
  // Summary (10 points)
  if (formData.summary && formData.summary.length > 50) score += 10;
  else if (formData.summary) score += 5;
  
  // Experience (25 points)
  if (formData.experience && formData.experience.length > 0) {
    score += 10;
    const detailed = formData.experience.filter(e => e.description && e.description.length > 100).length;
    score += Math.min(detailed * 5, 15);
  }
  
  // Education (10 points)
  if (formData.education && formData.education.length > 0) score += 10;
  
  // Skills (15 points)
  if (formData.skills && formData.skills.length >= 5) score += 10;
  else if (formData.skills && formData.skills.length > 0) score += 5;
  if (formData.skills && formData.skills.length >= 10) score += 5;
  
  // Extras (15 points)
  if (formData.languages && formData.languages.length > 0) score += 5;
  if (formData.certifications && formData.certifications.length > 0) score += 5;
  if (formData.projects && formData.projects.length > 0) score += 5;
  
  return Math.min(score, maxScore);
}

function calculateCompleteness(formData) {
  const sections = [
    { name: 'Basics', complete: !!(formData.name && formData.title && formData.email && formData.phone) },
    { name: 'Summary', complete: !!(formData.summary && formData.summary.length > 50) },
    { name: 'Experience', complete: !!(formData.experience && formData.experience.length > 0) },
    { name: 'Education', complete: !!(formData.education && formData.education.length > 0) },
    { name: 'Skills', complete: !!(formData.skills && formData.skills.length >= 5) },
    { name: 'Languages', complete: !!(formData.languages && formData.languages.length > 0) },
    { name: 'Certifications', complete: !!(formData.certifications && formData.certifications.length > 0) },
    { name: 'Projects', complete: !!(formData.projects && formData.projects.length > 0) }
  ];
  
  const completed = sections.filter(s => s.complete).length;
  return {
    percentage: Math.round((completed / sections.length) * 100),
    sections
  };
}

function extractATSKeywords(formData) {
  const text = [
    formData.title,
    formData.summary,
    formData.experience?.map(e => e.description).join(' '),
    formData.skills?.join(' '),
    formData.certifications?.map(c => c.name).join(' '),
    formData.projects?.map(p => p.tech).join(' ')
  ].join(' ').toLowerCase();
  
  const commonKeywords = [
    'javascript', 'typescript', 'python', 'java', 'react', 'node', 'aws', 'docker',
    'kubernetes', 'sql', 'nosql', 'git', 'ci/cd', 'agile', 'scrum', 'rest', 'graphql',
    'microservices', 'api', 'database', 'frontend', 'backend', 'fullstack', 'devops',
    'machine learning', 'ai', 'data', 'analytics', 'cloud', 'security', 'testing'
  ];
  
  return commonKeywords.filter(kw => 
    text.includes(kw.toLowerCase())
  );
}

function estimateWordCount(formData) {
  const text = JSON.stringify(formData);
  return Math.round(text.length / 5);
}

export function generateImprovementPlan(formData) {
  const analysis = analyzeResume(formData);
  const plan = [];
  
  // Priority fixes
  analysis.warnings.forEach(w => {
    plan.push({ priority: 'High', action: w, category: 'Fix' });
  });
  
  // Suggestions
  analysis.suggestions.forEach(s => {
    plan.push({ priority: 'Medium', action: s, category: 'Improve' });
  });
  
  // Quick wins
  if (!formData.linkedin) plan.push({ priority: 'High', action: 'Add LinkedIn profile URL', category: 'Contact' });
  if (!formData.github) plan.push({ priority: 'Medium', action: 'Add GitHub profile URL', category: 'Contact' });
  if (!formData.portfolio) plan.push({ priority: 'Medium', action: 'Add portfolio website', category: 'Contact' });
  
  return plan.sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function generateInterviewQuestions(formData, targetRole = 'fullstack') {
  const questions = {
    technical: [
      `Walk me through your experience with ${formData.skills[0] || 'your primary technology'}.`,
      `How have you used ${formData.skills[1] || 'relevant technology'} in production?`,
      `Describe a challenging technical problem you solved recently.`,
      `How do you approach debugging complex issues?`,
      `What's your experience with testing and CI/CD pipelines?`
    ],
    behavioral: [
      'Tell me about a time you had to learn a new technology quickly.',
      'Describe a situation where you disagreed with a team member. How did you handle it?',
      'Tell me about a project that failed. What did you learn?',
      'How do you prioritize tasks when everything seems urgent?',
      'Describe a time you had to explain a complex technical concept to a non-technical stakeholder.'
    ],
    roleSpecific: {
      frontend: [
        'How do you optimize frontend performance?',
        'Explain the virtual DOM and how React uses it.',
        'How do you handle state management in large applications?'
      ],
      backend: [
        'How do you design scalable APIs?',
        'Explain database indexing and when to use it.',
        'How do you handle database migrations in production?'
      ],
      fullstack: [
        'How do you decide between server-side and client-side rendering?',
        'Describe your experience with API design.',
        'How do you ensure security in full-stack applications?'
      ],
      data: [
        'How do you handle missing or dirty data?',
        'Explain your approach to feature engineering.',
        'How do you validate machine learning models?'
      ],
      devops: [
        'How do you implement zero-downtime deployments?',
        'Explain your approach to infrastructure as code.',
        'How do you handle monitoring and alerting?'
      ]
    }
  };
  
  return {
    technical: questions.technical,
    behavioral: questions.behavioral,
    roleSpecific: questions.roleSpecific[targetRole] || questions.roleSpecific.fullstack
  };
}

export function generateSalaryInsights(formData, location = 'US') {
  // Mock salary data - in production would use real API
  const baseSalaries = {
    'Software Engineer': { min: 80000, max: 180000, median: 120000 },
    'Senior Software Engineer': { min: 120000, max: 200000, median: 160000 },
    'Frontend Developer': { min: 70000, max: 150000, median: 110000 },
    'Backend Developer': { min: 80000, max: 170000, median: 125000 },
    'Full Stack Developer': { min: 85000, max: 180000, median: 130000 },
    'Data Scientist': { min: 90000, max: 190000, median: 135000 },
    'DevOps Engineer': { min: 95000, max: 180000, median: 135000 },
    'Engineering Manager': { min: 140000, max: 250000, median: 180000 }
  };
  
  const title = formData.title || 'Software Engineer';
  const salary = baseSalaries[title] || baseSalaries['Software Engineer'];
  
  // Adjust for experience
  const expYears = formData.experience?.reduce((sum, exp) => {
    const start = new Date(exp.startDate || '2020').getFullYear();
    const end = exp.endDate ? new Date(exp.endDate).getFullYear() : new Date().getFullYear();
    return sum + (end - start);
  }, 0) || 3;
  
  const expMultiplier = Math.min(1 + (expYears * 0.05), 1.5);
  
  return {
    title,
    location,
    experienceYears: expYears,
    estimatedRange: {
      min: Math.round(salary.min * expMultiplier),
      max: Math.round(salary.max * expMultiplier),
      median: Math.round(salary.median * expMultiplier)
    },
    percentiles: {
      p25: Math.round(salary.min * expMultiplier * 1.1),
      p50: Math.round(salary.median * expMultiplier),
      p75: Math.round(salary.max * expMultiplier * 0.9),
      p90: Math.round(salary.max * expMultiplier)
    },
    factors: [
      `${expYears} years experience`,
      `${formData.skills?.length || 0} skills listed`,
      `${formData.experience?.length || 0} previous roles`,
      formData.education?.length > 0 ? 'Degree holder' : 'Self-taught/No degree listed'
    ]
  };
}

export function generateNetworkingTips(formData) {
  return [
    `Connect with ${formData.experience[0]?.company || 'former colleagues'} alumni on LinkedIn`,
    `Join ${formData.skills[0] || 'tech'} community groups and forums`,
    `Attend ${formData.skills.slice(0, 3).join(', ')} meetups and conferences`,
    'Share a project or article on LinkedIn monthly',
    'Reach out to 3 hiring managers per week at target companies',
    'Offer to mentor junior developers - builds visibility',
    'Contribute to open source projects in your stack',
    'Write a technical blog post about a problem you solved'
  ];
}