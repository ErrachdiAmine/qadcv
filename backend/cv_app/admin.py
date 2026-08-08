from django.contrib import admin
from .models import CV, Experience, Education, Skill, Language, Certification, Project, CVVersion, JobApplication, CoverLetter


class ExperienceInline(admin.TabularInline):
    model = Experience
    extra = 0
    fields = ['position', 'company', 'location', 'start_date', 'end_date', 'order']


class EducationInline(admin.TabularInline):
    model = Education
    extra = 0
    fields = ['degree', 'field', 'institution', 'location', 'graduation_date', 'gpa', 'order']


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 0
    fields = ['name', 'category', 'order']


class LanguageInline(admin.TabularInline):
    model = Language
    extra = 0
    fields = ['name', 'proficiency', 'order']


class CertificationInline(admin.TabularInline):
    model = Certification
    extra = 0
    fields = ['name', 'issuer', 'date', 'url', 'order']


class ProjectInline(admin.TabularInline):
    model = Project
    extra = 0
    fields = ['name', 'description', 'tech', 'url', 'order']


class CVVersionInline(admin.TabularInline):
    model = CVVersion
    extra = 0
    readonly_fields = ['version_number', 'label', 'is_auto', 'created_at']
    fields = ['version_number', 'label', 'is_auto', 'created_at']
    can_delete = False


class JobApplicationInline(admin.TabularInline):
    model = JobApplication
    extra = 0
    fields = ['company', 'title', 'status', 'match_score', 'applied_date']


class CoverLetterInline(admin.TabularInline):
    model = CoverLetter
    extra = 0
    readonly_fields = ['created_at']
    fields = ['company', 'title', 'created_at']


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'template', 'user', 'session_key', 'updated_at']
    list_filter = ['template', 'created_at', 'updated_at']
    search_fields = ['name', 'title', 'email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [
        ExperienceInline,
        EducationInline,
        SkillInline,
        LanguageInline,
        CertificationInline,
        ProjectInline,
        CVVersionInline,
        JobApplicationInline,
        CoverLetterInline,
    ]
    
    fieldsets = (
        ('Personal Info', {
            'fields': ('name', 'title', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio')
        }),
        ('Content', {
            'fields': ('summary', 'template')
        }),
        ('Metadata', {
            'fields': ('user', 'session_key', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['position', 'company', 'cv', 'start_date', 'end_date', 'order']
    list_filter = ['cv__template']
    search_fields = ['position', 'company', 'cv__name']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['degree', 'institution', 'cv', 'graduation_date', 'order']
    search_fields = ['degree', 'institution', 'cv__name']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'cv', 'order']
    list_filter = ['category', 'cv__template']
    search_fields = ['name', 'cv__name']


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['name', 'proficiency', 'cv', 'order']
    search_fields = ['name', 'cv__name']


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['name', 'issuer', 'cv', 'date', 'order']
    search_fields = ['name', 'issuer', 'cv__name']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'cv', 'order']
    search_fields = ['name', 'cv__name']


@admin.register(CVVersion)
class CVVersionAdmin(admin.ModelAdmin):
    list_display = ['cv', 'version_number', 'label', 'is_auto', 'created_at']
    list_filter = ['is_auto', 'created_at']
    readonly_fields = ['version_number', 'label', 'data', 'is_auto', 'created_at']
    search_fields = ['cv__name', 'label']


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'cv', 'status', 'applied_date', 'created_at']
    list_filter = ['status', 'applied_date', 'created_at']
    search_fields = ['title', 'company', 'cv__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CoverLetter)
class CoverLetterAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'cv', 'created_at']
    search_fields = ['title', 'company', 'cv__name']
    readonly_fields = ['created_at']