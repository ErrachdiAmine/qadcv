import json
import requests
from django.conf import settings
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import CV, Experience, Education, Skill, Language, Certification, Project, CVVersion, JobApplication, CoverLetter
from .serializers import (
    CVSerializer, CVListSerializer, CVExportSerializer,
    ExperienceSerializer, EducationSerializer, SkillSerializer,
    LanguageSerializer, CertificationSerializer, ProjectSerializer,
    CVVersionSerializer, JobApplicationSerializer, CoverLetterSerializer
)


class CVViewSet(viewsets.ModelViewSet):
    """ViewSet for CV CRUD operations"""
    queryset = CV.objects.all()
    serializer_class = CVSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['template']
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CVListSerializer
        return CVSerializer
    
    def get_queryset(self):
        user = self.request.user
        session_key = self.request.session.session_key
        
        if user.is_authenticated:
            return CV.objects.filter(user=user)
        elif session_key:
            return CV.objects.filter(session_key=session_key)
        return CV.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        session_key = self.request.session.session_key
        if not session_key:
            self.request.session.create()
            session_key = self.request.session.session_key
        serializer.save(user=user, session_key=session_key)
    
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """Export CV as compact JSON"""
        cv = self.get_object()
        serializer = CVExportSerializer(cv)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate PDF for CV (returns HTML for client-side printing)"""
        cv = self.get_object()
        serializer = CVExportSerializer(cv)
        return Response({
            'html': self.generate_cv_html(serializer.data),
            'filename': f"{cv.name.replace(' ', '_')}_CV.html"
        })
    
    def generate_cv_html(self, data):
        """Generate compact HTML for PDF export"""
        template_styles = {
            'modern': {'font': 'Inter, system-ui', 'primary': '#2563eb', 'header': 'center'},
            'classic': {'font': 'Georgia, serif', 'primary': '#1e3a8a', 'header': 'left'},
            'minimal': {'font': 'system-ui', 'primary': '#000000', 'header': 'left'},
            'elegant': {'font': 'Playfair Display, serif', 'primary': '#7c2d12', 'header': 'center'},
        }
        style = template_styles.get(data.get('template', 'modern'), template_styles['modern'])
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{data['name']} - CV</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: {style['font']}; line-height: 1.5; color: #1a1a1a; font-size: 11pt; }}
        .cv {{ max-width: 800px; margin: 0 auto; padding: 20mm; }}
        .header {{ text-align: {style['header']}; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid {style['primary']}; }}
        .name {{ font-size: 28pt; color: {style['primary']}; font-weight: 700; margin-bottom: 4px; }}
        .title {{ font-size: 14pt; color: #444; font-weight: 400; margin-bottom: 12px; }}
        .contact {{ display: flex; flex-wrap: wrap; justify-content: {style['header']}; gap: 16px; font-size: 10pt; color: #555; }}
        .contact a {{ color: {style['primary']}; text-decoration: none; }}
        .section {{ margin-bottom: 20px; }}
        .section-title {{ font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; color: {style['primary']}; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 12px; font-weight: 600; }}
        .item {{ margin-bottom: 12px; }}
        .item-header {{ display: flex; justify-content: space-between; margin-bottom: 4px; }}
        .item-title {{ font-weight: 600; font-size: 11pt; }}
        .item-subtitle {{ color: #555; font-size: 10pt; }}
        .item-dates {{ color: #666; font-size: 9pt; white-space: nowrap; }}
        .item-desc {{ font-size: 10pt; color: #333; line-height: 1.6; margin-top: 4px; }}
        .skills-list {{ display: flex; flex-wrap: wrap; gap: 6px; }}
        .skill-tag {{ background: {style['primary']}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 9pt; }}
        @media print {{ .cv {{ padding: 0; }} }}
    </style>
</head>
<body>
    <div class="cv">
        <div class="header">
            <div class="name">{data['name'] or 'Your Name'}</div>
            <div class="title">{data['title'] or 'Professional Title'}</div>
            <div class="contact">
"""
        if data['location']:
            html += f'<span>📍 {data["location"]}</span>'
        if data['email']:
            html += f'<span>✉️ <a href="mailto:{data["email"]}">{data["email"]}</a></span>'
        if data['phone']:
            html += f'<span>📞 {data["phone"]}</span>'
        if data['linkedin']:
            html += f'<span><a href="{data["linkedin"]}" target="_blank">💼 LinkedIn</a></span>'
        if data['github']:
            html += f'<span><a href="{data["github"]}" target="_blank">💻 GitHub</a></span>'
        if data['portfolio']:
            html += f'<span><a href="{data["portfolio"]}" target="_blank">🌐 Portfolio</a></span>'
        
        html += f"""
            </div>
        </div>
"""
        
        if data['summary']:
            html += f"""
        <div class="section">
            <div class="section-title">Summary</div>
            <div class="summary">{data['summary']}</div>
        </div>
"""
        
        if data['experiences']:
            html += '<div class="section"><div class="section-title">Experience</div>'
            for exp in data['experiences']:
                html += f"""
            <div class="item">
                <div class="item-header">
                    <div>
                        <div class="item-title">{exp['position']} at {exp['company']}</div>
                        <div class="item-subtitle">{exp.get('location', '')}</div>
                    </div>
                    <div class="item-dates">{exp['start_date']} – {exp['end_date'] or 'Present'}</div>
                </div>
"""
                if exp['description']:
                    html += f'<div class="item-desc">{exp["description"]}</div>'
                html += '</div>'
            html += '</div>'
        
        if data['education']:
            html += '<div class="section"><div class="section-title">Education</div>'
            for edu in data['education']:
                html += f"""
            <div class="item">
                <div class="item-header">
                    <div>
                        <div class="item-title">{edu['degree']} in {edu['field']}</div>
                        <div class="item-subtitle">{edu['institution']}</div>
                    </div>
                    <div class="item-dates">{edu['graduation_date']}</div>
                </div>
"""
                if edu['gpa']:
                    html += f'<div class="item-desc">GPA: {edu["gpa"]}</div>'
                html += '</div>'
            html += '</div>'
        
        if data['skills']:
            html += '<div class="section"><div class="section-title">Skills</div><div class="skills-list">'
            for skill in data['skills']:
                cat = f" ({skill['category']})" if skill.get('category') else ''
                html += f'<span class="skill-tag">{skill["name"]}{cat}</span>'
            html += '</div></div>'
        
        if data['languages']:
            html += '<div class="section"><div class="section-title">Languages</div>'
            for lang in data['languages']:
                html += f'<div class="item"><div class="item-title">{lang["name"]}</div><div class="item-subtitle">{lang["proficiency"]}</div></div>'
            html += '</div>'
        
        if data['certifications']:
            html += '<div class="section"><div class="section-title">Certifications</div>'
            for cert in data['certifications']:
                html += f'<div class="item"><div class="item-title">{cert["name"]}</div><div class="item-subtitle">{cert["issuer"]} {cert.get("date", "")}</div></div>'
            html += '</div>'
        
        if data['projects']:
            html += '<div class="section"><div class="section-title">Projects</div>'
            for proj in data['projects']:
                html += f"""
            <div class="item">
                <div class="item-header">
                    <div class="item-title">{proj['name']}</div>
                </div>
"""
                if proj['description']:
                    html += f'<div class="item-desc">{proj["description"]}</div>'
                if proj['tech']:
                    html += f'<div class="item-subtitle">Tech: {proj["tech"]}</div>'
                html += '</div>'
            html += '</div>'
        
        html += """
    </div>
</body>
</html>
"""
        return html
    
    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        """Create a manual version snapshot"""
        cv = self.get_object()
        version_number = cv.versions.count() + 1
        serializer = CVSerializer(cv)
        version = CVVersion.objects.create(
            cv=cv,
            version_number=version_number,
            label=request.data.get('label', f'Version {version_number}'),
            data=serializer.data,
            is_auto=False
        )
        return Response(CVVersionSerializer(version).data)
    
    @action(detail=True, methods=['post'])
    def restore_version(self, request, pk=None):
        """Restore CV from a version"""
        cv = self.get_object()
        version_id = request.data.get('version_id')
        try:
            version = cv.versions.get(id=version_id)
            cv.name = version.data.get('name', '')
            cv.title = version.data.get('title', '')
            cv.email = version.data.get('email', '')
            cv.phone = version.data.get('phone', '')
            cv.location = version.data.get('location', '')
            cv.linkedin = version.data.get('linkedin', '')
            cv.github = version.data.get('github', '')
            cv.portfolio = version.data.get('portfolio', '')
            cv.summary = version.data.get('summary', '')
            cv.template = version.data.get('template', 'modern')
            cv.save()
            return Response(CVSerializer(cv).data)
        except CVVersion.DoesNotExist:
            return Response({'error': 'Version not found'}, status=status.HTTP_404_NOT_FOUND)


class CVVersionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CVVersion.objects.all()
    serializer_class = CVVersionSerializer
    
    def get_queryset(self):
        cv_id = self.kwargs.get('cv_pk')
        return CVVersion.objects.filter(cv_id=cv_id)


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    
    def get_queryset(self):
        cv_id = self.kwargs.get('cv_pk')
        return JobApplication.objects.filter(cv_id=cv_id)
    
    def perform_create(self, serializer):
        cv_id = self.kwargs.get('cv_pk')
        serializer.save(cv_id=cv_id)


class CoverLetterViewSet(viewsets.ModelViewSet):
    queryset = CoverLetter.objects.all()
    serializer_class = CoverLetterSerializer
    
    def get_queryset(self):
        cv_id = self.kwargs.get('cv_pk')
        return CoverLetter.objects.filter(cv_id=cv_id)
    
    def perform_create(self, serializer):
        cv_id = self.kwargs.get('cv_pk')
        serializer.save(cv_id=cv_id)


class AIService:
    """Service for NVIDIA AI integration"""
    
    @staticmethod
    def call_nvidia(prompt, model=None, max_tokens=2000, temperature=0.7):
        api_key = getattr(settings, 'NVIDIA_API_KEY', '')
        api_url = getattr(settings, 'NVIDIA_API_URL', 'https://integrate.api.nvidia.com/v1')
        model = model or getattr(settings, 'NVIDIA_MODEL', 'nvidia/nemotron-3-ultra-550b-a55b')
        
        if not api_key:
            return {'error': 'NVIDIA API key not configured'}
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        }
        
        payload = {
            'model': model,
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': max_tokens,
            'temperature': temperature,
        }
        
        try:
            response = requests.post(f'{api_url}/chat/completions', headers=headers, json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {'fallback': True, 'error': str(e)}
    
    @staticmethod
    def enhance_cv(cv_data):
        prompt = f"""
Enhance this CV for a professional {cv_data.get('title', 'professional')}.
Improve the summary, experience descriptions, and suggest additional skills.

Current CV:
Name: {cv_data.get('name', '')}
Title: {cv_data.get('title', '')}
Summary: {cv_data.get('summary', '')}
Experience: {json.dumps(cv_data.get('experience', []), indent=2)}
Skills: {', '.join([s for s in cv_data.get('skills', [])])}

Return enhanced CV as JSON with the same structure.
"""
        return AIService.call_nvidia(prompt)
    
    @staticmethod
    def generate_summary(cv_data):
        prompt = f"""
Write a compelling professional summary for a {cv_data.get('title', 'professional')} with these experiences:
{json.dumps(cv_data.get('experience', []), indent=2)}
Skills: {', '.join([s for s in cv_data.get('skills', [])])}

Return only the summary paragraph (3-4 sentences).
"""
        return AIService.call_nvidia(prompt, max_tokens=500)
    
    @staticmethod
    def enhance_experience(description, position, company):
        prompt = f"""
Enhance this job description for a {position} at {company}:
"{description}"

Make it more impactful with action verbs, quantifiable achievements, and relevant keywords.
Return 4-6 bullet points.
"""
        return AIService.call_nvidia(prompt, max_tokens=800)
    
    @staticmethod
    def suggest_skills(cv_data, target_role=''):
        current_skills = [s for s in cv_data.get('skills', [])]
        prompt = f"""
Suggest 10-15 relevant skills for a {target_role or cv_data.get('title', 'professional')} 
with current skills: {', '.join(current_skills)}

Return as comma-separated list.
"""
        return AIService.call_nvidia(prompt, max_tokens=500)
    
    @staticmethod
    def generate_cover_letter(cv_data, company, title, job_description):
        prompt = f"""
Write a tailored cover letter for {cv_data.get('name', 'Candidate')} applying for {title} at {company}.

CV Summary: {cv_data.get('summary', '')}
Experience: {json.dumps(cv_data.get('experience', [])[:3], indent=2)}
Key Skills: {', '.join([s for s in cv_data.get('skills', [])[:10]])}

Job Description: {job_description}

Write a professional, personalized cover letter (3-4 paragraphs).
"""
        return AIService.call_nvidia(prompt, max_tokens=1000)
    
    @staticmethod
    def analyze_job_match(cv_data, job_description):
        prompt = f"""
Analyze how well this CV matches the job description.

CV:
{json.dumps({
    'title': cv_data.get('title'),
    'summary': cv_data.get('summary'),
    'experiences': cv_data.get('experience', [])[:3],
    'skills': [s for s in cv_data.get('skills', [])],
    'education': cv_data.get('education', [])
}, indent=2)}

Job Description:
{job_description}

Return JSON with:
- match_score (0-100)
- matched_skills (list)
- missing_skills (list)
- experience_match (0-100)
- recommendations (list of strings)
"""
        return AIService.call_nvidia(prompt, max_tokens=1500, temperature=0.5)

    @staticmethod
    def get_fallback_response(action, cv_data, request_data):
        """Return mock fallback responses when AI API is unavailable"""
        fallbacks = {
            'enhance_cv': {
                'result': f"Enhanced CV for {cv_data.get('name', 'Professional')}. Summary enhanced. Experience descriptions improved. Skills optimized for ATS."
            },
            'generate_summary': {
                'result': f"{cv_data.get('title', 'Professional')} with expertise in {', '.join(cv_data.get('skills', [])[:3]) or 'various technologies'}. {(cv_data.get('experience') or [{}])[0].get('position', '') + ' at ' + (cv_data.get('experience') or [{}])[0].get('company', '') if cv_data.get('experience') else ''} Seeking to leverage skills in a challenging new role."
            },
            'enhance_experience': {
                'result': "• Enhanced description with quantified achievements\n• Improved processes and efficiency by 25%\n• Led cross-functional team of 5 engineers\n• Implemented CI/CD pipelines reducing deployment time"
            },
            'suggest_skills': {
                'result': "JavaScript, TypeScript, React, Node.js, Python, SQL, Git, AWS, Docker, Testing, Agile, Problem Solving, Communication, Leadership, Time Management"
            },
            'generate_cover_letter': {
                'result': f"Dear Hiring Manager at {request_data.get('company', 'Company')},\n\nI am writing to express my strong interest in the {request_data.get('title', 'Position')} position. With my background as a {cv_data.get('title', 'professional')} and experience in {', '.join(cv_data.get('skills', [])[:3]) or 'various technologies'}, I am confident I can contribute significantly to your team.\n\nIn my current role as {(cv_data.get('experience') or [{}])[0].get('position', 'professional')} at {(cv_data.get('experience') or [{}])[0].get('company', 'my company')}, I have {(cv_data.get('experience') or [{}])[0].get('description', 'delivered impactful results')}. This experience has honed my skills in {', '.join((cv_data.get('skills') or [])[:5]) or 'relevant technologies'}, which align well with the requirements of this position.\n\nI am particularly drawn to {request_data.get('company', 'your company')} because of its reputation for innovation and excellence. I would welcome the opportunity to discuss how my experience can benefit your organization.\n\nThank you for your consideration.\n\nSincerely,\n{cv_data.get('name', 'Candidate')}\n{cv_data.get('email', '')} | {cv_data.get('phone', '')}"
            },
            'analyze_job_match': {
                'result': json.dumps({
                    'match_score': 65,
                    'matched_skills': cv_data.get('skills', [])[:3],
                    'missing_skills': ['AWS', 'Kubernetes', 'GraphQL'],
                    'experience_match': 70,
                    'recommendations': ['Add cloud certifications', 'Highlight leadership experience', 'Include specific metrics in achievements']
                })
            }
        }
        return fallbacks.get(action, {'result': 'Fallback response for ' + action})


class AIEnhanceView(APIView):
    """AI enhancement endpoints"""
    
    def post(self, request):
        action = request.data.get('action')
        cv_data = request.data.get('cv_data', {})
        
        if action == 'enhance_cv':
            result = AIService.enhance_cv(cv_data)
        elif action == 'generate_summary':
            result = AIService.generate_summary(cv_data)
        elif action == 'enhance_experience':
            result = AIService.enhance_experience(
                cv_data.get('description', ''),
                cv_data.get('position', ''),
                cv_data.get('company', '')
            )
        elif action == 'suggest_skills':
            result = AIService.suggest_skills(cv_data, cv_data.get('target_role', ''))
        elif action == 'generate_cover_letter':
            result = AIService.generate_cover_letter(
                cv_data,
                request.data.get('company', ''),
                request.data.get('title', ''),
                request.data.get('job_description', '')
            )
        elif action == 'analyze_job_match':
            result = AIService.analyze_job_match(cv_data, request.data.get('job_description', ''))
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        if 'error' in result:
            if result.get('fallback'):
                fallback_result = AIService.get_fallback_response(action, cv_data, request.data)
                return Response(fallback_result)
            return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            content = result['choices'][0]['message']['content']
            return Response({'result': content, 'raw': result})
        except (KeyError, IndexError):
            return Response({'error': 'Invalid AI response', 'raw': result}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IconConfigView(APIView):
    """Serve icon configuration to frontend"""
    
    def get(self, request):
        return Response(getattr(settings, 'ICON_PATHS', {}))


class ExportConfigView(APIView):
    """Serve export configuration to frontend"""
    
    def get(self, request):
        return Response(getattr(settings, 'CV_EXPORT_SETTINGS', {}))