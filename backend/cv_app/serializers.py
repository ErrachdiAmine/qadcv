from rest_framework import serializers
from .models import CV, Experience, Education, Skill, Language, Certification, Project, CVVersion, JobApplication, CoverLetter


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'position', 'company', 'location', 'start_date', 'end_date', 'description', 'order']
        read_only_fields = ['id']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'degree', 'field', 'institution', 'location', 'graduation_date', 'gpa', 'order']
        read_only_fields = ['id']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'order']
        read_only_fields = ['id']


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'name', 'proficiency', 'order']
        read_only_fields = ['id']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuer', 'date', 'url', 'order']
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'tech', 'url', 'order']
        read_only_fields = ['id']


class CVVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVVersion
        fields = ['id', 'version_number', 'label', 'data', 'is_auto', 'created_at']
        read_only_fields = ['id', 'version_number', 'created_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['id', 'company', 'title', 'job_description', 'match_score', 'status', 'applied_date', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CoverLetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoverLetter
        fields = ['id', 'company', 'title', 'job_description', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class CVSerializer(serializers.ModelSerializer):
    experiences = ExperienceSerializer(many=True, required=False)
    education = EducationSerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    languages = LanguageSerializer(many=True, required=False)
    certifications = CertificationSerializer(many=True, required=False)
    projects = ProjectSerializer(many=True, required=False)
    versions = CVVersionSerializer(many=True, read_only=True)
    applications = JobApplicationSerializer(many=True, read_only=True)
    cover_letters = CoverLetterSerializer(many=True, read_only=True)
    
    class Meta:
        model = CV
        fields = [
            'id', 'name', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio',
            'summary', 'template', 'experiences', 'education', 'skills', 'languages',
            'certifications', 'projects', 'versions', 'applications', 'cover_letters',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        experiences_data = validated_data.pop('experiences', [])
        education_data = validated_data.pop('education', [])
        skills_data = validated_data.pop('skills', [])
        languages_data = validated_data.pop('languages', [])
        certifications_data = validated_data.pop('certifications', [])
        projects_data = validated_data.pop('projects', [])
        
        cv = CV.objects.create(**validated_data)
        
        for exp_data in experiences_data:
            Experience.objects.create(cv=cv, **exp_data)
        for edu_data in education_data:
            Education.objects.create(cv=cv, **edu_data)
        for skill_data in skills_data:
            Skill.objects.create(cv=cv, **skill_data)
        for lang_data in languages_data:
            Language.objects.create(cv=cv, **lang_data)
        for cert_data in certifications_data:
            Certification.objects.create(cv=cv, **cert_data)
        for proj_data in projects_data:
            Project.objects.create(cv=cv, **proj_data)
        
        # Create initial version
        CVVersion.objects.create(
            cv=cv,
            version_number=1,
            label='Initial version',
            data=self.to_representation(cv),
            is_auto=True
        )
        
        return cv
    
    def update(self, instance, validated_data):
        experiences_data = validated_data.pop('experiences', None)
        education_data = validated_data.pop('education', None)
        skills_data = validated_data.pop('skills', None)
        languages_data = validated_data.pop('languages', None)
        certifications_data = validated_data.pop('certifications', None)
        projects_data = validated_data.pop('projects', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if experiences_data is not None:
            instance.experiences.all().delete()
            for exp_data in experiences_data:
                Experience.objects.create(cv=instance, **exp_data)
        
        if education_data is not None:
            instance.education.all().delete()
            for edu_data in education_data:
                Education.objects.create(cv=instance, **edu_data)
        
        if skills_data is not None:
            instance.skills.all().delete()
            for skill_data in skills_data:
                Skill.objects.create(cv=instance, **skill_data)
        
        if languages_data is not None:
            instance.languages.all().delete()
            for lang_data in languages_data:
                Language.objects.create(cv=instance, **lang_data)
        
        if certifications_data is not None:
            instance.certifications.all().delete()
            for cert_data in certifications_data:
                Certification.objects.create(cv=instance, **cert_data)
        
        if projects_data is not None:
            instance.projects.all().delete()
            for proj_data in projects_data:
                Project.objects.create(cv=instance, **proj_data)
        
        return instance


class CVListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for CV list"""
    experience_count = serializers.SerializerMethodField()
    skill_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CV
        fields = ['id', 'name', 'title', 'template', 'created_at', 'updated_at', 'experience_count', 'skill_count']
    
    def get_experience_count(self, obj):
        return obj.experiences.count()
    
    def get_skill_count(self, obj):
        return obj.skills.count()


class CVExportSerializer(serializers.ModelSerializer):
    """Serializer for compact CV export"""
    experiences = ExperienceSerializer(many=True)
    education = EducationSerializer(many=True)
    skills = SkillSerializer(many=True)
    languages = LanguageSerializer(many=True)
    certifications = CertificationSerializer(many=True)
    projects = ProjectSerializer(many=True)
    
    class Meta:
        model = CV
        fields = [
            'name', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio',
            'summary', 'template', 'experiences', 'education', 'skills', 'languages',
            'certifications', 'projects', 'updated_at'
        ]