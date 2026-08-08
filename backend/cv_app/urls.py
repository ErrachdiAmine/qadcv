from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CVViewSet, CVVersionViewSet, JobApplicationViewSet, CoverLetterViewSet, AIEnhanceView, IconConfigView, ExportConfigView

router = DefaultRouter()
router.register(r'cvs', CVViewSet, basename='cv')
router.register(r'cvs/(?P<cv_pk>[^/.]+)/versions', CVVersionViewSet, basename='cv-version')
router.register(r'cvs/(?P<cv_pk>[^/.]+)/applications', JobApplicationViewSet, basename='cv-application')
router.register(r'cvs/(?P<cv_pk>[^/.]+)/cover-letters', CoverLetterViewSet, basename='cv-cover-letter')

urlpatterns = [
    path('', include(router.urls)),
    path('ai/enhance/', AIEnhanceView.as_view(), name='ai-enhance'),
    path('icons/config/', IconConfigView.as_view(), name='icon-config'),
    path('export/config/', ExportConfigView.as_view(), name='export-config'),
]