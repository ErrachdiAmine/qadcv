const API_BASE = 'http://localhost:8001/api';

async function callBackend(action, cvData, extra = {}) {
  const response = await fetch(`${API_BASE}/ai/enhance/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action, cv_data: cvData, ...extra })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Backend error: ${response.status}`);
  }
  
  return response.json();
}

export async function enhanceCVWithAI(formData) {
  try {
    const result = await callBackend('enhance_cv', formData);
    const content = result.result || result.raw?.choices?.[0]?.message?.content;
    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        return { ...formData, summary: content };
      }
    }
    return formData;
  } catch (error) {
    console.error('enhanceCVWithAI failed:', error);
    return {
      ...formData,
      summary: formData.summary || 'Professional with experience in ' + (formData.skills.slice(0, 3).join(', ') || 'various technologies')
    };
  }
}

export async function generateSummary(formData) {
  try {
    const result = await callBackend('generate_summary', formData);
    const content = result.result || result.raw?.choices?.[0]?.message?.content;
    return content || fallbackSummary(formData);
  } catch (error) {
    console.error('generateSummary failed:', error);
    return fallbackSummary(formData);
  }
}

function fallbackSummary(formData) {
  const skills = formData.skills.slice(0, 3).join(', ');
  const exp = formData.experience[0];
  return `${formData.title || 'Professional'} with experience in ${skills || 'various technologies'}. ${exp ? `Previously ${exp.position} at ${exp.company}.` : ''} Seeking to leverage expertise in a challenging new role.`;
}

export async function enhanceExperienceDescription(experience) {
  try {
    const result = await callBackend('enhance_experience', experience);
    const content = result.result || result.raw?.choices?.[0]?.message?.content;
    return content || fallbackExperience(experience);
  } catch (error) {
    console.error('enhanceExperienceDescription failed:', error);
    return fallbackExperience(experience);
  }
}

function fallbackExperience(experience) {
  return `• ${experience.description}\n• Collaborated with cross-functional teams to deliver results\n• Improved processes and efficiency in daily operations`;
}

export async function suggestSkills(formData) {
  try {
    const result = await callBackend('suggest_skills', formData, { target_role: formData.title || '' });
    const content = result.result || result.raw?.choices?.[0]?.message?.content;
    if (content) return content.split(',').map(s => s.trim()).filter(s => s).slice(0, 15);
    return fallbackSkills(formData);
  } catch (error) {
    console.error('suggestSkills failed:', error);
    return fallbackSkills(formData);
  }
}

function fallbackSkills(formData) {
  const roleSkills = {
    'software': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Docker', 'Testing', 'Agile', 'Problem Solving'],
    'engineer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Docker', 'Testing', 'Agile', 'Problem Solving'],
    'developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Docker', 'Testing', 'Agile', 'Problem Solving'],
    'data': ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization', 'Statistics', 'AWS', 'Git', 'Communication', 'Problem Solving'],
    'manager': ['Project Management', 'Agile', 'Scrum', 'Team Leadership', 'Strategic Planning', 'Communication', 'Stakeholder Management', 'Budgeting', 'Risk Management', 'Mentoring'],
    'default': ['Communication', 'Problem Solving', 'Teamwork', 'Adaptability', 'Time Management', 'Critical Thinking', 'Leadership', 'Organization', 'Creativity', 'Analytical Thinking']
  };
  
  const title = (formData.title || '').toLowerCase();
  for (const [key, skills] of Object.entries(roleSkills)) {
    if (title.includes(key)) return skills;
  }
  return roleSkills.default;
}

export async function generateCoverLetter(formData, coverLetterData) {
  try {
    const result = await callBackend('generate_cover_letter', formData, {
      company: coverLetterData.companyName,
      title: coverLetterData.jobTitle,
      job_description: coverLetterData.jobDescription
    });
    const content = result.result || result.raw?.choices?.[0]?.message?.content;
    return content || fallbackCoverLetter(formData, coverLetterData);
  } catch (error) {
    console.error('generateCoverLetter failed:', error);
    return fallbackCoverLetter(formData, coverLetterData);
  }
}

function fallbackCoverLetter(formData, coverLetterData) {
  return `Dear Hiring Manager at ${coverLetterData.companyName},

I am writing to express my strong interest in the ${coverLetterData.jobTitle} position. With my background as a ${formData.title} and experience in ${formData.skills.slice(0, 3).join(', ')}, I am confident I can contribute significantly to your team.

In my current role as ${formData.experience[0]?.position || 'professional'} at ${formData.experience[0]?.company || 'my company'}, I have ${formData.experience[0]?.description || 'delivered impactful results'}. This experience has honed my skills in ${formData.skills.slice(0, 5).join(', ')}, which align well with the requirements of this position.

I am particularly drawn to ${coverLetterData.companyName} because of its reputation for innovation and excellence. I would welcome the opportunity to discuss how my experience can benefit your organization.

Thank you for your consideration.

Sincerely,
${formData.name}
${formData.email} | ${formData.phone}`;
}