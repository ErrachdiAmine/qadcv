// Skill categories for better organization and gap analysis
export const skillCategories = {
  'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'C++', 'C', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'],
  'Frontend': ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'HTML/CSS', 'SASS/SCSS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Styled Components', 'Redux', 'Zustand', 'React Query'],
  'Backend': ['Node.js', 'Express', 'Fastify', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET Core', 'Laravel', 'Rails', 'NestJS', 'GraphQL', 'REST APIs', 'gRPC', 'WebSockets'],
  'Databases': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'Firebase', 'Supabase', 'Prisma', 'TypeORM', 'Sequelize', 'Mongoose', 'SQLAlchemy'],
  'Cloud & DevOps': ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Vercel', 'Netlify', 'Heroku', 'Linux', 'Nginx'],
  'Data & AI': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Data Visualization', 'SQL', 'Spark', 'Kafka', 'Airflow', 'dbt', 'Tableau', 'Power BI'],
  'Testing': ['Jest', 'Vitest', 'Cypress', 'Playwright', 'Testing Library', 'Mocha', 'Chai', 'Pytest', 'JUnit', 'Selenium', 'E2E Testing', 'Unit Testing', 'Integration Testing'],
  'Tools & Practices': ['Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban', 'Code Review', 'TDD', 'Pair Programming', 'Documentation', 'Technical Writing'],
  'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Expo', 'Ionic', 'Capacitor'],
  'Architecture': ['Microservices', 'Monorepo', 'Event-Driven', 'Serverless', 'Clean Architecture', 'DDD', 'CQRS', 'Event Sourcing', 'System Design'],
  'Security': ['OAuth', 'JWT', 'OIDC', 'Encryption', 'Penetration Testing', 'OWASP', 'Security Auditing', 'Compliance', 'GDPR', 'HIPAA']
};

export function categorizeSkills(skills) {
  const categorized = {};
  const uncategorized = [];
  
  skills.forEach(skill => {
    let found = false;
    for (const [category, categorySkills] of Object.entries(skillCategories)) {
      if (categorySkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push(skill);
        found = true;
        break;
      }
    }
    if (!found) {
      uncategorized.push(skill);
    }
  });
  
  if (uncategorized.length > 0) {
    categorized['Other'] = uncategorized;
  }
  
  return categorized;
}

export function getSkillGaps(currentSkills, targetRole) {
  const roleSkills = {
    'frontend': ['React', 'TypeScript', 'CSS', 'Tailwind CSS', 'Testing', 'Git', 'CI/CD'],
    'backend': ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'Testing', 'Git', 'CI/CD'],
    'fullstack': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'Testing', 'Git'],
    'data': ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Data Visualization', 'Statistics'],
    'devops': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Monitoring'],
    'mobile': ['React Native', 'TypeScript', 'Testing', 'CI/CD', 'App Store'],
    'ml': ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Docker', 'Kubernetes'],
    'security': ['Penetration Testing', 'OWASP', 'Encryption', 'Compliance', 'Security Auditing']
  };
  
  const target = roleSkills[targetRole?.toLowerCase()] || roleSkills['fullstack'];
  const current = currentSkills.map(s => s.toLowerCase());
  const gaps = target.filter(skill => !current.includes(skill.toLowerCase()));
  
  return {
    matched: target.filter(skill => current.includes(skill.toLowerCase())),
    gaps,
    matchPercentage: Math.round((target.filter(skill => current.includes(skill.toLowerCase())).length / target.length) * 100)
  };
}

export function getRecommendedSkills(currentSkills, targetRole) {
  const { gaps } = getSkillGaps(currentSkills, targetRole);
  return gaps.slice(0, 5);
}