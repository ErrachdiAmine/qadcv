import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-dev-key-change-in-production'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'cv_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cv_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'frontend' / 'dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cv_backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5175',
    'http://127.0.0.1:5175',
]

CORS_ALLOW_CREDENTIALS = True

NVIDIA_API_KEY = os.getenv('NVIDIA_API_KEY', '')
NVIDIA_API_URL = os.getenv('NVIDIA_API_URL', 'https://integrate.api.nvidia.com/v1')
NVIDIA_MODEL = os.getenv('NVIDIA_MODEL', 'nvidia/nemotron-3-ultra-550b-a55b')

ICON_PATHS = {
    'enhance': 'icons/enhance.svg',
    'download': 'icons/download.svg',
    'job_match': 'icons/job_match.svg',
    'cover_letter': 'icons/cover_letter.svg',
    'versions': 'icons/versions.svg',
    'analytics': 'icons/analytics.svg',
    'export': 'icons/export.svg',
    'clear': 'icons/clear.svg',
    'dark_mode': 'icons/dark_mode.svg',
    'light_mode': 'icons/light_mode.svg',
    'add': 'icons/add.svg',
    'remove': 'icons/remove.svg',
    'settings': 'icons/settings.svg',
    'preview': 'icons/preview.svg',
    'linkedin': 'icons/linkedin.svg',
    'github': 'icons/github.svg',
    'portfolio': 'icons/portfolio.svg',
    'email': 'icons/email.svg',
    'phone': 'icons/phone.svg',
    'location': 'icons/location.svg',
}

CV_EXPORT_SETTINGS = {
    'compact_mode': True,
    'include_ats_score': True,
    'watermark': False,
    'pdf_options': {
        'format': 'A4',
        'margin': '15mm',
        'print_background': True,
    }
}