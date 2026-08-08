from django.db import models
from django.contrib.auth.models import User
import uuid


class CV(models.Model):
    """Main CV model storing all CV data"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cvs', null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    
    # Personal info
    name = models.CharField(max_length=200, blank=True)
    title = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=200, blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    
    # Professional summary
    summary = models.TextField(blank=True)
    
    # Template
    template = models.CharField(max_length=50, default='modern')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['session_key', '-updated_at']),
        ]
    
    def __str__(self):
        return f"{self.name or 'Unnamed CV'} ({self.id})"


class Experience(models.Model):
    """Work experience entries"""
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='experiences')
    position = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.CharField(max_length=50)
    end_date = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-order', 'id']
    
    def __str__(self):
        return f"{self.position} at {self.company}"


class Education(models.Model):
    """Education entries"""
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='education')
    degree = models.CharField(max_length=200)
    field = models.CharField(max_length=200, blank=True)
    institution = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    graduation_date = models.CharField(max_length=50, blank=True)
    gpa = models.CharField(max_length=20, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-order', 'id']
        verbose_name_plural = 'Education'
    
    def __str__(self):
        return f"{self.degree} at {self.institution}"


class Skill(models.Model):
    """Skills with categorization"""
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['category', 'order', 'id']
    
    def __str__(self):
        return self.name


class Language(models.Model):
    """Language proficiency"""
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='languages')
    name = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=50)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"{self.name} ({self.proficiency})"


class Certification(models.Model):
    """Certifications"""
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    date = models.CharField(max_length=50, blank=True)
    url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-order', 'id']
    
    def __str__(self):
        return self.name


class Project(models.Model):
    """Projects"""
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    tech = models.CharField(max_length=500, blank=True)
    url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-order', 'id']
    
    def __str__(self):
        return self.name


class CVVersion(models.Model):
    """Version history for CV"""
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    label = models.CharField(max_length=200, blank=True)
    data = models.JSONField()
    is_auto = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-version_number']
        unique_together = ['cv', 'version_number']
    
    def __str__(self):
        return f"v{self.version_number} - {self.cv.name}"


class JobApplication(models.Model):
    """Job application tracking"""
    STATUS_CHOICES = [
        ('saved', 'Saved'),
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]
    
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='applications')
    company = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    job_description = models.TextField(blank=True)
    match_score = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='saved')
    applied_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} at {self.company}"


class CoverLetter(models.Model):
    """Generated cover letters"""
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='cover_letters')
    company = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    job_description = models.TextField(blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Cover Letter for {self.title} at {self.company}"