// Job matching and application tracking utilities
export function matchJobToCV(jobDescription, cvData) {
  const requiredSkills = extractSkillsFromText(jobDescription);
  const cvSkills = cvData.skills?.map(s => s.toLowerCase()) || [];
  const cvExperience = cvData.experience || [];
  const cvEducation = cvData.education || [];
  
  const matchedSkills = requiredSkills.filter(skill => 
    cvSkills.some(cvSkill => cvSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cvSkill))
  );
  
  const missingSkills = requiredSkills.filter(skill => 
    !cvSkills.some(cvSkill => cvSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cvSkill))
  );
  
  // Calculate experience relevance
  const experienceKeywords = extractKeywordsFromExperience(cvExperience);
  const jobKeywords = extractKeywordsFromText(jobDescription);
  const experienceMatch = jobKeywords.filter(kw => 
    experienceKeywords.some(ekw => ekw.includes(kw) || kw.includes(ekw))
  ).length / Math.max(jobKeywords.length, 1);
  
  // Education match
  const educationMatch = cvEducation.some(edu => 
    jobDescription.toLowerCase().includes(edu.field?.toLowerCase() || '') ||
    jobDescription.toLowerCase().includes(edu.degree?.toLowerCase() || '')
  );
  
  const overallScore = Math.round(
    (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 50 +
    (experienceMatch * 30) +
    (educationMatch ? 20 : 0)
  );
  
  return {
    score: Math.min(overallScore, 100),
    matchedSkills,
    missingSkills,
    experienceMatch: Math.round(experienceMatch * 100),
    educationMatch: educationMatch ? 100 : 0,
    recommendation: getRecommendation(overallScore)
  };
}

function extractSkillsFromText(text) {
  const commonSkills = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'go', 'rust', 'react', 'vue', 'angular',
    'node.js', 'express', 'django', 'flask', 'spring', 'postgresql', 'mysql', 'mongodb', 'redis',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'git', 'ci/cd', 'terraform', 'sql', 'nosql',
    'graphql', 'rest', 'grpc', 'microservices', 'agile', 'scrum', 'jira', 'testing', 'tdd',
    'machine learning', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'data analysis', 'tableau'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

function extractKeywordsFromExperience(experience) {
  const keywords = new Set();
  experience.forEach(exp => {
    const text = `${exp.position} ${exp.company} ${exp.description}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    words.forEach(w => keywords.add(w));
  });
  return Array.from(keywords);
}

function extractKeywordsFromText(text) {
  return Array.from(new Set(text.toLowerCase().match(/\b\w{4,}\b/g) || []));
}

function getRecommendation(score) {
  if (score >= 80) return 'Excellent match - Apply with confidence';
  if (score >= 60) return 'Good match - Tailor your CV for this role';
  if (score >= 40) return 'Partial match - Consider upskilling in missing areas';
  return 'Low match - Significant gaps, consider other roles';
}

export function generateApplicationMaterials(jobData, cvData) {
  const match = matchJobToCV(jobData.description, cvData);
  
  return {
    coverLetter: generateCoverLetterForJob(jobData, cvData, match),
    tailoredSkills: [...cvData.skills, ...match.missingSkills.slice(0, 3)],
    priorityExperience: cvData.experience
      .filter(exp => matchJobToCV(jobData.description, { experience: [exp] }).score > 40)
      .slice(0, 3),
    interviewPrep: generateInterviewPrep(jobData, cvData, match)
  };
}

function generateCoverLetterForJob(jobData, cvData, match) {
  return `Dear Hiring Manager at ${jobData.company},

I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}. With my background as a ${cvData.title} and ${cvData.experience.length} years of relevant experience, I am confident I can contribute significantly to your team.

${match.matchedSkills.length > 0 ? 
  `My expertise in ${match.matchedSkills.slice(0, 3).join(', ')} aligns directly with your requirements for this role.` : 
  'My diverse technical background has prepared me well for the challenges of this position.'}

In my current role as ${cvData.experience[0]?.position} at ${cvData.experience[0]?.company}, I have ${cvData.experience[0]?.description?.split('.')[0] || 'delivered impactful results'}. This experience has honed my skills in ${cvData.skills.slice(0, 5).join(', ')}, which I believe would be valuable for ${jobData.company}'s goals.

I am particularly drawn to ${jobData.company} because of its reputation for innovation and excellence in ${jobData.industry || 'your field'}. I would welcome the opportunity to discuss how my experience can benefit your organization.

Thank you for your consideration.

Sincerely,
${cvData.name}
${cvData.email} | ${cvData.phone}`
}

function generateInterviewPrep(jobData, cvData, match) {
  return {
    technicalQuestions: [
      `Walk us through your experience with ${match.matchedSkills[0] || 'your primary skill'}`,
      `How have you used ${match.matchedSkills[1] || 'relevant technology'} in production?`,
      `Describe a challenging project you worked on and how you overcame obstacles.`
    ],
    behavioralQuestions: [
      'Tell us about a time you had to learn a new technology quickly.',
      'Describe a situation where you had to collaborate with a difficult team member.',
      'How do you prioritize tasks when everything seems urgent?'
    ],
    companyResearch: [
      `Research ${jobData.company}'s recent news and products`,
      `Understand their tech stack and architecture`,
      `Prepare questions about team structure and culture`
    ],
    skillsToReview: match.missingSkills.slice(0, 5)
  };
}

export function saveApplication(jobData, cvData, match) {
  const application = {
    id: Date.now().toString(),
    company: jobData.company,
    title: jobData.title,
    appliedDate: new Date().toISOString(),
    matchScore: match.score,
    status: 'Applied',
    materials: generateApplicationMaterials(jobData, cvData)
  };
  
  const existing = JSON.parse(localStorage.getItem('job-applications') || '[]');
  existing.push(application);
  localStorage.setItem('job-applications', JSON.stringify(existing));
  
  return application;
}

export function getApplications() {
  return JSON.parse(localStorage.getItem('job-applications') || '[]');
}

export function updateApplicationStatus(id, status) {
  const applications = getApplications();
  const app = applications.find(a => a.id === id);
  if (app) {
    app.status = status;
    localStorage.setItem('job-applications', JSON.stringify(applications));
  }
  return applications;
}